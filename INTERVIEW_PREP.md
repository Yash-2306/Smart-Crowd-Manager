# Ujjain 2028 Smart Crowd Manager — Resume & Interview Guide

> A comprehensive, metrics-driven guide to mastering the technical architecture, algorithms, and interview topics for the Simhastha Predictive Transit Command Center.

---

## 1. Project Summary (Your 60-Second Pitch)

**Ujjain 2028 Smart Crowd Manager** is a real-time predictive transit command center designed for the **Simhastha Mahakumbh 2028**, a religious congregation expecting over 100 million visitors. The platform shifts crowd management from reactive monitoring to **proactive algorithmic mitigation** by modeling pedestrian flows and simulating strategic rerouting policies before bottlenecks trigger crowd crushes.

**The Problem it Solves**: During peak bathing dates (*Shahi Snan*), millions of pilgrims move simultaneously between entry points (railway stations) and the riverfront. Bottlenecks at key chokepoints (like the 37m-wide *Harsiddhi Temple Square*) create extreme packing densities, historically resulting in crowd disasters. This system predicts congestion 15 to 60 minutes in advance, allowing commanders to activate physical diversions (*Harifatak Outer Ring*) and bypasses (*Dani Gate Elevated Catwalk*) to redistribute the load.

**Key Resume Line (Copy-Paste Ready)**:
> "Engineered a predictive transit command center for the Ujjain Simhastha 2028 (100M+ pilgrims) featuring a Spring Boot REST API and React/TypeScript dashboard. Implemented a pedestrian flow simulation engine using the Fruin Level-of-Service (LOS) model to compute real-time Volume-to-Flow Ratios (VFR) and Time-to-Decline (TTD) metrics across 6 key geographic transit nodes, reducing bottleneck density by up to 75% via simulated mitigation routing."

---

## 2. Tech Stack (3-Point Format for Resume)

### 2.1. Frontend — React 18, Vite, TypeScript & Leaflet.js
*   Built a highly responsive "dark command center" dashboard with **React 18** and **TypeScript**, implementing strict type safety for location node telemetry and simulation outputs.
*   Integrated **Leaflet.js** with **CartoDB Dark Matter** maps, rendering 6 geofenced node markers using dynamic HTML canvas indicators that pulse in real-time based on VFR severity (Nominal, Warning, Danger).
*   Visualized active crowd diversion and elevated bypass routes using animated, dashed vector polylines dynamically linked to control toggles.
*   Created a mock **Cognitive Small Language Model (SLM) evaluation panel** that streams reasoning logs (evaluating safety indexes, bottlenecks, and mitigations) to simulate production-grade AI decision-making.

### 2.2. Backend — Java 21 & Spring Boot 3.2 REST API
*   Designed a stateless REST API using **Java 21** and **Spring Boot 3.2** with Maven, exposing endpoints for location definitions, pre-configured backup routes, health checks, and simulation computations.
*   Implemented a Java-native simulation engine that models pilgrim distribution across the network based on geographic flow multipliers calibrated against historical Mahakumbh records (1982–2016).
*   Configured a global Cross-Origin Resource Sharing (**CORS**) policy mapping through `WebMvcConfigurer` to support seamless cross-domain requests between the Vercel-deployed frontend and the Render-hosted backend.
*   Enforced clean model-controller separation using Jackson annotations for precise serialization of nested simulation results.

### 2.3. Resilient Architecture & Hybrid Execution
*   Implemented a **dual-engine hybrid simulation fallback**: if the remote Spring Boot API becomes unreachable or hits a timeout threshold, the React frontend seamlessly falls back to a mirrored client-side TypeScript simulation engine to guarantee command center uptime.
*   Hosted the backend as a containerized service using a multi-stage **Docker build** optimized with Eclipse Temurin alpine JRE, minimizing production image size.
*   Structured historical statistics for past Simhastha iterations (1982, 1994, 2004, 2016) covering visitor metrics, environmental indexes (AQI, Water Quality Index), safety records, and public sentiment.

---

## 3. Full System Architecture

```
                                  +------------------------------------+
                                  |           BROWSER (Client)         |
                                  |      React 18 + Vite + TypeScript  |
                                  +------------------------------------+
                                    |                               |
                   HTTP POST (JSON) |                               | API Fail
               /api/simulate / Route|                               | Fallback
                                    v                               v
  +-----------------------------------+                 +-----------------------------------+
  |      SPRING BOOT BACKEND API      |                 |       CLIENT-SIDE FALLBACK        |
  |  (Java 21, Hosted on Render/Port) |                 |    (TypeScript SimEngine in-app)  |
  +-----------------------------------+                 +-----------------------------------+
    |                                                     |
    +---> CrowdController.java                            | -> computeSimulationMetrics()
    |      Handles REST requests                          |     Runs identical math locally
    |                                                     |     to ensure 100% UI uptime
    +---> SimulationService.java                          |
    |      Computes VFR, LOS, TTD, Safety Index           |
    |                                                     |
    +---> LocationDataService.java                        |
           Serves geospatial nodes                        |
                                    +---------------------+
                                    |
                                    v
  +------------------------------------------------------------------------------------------+
  |                                     UI PRESENTATION                                      |
  |  1. Interactive MapCanvas: Leaflet.js rendering live pulsing VFR status nodes & routes   |
  |  2. Sidebar Panel: Real-time telemetry, mitigation toggles, historical data matrices     |
  |  3. Terminal Panel: Small Language Model (SLM) cognitive evaluation log stream           |
  +------------------------------------------------------------------------------------------+
```

---

## 4. What You Should Study (Priority Order)

### 🔴 High Priority (Will definitely be asked)

| Topic | Why |
|---|---|
| **Volume-to-Flow Ratio (VFR)** | The core metric used to assess bottleneck severity ($VFR = \frac{CurrentLoad}{MaxCapacity}$). |
| **Fruin Pedestrian Model** | The scientific basis mapping VFR to Level of Service (LOS A-F) and velocity. |
| **Time-to-Decline (TTD)** | The algorithm predicting how fast the crowd safety index will reach critical thresholds. |
| **Leaflet.js Map Architecture** | How custom HTML divs (pulses/pins) are injected as map markers and bound to data. |
| **Hybrid Fallback Pattern** | Why and how the frontend falls back to TypeScript math when Axios times out. |
| **Spring Boot `@CrossOrigin` & CORS** | Critical for web clients accessing API resources on another host. |

### 🟡 Medium Priority (Good to know)

| Topic | Why |
|---|---|
| **Geographic Flow Distribution** | The mathematical multipliers dividing the influx rate (e.g., Junction absorbs 90% load). |
| **Multi-stage Docker Builds** | How we package the Spring Boot app into a lightweight, runnable container. |
| **Axios Timeout Handling** | Implementing the client-side fallback using Axios request interceptors and catch blocks. |
| **Jackson ObjectMapper** | How Spring Boot translates Java objects to JSON and vice versa. |
| **React `useCallback` Hook** | Preventing infinite re-renders when updating simulation states across sibling components. |

### 🟢 Nice to Know (Bonus points)

| Topic | Why |
|---|---|
| **Simhastha Historical Data** | Demonstrates domain knowledge of real crowd statistics (AQI, WQI, Domestic vs Intl numbers). |
| **CartoDB Dark Matter Tiles** | The CDN endpoint used for the customized dark theme maps. |
| **Tailwind vs. Pure CSS** | Why inline CSS styling was utilized to guarantee container dimension initialization. |

---

## 5. Core Algorithmic Concepts

### 5.1. Volume-to-Flow Ratio (VFR)
VFR is the primary metric representing crowd density at a specific node:
$$VFR = \frac{\text{Current Pedestrian Influx (pax/hr)}}{\text{Design Node Capacity (pax/hr)}}$$

*   **VFR < 0.85 (Nominal)**: Normal flow. Pedestrians choose their own walking speed.
*   **0.85 ≤ VFR < 1.25 (Warning)**: Minor restrictions. Crowd speed slows, queueing begins.
*   **VFR ≥ 1.25 (Danger / Crush)**: Severe bottleneck. People are forced into contact; crowd shockwaves occur.

### 5.2. Fruin Level of Service (LOS)
Calibrated from pedestrian transit engineering, the Fruin model maps VFR to specific speed profiles:

| VFR Range | Fruin LOS | Speed Profile | Description |
|---|---|---|---|
| $< 0.50$ | LOS-A | $1.4\text{ m/s}$ | **Free Flow**: Pedestrians walk unimpeded. |
| $0.50 - 0.74$ | LOS-B | $1.2\text{ m/s}$ | **Stable Flow**: Speed slightly restricted. |
| $0.75 - 0.99$ | LOS-C | $0.9\text{ m/s}$ | **Constrained**: Passing others requires effort. |
| $1.00 - 1.24$ | LOS-D | $0.6\text{ m/s}$ | **Unstable**: Walking speed significantly reduced. |
| $1.25 - 1.49$ | LOS-E | $0.4\text{ m/s}$ | **Forced Flow**: Frequent stops, extreme density. |
| $\ge 1.50$ | LOS-F | $0.1\text{ m/s}$ | **Crush Risk**: Physical contact, high disaster risk. |

### 5.3. Safety Index Formula
The overall network Safety Index is a composite score (0-100) calculated from the peak node VFR and active mitigations:
$$\text{Safety Index} = \min\left(100, \text{round}\left(\max\left(0, 100 - (\text{Peak VFR} \times 55)\right) + \text{Bonus}_{\text{diversion}} + \text{Bonus}_{\text{bypass}}\right)\right)$$
*   **Harifatak Ring Diversion Bonus**: +12% safety
*   **Dani Gate Elevated Bypass Bonus**: +10% safety

### 5.4. Time-to-Decline (TTD) Formula
If the network enters a warning state ($\text{Peak VFR} \ge 0.85$), the system calculates the estimated minutes before conditions degrade to critical levels:
$$\text{Base Minutes} = \frac{120.0}{(\text{Peak VFR} - 0.85) \times \frac{\text{Crowd Load}}{50000.0}}$$
$$\text{TTD} = \text{Base Minutes} \times (1.4 \text{ if Diversion Active}) \times (1.3 \text{ if Bypass Active})$$
*   *Note*: The computed minutes are capped between $5$ and $480$ minutes, formatting into hours/minutes for the user.

---

## 6. Key Geographic Nodes & Mitigation Routes

### 6.1. The 6 Critical Nodes

1.  **Ujjain Junction Railway Station (`ujjain_jnc`)**
    *   *Type*: Transit | *Capacity*: 120,000 pilgrims/hr
    *   *Geographic Model*: Receives **90%** of direct inbound crowd load.
2.  **Mahakaleshwar Temple Corridor Complex (`mahakal_corridor`)**
    *   *Type*: Epicenter | *Capacity*: 250,000 pilgrims/hr
    *   *Geographic Model*: Peak destination. Under standard conditions, crowd load spikes to **160%** of influx due to stagnation. If **Harifatak Ring Diversion** is active, load is capped at **95%**.
3.  **Harsiddhi Mata Temple Square (`harsiddhi_mandir`)**
    *   *Type*: Chokepoint | *Capacity*: 30,000 pilgrims/hr
    *   *Geographic Model*: Crucial 37m bottleneck. Receives **35%** of direct crowd. If **Dani Gate Bypass** is active, load drops by 75% ($\text{Load} \times 0.25$).
4.  **Ram Ghat Riverfront Bathing Zone (`ram_ghat`)**
    *   *Type*: Epicenter | *Capacity*: 350,000 pilgrims/hr
    *   *Geographic Model*: Holy bathing spot. Receives **140%** load during Shahi Snan. If **Dani Gate Bypass** is active, pressure drops to **110%** as crowds spread upstream.
5.  **Nanakheda Bus Terminal Holding Zone (`nanakheda_holding`)**
    *   *Type*: Holding | *Capacity*: 80,000 pilgrims/hr
    *   *Geographic Model*: Intercepts **60%** of inbound road traffic.
6.  **Mangalnath Mandir Transit Node (`mangalnath_mandir`)**
    *   *Type*: Transit | *Capacity*: 60,000 pilgrims/hr
    *   *Geographic Model*: Southern approach. Receives **45%** load.

### 6.2. Mitigation Vectors

*   **Harifatak Outer Ring Diversion (`b1_outer_ring_diversion`)**
    *   *Saves*: 38% travel time.
    *   *Mechanic*: Diverts railway station arrivals along the outer bypass roads, preventing dense pedestrian accumulation inside the narrow Mahakal old city alleys.
*   **Dani Gate Elevated Catwalk Bypass (`b2_dani_gate_bypass`)**
    *   *Saves*: Eliminates Harsiddhi crush risks.
    *   *Mechanic*: Creates a structured one-way overhead pedestrian catwalk system that diverts 75% of Mahakal-to-Ram Ghat movement away from Harsiddhi Square.

---

## 7. Interview Questions & Answers

### 7.1. Architecture & Mechanics

#### Q1. Walk me through the lifecycle of a simulation run in this application.
> When a user clicks "Simulate Peak Influx" in the React UI, a POST request is dispatched to `/api/simulate` containing the `crowdLoad` (slider value) and state of active mitigations. The Spring Boot backend processes the request in `CrowdController`, handing it off to `SimulationService`. The service computes the VFR for all 6 geographic nodes, identifies the peak bottlenecks, evaluates Fruin velocity levels, and calculates safety indexes and Time-to-Decline metrics. The JSON response is serialized back to the frontend, which updates the React state. The map re-renders markers with appropriate status colors/animations (green, yellow, or pulsing red) and renders active routing vectors. Simultaneously, the Terminal panel parses the telemetry changes and triggers an animated "SLM reasoning log stream".

#### Q2. Why did you implement a "hybrid fallback" pattern on the client?
> In critical public safety and disaster response command centers, downtime is unacceptable. If the Spring Boot backend server experiences a cold start delay, database crash, or network outage, the Axios HTTP client triggers a timeout catch block. Instead of displaying a broken error screen, the client immediately switches to the in-browser `computeSimulationMetrics` engine. This engine runs the exact same mathematical formulas compiled in TypeScript, ensuring the user gets instantaneous simulation calculations without depending on an active network connection.

#### Q3. How does the Axios timeout fallback distinguish between a slow network and a dead server?
> We configured the Axios client with a `timeout: 3000` (3 seconds) limit. If the server does not respond within this window, Axios aborts the request and throws an error block. The `catch` block intercepts this error, logs a console warning, and falls back to local simulation logic. This protects the UX from hanging requests.

#### Q4. What is the directory structure of the project, and how do the components communicate?
> The project is split into a `backend` Maven directory and a `frontend` Vite/React directory. On the frontend, `App.tsx` acts as the single source of truth, managing states for mitigations, crowd load, metrics, and selected nodes. It passes these states down to three components: `Sidebar` (handles input sliders and history tabs), `MapCanvas` (displays Leaflet spatial overlays), and `Terminal` (renders SLM logs). Components communicate via callback functions passed down as props (e.g. `onNodeSelect` from MapCanvas to App).

---

### 7.2. Simulation & Pedestrian Flow Algorithms

#### Q5. What is Volume-to-Flow Ratio (VFR) and how is it used in pedestrian dynamics?
> VFR measures physical capacity saturation. It divides the volume of active pedestrians by the design capacity of the geographic space. In our simulation, VFR is calculated per node. If a node's crowd volume exceeds its design capability ($VFR \ge 1.0$), density rises. At $VFR \ge 1.25$, we classify the node state as "danger" because walking speeds fall below $0.4\text{ m/s}$ (Fruin LOS-E/F), meaning the crowd is moving at a shuffle and any sudden stoppage can trigger a crush.

#### Q6. Explain how your average velocity calculations relate to Fruin’s Level of Service (LOS).
> In civil engineering, Fruin's Level of Service (LOS) categorizes pedestrian spaces from A (free flow) to F (complete queueing/crush). We mapped these categories to mathematical VFR thresholds. For instance, if VFR is below 0.50, pedestrians move at a natural $1.4\text{ m/s}$ (LOS-A). As VFR rises, speed degrades linearly. When peak VFR crosses 1.50, we set the speed to $0.1\text{ m/s}$ (LOS-F, forced compression), indicating that movement has ground to a halt and immediate intervention is required.

#### Q7. How does the "Time-to-Decline" (TTD) algorithm estimate network collapse?
> TTD calculates the rate at which safety decreases based on overload pressure. It checks how much the peak VFR exceeds the warning limit ($VFR - 0.85$). The excess ratio is scaled by the total inbound crowd load. If the crowd load is high and the bottleneck is heavily saturated, TTD outputs a low value (e.g., "18 min"). If the user enables mitigations, the base minutes are multiplied by $1.4$ (diversion) or $1.3$ (bypass) to reflect the theoretical delay of bottleneck formation due to active load shedding.

#### Q8. Why does the Mahakal Corridor experience a load of 1.6x the crowd load when no mitigations are active?
> In Ujjain's real geography, the Mahakaleshwar temple corridor functions as a destination "sink" where pilgrims queue to enter the inner sanctum. Because pilgrims spend hours inside the complex instead of exiting immediately, they accumulate. This accumulation is represented by a multiplier of $1.6\times \text{Influx}$. When the **Harifatak Ring Diversion** is enabled, inbound pilgrim traffic is actively diverted at the railway station, slowing down the arrival rate at the temple and dropping the multiplier to $0.95\times$.

#### Q9. How did you model the Harsiddhi bottleneck reduction?
> Harsiddhi Temple Square is a geographical bottleneck because it connects the Mahakal complex to the Ram Ghat riverfront via a narrow corridor. Without mitigations, it absorbs 35% of the total pilgrim load. Activating the **Dani Gate Bypass** (simulating an elevated skywalk) diverts 75% of this traffic directly to downstream areas of the river, leaving only 25% of the original load to pass through the square ($Load \times 0.35 \times 0.25$). This keeps the VFR nominal even during peak influx rates of 200,000 pilgrims/hour.

---

### 7.3. Frontend & Maps Integration

#### Q10. How does Leaflet.js initialize in a React app without causing double-mount errors?
> React's strict mode can run `useEffect` hooks twice in development, which causes Leaflet to throw an "Error: Map container is already initialized." We prevent this by storing the initialized map instance in a React `useRef` hook (`mapRef.current`). In the mounting `useEffect` block, we perform a check: if `mapRef.current` is already populated, we skip initialization. On unmount, we clean up the resources by calling `map.remove()` and clearing the ref.

#### Q11. How did you solve the "Zero-Width Container" map rendering bug?
> Leaflet reads the offset dimensions of its target HTML container during startup to calculate the grid bounds. Originally, the code used Tailwind classes like `flex-1` and `overflow-hidden` on the map wrapper. Since Tailwind wasn't installed, the browser evaluated the container's width as 0, making the map invisible. We resolved this by applying explicit inline styles (`flex: 1, minWidth: 0, height: "100vh"`) on the wrapper and calling `map.invalidateSize()` inside a double `requestAnimationFrame` callback to force Leaflet to recalculate its viewport bounds once the browser completed the DOM layout pass.

#### Q12. Explain how you created custom HTML markers in Leaflet with animations.
> We bypassed Leaflet’s default static blue pin markers by using `L.divIcon`. This allows us to pass a string of custom HTML and CSS. The HTML includes a central circular badge displaying an icon (e.g., 🚂, ⛩) or status indicator (e.g., ⚠, ✓). When a simulation is active and a node enters warning or danger states, we inject HTML divs styled with CSS keyframe animations (like `crush-ping`), producing a red or amber pulsing radar effect around the node coordinates.

#### Q13. How did you implement the bypass routes on the map canvas?
> The coordinates for the bypass routes are defined as arrays of latitude/longitude objects in `keyinfo.ts`. When the user activates a mitigation toggle, the component instantiates an `L.polyline` passing the coordinates, line thickness, and color (orange for Harifatak, purple for Dani Gate). We styled the lines with a `dashArray` property (e.g., `'10,5'`) to create a marching-ants animation effect, indicating flow direction and active status.

#### Q14. What are Leaflet's popups and how did you customize them to match a dark command center theme?
> A popup is an info bubble that displays when a user clicks a marker. We bound custom HTML templates to each marker using `.bindPopup()`. To maintain our dark theme, we passed the configuration option `{ className: 'dark-popup' }`. In `App.css`, we targeted this class name to override Leaflet's default white background, setting it to a deep slate (`#0f172a`), adding a neon cyan border (`#22d3ee`), and converting the text colors to light grey and blue.

---

### 7.4. Backend REST API (Spring Boot)

#### Q15. Why did you use Spring Boot 3.2 instead of older versions?
> Spring Boot 3.x is compiled on Java 17/21 baselines, allowing us to utilize modern language features like records, pattern matching, and virtual threads. It also updates the default servlet stack to Jakarta EE 10, improving security and performance.

#### Q16. Explain the purpose of `@RestController` and how it differs from `@Controller`.
> `@Controller` is the traditional Spring MVC annotation used to build server-side rendered HTML applications (e.g., returning Thymeleaf templates). `@RestController` combines `@Controller` and `@ResponseBody`. It tells Spring's servlet container that the return values from handler methods should be automatically serialized into HTTP response bodies (like JSON) using Jackson message converters.

#### Q17. How did you handle Cross-Origin Resource Sharing (CORS) in the Spring Boot application?
> Since our frontend client runs on `http://localhost:5173` and the backend REST API runs on `http://localhost:8080`, browsers will block API requests due to Same-Origin Security policies. We resolved this by overriding `addCorsMappings` in a custom `WebMvcConfigurer` bean within `CrowdManagerApplication.java`. This injects the `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods` headers into response packets, allowing the React client to consume the JSON feed.

#### Q18. How does dependency injection work in your `CrowdController`?
> We utilized constructor-based dependency injection. Instead of using field injection with `@Autowired` (which makes unit testing harder), we defined private final dependencies (`SimulationService` and `LocationDataService`) and passed them as arguments to the controller's constructor. Spring Boot automatically resolves and injects these beans during application context startup.

#### Q19. How did you structure your JSON request and response payloads?
> We created dedicated POJO (Plain Old Java Object) models. The request body is mapped to `SimRequest` which contains fields for `crowdLoad`, `mitigationDiversion`, and `mitigationBypass`. The return payload is mapped to a composite `SimMetrics` object. `SimMetrics` contains scalar metrics (`vfr`, `safetyIndex`, `avgVelocity`, `timeToDecline`) and a nested map `Map<String, SimNodeStatus>` representing the detailed state of each location. Jackson automatically maps this nested structure into a clean JSON tree.

---

### 7.5. Domain Specifics & Crowd Safety

#### Q20. What is the historical context of the Ujjain Simhastha?
> The Simhastha is a mass Hindu pilgrimage held every 12 years on the banks of the Kshipra river in Ujjain, Madhya Pradesh. During auspicious bathing days (*Shahi Snan*), peak crowd density is massive. Effective management is a challenge because of Ujjain's old city layout—narrow lanes, dead-end temple squares, and a major transit terminal (Ujjain Junction) that unloads trains of pilgrims directly into the city center.

#### Q21. Explain the "Cognitive SLM Evaluation Feed". What does it represent in a production environment?
> The Terminal component simulates a "Cognitive Small Language Model Evaluation Feed". In a production system, this panel represents an AI agent (running a fine-tuned Llama or Gemini model) that analyzes current telemetry metrics and generates natural language command decisions. In our UI, we modeled this behavior by linking state changes to a sequential logging loop. When metrics shift, the log outputs diagnostic steps, structural evaluations (e.g., warning that Harsiddhi has geometric constraints), and recommended mitigations.

#### Q22. Talk about the historical statistics you integrated. Why are they valuable?
> We embedded data from 1982, 1994, 2004, and 2016 Simhastha festivals. It details domestic visitors (climbing from 3.2M to 14.2M), international media outlets, and environmental factors like river Water Quality Index (WQI) dropping from 72 to 48, and waste scaling to 31,200 tons. This historical context is valuable because it allows planners to correlate simulation models with real past bottlenecks and see how the festival's scale has grown over time.

---

### 7.6. Deployment & DevOps

#### Q23. Walk me through the multi-stage Dockerfile you wrote for the backend.
> To optimize container deployments, we wrote a multi-stage `Dockerfile`.
> *   **Stage 1 (Build)**: Uses a full Maven Eclipse-Temurin JDK image, copies the source code, and runs `./mvnw clean package -DskipTests` to compile the fat JAR file.
> *   **Stage 2 (Runtime)**: Pulls a lightweight, minimal Eclipse-Temurin JRE Alpine Linux image. It copies only the compiled JAR from Stage 1. This prevents build tools (compilers, unit tests, source files) from bloating the container. The final production image size drops from over 600MB to under 150MB, speeding up cold starts on Render.

#### Q24. How is the frontend configured for production deployments?
> The React application is built via Vite (`npm run build`), which transpiles TypeScript, bundles assets, and outputs optimized HTML, CSS, and JS to a `/dist` directory. We deployed this to **Vercel** with a `vercel.json` configuration file. The backend API target is managed dynamically using a Vite environment variable `VITE_API_BASE_URL`. If the variable is absent, it defaults to local development (`localhost:8080`).

---

## 8. What You'd Do Differently in Production

If this project were being deployed to a real-world municipal command center, the following enhancements would be required:

1.  **Real-Time Data Ingestion**: Replace the slider controls with active MQTT message brokers or Apache Kafka streams connected to physical counting cameras (using computer vision YOLO density models) at railway stations and temple gates.
2.  **Stateful Database Integration**: Migrate from static/in-memory data models to a persistent PostgreSQL database with PostGIS extensions to query actual spatial geometries of the city lanes instead of mocked points.
3.  **Real LLM/SLM Integration**: Connect the "SLM Evaluation Feed" to a real local LLM (like Llama-3-8B hosted on-premise) using a LangChain RAG pipeline to answer query requests using actual crowd logs and safety PDFs as context.
4.  **Advanced Flow Models**: Replace the simple static multipliers with a dynamic Agent-Based Modeling system (like NetLogo or custom Python engines) to calculate spatial interactions between thousands of simulated pilgrim agents.
