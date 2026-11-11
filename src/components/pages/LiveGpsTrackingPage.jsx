import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Radio, 
  MapPin, 
  Navigation, 
  Play, 
  Square, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Trash2, 
  Footprints, 
  Smartphone, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Server,
  Layers,
  Compass,
  QrCode,
  Copy,
  Check,
  X,
  AlertCircle,
  Laptop
} from 'lucide-react';
import { liveGpsTrackingService } from '../../services/liveGpsTrackingService';
import { robotService } from '../../services/robotService';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function LiveGpsTrackingPage() {
  const { addToast } = usePawPatrol();

  // Component State
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [detections, setDetections] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [serverUrl, setServerUrl] = useState(liveGpsTrackingService.serverUrl);
  const [patrolStartTime, setPatrolStartTime] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [tileLayerType, setTileLayerType] = useState('street'); // 100% Free OpenStreetMap default - No API Key needed!
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimerRef = useRef(null);

  // Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const robotMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const polylineRef = useRef(null);
  const detectionMarkersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Default initial coordinates (Kochi Society center or Kerala coast)
  const defaultPos = [9.9312, 76.2673];

  // 100% Free Tile Layers (NO API KEYS REQUIRED)
  const tileLayers = {
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      name: 'OpenStreetMap (Free)'
    },
    hot: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      name: 'Humanitarian'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: 'Satellite Imagery'
    }
  };

  // Determine the best LAN IP for the phone to reach
  // Uses the hostname the browser loaded the dashboard from — works on any network
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const networkIp = currentHostname;
  const phoneUrl = `http://${networkIp}:3000/phone.html`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(phoneUrl)}`;

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultPos,
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Add initial tile layer (OpenStreetMap free)
    tileLayerRef.current = L.tileLayer(tileLayers[tileLayerType].url, {
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group for dog detections
    detectionMarkersLayerRef.current = L.layerGroup().addTo(map);

    // Polyline for patrol path
    polylineRef.current = L.polyline([], {
      color: '#0d9488',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Connect to live GPS service
    liveGpsTrackingService.connect(serverUrl);

    // Cleanup on unmount
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(tileLayers[tileLayerType].url);
  }, [tileLayerType]);

  // 3. Subscribe to Live GPS Service Events
  useEffect(() => {
    const unsubLocation = liveGpsTrackingService.on('location', (loc) => {
      setCurrentLocation(loc);
      setLastUpdateTime(new Date(loc.timestamp || Date.now()).toLocaleTimeString());
      if (!patrolStartTime) setPatrolStartTime(new Date().toLocaleTimeString());
    });

    const unsubHistory = liveGpsTrackingService.on('history', (historyList) => {
      setRouteHistory([...historyList]);
    });

    const unsubDetections = liveGpsTrackingService.on('detection', (data) => {
      if (data.fullList) {
        setDetections([...data.fullList]);
      } else if (data.newDetection) {
        setDetections(prev => [data.newDetection, ...prev]);
        addToast(`Stray Dog Detected: ${data.newDetection.dogName || 'Indie'}`, 'warning');
      }
    });

    const unsubStatus = liveGpsTrackingService.on('status', (status) => {
      if (status.connected !== undefined) setIsConnected(status.connected);
      if (status.isTracking !== undefined) setIsTracking(status.isTracking);
    });

    // Listen to real stray dog detection events from robotService
    const unsubRobotDetections = robotService.on('dogDetected', (dog) => {
      if (dog && (dog.tag === 'Stray' || dog.status === 'stray' || !dog.owner)) {
        liveGpsTrackingService.logDetection({
          name: dog.name,
          breed: dog.breed,
          confidence: dog.confidence || 0.93,
          tag: 'Stray'
        });
      }
    });

    // Set initial values
    if (liveGpsTrackingService.latestLocation) {
      setCurrentLocation(liveGpsTrackingService.latestLocation);
    }
    if (liveGpsTrackingService.routeHistory.length > 0) {
      setRouteHistory([...liveGpsTrackingService.routeHistory]);
    }
    if (liveGpsTrackingService.detections.length > 0) {
      setDetections([...liveGpsTrackingService.detections]);
    }
    setIsConnected(liveGpsTrackingService.isConnected);

    return () => {
      unsubLocation();
      unsubHistory();
      unsubDetections();
      unsubStatus();
      unsubRobotDetections();
    };
  }, [patrolStartTime, addToast]);

  // 4. Update Map Marker & Polyline on Location Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentLocation) return;

    const latLng = [currentLocation.latitude, currentLocation.longitude];

    // Create or update custom Robot Dog marker
    if (!robotMarkerRef.current) {
      const robotIcon = L.divIcon({
        className: 'gps-robot-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-3 rounded-full bg-teal-500/30 animate-ping"></div>
            <div class="absolute -inset-1.5 rounded-full bg-teal-400/40 blur-xs"></div>
            <div class="robot-compass-heading relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-teal-500/50 border-2 border-white transform transition-transform duration-200" style="transform: rotate(${currentLocation.heading || 0}deg);">
              <!-- Directional Forward Heading Pointer -->
              <div class="absolute -top-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[9px] border-b-emerald-300 filter drop-shadow"></div>
              <span style="font-size: 22px;">🐕</span>
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      robotMarkerRef.current = L.marker(latLng, { icon: robotIcon, zIndexOffset: 1000 }).addTo(map);
      robotMarkerRef.current.bindPopup(`
        <div class="p-1.5 font-sans text-xs">
          <div class="font-bold text-teal-600 flex items-center gap-1 mb-0.5">
            <span>🐕</span>
            <span>DOG ROBOT #01</span>
          </div>
          <div class="text-slate-600 text-[11px]">Live GPS Telemetry</div>
          <div class="font-mono text-[10px] text-slate-500 mt-1">${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}</div>
          <div class="text-[10px] text-emerald-600 font-bold mt-0.5">Accuracy: ±${(currentLocation.accuracy || 3).toFixed(1)}m</div>
        </div>
      `);
    } else {
      robotMarkerRef.current.setLatLng(latLng);
      // Smoothly rotate heading in real time as the phone turns
      const markerEl = robotMarkerRef.current.getElement();
      if (markerEl) {
        const headingEl = markerEl.querySelector('.robot-compass-heading');
        if (headingEl) {
          headingEl.style.transform = `rotate(${Math.round(currentLocation.heading || 0)}deg)`;
        }
      }
    }

    // Update GPS Accuracy circle
    if (currentLocation.accuracy) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle(latLng, {
          radius: currentLocation.accuracy,
          color: '#14b8a6',
          weight: 1.5,
          fillColor: '#14b8a6',
          fillOpacity: 0.15
        }).addTo(map);
      } else {
        accuracyCircleRef.current.setLatLng(latLng);
        accuracyCircleRef.current.setRadius(currentLocation.accuracy);
      }
    }

    // Auto-center map if enabled with smooth quick pan
    if (autoCenter) {
      map.panTo(latLng, { animate: true, duration: 0.25 });
    }
  }, [currentLocation, autoCenter]);

  // 5. Update Polyline Patrol Route
  useEffect(() => {
    if (!polylineRef.current) return;
    if (showRoute && routeHistory.length > 0) {
      const latLngs = routeHistory.map(p => [p.latitude, p.longitude]);
      polylineRef.current.setLatLngs(latLngs);
    } else {
      polylineRef.current.setLatLngs([]);
    }
  }, [routeHistory, showRoute]);

  // 6. Update Stray Dog Detection Markers
  useEffect(() => {
    if (!detectionMarkersLayerRef.current) return;
    detectionMarkersLayerRef.current.clearLayers();

    if (!showDetections) return;

    detections.forEach((det) => {
      const icon = L.divIcon({
        className: 'gps-detection-marker',
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            <div class="absolute -inset-1 rounded-full bg-rose-500/30 animate-pulse"></div>
            <div class="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 border border-white">
              <span style="font-size: 14px;">🐾</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([det.latitude, det.longitude], { icon });
      marker.bindPopup(`
        <div class="p-2 font-sans text-xs max-w-[200px]">
          <div class="flex items-center gap-1.5 font-bold text-rose-600 mb-1">
            <span>🐾</span>
            <span>${det.dogName || 'Stray Dog'}</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-200">${det.breed || 'Indie / Street Dog'}</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-0.5">Confidence: ${(det.confidence * 100).toFixed(0)}%</div>
          <div class="font-mono text-[9px] text-slate-400 mt-1">${new Date(det.timestamp).toLocaleTimeString()}</div>
        </div>
      `);
      marker.on('click', () => setSelectedDetection(det));
      detectionMarkersLayerRef.current.addLayer(marker);
    });
  }, [detections, showDetections]);

  // Distance calculation
  const totalDistance = useMemo(() => {
    return liveGpsTrackingService.calculateTotalDistance();
  }, [routeHistory]);

  // Center on Robot Handler
  const handleCenterRobot = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 18, {
        animate: true,
        duration: 0.8
      });
      setAutoCenter(true);
      addToast('Map centered on Dog Robot', 'info');
    } else {
      addToast('No robot GPS fix available yet. Connect your phone or start simulation.', 'warning');
    }
  };

  // Toggle Browser High-Accuracy Tracking on laptop
  const handleToggleTracking = () => {
    if (isTracking) {
      liveGpsTrackingService.stopBrowserTracking();
      setIsTracking(false);
      addToast('Laptop browser GPS stopped', 'info');
    } else {
      try {
        liveGpsTrackingService.startBrowserTracking();
        setIsTracking(true);
        addToast('Acquiring local GPS fix from this device...', 'info');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // Clear Route Display
  const handleClearRoute = () => {
    liveGpsTrackingService.clearRoute();
    setRouteHistory([]);
    addToast('Patrol route display cleared', 'info');
  };

  // Simulate Patrol Movement Test
  const handleToggleSimulation = () => {
    if (isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsSimulating(false);
      addToast('Live simulation paused', 'info');
      return;
    }

    setIsSimulating(true);
    addToast('Simulating live robot movement from smartphone sensor...', 'success');

    let startLat = currentLocation ? currentLocation.latitude : 9.9312;
    let startLng = currentLocation ? currentLocation.longitude : 76.2673;
    let angle = 0;

    simulationTimerRef.current = setInterval(async () => {
      angle += 0.15;
      const stepLat = startLat + Math.sin(angle) * 0.0006;
      const stepLng = startLng + Math.cos(angle) * 0.0006;
      const speed = (2.5 + Math.random() * 1.5);
      const heading = Math.round((angle * 180 / Math.PI) % 360);

      const payload = {
        robotId: 'ROBOT-DOG-01',
        latitude: stepLat,
        longitude: stepLng,
        accuracy: 3.2,
        speed,
        heading,
        timestamp: new Date().toISOString()
      };

      try {
        await fetch(`${serverUrl}/api/gps/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        // Local service fallback
        liveGpsTrackingService.handleNewLocation(payload);
      }
    }, 1500);
  };

  // Simulate Detection for instant demo
  const handleSimulateDetection = () => {
    const lat = currentLocation ? currentLocation.latitude : 9.9312;
    const lng = currentLocation ? currentLocation.longitude : 76.2673;

    const sampleDogs = [
      { name: 'Indie Street Dog', breed: 'Desi / Pariah', confidence: 0.94 },
      { name: 'Brown Stray Pup', breed: 'Mixed Indie', confidence: 0.88 },
      { name: 'Black Street Terrier', breed: 'Terrier Cross', confidence: 0.91 }
    ];
    const picked = sampleDogs[Math.floor(Math.random() * sampleDogs.length)];
    const jitterLat = lat + (Math.random() - 0.5) * 0.0002;
    const jitterLng = lng + (Math.random() - 0.5) * 0.0002;

    liveGpsTrackingService.logDetection({
      ...picked,
      latitude: jitterLat,
      longitude: jitterLng
    });
    addToast(`Recorded stray dog detection at (${jitterLat.toFixed(5)}, ${jitterLng.toFixed(5)})`, 'success');
  };

  const copyPhoneUrl = () => {
    navigator.clipboard.writeText(phoneUrl);
    setCopiedLink(true);
    addToast('Phone GPS transmitter link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* =========================================================================
          LEFT / MAIN SECTION: INTERACTIVE LEAFLET MAP
      ========================================================================= */}
      <div className="relative flex-1 h-1/2 lg:h-full w-full">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top-Left Floating Info HUD */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="glass-panel rounded-2xl p-3 shadow-2xl border border-slate-700/60 pointer-events-auto backdrop-blur-xl bg-slate-900/90 max-w-xs">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-tight flex items-center gap-1.5 text-white">
                    <span>LIVE GPS TRACKING</span>
                  </h2>
                  <p className="text-[10px] text-slate-400">Dog Robot Mobile Telemetry</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                isConnected 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isConnected ? 'ONLINE' : 'CONNECTING'}</span>
              </div>
            </div>

            {/* Quick telemetry strip */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-center font-mono">
              <div className="bg-slate-950/70 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[9px] text-slate-500 uppercase">Speed</div>
                <div className="text-xs font-bold text-teal-400">
                  {currentLocation ? (currentLocation.speed || 0).toFixed(1) : '0.0'} <span className="text-[8px] font-normal">km/h</span>
                </div>
              </div>
              <div className="bg-slate-950/70 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[9px] text-slate-500 uppercase">Accuracy</div>
                <div className="text-xs font-bold text-emerald-400">
                  {currentLocation ? `±${(currentLocation.accuracy || 0).toFixed(0)}m` : '--'}
                </div>
              </div>
              <div className="bg-slate-950/70 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[9px] text-slate-500 uppercase">Distance</div>
                <div className="text-xs font-bold text-sky-400">
                  {(totalDistance / 1000).toFixed(2)} <span className="text-[8px] font-normal">km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map View & Layer Controls (Floating Bottom Left) */}
        <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2 pointer-events-auto">
          {/* Tile Layer Selector (100% Free OSM) */}
          <div className="glass-panel rounded-xl p-1 shadow-xl border border-slate-700/60 flex items-center gap-1 bg-slate-900/90 text-xs">
            <button
              onClick={() => setTileLayerType('street')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${tileLayerType === 'street' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Standard Free OpenStreetMap"
            >
              OpenStreetMap
            </button>
            <button
              onClick={() => setTileLayerType('hot')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${tileLayerType === 'hot' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Humanitarian Free Tile"
            >
              Humanitarian
            </button>
            <button
              onClick={() => setTileLayerType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${tileLayerType === 'satellite' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Satellite Aerial View"
            >
              Satellite
            </button>
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleCenterRobot}
            className="glass-panel p-2 rounded-xl shadow-xl border border-slate-700/60 bg-slate-900/90 text-teal-400 hover:text-white hover:bg-teal-600 transition flex items-center gap-1.5 text-xs font-bold"
            title="Recenter Map on Dog Robot"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Center Robot</span>
          </button>

          {/* Toggle Auto Center */}
          <button
            onClick={() => setAutoCenter(!autoCenter)}
            className={`glass-panel px-2.5 py-2 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-1 transition ${
              autoCenter 
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                : 'bg-slate-900/90 text-slate-400 border-slate-700/60'
            }`}
            title="Keep map centered as robot moves"
          >
            <Compass className={`w-3.5 h-3.5 ${autoCenter ? 'text-teal-400 animate-spin-slow' : ''}`} />
            <span className="hidden sm:inline">Auto-Follow: {autoCenter ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: CONTROL PANEL & TELEMETRY DASHBOARD
      ========================================================================= */}
      <div className="w-full lg:w-[440px] xl:w-[480px] h-1/2 lg:h-full bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col z-10 overflow-y-auto">
        
        {/* Top Header / Subtitle */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="text-teal-400">📍</span>
              <span>Live GPS Tracking</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPhoneModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-md shadow-teal-500/25 animate-pulse"
                title="Connect Smartphone GPS to Robot"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Connect Phone</span>
                <QrCode className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Monitor your dog robot's real-time patrol location & detection hotspots.
          </p>
        </div>

        <div className="p-4 space-y-4 flex-1">

          {/* 1. PRIMARY GPS COORDINATES CARDS */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Robot Coordinates Fix</span>
              <span className="font-mono text-[10px] text-teal-400">
                {lastUpdateTime ? `Updated: ${lastUpdateTime}` : 'Waiting for GPS fix'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Latitude */}
              <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Latitude</div>
                <div className="text-lg font-extrabold font-mono text-teal-400 tracking-tight">
                  {currentLocation ? currentLocation.latitude.toFixed(6) : '0.000000'}°
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">WGS 84 Ellipsoid</div>
              </div>

              {/* Longitude */}
              <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Longitude</div>
                <div className="text-lg font-extrabold font-mono text-teal-400 tracking-tight">
                  {currentLocation ? currentLocation.longitude.toFixed(6) : '0.000000'}°
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">East Standard</div>
              </div>

              {/* GPS Accuracy */}
              <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] font-bold text-slate-500 uppercase">GPS Accuracy</div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {currentLocation?.accuracy ? `±${currentLocation.accuracy.toFixed(1)} m` : '-- m'}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">Horizontal Dilution</div>
              </div>

              {/* Tracking Status */}
              <div className="glass-panel p-3 rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Patrol Status</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-xs truncate">{currentLocation ? 'ACTIVE PATROL' : 'STANDBY'}</span>
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                  {routeHistory.length} Route Waypoints
                </div>
              </div>
            </div>
          </div>

          {/* 2. HOW TO CONNECT PHONE GPS (PROMINENT BANNER) */}
          <div className="glass-panel p-3.5 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-slate-950/80">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <Smartphone className="w-5 h-5 text-teal-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>How to Connect Your Phone GPS</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    1. Connect phone to same Wi-Fi.<br />
                    2. Scan QR or open <span className="font-mono text-teal-300 font-bold">{phoneUrl}</span>.<br />
                    3. Tap <strong>Start Transmitting GPS</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPhoneModalOpen(true)}
                className="shrink-0 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition shadow flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono truncate max-w-[220px]">
                {phoneUrl}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPhoneUrl}
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
                <span className="text-slate-600">•</span>
                <a
                  href="/phone.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Test in tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 3. TRACKING CONTROLS */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Patrol & Tracking Controls</span>
              <span className="text-[10px] text-slate-500">Live Telemetry</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Start / Stop Simulation */}
              <button
                onClick={handleToggleSimulation}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition shadow-md ${
                  isSimulating
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                }`}
                title="Simulate robot movement along a patrol path to test live tracking"
              >
                {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Stop Test Drive' : 'Test Live Movement'}</span>
              </button>

              {/* Center Robot */}
              <button
                onClick={handleCenterRobot}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Crosshair className="w-3.5 h-3.5 text-teal-400" />
                <span>Center Robot</span>
              </button>

              {/* Show / Hide Route */}
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                  showRoute 
                    ? 'bg-slate-800 text-teal-300 border-teal-500/30' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {showRoute ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showRoute ? 'Hide Route' : 'Show Route'}</span>
              </button>

              {/* Clear Route Display */}
              <button
                onClick={handleClearRoute}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Route</span>
              </button>
            </div>
          </div>

          {/* 4. STRAY DOG DETECTION LOCATIONS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-rose-400" />
                <span>Stray Dog Detection Locations</span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-rose-500/30">
                  {detections.length}
                </span>
              </div>
              
              <button
                onClick={handleSimulateDetection}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                title="Record a detection at the robot's current GPS position"
              >
                <Sparkles className="w-3 h-3" />
                <span>+ Log Detection</span>
              </button>
            </div>

            {detections.length === 0 ? (
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                No stray dogs detected at current GPS position yet. Tap <span className="text-amber-400 font-bold">+ Log Detection</span> to test logging a detection at current robot coordinates.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {detections.map((det) => (
                  <div
                    key={det.id}
                    onClick={() => {
                      setSelectedDetection(det);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([det.latitude, det.longitude], 18, { animate: true });
                      }
                    }}
                    className="glass-panel p-2.5 rounded-xl border border-slate-800 hover:border-rose-500/40 bg-slate-950/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                        🐾
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{det.dogName}</div>
                        <div className="text-[10px] text-slate-400">{det.breed}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        {(det.confidence * 100).toFixed(0)}% Match
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {det.latitude.toFixed(5)}, {det.longitude.toFixed(5)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. PATROL ROUTE HISTORY SUMMARY */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Patrol History Summary
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Patrol Start Time:</span>
                <span className="font-mono text-slate-200">{patrolStartTime || '--:--:--'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Distance Travelled:</span>
                <span className="font-mono font-bold text-teal-400">{totalDistance.toFixed(1)} meters</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Breadcrumb GPS Points:</span>
                <span className="font-mono text-slate-200">{routeHistory.length} recorded</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Backend Server:</span>
                <span className="font-mono text-xs text-sky-400 truncate max-w-[180px]">{serverUrl}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          CONNECT PHONE GPS MODAL (QR CODE + STEP BY STEP GUIDE)
      ========================================================================= */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="glass-panel w-full max-w-md rounded-3xl p-5 border border-slate-700 shadow-2xl bg-slate-900 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connect Phone GPS Sensor</h3>
                <p className="text-[11px] text-slate-400">Mount smartphone on robot to transmit coordinates</p>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center mb-4 shadow-inner">
              <img 
                src={qrCodeApiUrl} 
                alt="Scan to open Phone GPS"
                className="w-44 h-44 object-contain"
              />
              <div className="text-[10px] text-slate-700 font-semibold mt-2 flex items-center gap-1">
                <span>📷 Scan with phone camera</span>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between mb-4">
              <div className="truncate font-mono text-xs text-teal-300 pr-2">
                {phoneUrl}
              </div>
              <button
                onClick={copyPhoneUrl}
                className="shrink-0 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* 3 Step Instructions */}
            <div className="space-y-2 mb-4 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Connect your phone to the <strong>same Wi-Fi network</strong> as your laptop.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Open the URL above in Chrome or Safari on your phone.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Allow GPS location permission and tap <strong>START TRANSMITTING GPS</strong>.</span>
              </div>
            </div>

            {/* Direct Test on this device */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleToggleTracking}
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1.5"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>{isTracking ? 'Stop Laptop GPS' : 'Or Use Laptop GPS Sensor'}</span>
              </button>

              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
