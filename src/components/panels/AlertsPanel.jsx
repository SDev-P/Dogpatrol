import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  Search, 
  Volume2, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { SOCIETY_INFO } from '../../data/keralaSocietyData';

export default function AlertsPanel() {
  const { alertZones, flyTo, setIsLostDogRadarOpen, setIsSafeWalkModalOpen } = usePawPatrol();

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Aggression & Safety Zones
            </h2>
            <p className="text-[10px] text-slate-400">Live safety monitoring & detour recommendations</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
          {alertZones.length} Active
        </span>
      </div>

      {/* Quick Triggers */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <button
          onClick={() => setIsLostDogRadarOpen(true)}
          className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-left transition"
        >
          <div className="flex items-center justify-between mb-1">
            <Search className="w-4 h-4" />
            <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">RADAR</span>
          </div>
          <span className="text-xs font-bold block">Report Lost Pet</span>
          <span className="text-[10px] text-slate-400">Dispatch Sparky to search</span>
        </button>

        <button
          onClick={() => setIsSafeWalkModalOpen(true)}
          className="p-2.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-left transition"
        >
          <div className="flex items-center justify-between mb-1">
            <Navigation className="w-4 h-4" />
            <span className="text-[9px] bg-teal-500 text-white font-bold px-1.5 py-0.2 rounded-full">ESCORT</span>
          </div>
          <span className="text-xs font-bold block">Safe Walk Mode</span>
          <span className="text-[10px] text-slate-400">Avoid aggressive zones</span>
        </button>
      </div>

      {/* Geofence Status Banner */}
      <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Society Perimeter Geofence
            </span>
            <span className="text-[10px] text-slate-400">
              Active around {SOCIETY_INFO.name} (7 GPS nodes)
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          SECURE
        </span>
      </div>

      {/* Active Aggression Zones List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Identified Hazard Clusters
        </span>

        {alertZones.map((zone) => (
          <div
            key={zone.id}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-rose-500/30 shadow-sm space-y-2 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{zone.name}</span>
              </div>
              <span className="text-[9px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                {zone.severity} Risk
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {zone.reason}
            </p>

            {/* Safe Detour Box */}
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-700 dark:text-teal-300">
              <span className="font-bold block mb-0.5">🛡️ Recommended Safe Detour:</span>
              <span>{zone.safeDetourSuggestion}</span>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
              <span>Reported: {zone.timestamp}</span>
              <button
                onClick={() => flyTo(zone.center[0], zone.center[1], 19)}
                className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" /> View Zone on Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

