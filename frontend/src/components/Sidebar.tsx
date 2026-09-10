import { useState, useCallback } from "react";
import {
  MapPin,
  Clock,
  Banknote,
  HeartPulse,
  Leaf,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { STATES_AND_CITIES, type RouteRequest } from "../types";

interface SidebarProps {
  form: RouteRequest;
  onFormChange: (updates: Partial<RouteRequest>) => void;
  onSubmit: () => void;
  loading: boolean;
}

const PRIORITY_OPTIONS = [
  {
    value: "time" as const,
    label: "Fast Transit",
    desc: "Minimum total time",
    icon: Clock,
  },
  {
    value: "cost" as const,
    label: "Lowest Cost",
    desc: "Minimize energy + charging cost",
    icon: Banknote,
  },
  {
    value: "health" as const,
    label: "Battery Health",
    desc: "Reduce long-term degradation",
    icon: HeartPulse,
  },
  {
    value: "env" as const,
    label: "Lowest Emissions",
    desc: "Minimize environmental impact",
    icon: Leaf,
  },
];

function findLocation(coords: [number, number]) {
  for (let si = 0; si < STATES_AND_CITIES.length; si++) {
    const state = STATES_AND_CITIES[si];
    for (let ci = 0; ci < state.cities.length; ci++) {
      const city = state.cities[ci];
      if (city.coords[0] === coords[0] && city.coords[1] === coords[1]) {
        return { stateIdx: si, cityIdx: ci };
      }
    }
  }
  return { stateIdx: 0, cityIdx: 0 };
}

export default function Sidebar({
  form,
  onFormChange,
  onSubmit,
  loading,
}: SidebarProps) {
  const startLoc = findLocation(form.start_coords);
  const endLoc = findLocation(form.end_coords);

  const [originState, setOriginState] = useState(startLoc.stateIdx);
  const [destState, setDestState] = useState(endLoc.stateIdx);

  const handleOriginStateChange = useCallback(
    (si: number) => {
      setOriginState(si);
      const firstCity = STATES_AND_CITIES[si].cities[0];
      if (firstCity) {
        onFormChange({ start_coords: firstCity.coords });
      }
    },
    [onFormChange]
  );

  const handleDestStateChange = useCallback(
    (si: number) => {
      setDestState(si);
      const firstCity = STATES_AND_CITIES[si].cities[0];
      if (firstCity) {
        onFormChange({ end_coords: firstCity.coords });
      }
    },
    [onFormChange]
  );

  const originCities = STATES_AND_CITIES[originState]?.cities ?? [];
  const destCities = STATES_AND_CITIES[destState]?.cities ?? [];

  const originCityIdx = originCities.findIndex(
    (c) =>
      c.coords[0] === form.start_coords[0] &&
      c.coords[1] === form.start_coords[1]
  );
  const destCityIdx = destCities.findIndex(
    (c) =>
      c.coords[0] === form.end_coords[0] && c.coords[1] === form.end_coords[1]
  );

  return (
    <aside className="planning-panel">
      <div className="planning-header" style={{ padding: "12px 20px 8px" }}>
        <div className="section-title">ROUTE PLANNING</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Plan Your Route</h2>

      </div>

      <div className="planning-body" style={{ padding: "0 16px" }}>
        
        {/* Route Details Block */}
        <div className="sidebar-accordion">
          <div className="accordion-summary" style={{ padding: "9px 12px", fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>Route Details</div>
          <div className="accordion-content">
            {/* Origin */}
            <div className="white-form-group">
              <label className="white-form-label">Origin</label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="#475569" style={{ position: "absolute", left: 12, top: 12 }} />
                <select
                  className="white-form-select"
                  style={{ paddingLeft: 36 }}
                  value={`${originState}-${Math.max(originCityIdx, 0)}`}
                  onChange={(e) => {
                    const [sIdx, cIdx] = e.target.value.split('-').map(Number);
                    if (sIdx !== originState) {
                      handleOriginStateChange(sIdx);
                    } else {
                      const city = originCities[cIdx];
                      if (city) onFormChange({ start_coords: city.coords });
                    }
                  }}
                >
                  {STATES_AND_CITIES.map((s, si) => (
                    <optgroup key={s.state} label={s.state}>
                      {s.cities.map((c, ci) => (
                        <option key={c.name} value={`${si}-${ci}`}>
                          {s.state} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="white-form-group" style={{ marginTop: -8 }}>
              <label className="white-form-label">Destination</label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="#475569" style={{ position: "absolute", left: 12, top: 12 }} />
                <select
                  className="white-form-select"
                  style={{ paddingLeft: 36 }}
                  value={`${destState}-${Math.max(destCityIdx, 0)}`}
                  onChange={(e) => {
                    const [sIdx, cIdx] = e.target.value.split('-').map(Number);
                    if (sIdx !== destState) {
                      handleDestStateChange(sIdx);
                    } else {
                      const city = destCities[cIdx];
                      if (city) onFormChange({ end_coords: city.coords });
                    }
                  }}
                >
                  {STATES_AND_CITIES.map((s, si) => (
                    <optgroup key={s.state} label={s.state}>
                      {s.cities.map((c, ci) => (
                        <option key={c.name} value={`${si}-${ci}`}>
                          {s.state} - {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Cargo Block */}
        <details className="white-panel">
          <summary className="panel-header" style={{ cursor: 'pointer', listStyle: 'none', padding: "9px 12px", fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #e2e8f0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Vehicle &amp; Cargo
            <ChevronDown size={18} color="#475569" className="chevron-icon" />
          </summary>
          <div className="accordion-content" style={{ padding: "16px" }}>
            {/* Truck */}
            <div className="white-form-group">
              <label className="white-form-label">Vehicle Model</label>
              <select className="white-form-select">
                <option>Tesla Semi</option>
                <option>Volvo VNR Electric</option>
                <option>Freightliner eCascadia</option>
                <option>Nikola Tre BEV</option>
              </select>
            </div>

            {/* Payload */}
            <div className="white-form-group">
              <div className="white-slider-header">
                <label className="white-form-label">Payload Mass (kg)</label>
                <span className="white-slider-value">{form.payload_kg} kg</span>
              </div>
              <input
                type="range"
                className="white-slider-track"
                min={0} max={5000} step={100}
                value={form.payload_kg}
                onChange={(e) => onFormChange({ payload_kg: Number(e.target.value) })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#64748b" }}>
                <span>0</span><span>1000</span><span>2000</span><span>3000</span><span>4000</span><span>5000</span>
              </div>
            </div>

            {/* Starting SoC */}
            <div className="white-form-group" style={{ marginTop: 8 }}>
              <div className="white-slider-header">
                <label className="white-form-label">Starting Battery SoC</label>
                <span className="white-slider-value">{Math.round(form.starting_soc * 100)} %</span>
              </div>
              <input
                type="range"
                className="white-slider-track"
                min={5} max={100} step={1}
                value={Math.round(form.starting_soc * 100)}
                onChange={(e) => onFormChange({ starting_soc: Number(e.target.value) / 100 })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#64748b" }}>
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
          </div>
        </details>

        {/* Optimization Goal Block */}
        <div className="sidebar-accordion" style={{ padding: "10px 12px" }}>
          <div className="section-title" style={{ marginBottom: "8px", textTransform: "none", fontSize: "0.8rem" }}>Optimization Goal</div>
          <div className="priority-options">
            {PRIORITY_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className={`priority-card ${form.optimization_priority === opt.value ? "active active-" + opt.value : ""}`}
                onClick={() => onFormChange({ optimization_priority: opt.value })}
              >
                <div className="priority-icon">
                  <opt.icon size={16} />
                </div>
                <div>
                  <div className="priority-label" style={{ fontSize: "0.65rem", lineHeight: 1 }}>{opt.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Generate Button Wrapper */}
      <div style={{ position: "sticky", bottom: 0, background: "#ffffff", padding: "10px 16px", borderTop: "1px solid #f1f5f9", marginTop: "auto", zIndex: 10 }}>
        <button
          className="btn-blue"
          onClick={onSubmit}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? (
            "Computing Route..."
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              Generate Optimized Route
              <ArrowRight size={16} style={{ marginLeft: "auto" }} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
