import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Footprints,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { PATROL_WAYPOINTS, ALERT_ZONES } from '../../data/keralaSocietyData';
import { robotService } from '../../services/robotService';

export default function SafeWalkModal() {
  const { isSafeWalkModalOpen, setIsSafeWalkModalOpen, addToast } = usePawPatrol();

  const [destination, setDestination] = useState(PATROL_WAYPOINTS[2]); // Central Lawn
  const [avoidZones, setAvoidZones] = useState(true);
  const [started, setStarted] = useState(false);

  if (!isSafeWalkModalOpen) return null;

  const handleStartWalk = () => {
    robotService.startSafeEscort(destination);
    setStarted(true);

    addToast({
      type: 'success',
      title: 'Safe Walk Active',
      message: `Sparky is escorting you towards ${destination.name}. Aggression zones bypassed.`
    });

    setTimeout(() => {
      setStarted(false);
      setIsSafeWalkModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-teal-500/30 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Safe Walk Escort Mode</h2>
              <p className="text-[10px] text-teal-100">Autonomous companion for night walks & jogging</p>
            </div>
          </div>
          <button
            onClick={() => setIsSafeWalkModalOpen(false)}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {started ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">Sparky En Route!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escort started to {destination.name}. Sparky will match your walking pace and monitor surroundings.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4 text-xs">
            {/* Explanation box */}
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[11px] leading-relaxed flex items-start gap-2">
              <Footprints className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
              <span>
                Sparky will accompany you, illuminating the walkway with LED floodlights, detecting approaching dogs in advance, and alerting you to territorial strays.
              </span>
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                Select Your Walk Destination
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PATROL_WAYPOINTS.map((wp) => {
                  const isSelected = destination.id === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => setDestination(wp)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-500' : 'text-slate-400'}`} />
                        <span className="text-xs">{wp.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggression bypass toggle */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">
                  Bypass Aggression Zones
                </span>
                <span className="text-[10px] text-slate-400">
                  Automatically detours around North Gate Alley
                </span>
              </div>
              <input
                type="checkbox"
                checked={avoidZones}
                onChange={(e) => setAvoidZones(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSafeWalkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartWalk}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-500/25 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Start Walking With Sparky
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

