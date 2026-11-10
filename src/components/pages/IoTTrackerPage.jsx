import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Radio, 
  Smartphone, 
  Upload, 
  Server, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  MapPin, 
  Compass, 
  Activity, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Crosshair, 
  ChevronRight,
  Gauge,
  Mountain,
  Satellite,
  Clock,
  FileText,
  Globe,
  Check,
  Navigation
} from 'lucide-react';
import { iotGpsService } from '../../services/iotGpsService';
import { usePawPatrol } from '../../context/PawPatrolContext';

const IOT_PRESETS = [
  { name: "Kochi, Kerala (Palm Meadows)", lat: 10.0095, lng: 76.3638, badge: "Default" },
  { name: "Bengaluru, Karnataka (Indiranagar)", lat: 12.9784, lng: 77.6408, badge: "Metro" },
  { name: "Mumbai (Hiranandani Powai)", lat: 19.1197, lng: 72.9056, badge: "Metro" },
  { name: "Gurugram, NCR (DLF Phase 5)", lat: 28.4595, lng: 77.0266, badge: "NCR" },
  { name: "Hyderabad (Jubilee Hills)", lat: 17.4319, lng: 78.4073, badge: "South" },
  { name: "Chennai (Besant Nagar)", lat: 13.0001, lng: 80.2667, badge: "Coastal" },
  { name: "London, UK (Hyde Park)", lat: 51.5072, lng: -0.1657, badge: "Global" },
  { name: "San Francisco, CA (Dolores Park)", lat: 37.7596, lng: -122.4269, badge: "Global" }
];

export default function IoTTrackerPage() {
  const { 
    addToast, 
    setIsLocationModalOpen,
    relocateRobotTo,
    currentLocationName,
    robotState
  } = usePawPatrol();

  // Mode Selection: 'phone' | 'import' | 'server' | 'relocate'
  const [activeMode, setActiveMode] = useState('phone');

  // Relocation State
  const [isIoTDropMode, setIsIoTDropMode] = useState(false);
  const isIoTDropModeRef = useRef(false);
  isIoTDropModeRef.current = isIoTDropMode;

  const [customLat, setCustomLat] = useState(robotState.lat.toFixed(5));
  const [customLng, setCustomLng] = useState(robotState.lng.toFixed(5));
  const [customName, setCustomName] = useState('IoT Rover Custom Zone');
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);

  // Phone GPS State
  const [isPhoneTracking, setIsPhoneTracking] = useState(iotGpsService.isTrackingPhone);
  const [liveGpsPoint, setLiveGpsPoint] = useState(iotGpsService.currentPosition);
  const [phonePoints, setPhonePoints] = useState(iotGpsService.phoneGpsHistory);

  // Imported Dataset State
  const [dataset, setDataset] = useState(iotGpsService.importedDataset);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1); // 1x | 2x | 5x

  // Backend Server State
  const [serverType, setServerType] = useState('websocket'); // 'websocket' | 'polling'
  const [serverUrl, setServerUrl] = useState('ws://192.168.1.100:8080/gps');
  const [serverStatus, setServerStatus] = useState(iotGpsService.serverConfig.status);
  const [serverLogs, setServerLogs] = useState([]);

  // Tile layer for IoT map
  const [tileType, setTileType] = useState('street'); // 'street' | 'satellite' | 'dark'

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const robotMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const pathPolylineRef = useRef(null);
  const datasetMarkersGroupRef = useRef(null);

  // Initialize independent Leaflet Map for IoT Tracker
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = liveGpsPoint ? [liveGpsPoint.lat, liveGpsPoint.lng] : [10.0095, 76.3638];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    const tileUrls = {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    };

    tileLayerRef.current = L.tileLayer(tileUrls[tileType], {
      maxZoom: 19
    }).addTo(map);

    pathPolylineRef.current = L.polyline([], {
      color: '#0d9488',
      weight: 4,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    accuracyCircleRef.current = L.circle(initialCenter, {
      radius: 10,
      color: '#14b8a6',
      fillColor: '#2dd4bf',
      fillOpacity: 0.15,
      weight: 1
    }).addTo(map);

    datasetMarkersGroupRef.current = L.layerGroup().addTo(map);

    // IoT Robot Custom Marker
    const iotIcon = L.divIcon({
      className: 'iot-robot-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(13, 148, 136, 0.25);
            border: 2px solid #0d9488;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #0d9488 0%, #064e3b 100%);
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            color: #ffffff;
          ">
            <!-- Satellite / Rover icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
              <circle cx="12" cy="12" r="2"/>
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    robotMarkerRef.current = L.marker(initialCenter, { icon: iotIcon }).addTo(map);

    // Map click handler for IoT Relocate / Drop mode
    map.on('click', (e) => {
      if (isIoTDropModeRef.current) {
        const { lat, lng } = e.latlng;
        handleRelocateIoT(lat, lng, `IoT Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsIoTDropMode(false);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const tileUrls = {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    };
    tileLayerRef.current.setUrl(tileUrls[tileType]);
  }, [tileType]);

  // Subscribe to IoT GPS Service
  useEffect(() => {
    const unsubLoc = iotGpsService.on('location', (point, source) => {
      if (!point) return;
      setLiveGpsPoint(point);
      setPhonePoints([...iotGpsService.phoneGpsHistory]);

      if (robotMarkerRef.current && mapInstanceRef.current) {
        const latlng = [point.lat, point.lng];
        robotMarkerRef.current.setLatLng(latlng);
        accuracyCircleRef.current.setLatLng(latlng);
        accuracyCircleRef.current.setRadius(point.accuracy || 10);

        // Update breadcrumb trail
        const historyCoords = iotGpsService.phoneGpsHistory.map(p => [p.lat, p.lng]);
        pathPolylineRef.current.setLatLngs(historyCoords);

        // Auto follow
        mapInstanceRef.current.panTo(latlng, { animate: true });
      }
    });

    const unsubData = iotGpsService.on('datasetLoaded', (ds) => {
      setDataset(ds);
      setReplayIndex(0);
      drawDatasetOnMap(ds);
    });

    const unsubStatus = iotGpsService.on('serverStatus', (st) => {
      setServerStatus(st);
    });

    const unsubLog = iotGpsService.on('log', (entry) => {
      setServerLogs(prev => [entry, ...prev].slice(0, 30));
    });

    return () => {
      unsubLoc();
      unsubData();
      unsubStatus();
      unsubLog();
    };
  }, []);

  // Draw imported dataset on map
  const drawDatasetOnMap = (ds) => {
    if (!mapInstanceRef.current || !datasetMarkersGroupRef.current) return;
    datasetMarkersGroupRef.current.clearLayers();

    if (!ds || !ds.points || ds.points.length === 0) return;

    const latlngs = ds.points.map(p => [p.lat, p.lng]);
    const routeLine = L.polyline(latlngs, {
      color: '#f97316',
      weight: 3.5,
      dashArray: '4, 4'
    });
    datasetMarkersGroupRef.current.addLayer(routeLine);

    // Start point
    const startPoint = ds.points[0];
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: '<div style="background:#10b981; color:white; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:10px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">START</div>',
      iconSize: [44, 20],
      iconAnchor: [22, 10]
    });
    datasetMarkersGroupRef.current.addLayer(L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }));

    // End point
    const endPoint = ds.points[ds.points.length - 1];
    const endIcon = L.divIcon({
      className: 'end-marker',
      html: '<div style="background:#ef4444; color:white; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:10px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);">END</div>',
      iconSize: [40, 20],
      iconAnchor: [20, 10]
    });
    datasetMarkersGroupRef.current.addLayer(L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }));

    // Fit map bounds to dataset
    mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  };

  // Dataset Replay timer
  useEffect(() => {
    let interval = null;
    if (isReplaying && dataset && dataset.points.length > 0) {
      interval = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= dataset.points.length - 1) {
            setIsReplaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const pt = dataset.points[nextIdx];
          if (robotMarkerRef.current) {
            robotMarkerRef.current.setLatLng([pt.lat, pt.lng]);
          }
          return nextIdx;
        });
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(interval);
  }, [isReplaying, dataset, replaySpeed]);

  // --- Handlers ---
  const handleTogglePhoneGps = () => {
    if (isPhoneTracking) {
      iotGpsService.stopPhoneGpsTracking();
      setIsPhoneTracking(false);
      addToast({ type: 'info', title: 'Phone GPS Stopped', message: 'Paused live GPS broadcast from this device.' });
    } else {
      iotGpsService.startPhoneGpsTracking(
        (point) => {
          setIsPhoneTracking(true);
          addToast({
            type: 'success',
            title: 'Phone GPS Active',
            message: `Broadcasting coordinates: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} (Accuracy ±${point.accuracy}m)`
          });
        },
        (err) => {
          addToast({ type: 'danger', title: 'GPS Error', message: err.message });
        }
      );
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await iotGpsService.parseGpsFile(file);
      addToast({
        type: 'success',
        title: 'Dataset Imported Successfully',
        message: `Loaded ${parsed.pointCount} GPS track points (${parsed.totalDistanceKm} km)`
      });
    } catch (err) {
      addToast({
        type: 'danger',
        title: 'File Parse Error',
        message: err.message
      });
    }
  };

  const handleLoadSampleDataset = () => {
    const sample = iotGpsService.generateSampleDataset();
    iotGpsService.importedDataset = sample;
    setDataset(sample);
    drawDatasetOnMap(sample);
    addToast({
      type: 'info',
      title: 'Sample Track Loaded',
      message: `Loaded ${sample.pointCount} points representing an autonomous rover perimeter loop.`
    });
  };

  const handleConnectBackend = (e) => {
    e.preventDefault();
    iotGpsService.connectBackend({
      type: serverType,
      url: serverUrl
    });
  };

  const handleRecenter = () => {
    if (liveGpsPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([liveGpsPoint.lat, liveGpsPoint.lng], 17);
    }
  };

  // --- Relocation Handlers ---
  const handleRelocateIoT = (lat, lng, name = "Custom Location") => {
    const point = {
      lat,
      lng,
      altitude: 20,
      speed: 0,
      accuracy: 5,
      heading: 0,
      timestamp: Date.now()
    };
    setLiveGpsPoint(point);
    iotGpsService.currentPosition = point;

    if (robotMarkerRef.current && accuracyCircleRef.current && mapInstanceRef.current) {
      robotMarkerRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true });
    }

    relocateRobotTo(lat, lng, name);
  };

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      addToast({ type: 'warning', title: 'Geolocation Unavailable', message: 'Browser does not support GPS.' });
      return;
    }
    setIsLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingDevice(false);
        const { latitude, longitude } = pos.coords;
        handleRelocateIoT(latitude, longitude, 'Live Device Location');
        addToast({
          type: 'success',
          title: 'Device GPS Acquired',
          message: `Teleported IoT Rover to ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
      },
      (err) => {
        setIsLocatingDevice(false);
        addToast({ type: 'danger', title: 'Location Error', message: err.message });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCustomCoordinatesSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;
    handleRelocateIoT(lat, lng, customName || 'Custom Coordinates');
    addToast({
      type: 'success',
      title: 'Rover Teleported',
      message: `Relocated to ${customName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* --- Map Viewport (Left/Center) --- */}
      <div className="relative flex-1 h-1/2 md:h-full w-full bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Header Floating Badge */}
        <div className="absolute top-16 left-4 z-10 glass-panel px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-brand-500/30 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-100">
            IoT Robot Dedicated GPS Workspace
          </span>
          <span className="text-[10px] bg-brand-500/15 text-brand-600 dark:text-brand-400 font-mono px-2 py-0.5 rounded-full">
            STANDALONE
          </span>
        </div>

        {/* Relocate Mode Banner */}
        {isIoTDropMode && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-paw-orange text-white font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur text-xs flex items-center gap-2.5 animate-bounce border-2 border-white">
            <MapPin className="w-4 h-4" />
            <span>Click anywhere on the map to drop IoT Robot</span>
            <button
              onClick={() => setIsIoTDropMode(false)}
              className="bg-black/30 hover:bg-black/50 text-[10px] px-2 py-0.5 rounded-full"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Map Controls (Recenter, Relocate, Layers) */}
        <div className="absolute top-16 right-4 z-10 flex flex-col gap-2">
          {/* Recenter */}
          <button
            onClick={handleRecenter}
            title="Recenter on IoT Robot"
            className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-500 transition hover:scale-105 active:scale-95"
          >
            <Crosshair className="w-5 h-5 text-brand-500" />
          </button>

          {/* Point & Drop Tool */}
          <button
            onClick={() => setIsIoTDropMode(!isIoTDropMode)}
            title="Click to Drop IoT Robot on Map"
            className={`w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 ${
              isIoTDropMode ? 'bg-paw-orange text-white ring-2 ring-paw-orange/40' : 'text-slate-700 dark:text-slate-200 hover:text-paw-orange'
            }`}
          >
            <MapPin className="w-5 h-5 text-paw-orange" />
          </button>

          {/* Compass / Open Full Relocation Modal */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            title="Open Global Location Relocation Manager"
            className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-500 transition hover:scale-105 active:scale-95 group"
          >
            <Compass className="w-5 h-5 text-brand-500 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Tile Layer Toggle */}
          <button
            onClick={() => setTileType(prev => prev === 'street' ? 'satellite' : prev === 'satellite' ? 'dark' : 'street')}
            title="Toggle Tile Layer (Street / Satellite / Dark)"
            className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 transition hover:scale-105 active:scale-95"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Live HUD Coordinates Overlay at Bottom */}
        {liveGpsPoint && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-10 glass-panel p-3 rounded-2xl shadow-2xl border border-brand-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Live Telemetry Coordinates</span>
              <div className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                LAT: {liveGpsPoint.lat.toFixed(5)} • LNG: {liveGpsPoint.lng.toFixed(5)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Accuracy</span>
              <span className="font-mono font-bold text-emerald-500">±{liveGpsPoint.accuracy}m</span>
            </div>
          </div>
        )}
      </div>

      {/* --- Side Controller Panel (Right) --- */}
      <div className="w-full md:w-[420px] h-1/2 md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col z-20 shadow-2xl">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>IoT Robot Hardware Hub</span>
              </h2>
              <p className="text-[10px] text-slate-400">Phone GPS Mount • Dataset Upload • Backend Stream</p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950 border-b border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveMode('phone')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeMode === 'phone'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">Phone GPS</span>
          </button>

          <button
            onClick={() => setActiveMode('import')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeMode === 'import'
                ? 'bg-paw-orange text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="truncate">Dataset</span>
          </button>

          <button
            onClick={() => setActiveMode('server')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeMode === 'server'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="truncate">Backend</span>
          </button>

          <button
            onClick={() => setActiveMode('relocate')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeMode === 'relocate'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="truncate">Relocate</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* ================= MODE 1: PHONE GPS TRACKER ================= */}
          {activeMode === 'phone' && (
            <div className="space-y-3.5">
              {/* How it works info */}
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-slate-300 space-y-1.5">
                <span className="font-bold text-brand-400 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-brand-400" />
                  Mount Phone on IoT Robot Mode
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Open this page on the mobile phone mounted on your robot chassis. Tap <strong>"Start Live Tracking"</strong> below. It utilizes high-accuracy GPS chips on your phone to feed real-time coordinates, speed, and heading straight onto this dedicated map.
                </p>
              </div>

              {/* Big Action Button */}
              <button
                onClick={handleTogglePhoneGps}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-95 ${
                  isPhoneTracking
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 animate-pulse'
                    : 'bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white shadow-brand-500/25'
                }`}
              >
                <Radio className={`w-5 h-5 ${isPhoneTracking ? 'animate-spin' : ''}`} />
                <span>{isPhoneTracking ? 'Stop Phone GPS Broadcast' : 'Start Live Phone GPS Tracking'}</span>
              </button>

              {/* Live Telemetry Gauges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center justify-center gap-1">
                    <Gauge className="w-3 h-3 text-brand-400" /> Speed
                  </span>
                  <span className="text-base font-bold text-slate-100 font-mono mt-0.5 block">
                    {liveGpsPoint ? `${liveGpsPoint.speed} km/h` : '0.0 km/h'}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center justify-center gap-1">
                    <Mountain className="w-3 h-3 text-indigo-400" /> Altitude
                  </span>
                  <span className="text-base font-bold text-slate-100 font-mono mt-0.5 block">
                    {liveGpsPoint ? `${liveGpsPoint.altitude} m` : '15 m'}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center justify-center gap-1">
                    <Satellite className="w-3 h-3 text-emerald-400" /> Tracked
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                    {phonePoints.length} Pts
                  </span>
                </div>
              </div>

              {/* Track Actions (Export / Clear) */}
              {phonePoints.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => iotGpsService.exportTrackAsCsv()}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-400" /> Export CSV
                  </button>

                  <button
                    onClick={() => iotGpsService.exportTrackAsGpx()}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-paw-orange" /> Export GPX
                  </button>

                  <button
                    onClick={() => iotGpsService.clearPhoneTrack()}
                    className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition"
                    title="Clear Track History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 2: IMPORT GPS DATASET FILE ================= */}
          {activeMode === 'import' && (
            <div className="space-y-3.5">
              {/* File Dropzone */}
              <div className="p-5 border-2 border-dashed border-slate-700 hover:border-paw-orange rounded-3xl text-center transition bg-slate-800/30">
                <Upload className="w-8 h-8 text-paw-orange mx-auto mb-2 opacity-80" />
                <span className="font-bold text-slate-200 block text-xs">Upload GPS Dataset File</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Supports .CSV, .JSON, .GPX, .KML files</span>

                <label className="mt-3 inline-block cursor-pointer bg-paw-orange hover:bg-orange-600 text-white font-bold text-xs py-2 px-4 rounded-xl shadow transition">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept=".csv,.json,.gpx,.kml,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Download Sample Datasets Card */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Download Sample Datasets to Test
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/samples/sample_robot_patrol_route.csv"
                    download="sample_robot_patrol_route.csv"
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition text-[11px] font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-400" />
                    <span>Sample CSV</span>
                  </a>

                  <a
                    href="/samples/sample_robot_patrol_route.json"
                    download="sample_robot_patrol_route.json"
                    className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition text-[11px] font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-paw-orange" />
                    <span>Sample JSON</span>
                  </a>
                </div>
              </div>

              {/* Sample Dataset Quick Button */}
              <button
                onClick={handleLoadSampleDataset}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-paw-orange" />
                  <div className="text-left">
                    <span className="font-bold block text-xs">Load Sample Rover Perimeter Dataset</span>
                    <span className="text-[10px] text-slate-400">45 GPS points • 1.15 km circuit test</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dataset Details & Replay Player */}
              {dataset && (
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 text-xs truncate max-w-[180px] block">{dataset.name}</span>
                      <span className="text-[10px] text-slate-400">{dataset.pointCount} points • {dataset.totalDistanceKm} km</span>
                    </div>
                    <span className="text-[10px] font-mono bg-paw-orange/20 text-paw-orange font-bold px-2 py-0.5 rounded-full">
                      Max {dataset.maxSpeed} km/h
                    </span>
                  </div>

                  {/* Replay Scrubber */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Point {replayIndex + 1} of {dataset.pointCount}</span>
                      <span>{dataset.points[replayIndex]?.time || ''}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={dataset.pointCount - 1}
                      value={replayIndex}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setReplayIndex(idx);
                        const pt = dataset.points[idx];
                        if (robotMarkerRef.current) {
                          robotMarkerRef.current.setLatLng([pt.lat, pt.lng]);
                        }
                      }}
                      className="w-full accent-paw-orange h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Replay Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsReplaying(!isReplaying)}
                        className="w-8 h-8 rounded-xl bg-paw-orange hover:bg-orange-600 text-white flex items-center justify-center shadow transition"
                      >
                        {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setReplayIndex(0);
                          setIsReplaying(false);
                          if (robotMarkerRef.current && dataset.points[0]) {
                            robotMarkerRef.current.setLatLng([dataset.points[0].lat, dataset.points[0].lng]);
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setReplaySpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : 1)}
                        className="text-[10px] font-mono font-bold bg-slate-700 px-2 py-1 rounded-lg text-slate-200"
                      >
                        {replaySpeed}x Speed
                      </button>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-300">
                      <span>Lat: {dataset.points[replayIndex]?.lat.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 3: BACKEND SERVER STREAM ================= */}
          {activeMode === 'server' && (
            <div className="space-y-3.5">
              <form onSubmit={handleConnectBackend} className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-400" />
                    IoT Backend Server Hook
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    serverStatus === 'connected' 
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : serverStatus === 'connecting'
                      ? 'bg-amber-500/20 text-amber-400 font-bold animate-pulse'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {serverStatus.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Protocol Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServerType('websocket')}
                      className={`py-1.5 rounded-xl font-semibold text-xs border ${
                        serverType === 'websocket'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      WebSocket (Real-Time)
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerType('polling')}
                      className={`py-1.5 rounded-xl font-semibold text-xs border ${
                        serverType === 'polling'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      HTTP REST Polling
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Server Endpoint URL</label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder={serverType === 'websocket' ? 'ws://192.168.1.100:8080/gps' : 'http://192.168.1.100:8000/api/gps'}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl shadow transition text-xs"
                  >
                    Connect Stream
                  </button>
                  {serverStatus === 'connected' && (
                    <button
                      type="button"
                      onClick={() => iotGpsService.disconnectBackend()}
                      className="px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-xl text-xs"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>

              {/* Expected JSON schema note */}
              <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Expected IoT JSON Packet:</span>
                <code className="block bg-slate-950 p-2 rounded-xl font-mono text-[10px] text-emerald-400">
                  {`{ "lat": 10.0095, "lng": 76.3638, "speed": 4.2, "altitude": 20, "accuracy": 3 }`}
                </code>
              </div>

              {/* Stream Activity Logs */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Connection Event Logs</span>
                <div className="h-32 bg-slate-950 border border-slate-800 rounded-2xl p-2.5 font-mono text-[10px] overflow-y-auto space-y-1">
                  {serverLogs.length === 0 ? (
                    <span className="text-slate-600 italic">No network events yet.</span>
                  ) : (
                    serverLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 leading-snug">
                        <span className="text-slate-500">[{log.time}]</span>
                        <span className={
                          log.level === 'error' ? 'text-rose-400' :
                          log.level === 'success' ? 'text-emerald-400' :
                          log.level === 'warning' ? 'text-amber-400' : 'text-slate-300'
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE 4: RELOCATE IOT ROVER ================= */}
          {activeMode === 'relocate' && (
            <div className="space-y-3.5">
              {/* Current Active Location Info */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Active IoT Deployment
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                    {liveGpsPoint ? `${liveGpsPoint.lat.toFixed(4)}, ${liveGpsPoint.lng.toFixed(4)}` : `${robotState.lat.toFixed(4)}, ${robotState.lng.toFixed(4)}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentLocationName}
                </p>
              </div>

              {/* Quick Relocation Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsIoTDropMode(!isIoTDropMode)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 shadow ${
                    isIoTDropMode 
                      ? 'bg-paw-orange text-white border-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-paw-orange" />
                  <span>{isIoTDropMode ? 'Click Map Now...' : 'Drop on Map'}</span>
                  <span className="text-[9px] font-normal text-slate-400">Interactive click</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseDeviceLocation}
                  disabled={isLocatingDevice}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 shadow"
                >
                  <Navigation className={`w-4 h-4 text-emerald-400 ${isLocatingDevice ? 'animate-spin' : ''}`} />
                  <span>{isLocatingDevice ? 'Acquiring...' : 'Use My GPS'}</span>
                  <span className="text-[9px] font-normal text-slate-400">Device Location</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Preset Cities & Enclaves
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {IOT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleRelocateIoT(preset.lat, preset.lng, preset.name)}
                      className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-[11px] font-semibold text-slate-200 block truncate">{preset.name}</span>
                        <span className="text-[9px] text-slate-500 block">{preset.lat.toFixed(2)}, {preset.lng.toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {preset.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Coordinates Form */}
              <form onSubmit={handleCustomCoordinatesSubmit} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  Manual GPS Teleportation
                </span>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Location / Zone Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. My IoT Test Arena"
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="0.00001"
                      required
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="10.0095"
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="0.00001"
                      required
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      placeholder="76.3638"
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" /> Teleport IoT Rover Here
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

