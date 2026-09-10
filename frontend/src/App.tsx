import { useState } from "react";
import Navbar from "./components/Navbar";
import SideNav from "./components/SideNav";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import KPIDash from "./components/KPIDash";
import ElevationChart from "./components/ElevationChart";
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
    starting_soc: 0.65,
    optimization_priority: "time",
  });

  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const [activeTab, setActiveTab] = useState<'plan' | 'fleet' | 'analytics'>('plan');

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/optimize-route", {
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
      <Navbar onExpandMap={() => setIsMapExpanded(true)} activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as any)} />
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
            />
            <div className="map-bottom-row">
              <ElevationChart routeData={routeData} />
              <RouteItinerary routeData={routeData} startName={startName} endName={endName} />
            </div>
          </div>
          <div className="right-column">
            <KPIDash routeData={routeData} />
            <VehicleCargo payload_kg={form.payload_kg} routeData={routeData} />
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
