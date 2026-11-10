import React from 'react';
import { 
  Play, 
  Pause, 
  Home, 
  MapPin, 
  ShieldCheck, 
  Search, 
  RotateCcw
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { robotService } from '../../services/robotService';

export default function PatrolControlPanel() {
  const {
    robotState,
    isDrawingWaypoints,
    setIsDrawingWaypoints,
    resetToDefaultWaypoints,
    setIsSafeWalkModalOpen,
    setIsLostDogRadarOpen
  } = usePawPatrol();

  const isPatrolling = robotState.mode === 'Patrolling';
  const isPaused = robotState.mode === 'Paused';
  const isReturning = robotState.mode === 'Returning';

  return (
    <div className="glass-panel rounded-3xl p-3 shadow-xl border border-slate-200/60 dark:border-slate-800/80">
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {/* Start / Resume */}
        <button
          onClick={() => robotService.startPatrol()}
          disabled={isPatrolling}
          className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 ${
            isPatrolling
              ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
          }`}
          title="Start Autonomous Society Patrol"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start</span>
        </button>

        {/* Pause */}
        <button
          onClick={() => robotService.pausePatrol()}
          disabled={isPaused}
          className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 ${
            isPaused
              ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 cursor-default'
              : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
          }`}
          title="Pause Robot in Place"
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>Pause</span>
        </button>

        {/* Return to Base */}
        <button
          onClick={() => robotService.returnToBase()}
          disabled={isReturning || robotState.mode === 'Charging'}
          className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 ${
            isReturning
              ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 cursor-default'
              : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
          }`}
          title="Return to Solar Dock Alpha"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dock</span>
        </button>

        {/* Set Waypoints */}
        <button
          onClick={() => setIsDrawingWaypoints(!isDrawingWaypoints)}
          className={`flex-1 min-w-[75px] py-2 px-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 ${
            isDrawingWaypoints
              ? 'bg-paw-orange text-white ring-2 ring-paw-orange/40'
              : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
          }`}
          title="Click on map to draw route"
        >
          <MapPin className="w-3.5 h-3.5 text-paw-orange" />
          <span>Route</span>
        </button>
      </div>

      {/* Special Feature Quick Action Ribbons */}
      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
        {/* Safe Walk Escort */}
        <button
          onClick={() => setIsSafeWalkModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-gradient-to-r from-teal-500/15 to-emerald-500/15 hover:from-teal-500/25 hover:to-emerald-500/25 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-500/30 transition shadow-sm group"
        >
          <ShieldCheck className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
          <span>Safe Walk Escort</span>
        </button>

        {/* Lost Dog Radar */}
        <button
          onClick={() => setIsLostDogRadarOpen(true)}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-gradient-to-r from-rose-500/15 to-orange-500/15 hover:from-rose-500/25 hover:to-orange-500/25 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-500/30 transition shadow-sm group"
        >
          <Search className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          <span>Lost Dog Radar</span>
        </button>
      </div>
    </div>
  );
}

