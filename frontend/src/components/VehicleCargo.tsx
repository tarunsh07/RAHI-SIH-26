import { useState } from "react";
import { Maximize2, X, Leaf } from "lucide-react";
import type { RouteResponse } from "../types";

export default function VehicleCargo({ payload_kg, routeData }: { payload_kg: number, routeData: RouteResponse | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Vehicle & Cargo</div>
        {!isExpanded && (
          <button onClick={() => setIsExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
            <Maximize2 size={14} />
          </button>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: isExpanded ? "column" : "row", alignItems: "center", gap: "12px", flex: 1 }}>
        <img src="/truck.png" alt="EV Truck" className="vehicle-img" style={{ borderRadius: "8px", objectFit: "contain", height: isExpanded ? "200px" : "60px", width: isExpanded ? "100%" : "80px", marginBottom: isExpanded ? "12px" : "0", flexShrink: 0 }} />
        
        <div className="vehicle-specs" style={{ fontSize: isExpanded ? "1rem" : "0.65rem", gap: isExpanded ? "16px" : "4px", width: "100%" }}>
          <div className="spec-row">
            <span className="spec-label">Battery Capacity</span>
            <span className="spec-value">120 kWh</span>
          </div>
          {isExpanded && (
            <div className="spec-row">
              <span className="spec-label">Efficiency Model</span>
              <span className="spec-value">Physics v1.0</span>
            </div>
          )}
          <div className="spec-row">
            <span className="spec-label">Vehicle Type</span>
            <span className="spec-value">6-Wheeler (EV)</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Payload Mass</span>
            <span className="spec-value">{payload_kg} kg</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12px", background: "#dcfce7", borderRadius: "4px", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#16a34a", fontSize: isExpanded ? "0.9rem" : "0.65rem", fontWeight: 700 }}>
        <Leaf size={isExpanded ? 16 : 12} /> 
        Projected CO₂ Savings: {routeData ? `124 kg` : `--`}
      </div>
    </>
  );

  if (isExpanded) {
    return (
      <>
        <div className="bottom-panel vehicle-panel" style={{ paddingBottom: '8px' }}>{content}</div>
        <div className="fullscreen-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={() => setIsExpanded(false)}>
              <X size={16} />
            </button>
            <div style={{ maxWidth: 500, margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  return <div className="bottom-panel vehicle-panel" style={{ paddingBottom: '8px' }}>{content}</div>;
}
