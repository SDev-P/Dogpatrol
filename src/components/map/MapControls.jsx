import React, { useState } from 'react';
import { 
  Layers, 
  Crosshair, 
  Plus, 
  Minus, 
  Radar, 
  MapPin, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Compass
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function MapControls() {
  const {
    tileLayer,
    setTileLayer,
    radius,
    handleRadiusChange,
    recenterOnRobot,
    mapInstanceRef,
    isDrawingWaypoints,
    setIsDrawingWaypoints,
    customWaypoints,
    applyCustomWaypoints,
    cancelCustomWaypoints,
    resetToDefaultWaypoints,
    setIsLocationModalOpen
  } = usePawPatrol();

  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="absolute top-20 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Waypoint Drawing Mode Bar */}
      {isDrawingWaypoints ? (
        <div className="glass-panel p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-brand-500/30 text-xs font-medium text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2">
          <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {customWaypoints.length} Points
          </span>
          <button
            onClick={applyCustomWaypoints}
            disabled={customWaypoints.length < 2}
            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white px-2.5 py-1.5 rounded-xl transition shadow"
            title="Save Route"
          >
            <Check className="w-3.5 h-3.5" /> Apply
          </button>
          <button
            onClick={cancelCustomWaypoints}
            className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1.5 rounded-xl transition"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Recenter on Robot */}
      <button
        onClick={recenterOnRobot}
        title="Recenter on Sparky (Robot)"
        className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition hover:scale-105 active:scale-95 group"
      >
        <Crosshair className="w-5 h-5 transition-transform group-hover:rotate-45 text-brand-600 dark:text-brand-400" />
      </button>

      {/* Relocate Robot Location Picker */}
      <button
        onClick={() => setIsLocationModalOpen(true)}
        title="Change Robot AI Location / GPS Coordinates"
        className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition hover:scale-105 active:scale-95 group"
      >
        <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Radius Slider Toggle & Popup */}
      <div className="relative">
        <button
          onClick={() => setIsRadiusOpen(prev => !prev)}
          title="Adjust Patrol Radius"
          className={`w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 ${
            isRadiusOpen ? 'text-brand-600 ring-2 ring-brand-500' : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          <Radar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </button>

        {isRadiusOpen && (
          <div className="absolute right-12 top-0 w-64 p-3.5 glass-panel rounded-2xl shadow-2xl border border-brand-500/20 text-slate-800 dark:text-slate-100 z-30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-brand-500" /> Detection Radius
              </span>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full accent-brand-600 dark:accent-brand-400 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50 m</span>
              <span>250 m</span>
              <span>500 m</span>
              <span>1 km</span>
            </div>
          </div>
        )}
      </div>

      {/* Layer Switcher Toggle & Popup */}
      <div className="relative">
        <button
          onClick={() => setIsLayersOpen(prev => !prev)}
          title="Switch Map Tiles (Street / Satellite / Dark)"
          className={`w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 ${
            isLayersOpen ? 'text-brand-600 ring-2 ring-brand-500' : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5" />
        </button>

        {isLayersOpen && (
          <div className="absolute right-12 top-0 w-44 p-2 glass-panel rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-30 flex flex-col gap-1 text-xs">
            <button
              onClick={() => { setTileLayer('street'); setIsLayersOpen(false); }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                tileLayer === 'street'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Street (OSM)</span>
              {tileLayer === 'street' && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setTileLayer('satellite'); setIsLayersOpen(false); }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                tileLayer === 'satellite'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Satellite Aerial</span>
              {tileLayer === 'satellite' && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setTileLayer('dark'); setIsLayersOpen(false); }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                tileLayer === 'dark'
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Night / Carto Dark</span>
              {tileLayer === 'dark' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Set Waypoints Trigger */}
      {!isDrawingWaypoints && (
        <button
          onClick={() => setIsDrawingWaypoints(true)}
          title="Draw Custom Patrol Route Waypoints"
          className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-paw-orange transition hover:scale-105 active:scale-95"
        >
          <MapPin className="w-5 h-5 text-paw-orange" />
        </button>
      )}

      {/* Zoom In & Out */}
      <div className="flex flex-col gap-1 mt-1">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition hover:scale-105 active:scale-95"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

