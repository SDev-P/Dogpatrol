import { io } from 'socket.io-client';

class LiveGpsTrackingService {
  constructor() {
    this.socket = null;
    this.serverUrl = this.getDefaultServerUrl();
    this.isConnected = false;
    this.isTracking = false;
    this.watchId = null;

    this.latestLocation = null;
    this.routeHistory = [];
    this.detections = [];

    this.listeners = {
      location: new Set(),
      detection: new Set(),
      status: new Set(),
      history: new Set()
    };

    this.pollInterval = null;
  }

  getDefaultServerUrl() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:3001`;
    }
    return 'http://localhost:3001';
  }

  // Connect to the backend Socket.IO server
  connect(url) {
    if (url) this.serverUrl = url;

    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emitEvent('status', { connected: true, serverUrl: this.serverUrl });
        this.stopPolling();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.emitEvent('status', { connected: false, serverUrl: this.serverUrl });
        this.startPollingFallback();
      });

      this.socket.on('connect_error', (err) => {
        this.isConnected = false;
        this.emitEvent('status', { connected: false, error: err.message, serverUrl: this.serverUrl });
        this.startPollingFallback();
      });

      this.socket.on('gps_update', (data) => {
        this.handleNewLocation(data);
      });

      this.socket.on('dog_detected', (data) => {
        this.handleNewDetection(data);
      });

      this.socket.on('history_sync', (historyList) => {
        if (Array.isArray(historyList) && historyList.length > 0) {
          this.routeHistory = historyList;
          this.emitEvent('history', this.routeHistory);
        }
      });

      this.socket.on('detections_sync', (detectionsList) => {
        if (Array.isArray(detectionsList)) {
          this.detections = detectionsList;
          this.emitEvent('detection', { fullList: this.detections });
        }
      });

      this.socket.on('history_cleared', () => {
        this.routeHistory = [];
        this.latestLocation = null;
        this.emitEvent('history', []);
      });

    } catch (err) {
      console.warn('[LiveGpsService] Socket init error:', err);
      this.startPollingFallback();
    }

    // Initial fetch via REST API
    this.fetchLatestLocation();
    this.fetchHistory();
    this.fetchDetections();
  }

  disconnect() {
    this.stopPolling();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.emitEvent('status', { connected: false });
  }

  // Handle incoming location coordinate
  handleNewLocation(data) {
    if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') return;

    this.latestLocation = data;

    // Avoid duplicate points
    const lastPoint = this.routeHistory[this.routeHistory.length - 1];
    const isNew = !lastPoint ||
      Math.abs(lastPoint.latitude - data.latitude) > 0.000005 ||
      Math.abs(lastPoint.longitude - data.longitude) > 0.000005;

    if (isNew) {
      this.routeHistory.push(data);
      if (this.routeHistory.length > 2000) this.routeHistory.shift();
      this.emitEvent('history', this.routeHistory);
    }

    this.emitEvent('location', data);
  }

  // Handle incoming dog detection
  handleNewDetection(data) {
    if (!data) return;
    const exists = this.detections.some(d => d.id === data.id);
    if (!exists) {
      this.detections.unshift(data);
      if (this.detections.length > 200) this.detections.pop();
    }
    this.emitEvent('detection', { newDetection: data, fullList: this.detections });
  }

  // HTTP polling fallback if socket is unavailable
  startPollingFallback() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.fetchLatestLocation();
    }, 3000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // REST API: GET latest location
  async fetchLatestLocation() {
    try {
      const res = await fetch(`${this.serverUrl}/api/gps/location`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.handleNewLocation(json.data);
        }
      }
    } catch (e) {
      // Server may be offline
    }
  }

  // REST API: GET route history
  async fetchHistory() {
    try {
      const res = await fetch(`${this.serverUrl}/api/gps/history`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          this.routeHistory = json.data;
          this.emitEvent('history', this.routeHistory);
        }
      }
    } catch (e) {}
  }

  // REST API: GET detections
  async fetchDetections() {
    try {
      const res = await fetch(`${this.serverUrl}/api/gps/detections`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          this.detections = json.data;
          this.emitEvent('detection', { fullList: this.detections });
        }
      }
    } catch (e) {}
  }

  // Record a stray dog detection associated with current robot GPS
  async logDetection(dogInfo) {
    const lat = dogInfo.latitude || (this.latestLocation ? this.latestLocation.latitude : 0);
    const lng = dogInfo.longitude || (this.latestLocation ? this.latestLocation.longitude : 0);

    const payload = {
      robotId: 'ROBOT-DOG-01',
      dogName: dogInfo.name || dogInfo.dogName || 'Stray Dog',
      breed: dogInfo.breed || 'Indie / Street Dog',
      confidence: dogInfo.confidence || 0.94,
      tag: dogInfo.tag || 'Stray',
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      imageUrl: dogInfo.photo || dogInfo.image || null
    };

    try {
      const res = await fetch(`${this.serverUrl}/api/gps/detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      // Local fallback
      this.handleNewDetection(payload);
    }
    return payload;
  }

  // Browser-based GPS tracking (for device testing directly from dashboard)
  startBrowserTracking() {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation is not supported in this browser.');
    }

    this.isTracking = true;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const record = {
          robotId: 'DASHBOARD-DEVICE',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed !== null ? pos.coords.speed * 3.6 : 0,
          heading: pos.coords.heading || 0,
          timestamp: new Date(pos.timestamp).toISOString()
        };

        // Send via REST
        fetch(`${this.serverUrl}/api/gps/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        }).catch(() => {});

        this.handleNewLocation(record);
      },
      (err) => {
        console.warn('[LiveGpsService] Geolocation error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    this.emitEvent('status', { isTracking: true });
  }

  stopBrowserTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.emitEvent('status', { isTracking: false });
  }

  // Clear route from view
  clearRoute() {
    this.routeHistory = [];
    this.emitEvent('history', []);
  }

  // Event listener subscription
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].add(callback);
      return () => this.listeners[event].delete(callback);
    }
    return () => {};
  }

  emitEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }

  // Calculate approximate distance in meters
  calculateTotalDistance() {
    if (this.routeHistory.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < this.routeHistory.length; i++) {
      const p1 = this.routeHistory[i - 1];
      const p2 = this.routeHistory[i];
      total += this.getDistanceMeters(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    return total;
  }

  getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const liveGpsTrackingService = new LiveGpsTrackingService();

