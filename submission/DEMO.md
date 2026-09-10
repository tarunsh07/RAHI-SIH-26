# Live Prototype Demonstration

The live prototype of **RAHI (PS ID: SIH26205)** is fully operational locally. It consists of a real-time React/Vite frontend interfacing with a high-performance Python/FastAPI backend, executing live physics calculations and routing.

> **Note:** Demo video is currently being recorded and will be linked here prior to final evaluation rounds. **[Placeholder: YouTube/Drive Demo Video Link]**

---

## Running the Live Prototype Locally

To evaluate the prototype locally, follow these steps:

### 1. Start the Backend (Physics Engine)
Ensure you have Python 3.10+ installed.
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Start the Frontend (Visualizer Dashboard)
Ensure you have Node.js 18+ installed.
```bash
cd frontend
npm install
npm run dev
```

### 3. View the Prototype
Open your browser and navigate to `http://localhost:5173/`. 
Select different optimization goals (Fastest Transit, Lowest Cost, Battery Health, Lowest Emissions) and observe real-time route detours and charging station assignments.
