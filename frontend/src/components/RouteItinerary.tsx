import { useState } from "react";
import { Download, Zap, Maximize2, X, MapPin } from "lucide-react";
import type { RouteResponse } from "../types";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RouteItinerary({ routeData, startName, endName }: { routeData: RouteResponse | null, startName: string, endName: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!routeData) {
    return (
      <div className="bottom-panel itinerary-panel skeleton-card" style={{ display: "flex", flexDirection: "column", padding: "12px 14px" }}>
        <div className="section-title" style={{ marginBottom: 8 }}>ROUTE ITINERARY</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={18} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>No Stops Planned</p>
          <p style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center", maxWidth: 160 }}>Origin, charging stops &amp; destination will appear here after route generation.</p>
        </div>
      </div>
    );
  }

  // Generate dynamic times
  const formatTime = (hoursAdded: number) => {
    const totalMins = 8 * 60 + Math.round(hoursAdded * 60);
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const startTimeStr = formatTime(0);
  const endTimeStr = formatTime(routeData.kpi_metrics.j_time_hrs);

  const getStationName = (id: string) => {
    return routeData.stations?.find(s => s.station_id === id)?.name || id;
  };

  const stopsToRender = isExpanded ? routeData.charging_stops : routeData.charging_stops.slice(0, 1);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Route Itinerary Plan", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`${startName} to ${endName}`, 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Distance: ${Math.round(routeData.kpi_metrics.total_distance_km)} km`, 14, 40);
    doc.text(`Total Time: ${Math.floor(routeData.kpi_metrics.j_time_hrs)}h ${Math.round((routeData.kpi_metrics.j_time_hrs % 1) * 60)}m`, 14, 46);
    doc.text(`Total Cost: Rs. ${Math.round(routeData.kpi_metrics.j_cost_usd * 80)}`, 80, 40);
    doc.text(`Avg Efficiency: 1.8 kWh/km`, 80, 46);

    const tableData: string[][] = [];
    
    tableData.push(["Start", startName, startTimeStr, "85%", "-", "-"]);
    
    routeData.charging_stops.forEach((stop, i) => {
      const arrHrs = routeData.kpi_metrics.j_time_hrs * (i + 1) / (routeData.charging_stops.length + 1);
      const arr = formatTime(arrHrs);
      const dep = formatTime(arrHrs + (stop.wait_time_min + stop.charge_time_min) / 60);
      tableData.push([
        `Stop ${i + 1}`,
        getStationName(stop.station_id),
        `${arr} - ${dep}`,
        `${Math.round(stop.soc_at_arrival * 100)}% -> ${Math.round(stop.soc_after_charge * 100)}%`,
        `${Math.round(stop.charge_time_min)} min`,
        `${Math.round(stop.wait_time_min)} min`
      ]);
    });
    
    tableData.push(["End", endName, endTimeStr, `${Math.round(routeData.kpi_metrics.final_soc * 100)}%`, "-", "-"]);

    autoTable(doc, {
      startY: 55,
      head: [['Type', 'Location', 'Time', 'Battery (SoC)', 'Charge Time', 'Wait Time']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
    });
    
    doc.save("RAHI_Route_Plan.pdf");
  };

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>ROUTE ITINERARY</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid #cbd5e1", borderRadius: 4, padding: "4px 10px", fontSize: "0.75rem", color: "#475569", cursor: "pointer", fontWeight: 600, transition: "0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <Download size={12} /> Export
          </button>
          {!isExpanded && (
            <button onClick={() => setIsExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="itinerary-list" style={isExpanded ? { overflowY: "auto", flex: 1, paddingRight: "8px", marginTop: "16px", gap: "24px" } : { gap: "8px" }}>
        {/* Start */}
        <div className="itin-item">
          <div className="itin-icon" style={{ background: "#22c55e" }}></div>
          <div className="itin-content">
            <h4 style={isExpanded ? { fontSize: "1.1rem" } : {}}>Start</h4>
            <p style={isExpanded ? { fontSize: "0.9rem" } : {}}>{startName}</p>
            <div className="itin-sub" style={isExpanded ? { fontSize: "0.8rem" } : {}}>{startTimeStr} | SoC: {Math.round(routeData.telemetry_data[0]?.soc * 100 || 45)}%</div>
          </div>
        </div>

        {/* Stops */}
        {stopsToRender.map((stop, i) => (
          <div className="itin-item" key={stop.station_id}>
            <div className="itin-icon" style={{ background: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Zap size={10} />
            </div>
            <div className="itin-content">
              <h4 style={isExpanded ? { fontSize: "1.1rem" } : {}}>Charging Stop: {getStationName(stop.station_id)}</h4>
              <p style={isExpanded ? { fontSize: "0.9rem" } : {}}>Wait: {Math.round(stop.wait_time_min)} min | Charge: {Math.round(stop.charge_time_min)} min</p>
              <div className="itin-sub" style={isExpanded ? { fontSize: "0.8rem" } : {}}>{formatTime(routeData.kpi_metrics.j_time_hrs * (i + 1) / (routeData.charging_stops.length + 1))} | SoC: {Math.round(stop.soc_at_arrival * 100)}% → {Math.round(stop.soc_after_charge * 100)}%</div>
            </div>
          </div>
        ))}
        
        {!isExpanded && routeData.charging_stops.length > 1 && (
          <div className="itin-item">
            <div className="itin-icon" style={{ background: "#94a3b8", width: 8, height: 8, marginLeft: 3 }}></div>
            <div className="itin-content">
              <p style={{ fontSize: "0.65rem", fontStyle: "italic", cursor: "pointer", color: "#3b82f6" }} onClick={() => setIsExpanded(true)}>+ {routeData.charging_stops.length - 1} more stops (expand to view)</p>
            </div>
          </div>
        )}

        {/* End */}
        <div className="itin-item">
          <div className="itin-icon" style={{ background: "#ef4444" }}></div>
          <div className="itin-content">
            <h4 style={isExpanded ? { fontSize: "1.1rem" } : {}}>End</h4>
            <p style={isExpanded ? { fontSize: "0.9rem" } : {}}>{endName}</p>
            <div className="itin-sub" style={isExpanded ? { fontSize: "0.8rem" } : {}}>{endTimeStr} | SoC: {Math.round(routeData.kpi_metrics.final_soc * 100)}%</div>
          </div>
        </div>
      </div>
    </>
  );

  if (isExpanded) {
    return (
      <>
        <div className="bottom-panel itinerary-panel">{content}</div>
        <div className="fullscreen-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={() => setIsExpanded(false)}>
              <X size={16} />
            </button>
            <div style={{ maxWidth: 600, margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  return <div className="bottom-panel itinerary-panel">{content}</div>;
}
