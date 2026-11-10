import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Compass, 
  Crosshair, 
  Check, 
  Globe, 
  Sparkles,
  Info,
  Radio
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

const PRESET_LOCATIONS = [
  {
    name: "Kochi, Kerala (Palm Meadows Enclave)",
    region: "Kakkanad / Infopark, Kerala",
    lat: 10.0095,
    lng: 76.3638,
    badge: "Default"
  },
  {
    name: "Bengaluru, Karnataka (Indiranagar)",
    region: "Defense Colony & 100ft Road",
    lat: 12.9784,
    lng: 77.6408,
    badge: "Metro"
  },
  {
    name: "Mumbai, Maharashtra (Powai Gardens)",
    region: "Hiranandani Gardens, Powai",
    lat: 19.1197,
    lng: 72.9056,
    badge: "Metro"
  },
  {
    name: "Gurugram, NCR (DLF Phase 5)",
    region: "Golf Course Road, Haryana",
    lat: 28.4595,
    lng: 77.0266,
    badge: "NCR"
  },
  {
    name: "Hyderabad, Telangana (Jubilee Hills)",
    region: "Road No. 36 & Lotus Pond",
    lat: 17.4319,
    lng: 78.4073,
    badge: "South"
  },
  {
    name: "Chennai, Tamil Nadu (Besant Nagar)",
    region: "Elliot's Promenade & 4th Main",
    lat: 13.0001,
    lng: 80.2667,
    badge: "Coastal"
  },
  {
    name: "London, United Kingdom",
    region: "Hyde Park Residential Mews",
    lat: 51.5072,
    lng: -0.1657,
    badge: "Global"
  },
  {
    name: "San Francisco, California, USA",
    region: "Dolores Park Residential Heights",
    lat: 37.7596,
    lng: -122.4269,
    badge: "Global"
  }
];

export default function LocationModal() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    setIsRelocatingMode,
    currentLocationName,
    relocateRobotTo,
    robotState,
    addToast
  } = usePawPatrol();

  const [customLat, setCustomLat] = useState(robotState.lat.toFixed(5));
  const [customLng, setCustomLng] = useState(robotState.lng.toFixed(5));
  const [customName, setCustomName] = useState('My Custom Society');
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);

  if (!isLocationModalOpen) return null;

  // Use browser GPS
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      addToast({
        type: 'warning',
        title: 'Geolocation Unavailable',
        message: 'Your browser does not support GPS location lookup.'
      });
      return;
    }

    setIsLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingDevice(false);
        const { latitude, longitude } = position.coords;
        relocateRobotTo(latitude, longitude, 'My Current Device Location');
      },
      (error) => {
        setIsLocatingDevice(false);
        addToast({
          type: 'danger',
          title: 'Location Permission Denied',
          message: 'Please allow location permission in your browser or enter coordinates manually.'
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleStartMapPick = () => {
    setIsLocationModalOpen(false);
    setIsRelocatingMode(true);
    addToast({
      type: 'info',
      title: 'Click Anywhere on Map',
      message: 'Click on any road or neighborhood to drop Sparky there!'
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;

    relocateRobotTo(lat, lng, customName || 'Custom GPS Coordinates');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-brand-500/30 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Relocate Robot AI Location</h2>
              <p className="text-[10px] text-teal-100">Deploy Sparky to your society, city, or coordinates</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Real Dog vs Simulated Clarification Box */}
          <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-brand-700 dark:text-brand-300">
              <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>Real Dog vs. Simulation Telemetry</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <strong>Currently:</strong> PawPatrol is running in high-fidelity simulation mode with realistic canine behavioral profiles (Bruno, Maya, Appu, etc.) calibrated to the selected location so you can test every feature immediately.
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <strong>With Real Robot Hardware:</strong> Once connected via the <em>Settings</em> tab (WebSocket / ROS2 / REST), the robot streams <strong>actual live physical dogs</strong> detected by your rover's real onboard AI camera (YOLO / MobileNet)!
            </p>
          </div>

          {/* Quick Action Buttons: Live GPS & Map Click Drop */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleUseDeviceLocation}
              disabled={isLocatingDevice}
              className="p-3 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-semibold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
            >
              <Navigation className={`w-5 h-5 text-brand-500 ${isLocatingDevice ? 'animate-spin' : ''}`} />
              <span>{isLocatingDevice ? 'Detecting GPS...' : 'Use My Live Device GPS'}</span>
              <span className="text-[9px] font-normal text-slate-400">Relocate to your current home</span>
            </button>

            <button
              onClick={handleStartMapPick}
              className="p-3 rounded-2xl bg-paw-orange/15 hover:bg-paw-orange/25 border border-paw-orange/30 text-paw-orange font-semibold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
            >
              <Crosshair className="w-5 h-5 text-paw-orange" />
              <span>Click on Map to Drop</span>
              <span className="text-[9px] font-normal text-slate-400">Interactive point & teleport</span>
            </button>
          </div>

          {/* Current Active Location Info */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Active Zone</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{currentLocationName}</span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
              {robotState.lat.toFixed(4)}, {robotState.lng.toFixed(4)}
            </span>
          </div>

          {/* Preset Societies & Cities */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
              Select Preset Society / Neighborhood
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {PRESET_LOCATIONS.map((preset) => {
                const isActive = Math.abs(robotState.lat - preset.lat) < 0.005 && Math.abs(robotState.lng - preset.lng) < 0.005;

                return (
                  <div
                    key={preset.name}
                    onClick={() => relocateRobotTo(preset.lat, preset.lng, preset.name)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'bg-brand-500/15 border-brand-500 text-brand-700 dark:text-brand-300 font-semibold'
                        : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <span className="text-xs font-bold block truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{preset.region}</span>
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-500 flex-shrink-0">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom GPS Coordinates Form */}
          <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-500" />
              Manual GPS Coordinates
            </span>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">Location / Society Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Green Valley Villas, Block 4"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
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
                  placeholder="e.g. 10.0095"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs font-mono"
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
                  placeholder="e.g. 76.3638"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5 mt-1"
            >
              <MapPin className="w-3.5 h-3.5" /> Teleport Sparky to Coordinates
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

