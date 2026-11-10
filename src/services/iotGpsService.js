/**
 * IoT Robot GPS Tracking & Dataset Service
 * 
 * Supports:
 * 1. Live Phone GPS via navigator.geolocation.watchPosition (when phone is mounted on robot)
 * 2. Importing GPS dataset files (.json, .csv, .gpx)
 * 3. Connecting to custom IoT backend server (WebSocket / REST / Webhook)
 * 4. Exporting recorded tracks to CSV / JSON / GPX
 */

import { getDistanceMeters, getBearing } from './robotService';

class IoTGpsService {
  constructor() {
    this.listeners = {
      location: new Set(),
      datasetLoaded: new Set(),
      serverStatus: new Set(),
      log: new Set()
    };

    // Live Phone GPS Tracker State
    this.isTrackingPhone = false;
    this.watchId = null;
    this.currentPosition = null;
    this.phoneGpsHistory = []; // Array of { lat, lng, altitude, speed, accuracy, heading, timestamp }

    // Backend Server Connection
    this.serverConfig = {
      type: 'websocket', // 'websocket' | 'polling'
      url: 'ws://192.168.1.100:8080/gps',
      pollingInterval: 2000,
      status: 'disconnected' // 'connected' | 'connecting' | 'disconnected' | 'error'
    };
    this.ws = null;
    this.pollingTimer = null;

    // Imported Dataset State
    this.importedDataset = null; // { name, points: [{ lat, lng, speed, altitude, time }], totalDistance, maxSpeed }
    this.datasetReplayIndex = 0;
  }

  // --- 1. Live Phone GPS Tracker (Phone mounted on IoT Robot) ---
  startPhoneGpsTracking(onSuccess, onError) {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.emitLog('error', 'Geolocation is not supported by this device.');
      onError?.(new Error('Geolocation not supported'));
      return;
    }

    this.isTrackingPhone = true;
    this.emitLog('info', 'Phone GPS Tracking engaged. Monitoring high-accuracy positioning...');

    const options = {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude) : 15,
          speed: pos.coords.speed !== null ? +(pos.coords.speed * 3.6).toFixed(1) : 0, // m/s to km/h
          accuracy: Math.round(pos.coords.accuracy || 5), // meters
          heading: pos.coords.heading !== null && !isNaN(pos.coords.heading) ? Math.round(pos.coords.heading) : 0,
          timestamp: pos.timestamp || Date.now()
        };

        this.currentPosition = point;
        this.phoneGpsHistory.push(point);
        if (this.phoneGpsHistory.length > 500) this.phoneGpsHistory.shift();

        this.emitLocation(point, 'phone_live');
        onSuccess?.(point);
      },
      (err) => {
        this.emitLog('error', `Phone GPS Error: ${err.message}`);
        onError?.(err);
      },
      options
    );
  }

  stopPhoneGpsTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTrackingPhone = false;
    this.emitLog('info', 'Phone GPS Tracking stopped.');
  }

  clearPhoneTrack() {
    this.phoneGpsHistory = [];
    this.currentPosition = null;
    this.emitLocation(null, 'clear');
  }

  // --- 2. GPS Dataset File Parser (CSV, JSON, GPX) ---
  async parseGpsFile(file) {
    const text = await file.text();
    const fileName = file.name.toLowerCase();

    let points = [];

    if (fileName.endsWith('.json')) {
      points = this.parseJsonGps(text);
    } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      points = this.parseCsvGps(text);
    } else if (fileName.endsWith('.gpx') || fileName.endsWith('.xml') || fileName.endsWith('.kml')) {
      points = this.parseGpxGps(text);
    } else {
      // Try JSON first, then CSV
      try {
        points = this.parseJsonGps(text);
      } catch (e) {
        points = this.parseCsvGps(text);
      }
    }

    if (!points || points.length === 0) {
      throw new Error('No valid GPS coordinate points found in this file.');
    }

    // Calculate metadata: total distance & speed
    let totalDist = 0;
    let maxSpeed = 0;
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      totalDist += getDistanceMeters(p1.lat, p1.lng, p2.lat, p2.lng);
      if (p2.speed > maxSpeed) maxSpeed = p2.speed;
    }

    const dataset = {
      name: file.name,
      pointCount: points.length,
      points,
      totalDistanceKm: +(totalDist / 1000).toFixed(2),
      maxSpeed: +maxSpeed.toFixed(1),
      startTime: points[0].time || '00:00:00',
      endTime: points[points.length - 1].time || '00:00:00'
    };

    this.importedDataset = dataset;
    this.datasetReplayIndex = 0;
    this.emitDatasetLoaded(dataset);
    this.emitLog('success', `Imported ${points.length} GPS points from ${file.name} (${dataset.totalDistanceKm} km).`);

    return dataset;
  }

  parseJsonGps(text) {
    const data = JSON.parse(text);
    const rawList = Array.isArray(data) ? data : (data.points || data.coordinates || data.data || data.locations || []);

    return rawList.map((item, idx) => {
      let lat = item.lat ?? item.latitude ?? (Array.isArray(item) ? item[0] : null);
      let lng = item.lng ?? item.lon ?? item.longitude ?? (Array.isArray(item) ? item[1] : null);

      if (lat === null || lng === null) return null;

      return {
        id: idx + 1,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        speed: item.speed ? parseFloat(item.speed) : 3.5,
        altitude: item.alt ?? item.altitude ?? 20,
        time: item.time || item.timestamp || new Date(Date.now() - (rawList.length - idx) * 3000).toLocaleTimeString()
      };
    }).filter(Boolean);
  }

  parseCsvGps(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g, ''));
    const latIndex = header.findIndex(h => h === 'lat' || h === 'latitude' || h.includes('lat'));
    const lngIndex = header.findIndex(h => h === 'lng' || h === 'lon' || h === 'longitude' || h.includes('lon'));
    const speedIndex = header.findIndex(h => h === 'speed' || h.includes('spd') || h.includes('speed'));
    const altIndex = header.findIndex(h => h === 'alt' || h === 'altitude' || h.includes('alt'));
    const timeIndex = header.findIndex(h => h === 'time' || h === 'timestamp' || h.includes('time') || h.includes('date'));

    if (latIndex === -1 || lngIndex === -1) {
      throw new Error('CSV must have "lat" (or "latitude") and "lng" (or "longitude") columns.');
    }

    const points = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim().replace(/['"]/g, ''));
      if (parts.length <= Math.max(latIndex, lngIndex)) continue;

      const lat = parseFloat(parts[latIndex]);
      const lng = parseFloat(parts[lngIndex]);
      if (isNaN(lat) || isNaN(lng)) continue;

      const speed = speedIndex !== -1 && !isNaN(parseFloat(parts[speedIndex])) ? parseFloat(parts[speedIndex]) : 3.2;
      const altitude = altIndex !== -1 && !isNaN(parseFloat(parts[altIndex])) ? parseFloat(parts[altIndex]) : 18;
      const time = timeIndex !== -1 && parts[timeIndex] ? parts[timeIndex] : new Date(Date.now() - (lines.length - i) * 2000).toLocaleTimeString();

      points.push({ id: i, lat, lng, speed, altitude, time });
    }

    return points;
  }

  parseGpxGps(text) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const trkpts = xml.querySelectorAll('trkpt, wpt');

    const points = [];
    trkpts.forEach((pt, idx) => {
      const lat = parseFloat(pt.getAttribute('lat'));
      const lon = parseFloat(pt.getAttribute('lon'));
      if (isNaN(lat) || isNaN(lon)) return;

      const ele = pt.querySelector('ele')?.textContent;
      const speed = pt.querySelector('speed')?.textContent;
      const time = pt.querySelector('time')?.textContent;

      points.push({
        id: idx + 1,
        lat,
        lng: lon,
        altitude: ele ? parseFloat(ele) : 22,
        speed: speed ? parseFloat(speed) * 3.6 : 3.6,
        time: time ? new Date(time).toLocaleTimeString() : `Point ${idx + 1}`
      });
    });

    return points;
  }

  // --- 3. Backend Server Connector (WebSocket / REST) ---
  connectBackend(config) {
    this.disconnectBackend();
    this.serverConfig = { ...this.serverConfig, ...config };
    this.serverConfig.status = 'connecting';
    this.emitServerStatus(this.serverConfig.status);
    this.emitLog('info', `Connecting to backend IoT server at ${this.serverConfig.url}...`);

    if (this.serverConfig.type === 'websocket') {
      try {
        this.ws = new WebSocket(this.serverConfig.url);

        this.ws.onopen = () => {
          this.serverConfig.status = 'connected';
          this.emitServerStatus('connected');
          this.emitLog('success', `WebSocket connected to robot server at ${this.serverConfig.url}`);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleIncomingBackendPacket(data);
          } catch (e) {
            console.error('Failed to parse backend data:', e);
          }
        };

        this.ws.onclose = () => {
          this.serverConfig.status = 'disconnected';
          this.emitServerStatus('disconnected');
          this.emitLog('warning', 'IoT server WebSocket connection closed.');
        };

        this.ws.onerror = (err) => {
          this.serverConfig.status = 'error';
          this.emitServerStatus('error');
          this.emitLog('error', 'IoT server WebSocket connection error.');
        };
      } catch (err) {
        this.serverConfig.status = 'error';
        this.emitServerStatus('error');
      }
    } else {
      // REST HTTP Polling
      this.serverConfig.status = 'connected';
      this.emitServerStatus('connected');
      this.startHttpPolling();
    }
  }

  startHttpPolling() {
    this.pollingTimer = setInterval(async () => {
      try {
        const res = await fetch(this.serverConfig.url);
        if (res.ok) {
          const data = await res.json();
          this.handleIncomingBackendPacket(data);
        }
      } catch (err) {
        this.emitLog('error', `Polling error from ${this.serverConfig.url}: ${err.message}`);
      }
    }, this.serverConfig.pollingInterval || 2000);
  }

  handleIncomingBackendPacket(data) {
    // Standard format: { lat, lng, speed, altitude, accuracy, heading, battery }
    if (data.lat !== undefined && data.lng !== undefined) {
      const point = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        speed: data.speed !== undefined ? parseFloat(data.speed) : 0,
        altitude: data.altitude !== undefined ? parseFloat(data.altitude) : 15,
        accuracy: data.accuracy !== undefined ? parseFloat(data.accuracy) : 3,
        heading: data.heading !== undefined ? parseFloat(data.heading) : 0,
        battery: data.battery !== undefined ? data.battery : 90,
        timestamp: data.timestamp || Date.now()
      };
      this.currentPosition = point;
      this.phoneGpsHistory.push(point);
      this.emitLocation(point, 'backend_live');
    }
  }

  disconnectBackend() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.serverConfig.status = 'disconnected';
    this.emitServerStatus('disconnected');
  }

  // --- 4. Export Tracks ---
  exportTrackAsCsv(points) {
    const list = points && points.length > 0 ? points : this.phoneGpsHistory;
    if (list.length === 0) return null;

    let csv = 'latitude,longitude,speed_kmh,altitude_m,accuracy_m,heading_deg,timestamp\n';
    list.forEach(p => {
      csv += `${p.lat},${p.lng},${p.speed || 0},${p.altitude || 0},${p.accuracy || 0},${p.heading || 0},${new Date(p.timestamp || Date.now()).toISOString()}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iot_robot_gps_track_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportTrackAsGpx(points) {
    const list = points && points.length > 0 ? points : this.phoneGpsHistory;
    if (list.length === 0) return null;

    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PawPatrol IoT Tracker" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>IoT Robot Track</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Robot Tracked Route</name>
    <trkseg>
`;
    list.forEach(p => {
      gpx += `      <trkpt lat="${p.lat}" lon="${p.lng}">
        <ele>${p.altitude || 0}</ele>
        <speed>${((p.speed || 0) / 3.6).toFixed(2)}</speed>
        <time>${new Date(p.timestamp || Date.now()).toISOString()}</time>
      </trkpt>\n`;
    });
    gpx += `    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iot_robot_track_${Date.now()}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Sample real GPS track dataset generator (for instant demo/testing)
  generateSampleDataset() {
    const centerLat = 10.0095;
    const centerLng = 76.3638;
    const points = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const r = 0.0012 + Math.sin(i * 0.4) * 0.0003;
      const lat = centerLat + Math.sin(angle) * r;
      const lng = centerLng + Math.cos(angle) * r * 1.3;
      const speed = +(3.2 + Math.sin(i * 0.5) * 1.5).toFixed(1);
      const altitude = Math.round(18 + Math.cos(i * 0.3) * 4);
      const time = new Date(Date.now() - (count - i) * 2500).toLocaleTimeString();

      points.push({ id: i + 1, lat, lng, speed, altitude, time });
    }

    return {
      name: "Sample_IoT_Rover_Perimeter_Circuit.csv",
      pointCount: points.length,
      points,
      totalDistanceKm: 1.15,
      maxSpeed: 4.7,
      startTime: points[0].time,
      endTime: points[points.length - 1].time
    };
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

  emitLocation(point, source) {
    this.listeners.location.forEach(cb => cb(point, source));
  }

  emitDatasetLoaded(dataset) {
    this.listeners.datasetLoaded.forEach(cb => cb(dataset));
  }

  emitServerStatus(status) {
    this.listeners.serverStatus.forEach(cb => cb(status));
  }

  emitLog(level, message) {
    this.listeners.log.forEach(cb => cb({ level, message, time: new Date().toLocaleTimeString() }));
  }
}

export const iotGpsService = new IoTGpsService();

