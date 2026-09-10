"""
EV Fleet Physics Engine
=======================
Three deterministic mathematical models for energy consumption,
charging time estimation, and queueing wait-time prediction.
"""

import math
import random

# ──────────────────────────────────────────────
# Physical Constants
# ──────────────────────────────────────────────
RHO_AIR = 1.225        # Air density (kg/m³)
C_D = 0.44             # Aerodynamic drag coefficient
A_F = 4.2              # Frontal area (m²)
C_RR = 0.012           # Rolling resistance coefficient
G = 9.81               # Gravitational acceleration (m/s²)

# Vehicle defaults
DEFAULT_BATTERY_CAPACITY_KWH = 120.0
DEFAULT_VEHICLE_MASS_KG = 8000.0   # Unladen truck mass

# CC-CV charging
BETA_PENALTY = 8.0     # Exponential penalty steepness above 80 % SoC


# ──────────────────────────────────────────────
# A.  Longitudinal Vehicle Dynamics
# ──────────────────────────────────────────────
def calculate_traction_energy(
    velocity_m_s: float,
    acceleration_m_s2: float,
    grade_angle_rad: float,
    vehicle_mass_kg: float,
    time_seconds: float,
) -> float:
    """
    Compute the energy consumed (kWh) over a single road segment.

    F_traction = F_aero + F_roll + F_grade + F_inertia
    Power (kW) = F_traction · v / 1000
    Energy (kWh) = Power · (t / 3600)

    Returns energy in kWh (always >= 0 — regenerative braking is ignored
    in this prototype for simplicity).
    """
    f_aero = 0.5 * RHO_AIR * C_D * A_F * (velocity_m_s ** 2)
    f_roll = vehicle_mass_kg * G * C_RR * math.cos(grade_angle_rad)
    f_grade = vehicle_mass_kg * G * math.sin(grade_angle_rad)
    f_inertia = vehicle_mass_kg * acceleration_m_s2

    f_traction = f_aero + f_roll + f_grade + f_inertia

    # Clamp to zero — truck coasting downhill doesn't *add* energy in this model
    f_traction = max(f_traction, 0.0)

    power_kw = (f_traction * velocity_m_s) / 1000.0
    energy_kwh = power_kw * (time_seconds / 3600.0)
    return energy_kwh


def calculate_segment_energy(
    length_m: float,
    speed_m_s: float,
    vehicle_mass_kg: float,
    grade_angle_rad: float = 0.0,
    acceleration_m_s2: float = 0.0,
) -> float:
    """
    Convenience wrapper: given a road segment length and speed, compute
    the time and return energy (kWh).
    """
    if speed_m_s <= 0:
        speed_m_s = 8.33  # default ~30 km/h in urban areas
    time_s = length_m / speed_m_s
    return calculate_traction_energy(
        velocity_m_s=speed_m_s,
        acceleration_m_s2=acceleration_m_s2,
        grade_angle_rad=grade_angle_rad,
        vehicle_mass_kg=vehicle_mass_kg,
        time_seconds=time_s,
    )


# ──────────────────────────────────────────────
# B.  CC-CV Charging Kinetics
# ──────────────────────────────────────────────
def calculate_charge_time(
    current_soc: float,
    target_soc: float,
    charger_power_kw: float,
    battery_capacity_kwh: float = DEFAULT_BATTERY_CAPACITY_KWH,
) -> float:
    """
    Estimate charging time (minutes) using a piecewise CC-CV model.

    • Constant Current (SoC ≤ 0.80): linear — time = energy / power
    • Constant Voltage (SoC > 0.80): exponential penalty applied

    Returns total charging time in minutes.
    """
    if target_soc <= current_soc:
        return 0.0

    total_minutes = 0.0
    soc = current_soc
    step = 0.01  # 1 % SoC increments for numerical integration

    while soc < target_soc:
        soc_next = min(soc + step, target_soc)
        delta_energy = (soc_next - soc) * battery_capacity_kwh  # kWh

        if soc_next <= 0.80:
            # CC phase — full charger power available
            time_hrs = delta_energy / charger_power_kw
        else:
            # CV phase — exponential throttling
            penalty = math.exp(BETA_PENALTY * (soc_next - 0.80))
            effective_power = charger_power_kw / penalty
            effective_power = max(effective_power, 1.0)  # floor at 1 kW
            time_hrs = delta_energy / effective_power

        total_minutes += time_hrs * 60.0
        soc = soc_next

    return round(total_minutes, 2)


# ──────────────────────────────────────────────
# C.  M/M/N Queueing (Kingman Approximation)
# ──────────────────────────────────────────────
def calculate_wait_time(
    num_plugs: int,
    arrival_rate_lambda: float | None = None,
    avg_service_time_min: float = 30.0,
) -> float:
    """
    Estimate expected waiting time at a charging station using a simplified
    M/M/N queueing model (Kingman / heavy-traffic approximation).

    • λ (arrival rate) is randomised between 1-10 vehicles/hr if not supplied.
    • μ = 1 / avg_service_time  (service rate per plug, in vehicles/hr)
    • ρ = λ / (N · μ)           (utilisation ratio, capped at 0.95)

    Returns expected wait time in minutes.
    """
    if arrival_rate_lambda is None:
        arrival_rate_lambda = random.uniform(1.0, 10.0)

    if avg_service_time_min <= 0.01:
        return 0.0

    # Service rate: vehicles/hr per plug
    mu = 60.0 / avg_service_time_min  # e.g. 2 vehicles/hr for 30-min service

    N = max(num_plugs, 1)
    rho = arrival_rate_lambda / (N * mu)
    rho = min(rho, 0.95)  # cap to prevent divergence

    if rho <= 0:
        return 0.0

    # Kingman (heavy-traffic) approximation for M/M/N:
    # W_q ≈ (ρ / (1 - ρ)) · (1 / (N · μ))   [hours]
    wait_hrs = (rho / (1.0 - rho)) * (1.0 / (N * mu))
    wait_min = wait_hrs * 60.0

    return round(max(wait_min, 0.0), 2)
