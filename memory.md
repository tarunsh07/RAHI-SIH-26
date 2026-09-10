# Intelligent EV Fleet Routing & Dispatch Platform - Project Memory

## 1. Project Context & Objective
**Goal:** A B2B enterprise dashboard for commercial Electric Vehicle (EV) fleet managers to calculate energy-efficient delivery routes, predict dynamic traffic/energy losses, and decide when/where a truck should detour to charge.
**Core Hook:** Utilizes a deterministic "Physics Engine" for electromechanical battery drain and stochastic queueing theory for waiting lines at charging stations.
**Design Language:** Professional, data-dense, B2B SaaS. Dark-themed with deep contrasting colors (Slate/Blue/Emerald).

## 2. Current Architecture & Tech Stack

### Frontend (React + Vite + TypeScript)
- **Framework & Build:** React 19, Vite, TypeScript.
- **Styling:** Tailwind CSS v4, custom CSS variables (`index.css`).
- **Mapping:** `react-leaflet` with `leaflet` (Inverted OSM tiles for dark mode).
- **Data Visualization:** `recharts` (AreaChart for SoC telemetry).
- **Icons:** `lucide-react`.

### Backend (Python + FastAPI)
- **Framework:** FastAPI, Uvicorn.
- **Core Logic:** Custom `physics_engine.py` for mathematical modeling.
- **Routing:** Uses **OSRM (Open Source Routing Machine)** public API via `httpx` for real road-following routes across India (diverging from initial `osmnx` bounding box requirement to support full-country scale).
- **Data Validation:** `pydantic` models for request/response schemas.

## 3. Directory Structure
```text
/ev-fleet-platform (d:/SIH/prototype)
├── /backend
│   ├── main.py              # FastAPI server, endpoints & route optimization loop
│   ├── physics_engine.py    # Math formulas (Traction, CC-CV, Queueing)
│   └── requirements.txt     # Python dependencies
└── /frontend
    ├── package.json         # NPM scripts and dependencies
    ├── /src
    │   ├── App.tsx          # Main Grid Layout & State Management
    │   ├── index.css        # Tailwind directives and custom component styles
    │   ├── types.ts         # TypeScript interfaces & Indian City coordinates
    │   └── /components
    │       ├── MapView.tsx  # Leaflet integration, markers, polylines
    │       ├── Sidebar.tsx  # User Inputs (Origin, Dest, Payload, SoC, Priority)
    │       ├── KPIDash.tsx  # 4-Parameter Output, Charge Stops, Telemetry Chart
    │       └── Navbar.tsx   # Header
```

## 4. Implementation Details

### Backend: Physics Engine (`physics_engine.py`)
1. **Longitudinal Vehicle Dynamics (Energy Drain):**
   - Accounts for Aerodynamic drag (`F_aero`), Rolling resistance (`F_roll`), Grade resistance (`F_grade`), and Inertia (`F_inertia`).
   - Calculates Power (kW) and Energy (kWh) over time/distance. Regenerative braking is currently clamped (min 0).
2. **CC-CV Charging Kinetics:**
   - Linear charging (Constant Current) up to 80% SoC.
   - Exponential decay penalty (Constant Voltage) above 80% SoC using a `BETA_PENALTY`.
3. **Stochastic Queueing (M/M/N):**
   - Uses Kingman's heavy-traffic approximation for expected wait time.
   - Caps utilization ratio ($\rho$) at 0.95 to prevent infinite wait times.

### Backend: Routing Logic (`main.py`)
- **Charging Stations:** Hardcoded list of ~70 stations across major Indian cities and highway corridors.
- **Simulation Loop:** 
  1. Fetches OSRM route for Origin → Destination.
  2. Walks the route polyline segment by segment, calculating energy drain.
  3. If SoC drops below threshold (`0.12`), finds the nearest station within range, adds it as a waypoint, and re-routes.
  4. Recalculates final KPIs: Total Time ($J_{time}$), Energy Cost ($J_{cost}$), CO2 Emissions ($J_{env}$), and Battery Health.

### Frontend: UI/UX (`index.css` & Components)
- **Layout:** Strict `100vh` app-shell grid. 60px Navbar. Main content split into Sidebar (320px), MapView (flex), and KPIDash (360px).
- **Sidebar:** Dropdowns for Start/End locations (parsed from `types.ts`), sliders for Payload & SoC, radio group for Priority.
- **MapView:** Auto-fits bounds to the route. Renders Start (Green), End (Red), and charging stations. Highlights active charging detours in Amber (`#f59e0b`).
- **KPIDash:** 2x2 Grid for metrics, list of active charging stops with wait/charge times, and a telemetry Area Chart showing SoC % dipping and spiking across the journey.

## 5. Development Rules & Future Changes
- **No Boilerplate:** Avoid auth, user management, or settings. Focus on the core dispatch loop.
- **Append Only:** Any new architectural decisions, feature additions, or major context changes MUST be appended to this `memory.md` file.

---
*(End of Initial Context - Append future updates below)*
