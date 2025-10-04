# 🛸 Ujjain 2028 Smart Crowd Manager
### Simhastha Predictive Transit Command Center

An enterprise-grade real-time crowd dynamics and traffic routing system built for the multi-million scale **Ujjain Simhastha Mahakumbh 2028**. The application shifts transit management from reactive observation to **proactive algorithmic mitigation**.

---

## 🌟 Core Technical Highlights

- **Spring Boot REST API Backend**: Java 21 Spring Boot 3.x backend exposing `/api/simulate`, `/api/locations`, `/api/routes`, and `/api/health` endpoints with full CORS support
- **Real-time Simulation Engine**: Java-native crowd distribution model computing Volume-to-Flow Ratios (VFR) across 6 strategic transit nodes, ported to both backend (Java) and frontend (TypeScript fallback)
- **Interactive Transit Map**: Leaflet.js with CartoDB dark tiles, custom HTML markers with live VFR status, animated bypass polylines, and dark-themed popups
- **Cognitive SLM Evaluation Feed**: Streams algorithmic decision logs evaluating crowd conditions — triggers neon-red crush alerts when VFR exceeds 1.25 threshold
- **Historical Matrix**: Parses 6 sub-sections of Mahakumbh historical records (1982–2016) — visitor counts, revenue, safety metrics, environmental data, and media coverage
- **Domain-Aware Rerouting**: Activates two configurable diversion routes (`b1_outer_ring_diversion`, `b2_dani_gate_bypass`) targeted at Ujjain's known geographic bottlenecks

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Java 21, Spring Boot 3.2, Maven |
| **REST API** | Spring Web MVC, Jackson |
| **Frontend** | React 18, Vite, TypeScript |
| **Mapping** | Leaflet.js, CartoDB Dark Tiles |
| **UI Icons** | Lucide React |
| **HTTP Client** | Axios (with local fallback) |
| **Styling** | Vanilla CSS (custom dark design system) |

---

## 🏗️ Architecture

```
Smart-Crowd-Manager/
├── backend/                     ← Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/ujjain/crowdmanager/
│       ├── CrowdManagerApplication.java  ← Entry point + CORS config
│       ├── controller/
│       │   └── CrowdController.java      ← REST endpoints
│       ├── model/
│       │   ├── LocationNode.java
│       │   ├── BackupRoute.java
│       │   ├── SimRequest.java
│       │   ├── SimMetrics.java
│       │   └── SimNodeStatus.java
│       └── service/
│           ├── SimulationService.java    ← Crowd distribution algorithm
│           └── LocationDataService.java  ← Geographic data provider
│
└── frontend/                    ← React + Vite + TypeScript
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── MapCanvas.tsx    ← Leaflet map with live markers
        │   ├── Sidebar.tsx      ← Control panel + historical data
        │   └── Terminal.tsx     ← SLM evaluation log stream
        └── data/
            ├── keyinfo.ts       ← Location nodes + routes (static)
            └── simulationEngine.ts  ← API client + local fallback
```

---

## 🚀 Running Locally

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# API starts at http://localhost:8080
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# UI starts at http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/locations` | All 6 transit node definitions |
| `GET` | `/api/routes` | Pre-configured backup routes |
| `POST` | `/api/simulate` | Compute crowd simulation metrics |

### POST `/api/simulate` Example
```json
// Request
{
  "crowdLoad": 120000,
  "mitigationDiversion": false,
  "mitigationBypass": true
}

// Response
{
  "vfr": 1.31,
  "safetyIndex": 32,
  "avgVelocity": "0.4 m/s (LOS-E, Forced Flow)",
  "timeToDecline": "18 min",
  "nodes": {
    "harsiddhi_mandir": {
      "id": "harsiddhi_mandir",
      "vfr": 1.40,
      "status": "danger",
      "currentLoad": 42000,
      "maxCapacity": 30000
    }
  }
}
```

---

## 📊 Simulation Algorithm

The simulation engine models pilgrim crowd distribution across 6 strategic nodes using calibrated multipliers from historical Mahakumbh data:

- **VFR (Volume-to-Flow Ratio)**: `currentLoad / nodeCapacity`
  - `VFR < 0.85` → Nominal (LOS A-C)
  - `0.85 ≤ VFR < 1.25` → Warning (LOS D-E)
  - `VFR ≥ 1.25` → **CRUSH RISK** — bypass vectors auto-triggered
- **Safety Index**: Composite score (0-100) derived from peak VFR with bonuses for active mitigations
- **Fruin LOS Model**: Maps VFR to pedestrian velocity (1.4 m/s free flow → 0.1 m/s crush)

---

## 🗺️ Key Geographic Nodes

| Node | Type | Risk |
|------|------|------|
| Ujjain Junction Railway Station | Transit | Multi-wave simultaneous unloading |
| Mahakaleshwar Temple Corridor | Epicenter | Dead-end crowd packing |
| **Harsiddhi Mata Temple Square** | **Chokepoint** | **37m bottleneck — crush risk** |
| Ram Ghat Riverfront | Epicenter | Peak Shahi Snan surge |
| Nanakheda Bus Terminal | Holding | Vehicle-to-pedestrian conversion zone |
| Mangalnath Mandir | Transit | Heritage lane constrictions |
