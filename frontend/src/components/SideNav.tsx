import { Route, Truck, Zap, BarChart3 } from "lucide-react";

export default function SideNav({ onExpandMap, activeTab, onTabChange }: { onExpandMap: () => void, activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <div className="side-nav">
      <div className={`side-nav-item ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => onTabChange('plan')}>
        <div className="icon-container">
          <Route size={18} />
        </div>
        <span>Plan</span>
      </div>
      
      <div className={`side-nav-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => onTabChange('fleet')}>
        <div className="icon-container">
          <Truck size={18} />
        </div>
        <span>Fleet</span>
      </div>
      
      <div className="side-nav-item" onClick={onExpandMap}>
        <div className="icon-container">
          <Zap size={20} />
        </div>
        <span>Map</span>
      </div>
      
      <div className={`side-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => onTabChange('analytics')}>
        <div className="icon-container">
          <BarChart3 size={18} />
        </div>
        <span>Analytics</span>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
        <div style={{ fontSize: "0.5rem", color: "#64748b", textAlign: "center", lineHeight: "1.2" }}>
          Sustainable<br/>Deliveries<br/>Today<br/>for Tomorrow
        </div>
      </div>
    </div>
  );
}
