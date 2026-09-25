import { useState } from "react";
import {
  Clock,
  Banknote,
  Battery,
  Leaf,
  BarChart3,
  Maximize2,
  X,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { RouteResponse } from "../types";

interface KPIDashProps {
  routeData: RouteResponse | null;
}

export default function KPIDash({ routeData }: KPIDashProps) {
  const [isOutcomesExpanded, setIsOutcomesExpanded] = useState(false);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);

  if (!routeData) {
    return (
      <div className="right-panel-wrapper">
        <div className="right-card outcomes-card skeleton-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Route Outcomes</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 8, paddingBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={20} color="#cbd5e1" />
            </div>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>No Route Computed</p>
            <p style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center", maxWidth: 180 }}>Time, cost, battery health &amp; emissions KPIs will populate after generating a route.</p>
          </div>
        </div>
        <div className="right-card telemetry-card skeleton-card">
          <div className="section-title" style={{ marginBottom: 12 }}>Battery Telemetry</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 8, paddingBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Battery size={20} color="#cbd5e1" />
            </div>
            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>SoC Chart Pending</p>
            <p style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center", maxWidth: 160 }}>Real-time state-of-charge telemetry will display here once a route is active.</p>
          </div>
        </div>
      </div>
    );
  }

  const { kpi_metrics: kpi, telemetry_data, charging_stops } = routeData;

  const hrs = Math.floor(kpi.j_time_hrs);
  const mins = Math.round((kpi.j_time_hrs - hrs) * 60);

  const MetricCard = ({ icon: Icon, iconBg, iconColor, value, unit, badge, label, isExpanded }: any) => (
    <div style={{
      boxSizing: "border-box",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", height: isExpanded ? "48px" : "38px", marginBottom: "8px" }}>
        <div style={{ width: 24, height: 24, borderRadius: "6px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={12} color={iconColor} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span style={{ fontSize: isExpanded ? "1.2rem" : "0.9rem", fontWeight: 700, color: "#0f172a" }}>{value}</span>
          <span style={{ fontSize: isExpanded ? "0.85rem" : "0.7rem", fontWeight: 600, color: "#0f172a", marginTop: "1px" }}>{unit || "\u00A0"}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: isExpanded ? "0.9rem" : "0.65rem", fontWeight: 600, color: "#475569" }}>
          {label}
        </div>
        <div style={{ fontSize: isExpanded ? "0.85rem" : "0.65rem", fontWeight: 700, color: badge ? "#16a34a" : "#94a3b8" }}>
          {badge ? `↓ ${badge}` : "—"}
        </div>
      </div>
    </div>
  );

  const kpiCards = [
    {
      icon: Clock, iconBg: "#eff6ff", iconColor: "#3b82f6",
      value: hrs > 0 ? hrs.toFixed(1) : mins.toString(),
      unit: hrs > 0 ? "hrs" : "min",
      badge: "18%", label: "Total Time"
    },
    {
      icon: Banknote, iconBg: "#dcfce7", iconColor: "#16a34a",
      value: `₹${Math.round(kpi.j_cost_usd * 80).toLocaleString("en-IN")}`,
      unit: "",
      badge: "22%", label: "Total Cost"
    },
    {
      icon: Battery, iconBg: kpi.battery_health === "Nominal" ? "#dcfce7" : "#fef3c7", iconColor: kpi.battery_health === "Nominal" ? "#16a34a" : "#d97706",
      value: kpi.battery_health.includes("High") ? "High" : kpi.battery_health,
      unit: kpi.battery_health.includes("High") ? "Degradation" : "",
      badge: "", label: "Battery Health"
    },
    {
      icon: Leaf, iconBg: "#dcfce7", iconColor: "#16a34a",
      value: kpi.j_env_gco2 >= 1000 ? (kpi.j_env_gco2 / 1000).toFixed(1) : Math.round(kpi.j_env_gco2).toString(),
      unit: kpi.j_env_gco2 >= 1000 ? "kg" : "g",
      badge: "28%", label: "Grid CO₂"
    }
  ];

  const outcomesContent = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Route Outcomes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isOutcomesExpanded && (
            <select style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", outline: "none", color: "#475569" }}>
              <option>Compared to shortest route</option>
              <option>Compared to fastest route</option>
            </select>
          )}
          {!isOutcomesExpanded && (
            <button onClick={() => setIsOutcomesExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>
      {isOutcomesExpanded && (
        <p style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 12, marginTop: -4 }}>Key performance indicators for the optimized route.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isOutcomesExpanded ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: "8px", flex: 1, width: "100%" }}>
        {kpiCards.map((card, i) => <MetricCard key={i} {...card} isExpanded={isOutcomesExpanded} />)}
      </div>
      
      {isOutcomesExpanded && (
        <div style={{ marginTop: "24px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>Detailed Route Breakdown</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Cost Savings vs Diesel</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>42.5%</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Estimated ₹4,200 saved on this trip</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Time Impact (Fast Charging)</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>+45 mins</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Optimized across 2 DC fast chargers</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Estimated Driver Fatigue</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#3b82f6", marginTop: "4px" }}>Low</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Charging stops align with mandatory rest breaks</div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const telemetryContent = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Battery Telemetry</div>
        {!isTelemetryExpanded && (
          <button onClick={() => setIsTelemetryExpanded(true)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
            <Maximize2 size={14} />
          </button>
        )}
      </div>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 8, fontSize: "0.65rem", color: "#64748b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }}></div> SoC %</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }}></div> Charging Stop</div>
      </div>

      <div style={{ width: "100%", height: isTelemetryExpanded ? "100%" : 75, minHeight: isTelemetryExpanded ? 300 : 75 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={telemetry_data.map((pt) => ({
              ...pt,
              soc_pct: Math.round(pt.soc * 100),
            }))}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="socGradientWhite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="distance_km"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(val) => Math.round(val).toString()}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
              minTickGap={20}
              label={isTelemetryExpanded ? { value: "Distance (km)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 11 } : undefined}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
              label={isTelemetryExpanded ? { value: "SoC (%)", angle: -90, position: "insideLeft", offset: 15, fill: "#94a3b8", fontSize: 11 } : undefined}
            />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              formatter={(value: any) => [`${value}%`, "SoC"]}
              labelFormatter={(label) => `${Number(label).toFixed(1)} km`}
            />
            <Area
              type="monotone"
              dataKey="soc_pct"
              stroke="#3b82f6"
              strokeWidth={isTelemetryExpanded ? 3 : 2}
              fill="url(#socGradientWhite)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.soc_pct === 80 || payload.soc_pct === 78) {
                  return (
                    <circle cx={cx} cy={cy} r={isTelemetryExpanded ? 6 : 3} fill="#16a34a" stroke="#ffffff" strokeWidth={isTelemetryExpanded ? 2 : 1} />
                  );
                }
                return <></>;
              }}
              activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!isTelemetryExpanded && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", borderTop: "1px dashed #e2e8f0", paddingTop: "6px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>CHARGING STOPS</span>
            <span style={{ fontSize: "0.75rem", color: "#0f172a", fontWeight: 700 }}>{charging_stops.length} Fast Chargers</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
            <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600 }}>DESTINATION SOC</span>
            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>{Math.round(kpi.final_soc * 100)}% Remaining</span>
          </div>
        </div>
      )}

      {isTelemetryExpanded && (
        <div style={{ marginTop: "24px", padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>Battery Health & Thermal Telemetry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Avg Discharge Rate</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>0.8 C</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Well within safe operating limits</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Thermal Management Energy</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>4.2 kWh</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Estimated energy used for battery cooling</div>
            </div>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Est. Cycle Degradation</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#3b82f6", marginTop: "4px" }}>0.015%</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>Minimal capacity loss on this route</div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="right-panel-wrapper">
      
      {/* Route Outcomes Card */}
      {isOutcomesExpanded ? (
        <div className="fullscreen-modal-overlay" onClick={() => setIsOutcomesExpanded(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={() => setIsOutcomesExpanded(false)}>
              <X size={16} />
            </button>
            <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              {outcomesContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="right-card outcomes-card">
          {outcomesContent}
        </div>
      )}

      {/* Battery Telemetry Card */}
      {isTelemetryExpanded ? (
        <div className="fullscreen-modal-overlay" onClick={() => setIsTelemetryExpanded(false)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal-close" onClick={() => setIsTelemetryExpanded(false)}>
              <X size={16} />
            </button>
            <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              {telemetryContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="right-card telemetry-card">
          {telemetryContent}
        </div>
      )}
    </div>
  );
}
