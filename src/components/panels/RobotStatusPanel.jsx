import React, { useState } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Gauge, 
  Wifi, 
  Footprints, 
  Camera, 
  Eye, 
  Sparkles,
  Maximize2,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function RobotStatusPanel() {
  const { robotState, dogs } = usePawPatrol();
  const [isVisionThermal, setIsVisionThermal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Status badge styling
  const getModeBadge = (mode) => {
    switch (mode) {
      case 'Patrolling':
        return { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500 animate-pulse' };
      case 'Returning':
        return { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', dot: 'bg-amber-500 animate-ping' };
      case 'Charging':
        return { bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', dot: 'bg-blue-500' };
      case 'Escorting':
        return { bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', dot: 'bg-indigo-500 animate-bounce' };
      case 'Searching':
        return { bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', dot: 'bg-rose-500 animate-ping' };
      default:
        return { bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
    }
  };

  const modeBadge = getModeBadge(robotState.mode);
  const batteryPct = Math.round(robotState.battery);
  const nearestDog = dogs.slice().sort((a, b) => a.distanceFromRobot - b.distanceFromRobot)[0];

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-xl border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>{robotState.robotId}</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Palm Meadows Unit Alpha</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Badge */}
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${modeBadge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${modeBadge.dot}`} />
            {robotState.mode}
          </div>

          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 my-3">
            {/* Battery */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-tight">Batt</span>
                {robotState.isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                ) : (
                  <Battery className={`w-3.5 h-3.5 ${batteryPct < 20 ? 'text-rose-500' : 'text-emerald-500'}`} />
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {batteryPct}%
              </div>
              {/* Battery bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${batteryPct < 20 ? 'bg-rose-500' : batteryPct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${batteryPct}%` }}
                />
              </div>
            </div>

            {/* Speed */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-tight">Speed</span>
                <Gauge className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {robotState.speed} <span className="text-[9px] font-normal text-slate-400">km/h</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 truncate">Pacing Nom</span>
            </div>

            {/* Signal */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-tight">Signal</span>
                <Wifi className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {robotState.signal}%
              </div>
              <span className="text-[9px] text-slate-400 mt-1">{robotState.rssi} dBm</span>
            </div>

            {/* Distance Today */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-2.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-tight">Today</span>
                <Footprints className="w-3.5 h-3.5 text-paw-orange" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {robotState.distanceCoveredToday} <span className="text-[9px] font-normal text-slate-400">km</span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1">Patrol Odo</span>
            </div>
          </div>

          {/* Mini Live Camera Stream HUD */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-0.5">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-brand-500" />
                AI Vision Feed (Wide-Angle LIDAR / RGB)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsVisionThermal(prev => !prev)}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition ${
                    isVisionThermal ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isVisionThermal ? 'THERMAL' : 'RGB'}
                </button>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[9px] font-mono text-rose-500 font-bold">LIVE 30fps</span>
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className={`relative h-32 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 transition-all ${
              isVisionThermal ? 'filter contrast-150 hue-rotate-180 invert' : ''
            }`}>
              {/* Simulated Camera Background Video/Image */}
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                alt="Robot Vision Live Stream"
                className="w-full h-full object-cover filter brightness-90"
              />

              {/* HUD Crosshairs & Grid Lines */}
              <div className="absolute inset-0 pointer-events-none border border-brand-500/30">
                {/* Center target crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-brand-400/50 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-brand-400 rounded-full" />
                </div>

                {/* Simulated AI Detection Bounding Box on Nearest Dog */}
                {nearestDog && (
                  <div className="absolute top-5 left-1/3 w-32 h-20 border-2 border-emerald-400 bg-emerald-500/10 rounded flex flex-col justify-between p-1 backdrop-blur-[1px] animate-pulse">
                    <div className="bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded-sm w-fit flex items-center gap-1 shadow">
                      <span>CANINE: {nearestDog.name.toUpperCase()}</span>
                      <span>({Math.round(nearestDog.confidence * 100)}%)</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-emerald-300 bg-black/60 px-1 rounded">
                      <span>DIST: {nearestDog.distanceFromRobot}m</span>
                      <span>{nearestDog.breed.slice(0, 10)}</span>
                    </div>
                  </div>
                )}

                {/* Status Telemetry Ribbon on Camera */}
                <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-emerald-400 bg-slate-950/70 backdrop-blur px-2 py-0.5 rounded">
                  <span>HD 1080p • LAT:{robotState.lat.toFixed(4)} LNG:{robotState.lng.toFixed(4)}</span>
                  <span>HDG:{Math.round(robotState.heading || 0)}°</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

