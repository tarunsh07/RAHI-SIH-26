<div align="center">
  <img src="assets/logo.png" alt="RAHI Logo" width="200" />
  <h1>RAHI - Route Analysis and Haulage Intelligence</h1>
  <p><strong>Physics-Informed Multi-Objective EV Fleet Routing & Dispatch Engine</strong></p>
</div>

## 1. Project Information

- **Project Title:** RAHI – Dynamic EV Fleet Routing & Dispatch Engine
- **PS ID:** SIH26205
- **PS Title:** Student Innovation (Transportation & Logistics)
- **Category:** Software
- **Theme:** Transportation & Logistics

## 2. Problem Statement

Commercial Electric Vehicle (EV) fleet dispatchers operate under severe real-world uncertainty. Standard shortest-path algorithms rely on static road networks and linear battery discharge assumptions, completely ignoring:
1. **Dynamic Road Topography & Inertial Forces:** Elevation gradients ($\theta$), rolling friction, and aerodynamic drag drastically accelerate battery depletion under commercial cargo payloads.
2. **Charging Station Congestion:** Severe queueing delays and fluctuating charger availability at public charging hubs cause missed delivery windows and expensive driver overtime penalties.
3. **Electrochemical Realities:** Forcing ultra-fast DC charging on high-temperature packs or charging beyond 80% SoC causes severe non-linear cell throttling (CC-CV phase) and rapid capacity fade.

## 3. Proposed Solution

RAHI solves the EV Vehicle Routing Problem with Pickup and Delivery (VRP-PD) by coupling first-principles electrical engineering physics with a data-driven Machine Learning pipeline.

### Architectural Strategy: Physics Baseline + Machine Learning Optimization
* **The Deterministic Physics Engine (Implemented in Prototype):** Computes exact baseline traction energy ($F_{\text{traction}}$), non-linear battery CC-CV charge curves, and stochastic $M/M/\mathcal{N}_c/K_c$ queue wait times. This guarantees that foundational route evaluations obey energy conservation laws.
* **The Active Machine Learning Pipeline (In Active Training & Pipeline Integration):**
  * **Physics-Guided XGBoost (Energy Prediction):** Predicts the non-deterministic energy *residuals* caused by live traffic stop-and-go patterns on top of the physical baseline.
  * **Time-Series LSTM (Queue Forecasting):** Learns non-stationary customer arrival rates $\Lambda_c(t)$ from temporal traffic patterns to drive the queueing model.
  * **Constrained Deep Q-Network / RL Agent (Route Dispatch):** Evaluates the 4-parameter cost vector ($\mathbf{J} = [J_{\text{time}}, J_{\text{cost}}, J_{\text{health}}, J_{\text{env}}]^T$) with $\epsilon$-constrained boundaries to select optimal charging detours.

## 4. Key Features

- **Physics-Informed Telemetry:** Computes continuous energy consumption ($e_{i,j}$) taking into account vehicle curb weight, live cargo payload, road grade ($\theta$), and motor efficiency mappings.
- **Dynamic Queue-Aware Charging Stops:** Intercepts routes before SoC hits critical reserve limits ($12\%$) and routes trucks to chargers optimized for low wait times and off-peak Time-of-Use (ToU) tariffs.
- **Multi-Objective Bounded Trade-Offs:** Fleet managers choose a primary target (**Fastest Transit**, **Lowest Cost**, **Battery Health**, or **Lowest Emissions**) while the engine applies hard $\epsilon$-constraints to prevent excessive secondary degradation.
- **Highway & Urban Corridor Database:** Curated database of charging hubs mapped across key Indian freight corridors.
- **Interactive Enterprise Visualizer:** Real-time dashboard with dynamic SoC trajectory graphs, detour polylines, and multi-variable KPI breakdowns.

## 5. Technology Stack

- **Frontend Dashboard:** React 18, TypeScript, Vite, Tailwind CSS, Leaflet / React-Leaflet, Lucide Icons, Recharts
- **Backend Core & Routing:** Python 3.11+, FastAPI, Uvicorn, OSRM Engine, NetworkX
- **Machine Learning Pipeline (Active Integration):** PyTorch (DQN / RL Agent), XGBoost / LightGBM, TensorFlow/Keras (LSTM Arrival Predictor)
- **Data Protocols & APIs:** OpenStreetMap (OSMnx), Open-Elevation API, Open Charge Map

## 6. Architecture

See [docs/architecture.md](docs/architecture.md) for full mathematical derivations and ML training loss formulations.

```text
               +---------------------------------------------+
               |  Fleet Dispatch Input (Stops, Payload, SoC) |
               +---------------------------------------------+
                                      |
                                      v
               +---------------------------------------------+
               |    Phase 1: OSRM Route Geometry Extraction  |
               +---------------------------------------------+
                                      |
            +-------------------------+-------------------------+
            |                                                   |
            v                                                   v
+-------------------------------+               +-------------------------------+
|  Physics Engine Baseline      |               |  Active ML Enhancement Layer  |
|  - Longitudinal Forces        | <-----------> |  - XGBoost: Traffic Residuals |
|  - CC-CV Charging Profile     |               |  - LSTM: Station Arrival Rates|
|  - M/M/N/K Queue Equations    |               |  - Constrained DQN: Detours   |
+-------------------------------+               +-------------------------------+
                                      |
                                      v
               +---------------------------------------------+
               |   Phase 2: Multi-Objective Decision Engine  |
               +---------------------------------------------+
                                      |
                                      v
               +---------------------------------------------+
               |   Phase 3: Telemetry Synthesis & Dashboard  |
               +---------------------------------------------+
```

## 7. Repository Structure

```text
prototype/
├── assets/                   # Logos, screenshots, and visual assets
├── backend/                  # FastAPI Server & Physics Engine
│   ├── __pycache__/
│   ├── download_graph.py
│   ├── main.py
│   ├── physics_engine.py
│   └── requirements.txt
├── docs/                     # Technical documentation
│   └── architecture.md
├── frontend/                 # React UI Dashboard (Vite, Leaflet, Tailwind)
├── submission/               # Final SIH documents
│   ├── DEMO.md
│   └── PRESENTATION.md
└── README.md
```

## 8. Final Presentation

The presentation deck covers our mechanical traction modeling, queueing theory proofs, active ML pipeline integration, and live prototype benchmarking.

See `submission/PRESENTATION.md` for the slide breakdown and accessible presentation link.

## 9. Demo Video

See `submission/DEMO.md` for local execution instructions and the demo recording link.

## 10. Screenshots / Prototype Photos

<img width="1908" height="915" alt="1" src="https://github.com/user-attachments/assets/6420ff05-aac7-4877-8259-80056b537ebd" />
<img width="1912" height="920" alt="2" src="https://github.com/user-attachments/assets/94ea272d-bc3a-4d6a-ac51-d42d742cbe21" />


## 11. Installation

### Clone Repository
```bash
git clone https://github.com/tarunsh07/RAHI-SIH-26.git
cd RAHI-SIH-26
```

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

## 12. Run

### 1. Launch FastAPI Backend Server
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation and Swagger UI will be available at `http://127.0.0.1:8000/docs`.

### 2. Launch React Frontend Interface
```bash
# In a separate terminal
cd frontend
npm run dev
```
Open `http://localhost:5173/` in any browser to interact with the dispatch dashboard.

## 13. Future Scope

While the core physics-informed dispatch engine and ML pipeline represent our production architecture, future platform expansion includes:

- **Vehicle-to-Grid (V2G) Bi-Directional Integration:** Allowing commercial fleets to discharge power back into regional microgrids during peak tariff hours to generate auxiliary revenue.
- **Cell Temperature & Battery Thermal Management:** Modeling dynamic HVAC cooling loads and ambient heat factors on Indian highways to actively predict thermal throttling during summer routes.
- **Onboard Telematics (OBD-II / CAN Bus) Integration:** Connecting directly with commercial EV telematics for continuous, real-time SoC and tire-pressure calibration.
