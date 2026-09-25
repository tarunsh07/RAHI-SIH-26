import { useState, useCallback, useEffect } from "react";
import {
  MapPin,
  Clock,
  Banknote,
  HeartPulse,
  Leaf,
  ArrowRight,
  ChevronDown,
  X
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

const LOCATION_OPTIONS = STATES_AND_CITIES.flatMap((s, si) => [
  { isGroup: true, label: s.state, value: `group-${si}` },
  ...s.cities.map((c, ci) => ({ isGroup: false, label: `${c.name}`, value: `${si}-${ci}` }))
]);

const TRUCK_OPTIONS = [
  { isGroup: false, label: "Tesla Semi", value: "Tesla Semi" },
  { isGroup: false, label: "Volvo VNR Electric", value: "Volvo VNR Electric" },
  { isGroup: false, label: "Freightliner eCascadia", value: "Freightliner eCascadia" },
  { isGroup: false, label: "Nikola Tre BEV", value: "Nikola Tre BEV" },
];

function CustomSelect({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: any[], placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder || "Select...";

  return (
    <div style={{ position: "relative" }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="white-form-select" 
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", paddingLeft: 36 }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} color="#64748b" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="animate-dropdown" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, zIndex: 99999, maxHeight: 240, overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            {options.map((opt, i) => (
              opt.isGroup ? (
                <div key={opt.value} style={{ padding: "6px 12px", background: "#f8fafc", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", position: "sticky", top: 0 }}>
                  {opt.label}
                </div>
              ) : (
                <div 
                  key={opt.value} 
                  onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }} 
                  style={{ padding: "8px 12px", fontSize: "0.8rem", color: opt.value === value ? "#3b82f6" : "#0f172a", background: opt.value === value ? "#eff6ff" : "transparent", cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: opt.value === value ? "#3b82f6" : "transparent" }}></span>
                  {opt.label}
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

  const [isCargoOpen, setIsCargoOpen] = useState(false);
  const [showCargoTooltip, setShowCargoTooltip] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowCargoTooltip(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => {
          if (p < 40) return p + 3;
          if (p < 70) return p + 1.5;
          if (p < 85) return p + 0.5;
          if (p < 95) return p + 0.2;
          return p;
        });
      }, 200);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
            <div className="white-form-group" style={{ position: "relative", zIndex: 50 }}>
              <label className="white-form-label">Origin</label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="#475569" style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }} />
                <CustomSelect
                  value={`${originState}-${Math.max(originCityIdx, 0)}`}
                  options={LOCATION_OPTIONS}
                  onChange={(val) => {
                    const [sIdx, cIdx] = val.split('-').map(Number);
                    if (sIdx !== originState) {
                      handleOriginStateChange(sIdx);
                    } else {
                      const city = originCities[cIdx];
                      if (city) onFormChange({ start_coords: city.coords });
                    }
                  }}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="white-form-group" style={{ marginTop: -8, position: "relative", zIndex: 40 }}>
              <label className="white-form-label">Destination</label>
              <div style={{ position: "relative" }}>
                <MapPin size={16} color="#475569" style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }} />
                <CustomSelect
                  value={`${destState}-${Math.max(destCityIdx, 0)}`}
                  options={LOCATION_OPTIONS}
                  onChange={(val) => {
                    const [sIdx, cIdx] = val.split('-').map(Number);
                    if (sIdx !== destState) {
                      handleDestStateChange(sIdx);
                    } else {
                      const city = destCities[cIdx];
                      if (city) onFormChange({ end_coords: city.coords });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Cargo Block */}
        <div style={{ position: "relative" }}>
          {showCargoTooltip && (
            <div style={{
              position: "absolute",
              right: "12px",
              top: "-34px",
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              zIndex: 99999,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              animation: "pulse 2s infinite"
            }}>
              <div style={{ position: "absolute", right: "12px", bottom: "-5px", width: "8px", height: "8px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", transform: "rotate(45deg)" }}></div>
              <span>Select Cargo Details</span>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCargoTooltip(false); }} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 }}>
                 <X size={14} />
              </button>
            </div>
          )}
          <div className="white-panel" onClick={() => setShowCargoTooltip(false)}>
            <div className="panel-header" onClick={() => setIsCargoOpen(!isCargoOpen)} style={{ cursor: 'pointer', padding: "9px 12px", fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #e2e8f0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Vehicle &amp; Cargo
              <ChevronDown size={18} color="#475569" style={{ transform: isCargoOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </div>
            <div className={`accordion-content-wrapper ${isCargoOpen ? 'open' : ''}`}>
              <div className="accordion-content-inner" style={{ padding: "16px" }}>
              {/* Truck */}
            <div className="white-form-group">
              <label className="white-form-label">Vehicle Model</label>
              <div style={{ position: "relative" }}>
                <CustomSelect
                  value={form.truck_model || "Freightliner eCascadia"}
                  options={TRUCK_OPTIONS}
                  onChange={(v) => onFormChange({ truck_model: v })}
                />
              </div>
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
            </div>
          </div>
        </div>

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
          style={{ width: "100%", position: "relative", overflow: "hidden" }}
        >
          {loading && (
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progress}%`,
              background: "rgba(255, 255, 255, 0.25)",
              transition: "width 0.2s ease-out",
              zIndex: 1
            }} />
          )}
          <span style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}>
            {loading ? (
              <>{progress < 15 ? "Waking up server..." : progress < 95 ? "Computing Route..." : "Finalizing..."}</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                Generate Optimized Route
                <ArrowRight size={16} style={{ marginLeft: "auto" }} />
              </>
            )}
          </span>
        </button>
      </div>
    </aside>
  );
}
