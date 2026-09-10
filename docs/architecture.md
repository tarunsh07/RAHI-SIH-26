# System Architecture & Engineering Specifications

**RAHI: Route Analysis and Haulage Intelligence (PS ID: SIH26205)**  
*A Hybrid Framework Fusing First-Principles Physics with Constrained Machine Learning for Commercial EV Fleet Logistics*

---

## 1. Architectural Philosophy: The Dual-Engine Paradigm

Standard machine learning models applied to vehicle routing often operate as statistical "black boxes." In real-world commercial fleet dispatching, pure data-driven approaches regularly fail edge cases—such as predicting negative energy consumption during uphill acceleration or violating battery charging kinetics.

RAHI circumvents this through a **Dual-Engine Architecture**:
* **Engine 1 (Deterministic Physical Foundation):** Establishes hard thermodynamic, mechanical, and queueing-theoretic boundaries. It ensures that every edge traversal and battery state transition obeys energy conservation laws and electrochemical kinetics.
* **Engine 2 (Active Machine Learning Layer):** Learns non-linear, stochastic real-world dynamics (urban traffic stop-and-go cycles, fluctuating queue arrivals, and multi-objective Pareto trade-offs) strictly bounded by the physical engine.

```text
+----------------------------------------------------------------------------------------------------+
|                                    RAHI DUAL-ENGINE ARCHITECTURE                                   |
|                                                                                                    |
|  [ Dispatch Inputs ]                                                                               |
|  (Waypoints, Payload Mass, Starting SoC, Driver Shift Limit, Fleet Objective)                      |
|          │                                                                                         |
|          ▼                                                                                         |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ ENGINE 1: DETERMINISTIC PHYSICS BASELINE                                                     │  |
|  │  ├── 1. Longitudinal Dynamics: Computes baseline tractive demand F_traction                 │  |
|  │  ├── 2. Drivetrain & Regen: Maps mechanical work to battery drain via eta_motor              │  |
|  │  ├── 3. Electrochemical CC-CV: Non-linear charging power tapering above 80% SoC              │  |
|  │  └── 4. Kingman Queueing Model: Analytical wait-time calculation E[T_c^wt]                   │  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────┘  |
|          │                                                                                         |
|          ▼ (Provides Physical Bounds & Baseline Costs)                                             |
|  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐  |
|  │ ENGINE 2: ACTIVE MACHINE LEARNING OPTIMIZATION LAYER                                         │  |
|  │  ├── 1. Physics-Guided XGBoost: Predicts traffic-induced residual energy loss Delta e        │  |
|  │  ├── 2. Temporal LSTM: Forecasts time-varying station arrival rates Lambda_c(t)             │  |
|  │  └── 3. Constrained DQN: Explores detour actions via eps-bounded multi-objective rewards     │  |
|  └──────────────────────────────────────────────────────────────────────────────────────────────┘  |
|          │                                                                                         |
|          ▼                                                                                         |
|  [ Real-Time Dispatch Solution ]                                                                   |
|  (Turn-by-Turn Waypoints, Dynamic SoC Curves, Charging Dwell Schedules, Cost Breakdown)           |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Engine 1: Deterministic Physics Baseline

### 2.1 Longitudinal Vehicle Dynamics & Traction Energy
For any directed road link between node $i$ and node $j$, the total required tractive force at the wheels $F_{\text{traction}}(t)$ is derived from first-principles road mechanics:

$$F_{\text{traction}}(t) = F_{\text{aero}}(t) + F_{\text{roll}}(t) + F_{\text{grade}}(t) + F_{\text{accel}}(t)$$

$$F_{\text{traction}}(t) = \frac{1}{2}\rho_a C_d A_f v(t)^2 + M_{\text{veh}} g C_{rr} \cos(\theta) + M_{\text{veh}} g \sin(\theta) + M_{\text{veh}} a(t)$$

| Parameter | Symbol | Engineering Unit | Default Commercial Value | Description |
| :--- | :---: | :---: | :---: | :--- |
| Air Density | $\rho_a$ | $\text{kg/m}^3$ | $1.225$ | Ambient air density at sea level |
| Drag Coefficient | $C_d$ | Dimensionless | $0.44$ | Aerodynamic drag rating (Class 6 truck) |
| Frontal Area | $A_f$ | $\text{m}^2$ | $4.20$ | Effective cross-sectional contact area |
| Total Vehicle Mass | $M_{\text{veh}}$ | $\text{kg}$ | $M_{\text{curb}} + M_{\text{payload}}$ | Dynamic gross operating mass |
| Gravity Acceleration | $g$ | $\text{m/s}^2$ | $9.81$ | Earth gravitational constant |
| Rolling Resistance | $C_{rr}$ | Dimensionless | $0.012$ | Radial tire on asphalt coefficient |
| Road Gradient | $\theta$ | Radians | $\arctan(\Delta h / d_{i,j})$ | Slope angle derived from elevation |
| Velocity / Acceleration | $v, a$ | $\text{m/s}, \text{m/s}^2$ | Dynamic | Real-time segment kinematics |

#### Electromechanical Battery Terminal Power
Mechanical force is mapped to electrical terminal battery power $P_{\text{elec}}$ by accounting for four-quadrant motor-inverter losses and regenerative braking recovery:

$$P_{\text{elec}}(t) = \begin{cases} \dfrac{F_{\text{traction}}(t) \cdot v(t)}{\eta_{\text{drivetrain}}(T_{\text{em}}, \omega_m)} + P_{\text{aux}}, & \text{if } F_{\text{traction}}(t) \ge 0 \quad (\text{Propulsion}) \\[10pt] \eta_{\text{regen}}(\text{SoC}, v) \cdot F_{\text{traction}}(t) \cdot v(t) + P_{\text{aux}}, & \text{if } F_{\text{traction}}(t) < 0 \quad (\text{Regenerative Braking}) \end{cases}$$

* $\eta_{\text{drivetrain}}$ models copper and iron losses across motor torque $T_{\text{em}}$ and rotational speed $\omega_m$ (baseline efficiency: $91\%$).
* $\eta_{\text{regen}}$ dynamically tapers to zero as battery $\text{SoC} \to 95\%$ to prevent cell overvoltage.
* $P_{\text{aux}}$ accounts for baseline auxiliary loads (HVAC, battery thermal cooling, compute telemetry), set at $2.5\text{ kW}$.

---

### 2.2 Electrochemical Battery Charging Kinetics (CC-CV Model)
Commercial fleet dispatch algorithms frequently assume constant charging speeds (e.g., assuming a $150\text{ kW}$ charger consistently delivers $150\text{ kW}$). RAHI enforces non-linear Constant Current--Constant Voltage (CC-CV) saturation curves to model real charging durations accurately:

$$P_{\text{ch}}(\text{SoC}) = \begin{cases} \min(s_c, P_{\text{veh}}^{\max}) \cdot \eta_{\text{ch}}, & \text{if } \text{SoC} \le 80\% \quad (\text{Constant Current Phase}) \\[8pt] \min(s_c, P_{\text{veh}}^{\max}) \cdot \eta_{\text{ch}} \cdot \exp\left(-\beta \left(\dfrac{\text{SoC} - 80\%}{20\%}\right)\right), & \text{if } \text{SoC} > 80\% \quad (\text{Constant Voltage Phase}) \end{cases}$$

```text
Charging Power (kW)
  150 kW ┌──────────────────────────┐
         │                          │
         │  Constant Current (CC)   │  Constant Voltage (CV)
         │  Maximum Power Flow      │  Exponential Thermal Throttling
   30 kW │                          │         \
         └──────────────────────────┴───────────\──────
         0%                        80%         100%   State of Charge (SoC)
```

The exact charging dwell time $T^{\text{ch}}$ required to replenish energy quantity $y_{n,c}$ is calculated by integrating the reciprocal power function:

$$T^{\text{ch}}(y_{n,c}, s_c) = \int_{\text{SoC}_{\text{arr}}}^{\text{SoC}_{\text{arr}} + \frac{y_{n,c}}{b_{\text{bev}}}} \frac{b_{\text{bev}}}{P_{\text{ch}}(\text{SoC})} \, d\text{SoC}$$

---

### 2.3 Stochastic Station Queueing Formulation ($M/M/\mathcal{N}_c$)
Charging station delay is modeled as a multi-server Markovian queueing system. For a station $c$ possessing $\mathcal{N}_c$ independent charging dispensers:

1. **Traffic Intensity / Utilization ($\rho_c$):**
   $$\rho_c(t) = \frac{\Lambda_c(t)}{\mathcal{N}_c \cdot \mu_c}$$
   Where $\Lambda_c(t)$ is the incoming vehicle arrival rate ($\text{vehicles/hour}$) and $\mu_c = \frac{s_c \cdot \eta_{\text{ch}}}{\bar{y}}$ is the service rate based on average replenishment demand $\bar{y}$.

2. **Expected Queue Waiting Time ($E[T_c^{\text{wt}}]$):**
   Using the Kingman closed-form approximation for multi-server setups:
   $$E[T_c^{\text{wt}}(t)] \approx \left( \frac{\rho_c(t)^{\sqrt{2(\mathcal{N}_c + 1)}}}{1 - \rho_c(t)} \right) \cdot \frac{1}{\mathcal{N}_c \cdot \mu_c}$$
   *When $\rho_c \to 1$, the analytical formulation reflects hyper-exponential delay spikes, naturally penalizing high-traffic hubs during route optimization.*

---

## 3. Engine 2: Active Machine Learning Enhancement Layer

```text
                        +-------------------------------+
                        |   Physical Baseline Output    |
                        |   - F_traction Mechanical     |
                        |   - Free-Flow Speed Profile   |
                        +-------------------------------+
                                        │
                                        ▼
+───────────────────────────────────────────────────────────────────────────────+
|               RESIDUAL ENERGY ESTIMATION: PHYSICS-GUIDED XGBOOST              |
|                                                                               |
|  Input Features:                                                              |
|  [ Segment Length, Physics Energy Baseline, Traffic Congestion Ratio,         |
|    Hour-of-Day, Road Hierarchy Index, Ambient Temperature ]                   |
|                                                                               |
|  Tree Ensemble (Residual Objective):                                          |
|  Predicts Delta e = e_actual - e_physics                                      |
|                                                                               |
|  Output:                                                                      |
|  e_segment = e_physics + max(0, Delta e_XGBoost)                              |
+───────────────────────────────────────────────────────────────────────────────+
```

### 3.1 Physics-Guided Gradient Boosting (PGR-GBM)
Instead of predicting total energy as an unconstrained regression task, XGBoost is structured strictly as a **residual learner**:

$$\hat{e}_{i,j}(t) = e_{i,j}^{\text{physics}} + \Delta e_{\text{XGBoost}}(\mathbf{x}_{i,j,t})$$

* **Feature Vector ($\mathbf{x}_{i,j,t}$):** $\langle e_{i,j}^{\text{physics}}, \text{congestion\_index}, \text{speed\_ratio}, \text{hour\_bin}, \text{road\_type}, T_{\text{ambient}} \rangle$.
* **Physics Guardrail:** A hard non-negativity constraint $\Delta e_{\text{XGBoost}} \ge 0$ is enforced during propulsion phases, ensuring traffic stop-and-go patterns can only add thermodynamic losses relative to the smooth-flow baseline.

---

### 3.2 Dynamic Arrival Rate Forecasting (Temporal LSTM)
While the Kingman equation calculates delays analytically, real arrival rates $\Lambda_c(t)$ are non-stationary and depend on temporal commute cycles.

* **Architecture:** 2-layer stacked Long Short-Term Memory (LSTM) network with 64 hidden units and Dropout ($p=0.2$).
* **Input Sequence:** 24-step sliding window of historical station plug connections, adjacent highway traffic volume, and temporal cyclical features ($\sin(2\pi t/24), \cos(2\pi t/24)$).
* **Target Output:** $\hat{\Lambda}_c(t+\tau)$—the predicted vehicle arrival rate at the estimated time of arrival (ETA), directly parameterizing Engine 1's queueing formula.

---

### 3.3 Constrained Deep Q-Network (CMO-DQN) for Routing Decisions
The routing decision problem is modeled as a **Constrained Markov Decision Process (CMDP)**:

* **State Space $\mathcal{S}$:** Current node $n$, current battery $\text{SoC}_t$, elapsed shift time $T_{\text{elapsed}}$, active traffic matrix $\mathbf{M}_{\text{traffic}}(t)$, and downstream station vectors $\mathbf{C}_{\text{status}}(t)$.
* **Action Space $\mathcal{A}$:** 
  * Action 0: Continue directly to the next scheduled delivery waypoint along the minimum energy corridor.
  * Action $k \in \{1, \dots, |C|\}$: Divert to candidate charging hub $c_k$ and replenish battery up to target $\text{SoC}_{\text{target}}$.
* **Q-Network Loss Formulation:**
  $$L(\theta) = \mathbb{E}\left[ \left( R_{\text{composite}} + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta) \right)^2 \right]$$

---

## 4. Multi-Objective Formulation & Bounded $\epsilon$-Constraints

RAHI evaluates every candidate charging detour using a 4-dimensional cost vector:

$$\mathbf{J}(n, c) = \begin{bmatrix} J_{\text{time}}(n, c) \\[4pt] J_{\text{cost}}(n, c) \\[4pt] J_{\text{health}}(n, c) \\[4pt] J_{\text{env}}(n, c) \end{bmatrix}$$

```text
                                  [ FLEET MANAGER SELECTS GOAL ]
                                                │
                 ┌──────────────────┬───────────┴───────────┬──────────────────┐
                 ▼                  ▼                       ▼                  ▼
          [ FASTEST TIME ]   [ LOWEST COST ]        [ BATTERY HEALTH ]  [ LOWEST EMISSIONS ]
                 │                  │                       │                  │
                 └──────────────────┼───────────────────────┴──────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────────┐
       │             BOUNDED EPSILON-CONSTRAINT EVALUATION           │
       │                                                             │
       │  Minimize:   J_selected(n, c)                               │
       │  Subject to: J_m(n, c) <= (1 + eps_m) * J_ideal_m,  m != k  │
       │              SoC(n) >= 12%                                  │
       │              Total Time <= Driver Shift Limit               │
       └─────────────────────────────────────────────────────────────┘
```

### 4.1 Cost Vector Definitions
1. **Total Operation Time ($J_{\text{time}}$):**
   $$J_{\text{time}} = t_{\text{transit}} + E[T_c^{\text{wt}}] + T^{\text{ch}}(y_{n,c}, s_c)$$
2. **Financial Operating Cost ($J_{\text{cost}}$):**
   $$J_{\text{cost}} = y_{n,c} \cdot c_c^{\text{ch}}(t_{\text{arr}}) + \max\left(0, J_{\text{time}} - T_{\text{shift\_limit}}\right) \cdot c^{\text{overtime}}$$
   *Enforces Time-of-Use (ToU) electricity tariffs $c_c^{\text{ch}}(t)$ and commercial driver overtime penalties ($c^{\text{overtime}} = \$25/\text{hr}$).*
3. **Battery Degradation Penalty ($J_{\text{health}}$):**
   $$J_{\text{health}} = C_{\text{deg}} \cdot \left( \frac{s_c}{P_{\text{baseline}}} \right)^2 \cdot \exp\left(\kappa \cdot \text{SoC}_{\text{arr}}\right) \cdot y_{n,c}$$
   *Penalizes ultra-fast high-C charging when arrival SoC is already high to mitigate lithium plating and cell capacity loss.*
4. **Grid Carbon Emissions ($J_{\text{env}}$):**
   $$J_{\text{env}} = y_{n,c} \cdot \text{CI}_{\text{grid}}(c, t_{\text{arr}})$$
   *Multiplies energy replenished by the marginal Grid Carbon Intensity ($\text{gCO}_2/\text{kWh}$) at that geographic node and hour.*

---

## 5. End-to-End Pipeline Execution Trace

```text
[Step 1: Ingestion & Parsing]
  └── Input: Origin, Waypoints [W_1, W_2, ...], Destination, Payload (kg), Initial SoC (%)
  └── OpenStreetMap extraction & segment splitting (max 500m per micro-edge)

[Step 2: Kinematic Geometry Walk]
  └── For each micro-segment:
        ├── Query elevation delta -> compute theta = arctan(Delta_h / length)
        ├── Compute theoretical mechanical work via Engine 1 (F_traction)
        └── Query traffic index -> apply Engine 2 (Physics-Guided XGBoost) -> obtain net e_segment

[Step 3: State-of-Charge Monitoring & Interception]
  └── Accumulate segment energy: SoC_{k+1} = SoC_k - (e_segment / Battery_Capacity)
  └── Trigger Condition: If predicted SoC along path drops below threshold (12%):
        ├── Halt forward direct route walk
        └── Identify candidate charging hubs within reachable radius

[Step 4: Multi-Objective Detour Optimization]
  └── For each candidate hub c:
        ├── Engine 2 (LSTM) -> Forecast arrival rate Lambda_c(ETA)
        ├── Engine 1 (Kingman Queue) -> Calculate expected wait time E[T_c^wt]
        ├── Engine 1 (CC-CV) -> Calculate dwell time T^ch to charge back to safe buffer (80%)
        ├── Compute vector J(n, c) = [J_time, J_cost, J_health, J_env]^T
        └── Evaluate eps-bounded constraints against chosen fleet goal
  └── Select optimal station c* that minimizes chosen goal without violating secondary caps

[Step 5: Telemetry Synthesis & Dashboard Dispatch]
  └── Splice optimal detour segments: Node_n -> Station_c* -> Node_{n+1}
  └── Compile output JSON:
        ├── Full coordinate polyline (main vs. detour paths)
        ├── Continuous distance-vs-SoC curve for visual analytics
        └── Comparative KPI matrix (Selected vs. Baseline routes)
```

---

## 6. Data Schemas & API Contracts

### 6.1 Route Optimization Request (`POST /api/optimize-route`)
```json
{
  "origin": { "lat": 28.6139, "lng": 77.2090 },
  "destination": { "lat": 26.8467, "lng": 80.9462 },
  "intermediate_waypoints": [],
  "vehicle_specs": {
    "battery_capacity_kwh": 120.0,
    "current_soc_pct": 42.0,
    "curb_weight_kg": 3500.0,
    "payload_weight_kg": 1800.0,
    "max_dc_charge_rate_kw": 150.0
  },
  "operational_constraints": {
    "shift_limit_hours": 8.0,
    "min_safety_soc_pct": 12.0,
    "optimization_priority": "cost",
    "secondary_tolerance_eps": 0.20
  }
}
```

### 6.2 Dispatch Telemetry Response Schema
```json
{
  "status": "OPTIMAL_DISPATCH_COMPUTED",
  "summary_metrics": {
    "total_distance_km": 534.2,
    "total_transit_time_hrs": 7.42,
    "total_energy_consumed_kwh": 98.6,
    "total_financial_cost_inr": 1840.50,
    "total_carbon_emitted_gco2": 4120.0,
    "driver_overtime_hrs": 0.0
  },
  "charging_schedule": [
    {
      "station_id": "CS_YAMUNA_EXPR_04",
      "station_name": "Jewar Express Supercharger Hub",
      "location": { "lat": 28.1487, "lng": 77.5452 },
      "arrival_soc_pct": 14.8,
      "departure_soc_pct": 80.0,
      "energy_added_kwh": 78.24,
      "metrics": {
        "predicted_queue_wait_min": 8.5,
        "plug_charge_time_min": 36.2,
        "power_rating_kw": 150.0,
        "effective_tariff_per_kwh": 18.50
      }
    }
  ],
  "telemetry_stream": [
    { "cumulative_dist_km": 0.0, "soc_pct": 42.0, "elevation_m": 216.0 },
    { "cumulative_dist_km": 45.2, "soc_pct": 31.4, "elevation_m": 204.0 }
  ],
  "route_geometry": {
    "main_corridor_polyline": "_p~iF~ps|U_ulLnnqC_mqN...",
    "charging_detour_polyline": "cr}hEnv`|U_seK..."
  }
}
```