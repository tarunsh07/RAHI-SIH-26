import { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Navigation, Zap, X, Sun, Moon } from "lucide-react";
import type { RouteResponse, ChargingStation } from "../types";

/* Sleek Professional Map Markers */
const startIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:linear-gradient(135deg, #10b981, #059669);color:white;border-radius:50%;box-shadow:0 3px 8px rgba(16,185,129,0.4);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const endIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:linear-gradient(135deg, #f43f5e, #e11d48);color:white;border-radius:50%;box-shadow:0 3px 8px rgba(244,63,94,0.4);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const stationIcon = L.divIcon({
  className: "",
  html: `<div style="opacity:0.65;display:flex;align-items:center;justify-content:center;width:10px;height:10px;background:#f1f5f9;color:#64748b;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.15);border:1.5px solid #cbd5e1;"><svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const activeStationIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;background:linear-gradient(135deg, #3b82f6, #2563eb);color:white;border-radius:50%;box-shadow:0 3px 8px rgba(59,130,246,0.4);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const highlightIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:linear-gradient(135deg, #eab308, #ca8a04);color:white;border-radius:50%;box-shadow:0 0 0 6px rgba(234,179,8,0.3);border:2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* Auto-fit bounds component */
function FitBounds({ coords, highlight }: { coords: [number, number][], highlight?: [number, number] | null }) {
  const map = useMap();
  const prevKey = useRef("");

  useEffect(() => {
    if (highlight) {
      map.flyTo(highlight, 14, { duration: 1.5 });
      return;
    }
    
    if (coords.length < 2) return;
    const key = coords.map((c) => `${c[0].toFixed(3)},${c[1].toFixed(3)}`).join("|");
    if (key === prevKey.current) return;
    prevKey.current = key;

    const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [coords, map, highlight]);

  return null;
}

/* Fixes broken tiles when container resizes */
function MapUpdater({ isExpanded }: { isExpanded?: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

interface MapViewProps {
  routeData: RouteResponse | null;
  startCoords: [number, number];
  endCoords: [number, number];
  isExpanded?: boolean;
  onCloseExpand?: () => void;
  highlightCoords?: [number, number] | null;
}

export default function MapView({
  routeData,
  startCoords,
  endCoords,
  isExpanded,
  onCloseExpand,
  highlightCoords,
}: MapViewProps) {
  const center: [number, number] = [28.6139, 77.209];
  const [mapType, setMapType] = useState<"Map" | "Satellite">("Map");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const allStations: ChargingStation[] = routeData?.stations ?? [];
  const activeStationIds = new Set(
    routeData?.charging_stops?.map((s) => s.station_id) ?? []
  );

  const fitCoords: [number, number][] = routeData
    ? (routeData.route_polyline as [number, number][])
    : [startCoords, endCoords];

  // Logic to compute the detour dashed line near the charging station
  const detourPolyline = useMemo(() => {
    if (!routeData || routeData.charging_stops.length === 0) return null;
    const cs = routeData.charging_stops[0];
    const poly = routeData.route_polyline;
    
    let minDiff = Infinity;
    let minIdx = -1;
    for (let i = 0; i < poly.length; i++) {
      const d = Math.pow(poly[i][0] - cs.lat, 2) + Math.pow(poly[i][1] - cs.lng, 2);
      if (d < minDiff) {
        minDiff = d;
        minIdx = i;
      }
    }
    
    if (minIdx !== -1) {
      const startIdx = Math.max(0, minIdx - 8);
      const endIdx = Math.min(poly.length - 1, minIdx + 8);
      return poly.slice(startIdx, endIdx + 1);
    }
    return null;
  }, [routeData]);

  return (
    <div className={`map-panel ${isExpanded ? 'fullscreen-map' : ''} ${isDarkMode ? 'dark-mode-map' : ''}`}>
      {isExpanded && (
        <button onClick={onCloseExpand} style={{ position: "absolute", top: 12, right: 12, zIndex: 10000, background: "#ffffff", color: "#475569", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <X size={20} />
        </button>
      )}

      <div className="map-mode-toggle" style={isExpanded ? { right: 52 } : {}}>
        <div 
          className={`mode-btn ${mapType === "Map" ? "active" : ""}`}
          onClick={() => setMapType("Map")}
        >
          Map
        </div>
        <div 
          className={`mode-btn ${mapType === "Satellite" ? "active" : ""}`}
          onClick={() => setMapType("Satellite")}
        >
          Satellite
        </div>
        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.2)", margin: "0 4px" }}></div>
        <div 
          className="mode-btn" 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          title="Toggle Theme"
          style={{ padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}></div>
          <span>Start</span>
        </div>
        <div className="legend-item">
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}></div>
          <span>Destination</span>
        </div>
        <div className="legend-item">
          <div className="legend-line" style={{ background: "#3b82f6" }}></div>
          <span>Optimized Route</span>
        </div>
        <div className="legend-item">
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#16a34a", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={10} /></div>
          <span>Charging Station</span>
        </div>
      </div>

      {/* Compass / Scale mock */}
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 1000, display: "flex", alignItems: "flex-end", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#94a3b8", fontSize: "0.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100px", borderBottom: "2px solid #94a3b8", paddingBottom: "2px" }}>
            <span>0</span><span>2</span><span>4</span><span>6 km</span>
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e2e8f0", fontWeight: "bold", fontSize: "0.8rem", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
          N
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <ZoomControl position="topleft" />
        <MapUpdater isExpanded={isExpanded} />
        
        {mapType === "Map" ? (
          <TileLayer
            className="map-tiles"
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <FitBounds coords={fitCoords} highlight={highlightCoords} />

        <Marker position={startCoords} icon={startIcon}>
          <Tooltip direction="right" permanent offset={[12, -10]} className="map-tooltip">
            <div style={{ fontWeight: 600, fontSize: "0.75rem" }}>Origin</div>
          </Tooltip>
        </Marker>
        <Marker position={endCoords} icon={endIcon}>
          <Tooltip direction="right" permanent offset={[12, -10]} className="map-tooltip">
            <div style={{ fontWeight: 600, fontSize: "0.75rem" }}>Destination</div>
          </Tooltip>
        </Marker>

        {allStations.map((s) => {
          const isActive = activeStationIds.has(s.station_id);
          return (
            <Marker
              key={s.station_id}
              position={[s.lat, s.lng]}
              icon={isActive ? activeStationIcon : stationIcon}
            >
              <Tooltip direction="top" offset={[0, -10]} className="map-tooltip">
                <div style={{ fontWeight: 600, fontSize: "0.7rem", color: isActive ? "#f59e0b" : "#e2e8f0" }}>{s.name} | {s.power_kw} kW</div>
              </Tooltip>
            </Marker>
          );
        })}

        {routeData && routeData.route_polyline.length > 1 && (
          <Polyline
            positions={routeData.route_polyline as [number, number][]}
            pathOptions={{
              color: "#3b82f6",
              weight: 3,
              opacity: 0.9,
            }}
          />
        )}

        {detourPolyline && (
          <Polyline
            positions={detourPolyline as [number, number][]}
            pathOptions={{
              color: "#f59e0b",
              weight: 4,
              dashArray: "8, 8",
              opacity: 1,
            }}
          />
        )}

        {highlightCoords && (
          <Marker position={highlightCoords} icon={highlightIcon}>
            <Tooltip direction="top" permanent offset={[0, -12]} className="map-tooltip">
              <div style={{ fontWeight: 600, fontSize: "0.75rem", color: "#eab308" }}>Selected Location</div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
