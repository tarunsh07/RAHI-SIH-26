import { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Line,
  ComposedChart,
} from "recharts";
import { Maximize2, X, TrendingUp } from "lucide-react";
import type { RouteResponse } from "../types";

interface ElevationChartProps {
  routeData: RouteResponse | null;
}

export default function ElevationChart({ routeData }: ElevationChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const data = useMemo(() => {
    if (!routeData) return [];
    
    let cumulativeEnergy = 0;
    return routeData.telemetry_data.map((pt, i) => {
      const elevation = 200 + Math.sin(pt.distance_km / 12) * 80 + Math.cos(pt.distance_km / 5) * 40;
      
      if (i > 0) {
        const distDiff = pt.distance_km - routeData.telemetry_data[i-1].distance_km;
        cumulativeEnergy += distDiff * 1.2 * (1 + Math.sin(pt.distance_km / 10) * 0.2); 
      }
      
      return {
        distance: pt.distance_km,
        elevation: Math.round(elevation),
        energy: Number(cumulativeEnergy.toFixed(1)),
      };
    });
  }, [routeData]);

  if (!routeData) {
    return (
      <div className="bottom-panel elevation-panel skeleton-card" style={{ display: "flex", flexDirection: "column", padding: "12px 14px" }}>
        <div className="section-title" style={{ marginBottom: 8 }}>Route Elevation &amp; Energy</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>Awaiting Route Data</p>
          <p style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center", maxWidth: 160 }}>Elevation &amp; cumulative energy will plot here once a route is generated.</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0, fontSize: "0.75rem", whiteSpace: "nowrap" }}>Route Elevation & Energy</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.6rem", color: "#64748b", whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 4, background: "#cbd5e1", borderRadius: 2 }}></div> Elevation
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 4, background: "#3b82f6", borderRadius: 2 }}></div> Energy (kWh)
          </div>
          {!isExpanded && (
            <button onClick={() => setIsExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0, marginLeft: "4px" }}>
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, width: "100%", height: isExpanded ? "100%" : 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="distance"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(val) => Math.round(val).toString()}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
              minTickGap={20}
              label={isExpanded ? { value: "Distance (km)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 11 } : undefined}
            />
            <YAxis
              yAxisId="left"
              domain={['auto', 'auto']}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
              label={isExpanded ? { value: "Elevation (m)", angle: -90, position: "insideLeft", offset: 15, fill: "#94a3b8", fontSize: 11 } : undefined}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 'dataMax']}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(val) => Math.round(val).toString()}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
              label={isExpanded ? { value: "Cumulative Energy (kWh)", angle: 90, position: "insideRight", offset: -5, fill: "#94a3b8", fontSize: 11 } : undefined}
            />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="elevation"
              fill="#e2e8f0"
              stroke="none"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="energy"
              stroke="#3b82f6"
              strokeWidth={isExpanded ? 3 : 2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: "24px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>Topography & Energy Metrics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Max Ascent Grade</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ef4444", marginTop: "4px" }}>6.4%</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Peak climb requires 140 kW power</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Net Elevation Change</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>+420 m</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Overall uphill route profile</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Regen Braking Recovered</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>12.5 kWh</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Recaptured during downhill segments</div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isExpanded) {
    return (
      <>
        <div className="bottom-panel elevation-panel">{content}</div>
        <div className="fullscreen-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={() => setIsExpanded(false)}>
              <X size={16} />
            </button>
            <div style={{ maxWidth: 800, margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  return <div className="bottom-panel elevation-panel">{content}</div>;
}
