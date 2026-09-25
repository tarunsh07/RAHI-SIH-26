import { useState, useEffect, useRef } from "react";
import { Bell, Search, ChevronDown, X } from "lucide-react";

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Navbar({ onExpandMap, activeTab, onTabChange, onSearchSelect }: { onExpandMap: () => void, activeTab: string, onTabChange: (tab: string) => void, onSearchSelect?: (coords: [number, number]) => void }) {
  const now = useLiveClock();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    const rawApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const apiUrl = rawApiUrl.replace(/\/$/, "");
    fetch(`${apiUrl}/api/stations`)
      .then(r => r.json())
      .then(d => setStations(d.stations || []))
      .catch(e => console.error("Failed to load stations", e));
  }, []);

  const filtered = search.trim() ? stations.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) : [];

  const dayName = DAYS[now.getDay()];
  const day = String(now.getDate()).padStart(2, "0");
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const secs = String(now.getSeconds()).padStart(2, "0");

  return (
    <nav className="navbar">
      <div className="header-bg"></div>

      <div className="navbar-brand" style={{ zIndex: 10 }}>
        <img src="/logo.png" alt="RAHI Logo" className="navbar-logo" />
        <div className="navbar-title">RAHI</div>
        <div className="navbar-subtitle">Intelligent EV Dispatch Platform</div>
      </div>

      <div className="navbar-center-nav" style={{ zIndex: 9999, flex: 1, display: "flex", justifyContent: "center" }}>
        <div className="search-bar" style={{ width: "400px", padding: "8px 16px", position: "relative" }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search locations, vehicles, or stations..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>⌘K</div>
          {search.trim() && filtered.length > 0 && (
            <div className="animate-dropdown" style={{ position: "absolute", top: 40, left: 0, right: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: 6, zIndex: 99999, maxHeight: 200, overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
              {filtered.map(s => (
                <div 
                  key={s.station_id} 
                  style={{ padding: "8px 12px", fontSize: "0.8rem", color: "#e2e8f0", cursor: "pointer", borderBottom: "1px solid #334155", textAlign: "left" }} 
                  onClick={() => { onSearchSelect?.([s.lat, s.lng]); setSearch(""); }}
                >
                  {s.name} <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>({s.power_kw}kW)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right" style={{ zIndex: 9999 }}>
        <div style={{ position: "relative", cursor: "pointer", marginLeft: "8px", marginRight: "8px" }} onClick={() => setShowNotifs(!showNotifs)}>
          <Bell size={20} color="#cbd5e1" />
          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #0f172a" }}></div>
          {showNotifs && (
            <div className="animate-dropdown" style={{ position: "absolute", top: 30, right: -10, width: 280, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 99999, padding: 6, color: "#f8fafc", textAlign: "left", cursor: "default" }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, padding: "2px 4px 6px", borderBottom: "1px solid #334155", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Notifications</span>
                <button onClick={(e) => { e.stopPropagation(); setShowNotifs(false); }} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 2 }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: "0.7rem", padding: "6px 8px", background: "#0f172a", borderRadius: 4, display: "flex", alignItems: "center", borderLeft: "2px solid #22c55e" }}>
                  Fleet optimization complete for Route A
                </div>
                <div style={{ fontSize: "0.7rem", padding: "6px 8px", background: "#0f172a", borderRadius: 4, display: "flex", alignItems: "center", borderLeft: "2px solid #3b82f6" }}>
                  New charging station added in Delhi NCR
                </div>
                <div style={{ fontSize: "0.7rem", padding: "6px 8px", background: "#0f172a", borderRadius: 4, display: "flex", alignItems: "center", borderLeft: "2px solid #f59e0b" }}>
                  Vehicle MH04-EV-2024 requires maintenance
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
          <div className="navbar-avatar-wrapper">
            <div className="navbar-avatar" style={{ background: "linear-gradient(135deg, #a686fb, #6d28d9)", color: "white" }}>CG</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, marginRight: 4, marginLeft: 6 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9", marginTop: 6, whiteSpace: "nowrap" }}>Cipher Gupta</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>
          
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "0.6rem", color: "#cbd5e1", gap: 8, marginTop: -2 }}>
            <span>{dayName}, {day} {month} {year}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>{hours}:{mins}:{secs}</span>
            <span style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", height: 10 }}></span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981", fontWeight: 500 }}>
              <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%" }}></div> System Online
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
