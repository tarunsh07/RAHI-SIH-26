import { Truck, Battery, AlertTriangle, Navigation, MapPin } from "lucide-react";

export default function FleetDashboard() {
  const fleetData = [
    { id: "EV-101", status: "On Route", soc: 82, location: "Near Panipat", destination: "Ambala", eta: "1h 15m", payload: "1.8t", health: "Good" },
    { id: "EV-102", status: "Charging", soc: 45, location: "Karnal Supercharger", destination: "Ludhiana", eta: "-", payload: "2.1t", health: "Nominal" },
    { id: "EV-103", status: "Idle", soc: 100, location: "Delhi Hub", destination: "-", eta: "-", payload: "0t", health: "Good" },
    { id: "EV-104", status: "On Route", soc: 34, location: "Kurukshetra Highway", destination: "Chandigarh", eta: "2h 10m", payload: "1.5t", health: "Attention" },
    { id: "EV-105", status: "On Route", soc: 67, location: "Sonipat Bypass", destination: "Panipat", eta: "45m", payload: "2.0t", health: "Good" },
  ];

  return (
    <div style={{ flex: 1, padding: "24px", color: "white", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, marginBottom: "8px" }}>Fleet Overview</h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>Live tracking and status of all EV assets.</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Total Vehicles</span>
            <Truck size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>24</div>
        </div>
        
        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Active Routes</span>
            <Navigation size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>18</div>
        </div>

        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Avg Fleet SoC</span>
            <Battery size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>68%</div>
        </div>

        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Alerts</span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>2</div>
        </div>
      </div>

      {/* Table */}
      <div className="skeleton-card" style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>Active Fleet Status</h2>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#334155" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(0,0,0,0.1)", textAlign: "left", fontSize: "0.8rem", color: "#64748b" }}>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Vehicle ID</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Battery (SoC)</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Location</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Destination</th>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>ETA</th>
            </tr>
          </thead>
          <tbody>
            {fleetData.map((v, i) => (
              <tr key={v.id} style={{ borderBottom: i < fleetData.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                <td style={{ padding: "16px 20px", fontWeight: 600, color: "#0f172a" }}>{v.id}</td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{
                    padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600,
                    background: v.status === "On Route" ? "#dcfce7" : v.status === "Charging" ? "#fef3c7" : "#f1f5f9",
                    color: v.status === "On Route" ? "#16a34a" : v.status === "Charging" ? "#d97706" : "#64748b"
                  }}>
                    {v.status}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "60px", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${v.soc}%`, height: "100%", background: v.soc > 20 ? "#10b981" : "#ef4444" }}></div>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{v.soc}%</span>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={12} color="#94a3b8" />
                    {v.location}
                  </div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: "0.85rem" }}>{v.destination}</td>
                <td style={{ padding: "16px 20px", fontSize: "0.85rem", fontWeight: 500 }}>{v.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
