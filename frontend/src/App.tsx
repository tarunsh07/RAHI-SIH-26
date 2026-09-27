import { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import Navbar from "./components/Navbar";
import SideNav from "./components/SideNav";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import KPIDash from "./components/KPIDash";
import RouteItinerary from "./components/RouteItinerary";
import VehicleCargo from "./components/VehicleCargo";
import FleetDashboard from "./components/FleetDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import type { RouteRequest, RouteResponse } from "./types";
import { ALL_CITIES } from "./types";

export default function App() {
  const [form, setForm] = useState<RouteRequest>({
    start_coords: [28.6139, 77.209], // New Delhi
    end_coords: [25.3176, 82.9739], // Varanasi
    payload_kg: 2000,
    starting_soc: 0.40,
    optimization_priority: "time",
    truck_model: "Freightliner eCascadia",
  });

  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [highlightCoords, setHighlightCoords] = useState<[number, number] | null>(null);

  const [activeTab, setActiveTab] = useState<'plan' | 'fleet' | 'analytics'>('plan');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#0f172a", color: "white", textAlign: "center", padding: "20px" }}>
        <Monitor size={48} style={{ color: "#3b82f6", marginBottom: "20px" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>Desktop View Required</h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.5, maxWidth: "400px" }}>
          For the best experience during the demonstration, this dashboard is exclusively optimized for desktop and larger screens. Please open this link on a computer.
        </p>
      </div>
    );
  }

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || "https://rahi-sih-26.onrender.com";
      const apiUrl = rawApiUrl.replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/optimize-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setRouteData(data);
    } catch (err: any) {
      console.error(err);
      alert(`Route calculation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startName = ALL_CITIES.find(c => c.coords[0] === form.start_coords[0] && c.coords[1] === form.start_coords[1])?.name || "New Delhi";
  const endName = ALL_CITIES.find(c => c.coords[0] === form.end_coords[0] && c.coords[1] === form.end_coords[1])?.name || "Varanasi";

  return (
    <div className="app-shell">
      <Navbar 
        onExpandMap={() => setIsMapExpanded(true)} 
        activeTab={activeTab} 
        onTabChange={(tab: string) => setActiveTab(tab as any)} 
        onSearchSelect={(coords) => {
          setHighlightCoords(coords);
          setIsMapExpanded(true);
        }}
      />
      <div className="main-layout">
        <SideNav onExpandMap={() => setIsMapExpanded(true)} activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as any)} />
        {activeTab === 'plan' && (
          <>
            <Sidebar
              form={form}
              onFormChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
              onSubmit={handleOptimize}
              loading={loading}
            />
            <main className="center-right-grid">
              <div className="left-column">
                <MapView
                  routeData={routeData}
                  startCoords={form.start_coords}
                  endCoords={form.end_coords}
                  isExpanded={isMapExpanded}
                  onCloseExpand={() => setIsMapExpanded(false)}
                  highlightCoords={highlightCoords}
                />
                <div className="map-bottom-row">
                  <KPIDash routeData={routeData} />
                  <RouteItinerary routeData={routeData} startName={startName} endName={endName} />
                  <VehicleCargo form={form} routeData={routeData} />
                </div>
              </div>
            </main>
        </>
        )}
        
        {activeTab === 'fleet' && <FleetDashboard />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>

    </div>
  );
}
