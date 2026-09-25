import { useState } from "react";
import { Maximize2, X, Leaf } from "lucide-react";
import type { RouteResponse, RouteRequest } from "../types";

export default function VehicleCargo({ form, routeData }: { form: RouteRequest, routeData: RouteResponse | null }) {
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: isExpanded ? "100%" : "80px", flexShrink: 0 }}>
          <img src="/truck.png" alt="EV Truck" className="vehicle-img" style={{ borderRadius: "8px", objectFit: "contain", height: isExpanded ? "180px" : "50px", width: "100%", marginBottom: isExpanded ? "8px" : "4px" }} />
          <div style={{ fontSize: isExpanded ? "0.85rem" : "0.55rem", fontWeight: 700, color: "#0f172a", textAlign: "center", lineHeight: 1.1 }}>{form.truck_model || "Freightliner eCascadia"}</div>
        </div>
        
        <div className="vehicle-specs" style={{ fontSize: isExpanded ? "1rem" : "0.65rem", gap: isExpanded ? "16px" : "4px", width: "100%" }}>
          <div className="spec-row">
            <span className="spec-label">Battery</span>
            <span className="spec-value">
              {form.truck_model === "Volvo VNR Electric" ? "565 kWh" : 
               form.truck_model === "Freightliner eCascadia" ? "438 kWh" : 
               form.truck_model === "Nikola Tre BEV" ? "733 kWh" : "850 kWh"}
            </span>
          </div>
          {isExpanded && (
            <div className="spec-row">
              <span className="spec-label">Efficiency Model</span>
              <span className="spec-value">Physics v1.0</span>
            </div>
          )}
          <div className="spec-row">
            <span className="spec-label">Type</span>
            <span className="spec-value">
              {form.truck_model === "Tesla Semi" ? "Class 8 Semi-Truck" : "Class 8 EV Truck"}
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Payload Mass</span>
            <span className="spec-value">{form.payload_kg} kg</span>
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
