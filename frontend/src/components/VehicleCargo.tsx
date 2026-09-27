import { useState } from "react";
import { Maximize2, X, Leaf } from "lucide-react";
import type { RouteResponse, RouteRequest } from "../types";

export default function VehicleCargo({ form, routeData }: { form: RouteRequest, routeData: RouteResponse | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>VEHICLE & CARGO</div>
        {!isExpanded && (
          <button onClick={() => setIsExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
            <Maximize2 size={14} />
          </button>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: isExpanded ? "column" : "row", alignItems: "center", gap: "12px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: isExpanded ? "100%" : "120px", flexShrink: 0 }}>
          <img src="/truck.png" alt="EV Truck" className="vehicle-img" style={{ borderRadius: "8px", objectFit: "contain", height: isExpanded ? "180px" : "75px", width: "100%", marginBottom: isExpanded ? "8px" : "4px" }} />
          <div style={{ fontSize: isExpanded ? "0.85rem" : "0.55rem", fontWeight: 700, color: "#0f172a", textAlign: "center", lineHeight: 1.1 }}>{form.truck_model || "Freightliner eCascadia"}</div>
        </div>
        
        <div className="vehicle-specs" style={{ display: "flex", flexDirection: "column", fontSize: isExpanded ? "1rem" : "0.65rem", gap: isExpanded ? "16px" : "8px", width: "100%" }}>
          <div className="spec-row">
            <span className="spec-label">Battery</span>
            <span className="spec-value">
              {form.truck_model === "Volvo VNR Electric" ? "565 kWh" : 
               form.truck_model === "Freightliner eCascadia" ? "438 kWh" : 
               form.truck_model === "Nikola Tre BEV" ? "733 kWh" : "850 kWh"}
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Est. Range</span>
            <span className="spec-value">
              {form.truck_model === "Volvo VNR Electric" ? "440 km" : 
               form.truck_model === "Freightliner eCascadia" ? "370 km" : 
               form.truck_model === "Nikola Tre BEV" ? "530 km" : "800 km"}
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Initial SoC</span>
            <span className="spec-value">{Math.round(form.starting_soc * 100)}%</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: isExpanded ? "8px" : "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span className="spec-label">Payload Capacity</span>
              <span className="spec-value">{form.payload_kg.toLocaleString()} / 5,000 kg</span>
            </div>
            <div style={{ width: "100%", height: isExpanded ? "6px" : "4px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min((form.payload_kg / 5000) * 100, 100)}%`, height: "100%", background: "#3b82f6", borderRadius: "4px", transition: "width 0.3s ease" }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "12px", background: "#dcfce7", borderRadius: "4px", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#16a34a", fontSize: isExpanded ? "0.9rem" : "0.65rem", fontWeight: 700, flexShrink: 0 }}>
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

  return <div className="bottom-panel vehicle-panel" style={{ paddingBottom: '8px', justifyContent: 'space-between', height: '100%' }}>{content}</div>;
}
