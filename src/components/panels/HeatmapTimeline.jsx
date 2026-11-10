import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Clock, 
  Footprints, 
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { HEATMAP_TIMELINE_DATA } from '../../data/keralaSocietyData';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function HeatmapTimeline() {
  const { 
    scrubberHour, 
    setScrubberHour, 
    isScrubberPlaying, 
    setIsScrubberPlaying,
    flyTo
  } = usePawPatrol();

  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x | 2x | 4x

  // Current timeline frame
  const currentFrame = HEATMAP_TIMELINE_DATA.find(d => d.hour === scrubberHour) || HEATMAP_TIMELINE_DATA[0];

  // Playback timer
  useEffect(() => {
    let interval = null;
    if (isScrubberPlaying) {
      interval = setInterval(() => {
        setScrubberHour((prevHour) => {
          const currentIndex = HEATMAP_TIMELINE_DATA.findIndex(d => d.hour === prevHour);
          const nextIndex = (currentIndex + 1) % HEATMAP_TIMELINE_DATA.length;
          return HEATMAP_TIMELINE_DATA[nextIndex].hour;
        });
      }, 2000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isScrubberPlaying, playbackSpeed]);

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-xl border border-slate-200/60 dark:border-slate-800/80">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-paw-orange to-paw-amber flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Canine Activity Heatmap</span>
              <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono px-2 py-0.5 rounded-full">
                24H REPLAY
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Replay dog density and hotspot clusters across Kakkanad</p>
          </div>
        </div>

        {/* Time display pill */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-paw-orange" />
          <span>{currentFrame.label}</span>
        </div>
      </div>

      {/* Scrubber Controls */}
      <div className="mt-4 space-y-3">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={HEATMAP_TIMELINE_DATA.length - 1}
            value={HEATMAP_TIMELINE_DATA.findIndex(d => d.hour === scrubberHour)}
            onChange={(e) => {
              const item = HEATMAP_TIMELINE_DATA[Number(e.target.value)];
              if (item) setScrubberHour(item.hour);
            }}
            className="w-full accent-paw-orange h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          {/* Time markers labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
            {HEATMAP_TIMELINE_DATA.map((d) => (
              <span 
                key={d.hour} 
                className={`cursor-pointer transition ${d.hour === scrubberHour ? 'text-paw-orange font-bold scale-110' : 'hover:text-slate-200'}`}
                onClick={() => setScrubberHour(d.hour)}
              >
                {d.hour > 12 ? `${d.hour - 12}P` : `${d.hour}A`}
              </span>
            ))}
          </div>
        </div>

        {/* Playback Controls & Stats */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScrubberPlaying(prev => !prev)}
              className="w-9 h-9 rounded-2xl bg-paw-orange hover:bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 transition active:scale-95"
              title={isScrubberPlaying ? 'Pause Replay' : 'Play Replay'}
            >
              {isScrubberPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setScrubberHour(HEATMAP_TIMELINE_DATA[0].hour);
                setIsScrubberPlaying(false);
              }}
              className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
              title="Reset to 06:00 AM"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggle */}
            <button
              onClick={() => {
                setPlaybackSpeed(prev => prev === 1 ? 2 : prev === 2 ? 4 : 1);
              }}
              className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Change Speed"
            >
              {playbackSpeed}x SPEED
            </button>
          </div>

          {/* Active Dogs Count */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Activity Level</span>
              <span className="text-xs font-bold text-paw-orange flex items-center justify-end gap-1">
                <Footprints className="w-3.5 h-3.5" />
                {currentFrame.count} Dogs Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots Summary Card */}
      <div className="mt-3 p-3 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-paw-orange" />
            Observed Peak Congregation Hotspots
          </span>
          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
            {scrubberHour >= 17 ? 'Evening Play Hour' : scrubberHour <= 8 ? 'Morning Walk Hour' : 'Midday Rest'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {scrubberHour >= 17 
            ? "High dog density clustered around Central Lawn & Clubhouse Fountain (14 active canines playing). Low aggression index." 
            : scrubberHour <= 8 
            ? "High pedestrian & pet traffic along Jasmine Boulevard and North Villa Avenue."
            : "Moderate activity; dogs primarily resting in residential villa porches."}
        </p>
      </div>
    </div>
  );
}

