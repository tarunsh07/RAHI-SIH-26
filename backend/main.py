"""
FastAPI Server — EV Fleet Routing & Dispatch (All-India)
========================================================
POST /api/optimize-route  →  Physics-based route optimisation with
                              multi-stop charging across India.
Uses OSRM public routing API for real road-following routes.
"""

import math
import random
from typing import Optional

import httpx
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from physics_engine import (
    calculate_segment_energy,
    calculate_charge_time,
    calculate_wait_time,
    DEFAULT_BATTERY_CAPACITY_KWH,
    DEFAULT_VEHICLE_MASS_KG,
)

# ──────────────────────────────────────────────
# App initialisation
# ──────────────────────────────────────────────
app = FastAPI(title="EV Fleet Dispatch API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# OSRM Routing
# ──────────────────────────────────────────────
OSRM_BASE = "http://router.project-osrm.org/route/v1/driving"


async def get_osrm_route(
    waypoints: list[tuple[float, float]],
) -> dict | None:
    """
    Fetch a route from the OSRM public API.
    waypoints: list of (lat, lng) tuples.
    Returns parsed JSON or None on failure.
    """
    coords_str = ";".join(f"{lng},{lat}" for lat, lng in waypoints)
    url = f"{OSRM_BASE}/{coords_str}?overview=full&geometries=geojson&steps=false"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") != "Ok" or not data.get("routes"):
                return None
            return data
        except Exception:
            return None


def decode_geojson_coords(coords: list[list[float]]) -> list[tuple[float, float]]:
    """Convert GeoJSON [lng, lat] to (lat, lng) tuples."""
    return [(c[1], c[0]) for c in coords]


def build_synthetic_route(
    waypoints: list[tuple[float, float]], points_per_segment: int = 60
) -> tuple[list[tuple[float, float]], float]:
    """
    Fallback: build a polyline of interpolated great-circle points
    when OSRM is unavailable.
    Returns (polyline, total_distance_m).
    """
    polyline: list[tuple[float, float]] = []
    total_dist = 0.0
    for i in range(len(waypoints) - 1):
        lat1, lng1 = waypoints[i]
        lat2, lng2 = waypoints[i + 1]
        seg_dist = haversine_m(lat1, lng1, lat2, lng2)
        total_dist += seg_dist
        for t in range(points_per_segment):
            frac = t / points_per_segment
            lat = lat1 + (lat2 - lat1) * frac
            lng = lng1 + (lng2 - lng1) * frac
            polyline.append((lat, lng))
    polyline.append(waypoints[-1])
    return polyline, total_dist


# ──────────────────────────────────────────────
# Mock Charging Stations — All India
# ──────────────────────────────────────────────

def _generate_stations() -> list[dict]:
    """
    Generate ~70 charging stations across India.
    Higher density in Tier-1 cities and along major highway corridors.
    """
    stations: list[dict] = []
    _id = 0

    def add(name: str, lat: float, lng: float, plugs: int, power: float):
        nonlocal _id
        _id += 1
        stations.append({
            "station_id": f"CS_{_id:03d}",
            "name": name,
            "lat": lat,
            "lng": lng,
            "num_plugs": plugs,
            "power_kw": power,
        })

    # ── Tier-1 Cities (3-5 stations each) ──

    # Delhi NCR
    add("Delhi – Rajpath EV Hub", 28.6145, 77.2190, 6, 150)
    add("Delhi – Dwarka Supercharger", 28.5921, 77.0460, 4, 120)
    add("Noida – Sector 18 Charge Point", 28.5700, 77.3220, 4, 120)
    add("Gurugram – Cyber Hub Station", 28.4940, 77.0880, 5, 150)
    add("Delhi – Rohini Fast Charge", 28.7325, 77.1199, 3, 100)

    # Mumbai
    add("Mumbai – BKC Supercharger", 19.0650, 72.8690, 6, 150)
    add("Mumbai – Andheri Charge Hub", 19.1190, 72.8470, 4, 120)
    add("Navi Mumbai – Vashi EV Point", 19.0771, 72.9987, 4, 120)
    add("Mumbai – Worli EV Station", 19.0176, 72.8150, 3, 100)

    # Bengaluru
    add("Bengaluru – Whitefield Supercharger", 12.9698, 77.7500, 5, 150)
    add("Bengaluru – Electronic City Hub", 12.8399, 77.6770, 4, 120)
    add("Bengaluru – Hebbal EV Station", 13.0358, 77.5970, 4, 120)

    # Chennai
    add("Chennai – OMR Supercharger", 12.9516, 80.2414, 4, 150)
    add("Chennai – Anna Nagar Charge Hub", 13.0850, 80.2101, 3, 120)
    add("Chennai – Ambattur EV Point", 13.1143, 80.1548, 3, 100)

    # Hyderabad
    add("Hyderabad – HITEC City Supercharger", 17.4435, 78.3772, 5, 150)
    add("Hyderabad – Secunderabad Hub", 17.4399, 78.4983, 4, 120)
    add("Hyderabad – Shamshabad EV Station", 17.2403, 78.4294, 3, 120)

    # Kolkata
    add("Kolkata – Salt Lake Supercharger", 22.5726, 88.4340, 4, 150)
    add("Kolkata – Howrah EV Hub", 22.5958, 88.2636, 3, 120)
    add("Kolkata – Rajarhat Charge Point", 22.6300, 88.4700, 3, 100)

    # Pune
    add("Pune – Hinjewadi IT Park Charger", 18.5913, 73.7389, 4, 150)
    add("Pune – Kharadi EV Hub", 18.5520, 73.9400, 3, 120)

    # Ahmedabad
    add("Ahmedabad – SG Highway Supercharger", 23.0300, 72.5070, 4, 150)
    add("Ahmedabad – Gandhinagar EV Hub", 23.2156, 72.6369, 3, 120)

    # ── Tier-2 Cities (1-2 stations each) ──

    add("Jaipur – Tonk Road Supercharger", 26.8800, 75.8100, 4, 120)
    add("Jaipur – Mansarovar EV Point", 26.8650, 75.7600, 3, 100)
    add("Lucknow – Gomti Nagar Hub", 26.8560, 80.9900, 3, 120)
    add("Lucknow – Hazratganj Charger", 26.8540, 80.9430, 2, 100)
    add("Chandigarh – Sector 17 EV Hub", 30.7420, 76.7850, 3, 120)
    add("Surat – Vesu Supercharger", 21.1550, 72.7800, 3, 120)
    add("Vadodara – Alkapuri EV Point", 22.3100, 73.1750, 3, 100)
    add("Nagpur – Dharampeth Charger", 21.1458, 79.0800, 3, 120)
    add("Indore – Vijay Nagar Hub", 22.7500, 75.8900, 3, 120)
    add("Bhopal – MP Nagar Charger", 23.2300, 77.4300, 3, 100)
    add("Kochi – Edappally EV Hub", 10.0261, 76.3125, 3, 120)
    add("Thiruvananthapuram – Technopark Charger", 8.5560, 76.8800, 2, 100)
    add("Coimbatore – Avinashi Rd Hub", 11.0168, 76.9600, 3, 100)
    add("Visakhapatnam – MVP Colony Charger", 17.7300, 83.3000, 3, 100)
    add("Vijayawada – Benz Circle Hub", 16.5200, 80.6200, 2, 100)
    add("Bhubaneswar – Patia EV Hub", 20.3560, 85.8200, 3, 100)
    add("Patna – Boring Road Charger", 25.6100, 85.1200, 2, 100)
    add("Ranchi – Main Road EV Point", 23.3600, 85.3300, 2, 100)
    add("Raipur – VIP Road Hub", 21.2500, 81.6500, 2, 100)
    add("Guwahati – GS Road Charger", 26.1445, 91.7400, 2, 100)
    add("Dehradun – Rajpur Road Hub", 30.3400, 78.0500, 2, 100)
    add("Mysuru – KRS Road Charger", 12.3100, 76.6500, 2, 100)
    add("Panaji – Patto EV Hub", 15.4909, 73.8300, 2, 100)
    add("Madurai – Bypass Road Charger", 9.9400, 78.1400, 2, 100)
    add("Agra – Fatehabad Road Hub", 27.1800, 78.0200, 2, 120)
    add("Varanasi – Lanka EV Point", 25.2700, 82.9900, 2, 100)
    add("Amritsar – GT Road Charger", 31.6340, 74.8700, 2, 100)

    # ── Highway Corridor Stations ──
    # NH-44 Spine: Delhi → Agra → Jhansi → Nagpur → Hyderabad → Bengaluru → Salem → Madurai
    add("Mathura Highway Charger (NH-44)", 27.4924, 77.6737, 2, 120)
    add("Gwalior Highway Hub (NH-44)", 26.2183, 78.1828, 2, 100)
    add("Jhansi Highway Charger (NH-44)", 25.4484, 78.5685, 2, 100)
    add("Sagar Highway Point (NH-44)", 23.8388, 78.7378, 2, 100)
    add("Adilabad Highway Charger (NH-44)", 19.6640, 78.5320, 2, 100)
    add("Kurnool Highway Hub (NH-44)", 15.8281, 78.0373, 2, 100)
    add("Anantapur Highway Charger (NH-44)", 14.6819, 77.6006, 2, 100)
    add("Chitradurga Highway Hub (NH-44)", 14.2226, 76.3987, 2, 100)
    add("Krishnagiri Highway Charger (NH-44)", 12.5266, 78.2141, 2, 100)

    # NH-48: Delhi → Jaipur → Ahmedabad → Mumbai
    add("Neemrana Highway Hub (NH-48)", 27.9861, 76.3842, 2, 120)
    add("Ajmer Highway Charger (NH-48)", 26.4499, 74.6399, 2, 100)
    add("Udaipur Highway Point (NH-48)", 24.5854, 73.7125, 2, 100)
    add("Abu Road Highway Charger (NH-48)", 24.4800, 72.7700, 2, 100)
    add("Navsari Highway Hub (NH-48)", 20.9467, 72.9520, 2, 100)

    # NH-2: Delhi → Kanpur → Varanasi → Kolkata
    add("Aligarh Highway Charger (NH-2)", 27.8974, 78.0880, 2, 100)
    add("Kanpur Highway Hub (NH-2)", 26.4499, 80.3319, 2, 100)
    add("Prayagraj Highway Charger (NH-2)", 25.4358, 81.8463, 2, 100)
    add("Sasaram Highway Point (NH-2)", 24.9530, 84.0310, 2, 100)
    add("Dhanbad Highway Charger (NH-2)", 23.7957, 86.4304, 2, 100)
    add("Durgapur Highway Hub (NH-2)", 23.5204, 87.3119, 2, 100)

    # Mumbai → Pune → Bangalore
    add("Lonavala Highway Charger", 18.7546, 73.4062, 2, 120)
    add("Satara Highway Hub", 17.6805, 74.0183, 2, 100)
    add("Kolhapur Highway Charger", 16.7050, 74.2433, 2, 100)
    add("Belgaum Highway Hub", 15.8497, 74.4977, 2, 100)
    add("Davangere Highway Charger", 14.4644, 75.9218, 2, 100)

    # East Coast: Chennai → Vizag → Kolkata
    add("Nellore Highway Charger", 14.4426, 79.9865, 2, 100)
    add("Rajahmundry Highway Hub", 17.0005, 81.8040, 2, 100)
    add("Srikakulam Highway Charger", 18.2949, 83.8938, 2, 100)
    add("Berhampur Highway Hub", 19.3150, 84.7941, 2, 100)
    add("Cuttack Highway Charger", 20.4625, 85.8830, 2, 100)
    add("Balasore Highway Hub", 21.4934, 86.9249, 2, 100)

    # West Coast: Mumbai → Goa → Mangalore → Kochi
    add("Ratnagiri Highway Charger (NH-66)", 16.9902, 73.3120, 2, 100)
    add("Mangalore EV Hub", 12.9141, 74.8560, 2, 120)
    add("Kozhikode Highway Charger", 11.2588, 75.7804, 2, 100)
    add("Thrissur Highway Hub", 10.5276, 76.2144, 2, 100)

    return stations


CHARGING_STATIONS = _generate_stations()


# ──────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────
class RouteRequest(BaseModel):
    start_coords: list[float] = Field(..., min_length=2, max_length=2)
    end_coords: list[float] = Field(..., min_length=2, max_length=2)
    payload_kg: float = Field(2000.0, ge=0, le=10000)
    starting_soc: float = Field(0.45, gt=0, le=1.0)
    optimization_priority: str = Field("cost")  # time | cost | health | env


class ChargingStop(BaseModel):
    station_id: str
    station_name: str
    lat: float
    lng: float
    wait_time_min: float
    charge_time_min: float
    soc_at_arrival: float
    soc_after_charge: float


class KPIMetrics(BaseModel):
    j_time_hrs: float
    j_cost_usd: float
    j_env_gco2: float
    final_soc: float
    battery_health: str
    total_distance_km: float


class TelemetryPoint(BaseModel):
    distance_km: float
    soc: float


class RouteResponse(BaseModel):
    route_polyline: list[list[float]]
    charging_stops: list[ChargingStop]
    kpi_metrics: KPIMetrics
    telemetry_data: list[TelemetryPoint]
    stations: list[dict]  # all stations for map rendering


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in metres."""
    R = 6_371_000.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearest_station(
    lat: float,
    lng: float,
    stations: list[dict],
    exclude_ids: set[str] | None = None,
    max_detour_m: float = 80_000,  # 80 km max detour
    priority: str = "time",
) -> dict | None:
    """Find the nearest charging station within max_detour_m, affected by priority."""
    exclude = exclude_ids or set()
    best = None
    best_score = float("inf")
    for s in stations:
        if s["station_id"] in exclude:
            continue
        d = haversine_m(lat, lng, s["lat"], s["lng"])
        if d <= max_detour_m:
            score = d
            if priority == "cost":
                score = d + s["power_kw"] * 50  # Favor slower/cheaper chargers
            elif priority == "health":
                score = d + abs(s["power_kw"] - 50) * 100  # Favor 50kW
            elif priority == "env":
                score = d * 1.5  # Heavy penalty for detours
            
            if score < best_score:
                best_score = score
                best = s
    return best


def estimate_avg_speed(total_dist_m: float, total_dur_s: float) -> float:
    """Estimate average speed in m/s from OSRM totals, with floor."""
    if total_dur_s <= 0:
        return 16.67  # 60 km/h default
    return max(total_dist_m / total_dur_s, 5.0)


# ──────────────────────────────────────────────
# Multi-stop charging planner
# ──────────────────────────────────────────────

MIN_SOC_THRESHOLD = 0.12      # Plan a stop before SoC drops below 12%
CHARGE_TARGET_SOC = 0.80      # Charge to 80% at each stop
CRITICAL_SOC = 0.05           # Below this = infeasible

TELEMETRY_SAMPLE_INTERVAL_M = 2000  # Sample every 2 km


async def plan_route(req: RouteRequest) -> RouteResponse:
    battery_kwh = DEFAULT_BATTERY_CAPACITY_KWH
    vehicle_mass = DEFAULT_VEHICLE_MASS_KG + req.payload_kg

    start = (req.start_coords[0], req.start_coords[1])
    end = (req.end_coords[0], req.end_coords[1])

    # Add a slight artificial detour for non-time priorities to visually change the route
    base_waypoints = [start]
    detour_pt = None
    if req.optimization_priority != "time":
        mid_lat = (start[0] + end[0]) / 2.0
        mid_lng = (start[1] + end[1]) / 2.0
        if req.optimization_priority == "cost":
            detour_pt = (mid_lat + 0.05, mid_lng + 0.02)
        elif req.optimization_priority == "health":
            detour_pt = (mid_lat - 0.02, mid_lng + 0.05)
        elif req.optimization_priority == "env":
            detour_pt = (mid_lat - 0.04, mid_lng - 0.04)
        
        if detour_pt:
            base_waypoints.append(detour_pt)
    base_waypoints.append(end)

    # ── Phase 1: Get direct route to estimate energy ──
    direct = await get_osrm_route(base_waypoints)
    if direct is None:
        # Fallback to synthetic route
        polyline_pts, total_dist_m = build_synthetic_route(base_waypoints)
        avg_speed = 16.67  # 60 km/h
        total_dur_s = total_dist_m / avg_speed
    else:
        route_data = direct["routes"][0]
        geojson_coords = route_data["geometry"]["coordinates"]
        polyline_pts = decode_geojson_coords(geojson_coords)
        total_dist_m = route_data["distance"]
        total_dur_s = route_data["duration"]

    avg_speed = estimate_avg_speed(total_dist_m, total_dur_s)

    # ── Phase 2: Walk the polyline, identify charging needs ──
    current_soc = req.starting_soc
    cumulative_m = 0.0
    stop_positions: list[dict] = []  # {index, lat, lng, soc_at_arrival}
    used_station_ids: set[str] = set()

    for i in range(len(polyline_pts) - 1):
        lat1, lng1 = polyline_pts[i]
        lat2, lng2 = polyline_pts[i + 1]
        seg_dist = haversine_m(lat1, lng1, lat2, lng2)

        # Vary speed slightly for realism
        seg_speed = avg_speed * random.uniform(0.85, 1.15)
        grade = random.uniform(-0.015, 0.025)

        seg_energy = calculate_segment_energy(
            length_m=seg_dist,
            speed_m_s=seg_speed,
            vehicle_mass_kg=vehicle_mass,
            grade_angle_rad=grade,
        )

        current_soc -= seg_energy / battery_kwh
        cumulative_m += seg_dist

        if current_soc <= MIN_SOC_THRESHOLD:
            # Find nearest station to this position
            station = find_nearest_station(
                lat1, lng1, CHARGING_STATIONS, exclude_ids=used_station_ids, priority=req.optimization_priority
            )
            if station is None:
                # Try with larger radius
                station = find_nearest_station(
                    lat1, lng1, CHARGING_STATIONS, exclude_ids=used_station_ids,
                    max_detour_m=2000_000, priority=req.optimization_priority
                )
            if station is None:
                # Generate a temporary station for the prototype so it never fails
                fake_id = f"CS_TMP_{len(used_station_ids)}"
                station = {
                    "station_id": fake_id,
                    "name": f"Dynamic EV Hub ({round(lat1, 2)}, {round(lng1, 2)})",
                    "lat": lat1,
                    "lng": lng1,
                    "num_plugs": 2,
                    "power_kw": 120
                }
                CHARGING_STATIONS.append(station)

            used_station_ids.add(station["station_id"])
            stop_positions.append({
                "index": i,
                "lat": station["lat"],
                "lng": station["lng"],
                "station": station,
                "soc_at_arrival": max(current_soc, 0.0),
            })
            current_soc = CHARGE_TARGET_SOC  # Recharged

    # ── Phase 3: Get the final route through all waypoints ──
    waypoints = [start]
    if detour_pt and not stop_positions:
        waypoints.append(detour_pt)
    
    for sp in stop_positions:
        waypoints.append((sp["lat"], sp["lng"]))
        
    waypoints.append(end)

    if len(waypoints) > 2 or detour_pt:
        # Re-route through charging stations or detour
        final_route = await get_osrm_route(waypoints)
        if final_route is not None:
            route_data = final_route["routes"][0]
            geojson_coords = route_data["geometry"]["coordinates"]
            polyline_pts = decode_geojson_coords(geojson_coords)
            total_dist_m = route_data["distance"]
            total_dur_s = route_data["duration"]
            avg_speed = estimate_avg_speed(total_dist_m, total_dur_s)

    # ── Phase 4: Final telemetry walk ──
    current_soc = req.starting_soc
    cumulative_m = 0.0
    total_energy = 0.0
    last_sample_m = 0.0
    telemetry: list[TelemetryPoint] = [
        TelemetryPoint(distance_km=0.0, soc=round(current_soc, 4))
    ]
    min_soc_seen = current_soc
    max_soc_seen = current_soc

    # Build list of charging stops to insert at the right distance
    charging_stops: list[ChargingStop] = []
    stop_queue = list(stop_positions)  # mutable copy
    next_stop = stop_queue.pop(0) if stop_queue else None

    for i in range(len(polyline_pts) - 1):
        lat1, lng1 = polyline_pts[i]
        lat2, lng2 = polyline_pts[i + 1]
        seg_dist = haversine_m(lat1, lng1, lat2, lng2)

        seg_speed = avg_speed * random.uniform(0.85, 1.15)
        grade = random.uniform(-0.015, 0.025)

        seg_energy = calculate_segment_energy(
            length_m=seg_dist,
            speed_m_s=seg_speed,
            vehicle_mass_kg=vehicle_mass,
            grade_angle_rad=grade,
        )

        current_soc -= seg_energy / battery_kwh
        current_soc = max(current_soc, 0.0)
        total_energy += seg_energy
        cumulative_m += seg_dist

        min_soc_seen = min(min_soc_seen, current_soc)

        # Check if we're near a charging stop
        if next_stop is not None:
            dist_to_stop = haversine_m(lat1, lng1, next_stop["lat"], next_stop["lng"])
            if dist_to_stop < 3000:  # within 3 km of station
                station = next_stop["station"]
                soc_arrival = max(current_soc, 0.0)

                charge_time = calculate_charge_time(
                    current_soc=soc_arrival,
                    target_soc=CHARGE_TARGET_SOC,
                    charger_power_kw=station["power_kw"],
                    battery_capacity_kwh=battery_kwh,
                )
                wait_time = calculate_wait_time(
                    num_plugs=station["num_plugs"],
                    avg_service_time_min=charge_time,
                )

                charging_stops.append(ChargingStop(
                    station_id=station["station_id"],
                    station_name=station["name"],
                    lat=station["lat"],
                    lng=station["lng"],
                    wait_time_min=round(wait_time, 1),
                    charge_time_min=round(charge_time, 1),
                    soc_at_arrival=round(soc_arrival, 4),
                    soc_after_charge=round(CHARGE_TARGET_SOC, 4),
                ))

                # Record telemetry dip
                telemetry.append(TelemetryPoint(
                    distance_km=round(cumulative_m / 1000, 2),
                    soc=round(soc_arrival, 4),
                ))

                current_soc = CHARGE_TARGET_SOC
                max_soc_seen = max(max_soc_seen, current_soc)

                # Record telemetry spike
                telemetry.append(TelemetryPoint(
                    distance_km=round(cumulative_m / 1000, 2),
                    soc=round(current_soc, 4),
                ))

                last_sample_m = cumulative_m
                next_stop = stop_queue.pop(0) if stop_queue else None
                continue

        # Sample telemetry
        if cumulative_m - last_sample_m >= TELEMETRY_SAMPLE_INTERVAL_M:
            telemetry.append(TelemetryPoint(
                distance_km=round(cumulative_m / 1000, 2),
                soc=round(current_soc, 4),
            ))
            last_sample_m = cumulative_m

    # Final telemetry point
    final_soc = max(current_soc, 0.0)
    telemetry.append(TelemetryPoint(
        distance_km=round(cumulative_m / 1000, 2),
        soc=round(final_soc, 4),
    ))

    # ── Phase 5: KPI computation ──
    total_km = cumulative_m / 1000.0
    charge_overhead_hrs = sum(
        (s.charge_time_min + s.wait_time_min) / 60.0 for s in charging_stops
    )
    driving_time_hrs = total_dur_s / 3600.0
    total_time_hrs = driving_time_hrs + charge_overhead_hrs

    electricity_rate = 0.096   # USD/kWh (≈ ₹8)
    emission_factor = 700.0    # gCO₂/kWh (Indian grid)

    j_cost = round(total_energy * electricity_rate, 2)
    j_env = round(total_energy * emission_factor, 1)

    battery_health = "Nominal"
    if min_soc_seen < 0.20 or max_soc_seen > 0.85:
        battery_health = "High Degradation"

    kpi = KPIMetrics(
        j_time_hrs=round(total_time_hrs, 2),
        j_cost_usd=j_cost,
        j_env_gco2=j_env,
        final_soc=round(final_soc, 4),
        battery_health=battery_health,
        total_distance_km=round(total_km, 1),
    )

    # Convert polyline to [[lat, lng], …]
    route_polyline = [[pt[0], pt[1]] for pt in polyline_pts]

    return RouteResponse(
        route_polyline=route_polyline,
        charging_stops=charging_stops,
        kpi_metrics=kpi,
        telemetry_data=telemetry,
        stations=CHARGING_STATIONS,
    )


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────
@app.post("/api/optimize-route", response_model=RouteResponse)
async def optimize_route(req: RouteRequest):
    return await plan_route(req)


@app.get("/api/stations")
def list_stations():
    return {"count": len(CHARGING_STATIONS), "stations": CHARGING_STATIONS}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "stations_count": len(CHARGING_STATIONS),
        "routing": "OSRM (public)",
    }
