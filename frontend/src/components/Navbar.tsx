import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";

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

export default function Navbar({ onExpandMap, activeTab, onTabChange }: { onExpandMap: () => void, activeTab: string, onTabChange: (tab: string) => void }) {
  const now = useLiveClock();

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

      <div className="navbar-center-nav" style={{ zIndex: 10, flex: 1, display: "flex", justifyContent: "center" }}>
        <div className="search-bar" style={{ width: "400px", padding: "8px 16px" }}>
          <Search size={16} />
          <input type="text" placeholder="Search locations, vehicles, or stations..." />
          <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>⌘K</div>
        </div>
      </div>

      <div className="navbar-right" style={{ zIndex: 10 }}>
        <div style={{ position: "relative", cursor: "pointer", marginLeft: "8px", marginRight: "8px" }}>
          <Bell size={20} color="#cbd5e1" />
          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #0f172a" }}></div>
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
