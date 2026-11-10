# 🐾 PawPatrol • Autonomous Canine Sentinel Dashboard

> **PawPatrol** is a responsive, single-page command dashboard for an autonomous dog-patrolling robot that roams a residential society, detects local dogs, assesses aggression zones, and streams live telemetry on an interactive map.

Pre-configured with realistic live data for **Palm Meadows Residential Enclave, Infopark Road, Kakkanad, Kochi, Kerala, India**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🤖 Connecting Your Physical Robot Hardware

PawPatrol is designed with a plug-and-play **Mock Data Layer & Simulated WebSocket Feed**. When no physical robot is connected, a built-in simulation moves Sparky (`ROBO-DOG-09`) along the society roads, updates battery drain, logs canine encounters, and triggers geofence events.

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_ROBOT_API_URL=http://<YOUR_ROBOT_IP>:8000
VITE_ROBOT_WS_URL=ws://<YOUR_ROBOT_IP>:8000/ws/telemetry
```

You can also dynamically test and connect via the in-app **Settings Modal** (gear icon in the top navbar).

### 2. Expected Robot Telemetry JSON Payload

Your robot's WebSocket stream should emit JSON packets following this schema:

```json
{
  "robot": {
    "lat": 10.0095,
    "lng": 76.3638,
    "battery": 88,
    "speed": 3.4,
    "mode": "Patrolling",
    "heading": 45,
    "distanceCovered": 8.42,
    "signal": 94
  },
  "dogs": [
    {
      "id": "dog-1",
      "lat": 10.0099,
      "lng": 76.3642,
      "name": "Bruno",
      "known": true,
      "confidence": 0.98,
      "lastSeen": "Just now",
      "breed": "Golden Retriever",
      "size": "Large"
    },
    {
      "id": "dog-7",
      "lat": 10.0121,
      "lng": 76.3622,
      "name": "Rocky",
      "known": false,
      "confidence": 0.88,
      "lastSeen": "4 mins ago",
      "breed": "Indian Pariah (Desi)",
      "size": "Medium"
    }
  ]
}
```

### 3. Robot Control Commands (Inbound from Dashboard to Robot)

When the operator taps dashboard buttons, commands are dispatched to the robot:
- `robotService.startPatrol()`: Resumes autonomous society loop.
- `robotService.pausePatrol()`: Halts robot in place.
- `robotService.returnToBase()`: Commands rover to return to Solar Dock Alpha.
- `robotService.setCustomWaypoints([{ lat, lng }, ...])`: Transmits operator-drawn checkpoints.
- `robotService.startSafeEscort(destination)`: Engages Safe Walk mode matching pedestrian pace.
- `robotService.startLostDogSearch(dogData)`: Prioritizes search route around last reported sector.

---

## 🌟 Key Features

| Category | Highlights |
|---|---|
| **Live OSM Map** | Leaflet.js with OpenStreetMap, Esri Satellite, and Carto Dark tiles (no API keys required). Custom animated robot-dog marker with pulsing radar waves, breadcrumb trail, and live heading direction indicator. |
| **Patrol Radius** | Live translucent detection circle with 50m to 1km slider. Dogs inside radius are marked with pinging beacons. |
| **Canine Roster** | Filterable by Known, Unknown, Stray, or Nearby (<100m). Hovering any card highlights its map marker; clicking focuses and opens its **Dog Passport**. |
| **Dog Passport** | Auto-created canine profile with breed guess, size, visit history, favourite society spots, behavioral assessment, and owner claiming dialog with confetti celebration! |
| **Dog Heatmap Timeline** | 24-hour time scrubber (06:00 to 22:00) with play/pause playback at 1x, 2x, 4x speed, tracking peak canine activity and hotspots. |
| **Lost Dog Radar** | Community emergency reporting system: robot prioritizes quadrants where similar dogs were recently sighted and pushes community alerts. |
| **Aggression Zones** | Red pulsing hazard polygons marking territorial barking or construction noise. Recommends safe detour walkways. |
| **Safe Walk Mode** | "Walk with Me" night escort mode where Sparky accompanies residents while detouring around aggression zones. |
| **Robot Personality** | Animated robot-dog mascot "Sparky" with tail wags, perked ears for strays, sleeping snooze at charging docks, and interactive petting with hearts! |
| **Voice Commands** | Web Speech API integration. Ask *"Where is Bruno?"*, *"Find Tommy"*, *"Return to base"*, or *"Status report"* with synthesized voice replies. Includes text command input fallback. |
| **Patrol Report PDF** | Auto-generates official Daily Canine Audit Summary PDF with society census tables, distance covered, and incident logs. |
| **IoT GPS Rover (Separate Page)** | Dedicated hardware GPS tracking studio: (1) Mount phone on robot chassis to stream phone GPS live (`watchPosition`), (2) Import GPS datasets from CSV/JSON/GPX with speed & elevation playback, (3) Connect to backend IoT servers via WebSocket or REST. Completely separate from the society map! |
| **Design & UI** | Tailwind CSS with warm teal/orange palette, glassmorphism floating panels, dark/light mode toggle, and 3-step onboarding tour. |

---

## 📁 Project Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx           # Society branding, mode pill, quick actions
│   │   └── Sidebar.jsx          # Desktop dock & mobile bottom navigation
│   ├── map/
│   │   ├── LiveMap.jsx          # Leaflet map, custom icons, radar circle & trails
│   │   └── MapControls.jsx      # Layer toggle, recenter, radius slider, waypoints
│   └── panels/
│       ├── RobotStatusPanel.jsx     # Battery, speed, signal, AI camera HUD
│       ├── PatrolControlPanel.jsx   # Start, Pause, Dock, Route, Escort triggers
│       ├── DogListPanel.jsx         # Searchable canine directory & filters
│       ├── DogDetailModal.jsx       # Dog Passport modal & claiming system
│       ├── HeatmapTimeline.jsx      # 24H activity replay scrubber
│       ├── LostDogRadarModal.jsx    # Missing dog reporting & search radar
│       ├── SafeWalkModal.jsx        # "Walk with Me" route escort
│       ├── VoiceCommandBar.jsx      # Speech recognition & audio feedback
│       ├── RobotPersonalityWidget.jsx # Reactive Sparky mascot
│       ├── CommunityFeed.jsx        # Resident sighting wall & photo posts
│       ├── AlertsPanel.jsx          # Aggression zones & geofence monitor
│       ├── PatrolReportModal.jsx    # Daily summary & PDF generation
│       ├── SettingsModal.jsx        # Robot API & WebSocket configuration
│       ├── OnboardingTour.jsx       # 3-step interactive intro
│       └── ToastContainer.jsx       # Live system notification toasts
├── context/
│   └── PawPatrolContext.jsx     # Shared state provider
├── data/
│   └── keralaSocietyData.js     # Palm Meadows Enclave coordinates & mock dogs
├── services/
│   ├── robotService.js          # Hardware WebSocket / simulation engine
│   ├── voiceService.js          # Speech recognition & synthesis
│   └── pdfService.js            # jsPDF daily report generator
├── App.jsx                      # Main dashboard layout
└── main.jsx                     # Entrypoint
```

---

## 🛡️ License

MIT License • Developed for Palm Meadows Residents Welfare Association (PMRWA), Kakkanad, Kochi, Kerala.

