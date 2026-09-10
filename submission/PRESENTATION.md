# SIH 2026 Presentation Overview

**Project Name:** RAHI (Route Analysis and Haulage Intelligence)
**Problem Statement ID:** SIH26205

## Presentation Deck

**[Link to Google Drive PPT: Add accessible viewer link here]**

---

## 1. Title & Team
- **Project:** RAHI - Physics-Based EV Fleet Routing & Dispatch
- **Team:** Cipher
- **Vision:** Decarbonizing Indian logistics through highly deterministic EV routing and charging orchestration.

## 2. Problem Statement
Commercial EV fleet operators in India face range anxiety, unpredictable charging wait times, and traffic-induced energy variance, leading to inefficient logistics and stranded assets.

## 3. Solution Architecture
RAHI utilizes a dual-engine architecture:
- **Phase 1 (Deterministic Baseline):** Accurate physics and kinematics for energy drain, combined with queuing theory for charge times.
- **Phase 2 (Active ML Integration):** Data-driven models predicting traffic energy loss and dynamic station congestion.

## 4. Physics-Engine Baseline
- **Longitudinal Dynamics:** Computes energy consumption based on rolling resistance, grade resistance, payload mass, and aerodynamic drag.
- **Charging Kinetics:** CC-CV (Constant Current - Constant Voltage) charging curves.
- **Queuing Theory:** Predicts wait times at charging hubs.

## 5. Active ML Integration
- **Physics-Guided XGBoost:** Corrects the baseline for traffic congestion and real-world route variance.
- **LSTM Forecasting:** Predicts charging station arrival rates.
- **Constrained DQN:** Optimizes routing logic across multiple competing objectives (time, cost, battery health, environmental impact).

## 6. Results & Impact
- Eliminates range anxiety by guaranteeing charging stops before critical SoC thresholds.
- Optimizes fleet dispatch for varied business goals (fastest transit vs. lowest cost).
- Lowers operational costs and extends fleet battery lifespans.

## 7. Tech Stack
- **Backend:** Python (FastAPI, Uvicorn, Pandas, XGBoost)
- **Frontend:** React, TypeScript, Vite, Leaflet Maps
- **Routing:** OSRM Public API
