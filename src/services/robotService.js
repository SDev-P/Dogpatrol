import { INITIAL_DOGS, PATROL_WAYPOINTS, SOCIETY_INFO, SOCIETY_GEOFENCE, ALERT_ZONES } from '../data/keralaSocietyData';

/**
 * Robot Service & Simulated Telemetry / WebSocket Feed
 * 
 * Designed for immediate plug-and-play with a physical robot.
 * To connect a real robot, set:
 *   VITE_ROBOT_API_URL=http://your-robot-ip:8000
 *   VITE_ROBOT_WS_URL=ws://your-robot-ip:8000/ws/telemetry
 * in your .env file or dynamically through the Settings panel.
 */

// Helper to calculate distance in meters between two lat/lng pairs (Haversine)
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper to calculate bearing in degrees
export function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

// Ray-casting algorithm to test if point is inside society geofence
export function isPointInsidePolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

class RobotService {
  constructor() {
    this.listeners = {
      telemetry: new Set(),
      dogDetected: new Set(),
      alert: new Set(),
      log: new Set(),
      statusChange: new Set()
    };

    this.apiUrl = import.meta.env.VITE_ROBOT_API_URL || '';
    this.wsUrl = import.meta.env.VITE_ROBOT_WS_URL || '';
    this.isUsingRealHardware = false;
    this.ws = null;

    // Default Robot State
    this.state = {
      robotId: SOCIETY_INFO.robotId,
      lat: PATROL_WAYPOINTS[0].lat,
      lng: PATROL_WAYPOINTS[0].lng,
      heading: 45,
      battery: 88,
      isCharging: false,
      speed: 3.4, // km/h
      signal: 94, // %
      rssi: -58, // dBm
      mode: 'Patrolling', // 'Patrolling' | 'Paused' | 'Returning' | 'Charging' | 'Idle' | 'Escorting' | 'Searching'
      distanceCoveredToday: 6.84, // km
      activeWaypoints: [...PATROL_WAYPOINTS],
      currentWaypointIndex: 0,
      pathHistory: [
        [PATROL_WAYPOINTS[0].lat, PATROL_WAYPOINTS[0].lng]
      ],
      detectionRadius: 150, // meters
      lastHeartbeat: Date.now(),
      escortDestination: null,
      searchTargetDog: null,
      personality: {
        mood: 'happy', // happy | alert | barking | resting | friendly
        tailWagging: true,
        quip: "Patrolling palm-lined avenues of Kakkanad. All dogs accounted for!"
      }
    };

    this.dogs = JSON.parse(JSON.stringify(INITIAL_DOGS));
    this.recentDetections = [];
    this.simulationTimer = null;

    this.init();
  }

  init() {
    // Check if real WS endpoint is provided
    if (this.wsUrl) {
      this.connectWebSocket(this.wsUrl);
    } else {
      this.startSimulation();
    }
  }

  // --- Real Robot WebSocket / REST Integration ---
  connectWebSocket(url) {
    try {
      this.wsUrl = url;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isUsingRealHardware = true;
        this.emit('log', { level: 'success', message: `Connected to physical robot stream at ${url}` });
        this.stopSimulation();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleInboundTelemetry(data);
        } catch (err) {
          console.error("Failed to parse robot telemetry packet:", err);
        }
      };

      this.ws.onclose = () => {
        this.emit('log', { level: 'warning', message: 'Robot WebSocket disconnected. Falling back to local simulation.' });
        this.isUsingRealHardware = false;
        this.startSimulation();
      };

      this.ws.onerror = (err) => {
        this.emit('log', { level: 'error', message: 'Robot stream connection error.' });
      };
    } catch (e) {
      console.warn("WebSocket init error:", e);
      this.startSimulation();
    }
  }

  handleInboundTelemetry(data) {
    // Expected incoming format:
    // {
    //   robot: { lat, lng, battery, speed, mode, heading, distanceCovered },
    //   dogs: [ { id, lat, lng, name, known, confidence, lastSeen } ]
    // }
    if (data.robot) {
      this.state.lat = data.robot.lat ?? this.state.lat;
      this.state.lng = data.robot.lng ?? this.state.lng;
      this.state.battery = data.robot.battery ?? this.state.battery;
      this.state.speed = data.robot.speed ?? this.state.speed;
      this.state.mode = data.robot.mode ?? this.state.mode;
      this.state.heading = data.robot.heading ?? this.state.heading;
      this.state.distanceCoveredToday = data.robot.distanceCovered ?? this.state.distanceCoveredToday;
      this.state.pathHistory.push([this.state.lat, this.state.lng]);
      if (this.state.pathHistory.length > 80) this.state.pathHistory.shift();
    }

    if (Array.isArray(data.dogs)) {
      data.dogs.forEach((incomingDog) => {
        const existing = this.dogs.find(d => d.id === incomingDog.id);
        if (existing) {
          Object.assign(existing, incomingDog);
          existing.lastSeenTimestamp = Date.now();
        } else {
          this.dogs.push({
            ...incomingDog,
            lastSeenTimestamp: Date.now()
          });
          this.emit('dogDetected', incomingDog);
        }
      });
    }

    this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
  }

  // --- Real-time Simulation Engine ---
  startSimulation() {
    if (this.simulationTimer) return;

    this.simulationTimer = setInterval(() => {
      this.stepSimulation();
    }, 1500); // Telemetry update every 1.5 seconds
  }

  stopSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  stepSimulation() {
    if (this.state.mode === 'Paused' || this.state.mode === 'Idle') {
      this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
      return;
    }

    if (this.state.mode === 'Charging') {
      if (this.state.battery < 100) {
        this.state.battery = Math.min(100, this.state.battery + 0.5);
      }
      this.state.personality.mood = 'resting';
      this.state.personality.quip = "Topping up solar cells at North Dock. Ready for duty soon!";
      this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
      return;
    }

    // Determine target waypoint
    let target = null;

    if (this.state.mode === 'Returning') {
      target = SOCIETY_INFO.baseStation;
    } else if (this.state.mode === 'Escorting' && this.state.escortDestination) {
      target = this.state.escortDestination;
    } else if (this.state.mode === 'Searching' && this.state.searchTargetDog) {
      // Prioritize searching near the target dog's last seen area or North Gate
      target = { lat: this.state.searchTargetDog.lat, lng: this.state.searchTargetDog.lng };
    } else {
      // Normal Patrol loop
      const waypoints = this.state.activeWaypoints.length > 0 ? this.state.activeWaypoints : PATROL_WAYPOINTS;
      target = waypoints[this.state.currentWaypointIndex % waypoints.length];
    }

    if (!target) return;

    const currentLat = this.state.lat;
    const currentLng = this.state.lng;
    const dist = getDistanceMeters(currentLat, currentLng, target.lat, target.lng);

    // Calculate heading towards target
    const targetHeading = getBearing(currentLat, currentLng, target.lat, target.lng);
    this.state.heading = targetHeading;

    // Movement step (simulated speed ~ 3.5 km/h = ~1.0 m/s => ~1.5m per step)
    const stepMeters = (this.state.speed * 1000) / 3600 * 1.5;

    if (dist < stepMeters * 1.5) {
      // Reached waypoint!
      this.state.lat = target.lat;
      this.state.lng = target.lng;

      if (this.state.mode === 'Returning') {
        this.state.mode = 'Charging';
        this.state.isCharging = true;
        this.state.speed = 0;
        this.emit('log', { level: 'info', message: 'Sparky docked at Solar Charging Hub.' });
      } else if (this.state.mode === 'Escorting') {
        this.state.mode = 'Patrolling';
        this.state.escortDestination = null;
        this.emit('alert', {
          id: 'escort-done-' + Date.now(),
          type: 'success',
          title: 'Escort Complete',
          message: 'Safe Walk completed successfully. Sparky resumed normal patrol.'
        });
      } else if (this.state.mode === 'Searching') {
        this.state.personality.mood = 'alert';
        this.state.personality.quip = "Reached search quadrant. Scanning bushes for lost pet!";
      } else {
        // Next waypoint
        this.state.currentWaypointIndex = (this.state.currentWaypointIndex + 1) % this.state.activeWaypoints.length;
      }
    } else {
      // Step closer to target
      const ratio = stepMeters / dist;
      this.state.lat = currentLat + (target.lat - currentLat) * ratio;
      this.state.lng = currentLng + (target.lng - currentLng) * ratio;

      // Update distance covered today
      this.state.distanceCoveredToday = +(this.state.distanceCoveredToday + (stepMeters / 1000)).toFixed(3);

      // Battery slow discharge
      this.state.battery = Math.max(5, +(this.state.battery - 0.02).toFixed(2));
      if (this.state.battery < 15 && this.state.mode !== 'Returning' && this.state.mode !== 'Charging') {
        this.emit('alert', {
          id: 'low-bat-' + Date.now(),
          type: 'warning',
          title: 'Low Battery Warning',
          message: 'Sparky battery at 15%. Recommend returning to North Dock Alpha.'
        });
      }
    }

    // Path trail (keep up to 60 points)
    this.state.pathHistory.push([this.state.lat, this.state.lng]);
    if (this.state.pathHistory.length > 60) {
      this.state.pathHistory.shift();
    }

    // Occasional gentle dog jitter / roaming
    this.simulateDogActivity();

    // Check geofence
    this.checkGeofence();

    // Check alerts
    this.checkNearbyAlertZones();

    // Update personality based on nearby dogs
    this.updatePersonality();

    this.emit('telemetry', {
      ...this.state,
      dogs: this.getDogsWithProximity()
    });
  }

  simulateDogActivity() {
    // 20% chance per tick to slightly move a random dog to feel alive
    if (Math.random() < 0.25) {
      const idx = Math.floor(Math.random() * this.dogs.length);
      const dog = this.dogs[idx];
      // small jitter ~ 2 to 5 meters
      const dLat = (Math.random() - 0.5) * 0.00015;
      const dLng = (Math.random() - 0.5) * 0.00015;
      dog.lat += dLat;
      dog.lng += dLng;
      dog.lastSeen = 'Just now';
      dog.lastSeenTimestamp = Date.now();
    }
  }

  checkGeofence() {
    // Check if any stray dog or known dog has breached society geofence
    this.dogs.forEach(dog => {
      const inside = isPointInsidePolygon([dog.lat, dog.lng], SOCIETY_GEOFENCE);
      if (!inside && !dog.geofenceBreachAlerted) {
        dog.geofenceBreachAlerted = true;
        this.emit('alert', {
          id: 'geo-' + dog.id + '-' + Date.now(),
          type: 'warning',
          title: `Geofence Alert: ${dog.name}`,
          message: `${dog.name} (${dog.breed}) detected outside the society boundary!`,
          dogId: dog.id
        });
      } else if (inside) {
        dog.geofenceBreachAlerted = false;
      }
    });
  }

  checkNearbyAlertZones() {
    ALERT_ZONES.forEach(zone => {
      const dist = getDistanceMeters(this.state.lat, this.state.lng, zone.center[0], zone.center[1]);
      if (dist < zone.radius + 15 && !zone.recentlyWarned) {
        zone.recentlyWarned = true;
        setTimeout(() => { zone.recentlyWarned = false; }, 60000);
        this.emit('alert', {
          id: 'zone-warn-' + zone.id,
          type: 'danger',
          title: `Entering Aggression Zone: ${zone.name}`,
          message: zone.reason + '. Recommend safe detour.',
          zoneId: zone.id
        });
      }
    });
  }

  updatePersonality() {
    const dogsInRadius = this.dogs.filter(d => {
      const dMeters = getDistanceMeters(this.state.lat, this.state.lng, d.lat, d.lng);
      return dMeters <= this.state.detectionRadius;
    });

    const hasStray = dogsInRadius.some(d => d.category === 'stray');
    const knownCount = dogsInRadius.filter(d => d.category === 'known').length;

    if (this.state.mode === 'Searching') {
      this.state.personality.mood = 'alert';
      this.state.personality.quip = `Search radar engaged! Looking for ${this.state.searchTargetDog?.name || 'missing pet'}.`;
    } else if (hasStray) {
      this.state.personality.mood = 'alert';
      this.state.personality.tailWagging = false;
      this.state.personality.quip = "Alert: Unregistered canine detected nearby. Logging biometric profile.";
    } else if (knownCount > 0) {
      const firstKnown = dogsInRadius.find(d => d.category === 'known');
      this.state.personality.mood = 'happy';
      this.state.personality.tailWagging = true;
      this.state.personality.quip = `*Wags tail excitedly* Spotted friend ${firstKnown.name}! Confidence ${Math.round(firstKnown.confidence * 100)}%.`;
    } else {
      this.state.personality.mood = 'friendly';
      this.state.personality.tailWagging = true;
      this.state.personality.quip = "Peaceful patrol in progress across Kakkanad. All sensors nominal.";
    }
  }

  getDogsWithProximity() {
    return this.dogs.map(dog => {
      const distance = Math.round(getDistanceMeters(this.state.lat, this.state.lng, dog.lat, dog.lng));
      const inRadius = distance <= this.state.detectionRadius;
      return {
        ...dog,
        distanceFromRobot: distance,
        inRadius
      };
    });
  }

  // --- Robot Action Controls ---
  startPatrol() {
    this.state.mode = 'Patrolling';
    this.state.isCharging = false;
    this.state.speed = 3.5;
    this.emit('statusChange', this.state.mode);
    this.emit('log', { level: 'info', message: 'Patrol started. Navigation auto-engaged.' });
  }

  pausePatrol() {
    this.state.mode = 'Paused';
    this.state.speed = 0;
    this.emit('statusChange', this.state.mode);
    this.emit('log', { level: 'info', message: 'Robot paused in position.' });
  }

  returnToBase() {
    this.state.mode = 'Returning';
    this.state.speed = 4.2;
    this.emit('statusChange', this.state.mode);
    this.emit('log', { level: 'info', message: 'Returning to North Dock Alpha Solar Hub.' });
  }

  setDetectionRadius(meters) {
    this.state.detectionRadius = meters;
    this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
  }

  setCustomWaypoints(waypoints) {
    if (waypoints && waypoints.length > 0) {
      this.state.activeWaypoints = waypoints.map((wp, idx) => ({
        id: 'custom-wp-' + idx,
        name: `Waypoint #${idx + 1}`,
        lat: wp.lat,
        lng: wp.lng
      }));
      this.state.currentWaypointIndex = 0;
      this.state.mode = 'Patrolling';
      this.emit('log', { level: 'success', message: `Custom patrol route created with ${waypoints.length} waypoints.` });
    } else {
      this.state.activeWaypoints = [...PATROL_WAYPOINTS];
      this.state.currentWaypointIndex = 0;
    }
    this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
  }

  startSafeEscort(destination) {
    this.state.mode = 'Escorting';
    this.state.escortDestination = destination;
    this.state.speed = 3.0; // matching walking pace
    this.emit('statusChange', this.state.mode);
    this.emit('alert', {
      id: 'escort-start-' + Date.now(),
      type: 'info',
      title: 'Safe Walk Engaged',
      message: 'Sparky is now escorting you to your destination. Monitoring for aggressive strays.'
    });
  }

  startLostDogSearch(dogData) {
    this.state.mode = 'Searching';
    this.state.searchTargetDog = dogData;
    this.state.speed = 4.5; // faster scan speed
    this.emit('statusChange', this.state.mode);
    this.emit('alert', {
      id: 'lost-search-' + Date.now(),
      type: 'warning',
      title: `Lost Dog Radar: Searching for ${dogData.name}`,
      message: `Priority search initiated around last reported sector (${dogData.lastSeenLocation || 'Society Area'}). Community notified!`
    });
  }

  claimDog(dogId, ownerDetails) {
    const dog = this.dogs.find(d => d.id === dogId);
    if (dog) {
      dog.category = 'known';
      dog.owner = {
        name: ownerDetails.name,
        villa: ownerDetails.villa,
        phone: ownerDetails.phone,
        id: ownerDetails.ownerId,
        registered: true
      };
      dog.status = 'Registered Domestic Pet';
      this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
      return true;
    }
    return false;
  }

  addDogSighting(dog) {
    const newDog = {
      ...dog,
      id: 'dog-' + (this.dogs.length + 1),
      lastSeen: 'Just now',
      lastSeenTimestamp: Date.now(),
      sightingsCount: 1
    };
    this.dogs.push(newDog);
    this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
    return newDog;
  }

  // --- Custom Location Relocation ---
  relocateRobot(lat, lng, name = "Custom Coordinates") {
    this.state.lat = lat;
    this.state.lng = lng;
    this.state.pathHistory = [[lat, lng]];
    this.state.mode = 'Patrolling';
    this.state.isCharging = false;
    this.state.heading = 0;

    // Generate circular patrol checkpoints around the new location (~60-120m radius)
    const r = 0.0009; // approx 100 meters in coordinates
    this.state.activeWaypoints = [
      { id: 'loc-wp-1', name: `${name} - North Waypoint`, lat: lat + r * 1.1, lng: lng },
      { id: 'loc-wp-2', name: `${name} - East Promenade`, lat: lat + r * 0.6, lng: lng + r * 1.1 },
      { id: 'loc-wp-3', name: `${name} - South Walkway`, lat: lat - r * 0.8, lng: lng + r * 0.7 },
      { id: 'loc-wp-4', name: `${name} - Central Park`, lat: lat - r * 1.0, lng: lng - r * 0.4 },
      { id: 'loc-wp-5', name: `${name} - West Perimeter`, lat: lat, lng: lng - r * 1.1 },
      { id: 'loc-wp-6', name: `${name} - Return Dock`, lat: lat + r * 0.5, lng: lng - r * 0.5 }
    ];
    this.state.currentWaypointIndex = 0;

    // Re-anchor base station near the new coordinates
    SOCIETY_INFO.baseStation = {
      lat: lat - r * 0.5,
      lng: lng - r * 0.5,
      name: `${name} Dock Alpha`
    };

    // Re-distribute the dogs realistically around the new location so detection radius works immediately!
    const offsets = [
      { dLat: 0.0003, dLng: 0.0004 },   // Bruno (~50m away)
      { dLat: -0.0004, dLng: -0.0002 }, // Appu (~45m away)
      { dLat: 0.0007, dLng: 0.0005 },   // Maya (~95m away)
      { dLat: -0.0006, dLng: 0.0008 },  // Shadow (~110m away)
      { dLat: 0.0002, dLng: -0.0005 },  // Tommy (~55m away)
      { dLat: -0.0008, dLng: -0.0007 }, // Chacko (~125m away)
      { dLat: 0.0011, dLng: -0.0004 },  // Rocky (~130m away)
      { dLat: 0.0005, dLng: 0.0011 },   // Biscuit (~120m away)
      { dLat: -0.0003, dLng: 0.0006 },  // Ruby (~70m away)
      { dLat: 0.0008, dLng: -0.0008 },  // Simba (~115m away)
    ];

    this.dogs.forEach((dog, idx) => {
      const offset = offsets[idx % offsets.length];
      dog.lat = lat + offset.dLat;
      dog.lng = lng + offset.dLng;
      dog.lastSeen = 'Just now';
      dog.lastSeenTimestamp = Date.now();
    });

    this.state.personality.mood = 'alert';
    this.state.personality.quip = `Teleported to ${name}! Calibrating sensors and scanning new sector for canines.`;

    this.emit('log', { level: 'info', message: `Robot relocated to ${name} (${lat.toFixed(5)}, ${lng.toFixed(5)})` });
    this.emit('telemetry', { ...this.state, dogs: this.getDogsWithProximity() });
  }

  // --- Subscriptions ---
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].add(callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

// Singleton instance
export const robotService = new RobotService();

