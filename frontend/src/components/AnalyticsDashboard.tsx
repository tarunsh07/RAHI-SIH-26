import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Zap, Leaf, TrendingDown, DollarSign } from "lucide-react";

export default function AnalyticsDashboard() {
  const energyData = [
    { name: "Mon", current: 4000, previous: 4400 },
    { name: "Tue", current: 3000, previous: 3200 },
    { name: "Wed", current: 2000, previous: 2800 },
    { name: "Thu", current: 2780, previous: 2908 },
    { name: "Fri", current: 1890, previous: 2400 },
    { name: "Sat", current: 2390, previous: 2800 },
    { name: "Sun", current: 3490, previous: 3800 },
  ];

  const utilizationData = [
    { name: "Week 1", utilization: 85 },
    { name: "Week 2", utilization: 88 },
    { name: "Week 3", utilization: 92 },
    { name: "Week 4", utilization: 94 },
  ];

  return (
    <div style={{ flex: 1, padding: "24px", color: "white", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, marginBottom: "8px" }}>Fleet Analytics</h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>High-level insights into energy, cost, and efficiency.</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Total CO₂ Saved</span>
            <Leaf size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>4,250 kg</div>
          <div style={{ color: "#16a34a", fontSize: "0.7rem", fontWeight: 600, marginTop: "4px" }}>↑ 12% vs last month</div>
        </div>
        
        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Cost vs Diesel</span>
            <DollarSign size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>-45%</div>
          <div style={{ color: "#16a34a", fontSize: "0.7rem", fontWeight: 600, marginTop: "4px" }}>₹1.2M Saved YTD</div>
        </div>

        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Avg Efficiency</span>
            <TrendingDown size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>1.8 kWh/km</div>
          <div style={{ color: "#16a34a", fontSize: "0.7rem", fontWeight: 600, marginTop: "4px" }}>Optimized by AI</div>
        </div>

        <div className="skeleton-card" style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600 }}>Energy Consumed</span>
            <Zap size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>14.2 MWh</div>
          <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 600, marginTop: "4px" }}>This Month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", flex: 1, minHeight: "300px" }}>
        
        {/* Main Chart */}
        <div className="skeleton-card" style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: 0, marginBottom: "16px" }}>Weekly Energy Consumption (kWh)</h2>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '0.8rem', fontWeight: 600 }}
                  labelStyle={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="previous" name="Last Week" stroke="#cbd5e1" fillOpacity={1} fill="url(#colorPrevious)" />
                <Area type="monotone" dataKey="current" name="This Week" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="skeleton-card" style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: 0, marginBottom: "16px" }}>Fleet Utilization (%)</h2>
          <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}
                />
                <Bar dataKey="utilization" name="Utilization" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
