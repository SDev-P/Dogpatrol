import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Zap, MessageSquare } from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function RobotPersonalityWidget() {
  const { robotState } = usePawPatrol();
  const [petCount, setPetCount] = useState(0);
  const [petMessage, setPetMessage] = useState('');

  const personality = robotState.personality || {
    mood: 'happy',
    tailWagging: true,
    quip: "Patrolling palm-lined avenues of Kakkanad. All dogs accounted for!"
  };

  const handlePet = () => {
    setPetCount(prev => prev + 1);
    setPetMessage('*Happy beep boop! Sparky leans in for head scratches* 🐾❤️');

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.85 }
    });

    setTimeout(() => {
      setPetMessage('');
    }, 3500);
  };

  const isSleeping = robotState.mode === 'Charging';
  const isAlert = personality.mood === 'alert' || robotState.mode === 'Searching';

  return (
    <div className="glass-panel rounded-3xl p-3 shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 relative overflow-hidden group">
      {/* Interactive Mascot Avatar */}
      <div 
        onClick={handlePet}
        title="Click to pet Sparky!"
        className="relative cursor-pointer select-none flex-shrink-0"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform group-hover:scale-105 active:scale-95 shadow-md ${
          isAlert 
            ? 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-rose-500/20' 
            : isSleeping 
            ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/20'
            : 'bg-gradient-to-tr from-brand-600 to-brand-400 shadow-brand-500/20'
        }`}>
          {/* Animated SVG Robot Dog Mascot */}
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none" className="transition-transform">
            {/* Robot Head Body */}
            <rect x="10" y="14" width="28" height="22" rx="7" fill="#ffffff" fillOpacity="0.95" />
            
            {/* Ears (Perked or Relaxed) */}
            <path 
              d={isAlert ? "M11 14 L4 5 L16 11 Z" : "M12 14 L6 8 L15 12 Z"} 
              fill="#0d9488" 
              className={personality.tailWagging ? "animate-pulse" : ""}
            />
            <path 
              d={isAlert ? "M37 14 L44 5 L32 11 Z" : "M36 14 L42 8 L33 12 Z"} 
              fill="#0d9488" 
              className={personality.tailWagging ? "animate-pulse" : ""}
            />

            {/* Antenna */}
            <line x1="24" y1="14" x2="24" y2="7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="5" r="3" fill={isAlert ? "#ef4444" : "#14b8a6"} className={isAlert ? "animate-ping" : ""} />

            {/* Eyes */}
            {isSleeping ? (
              // Sleeping closed curved eyes
              <>
                <path d="M16 24 Q19 28 22 24" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M26 24 Q29 28 32 24" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : isAlert ? (
              // Wide alert glowing eyes
              <>
                <circle cx="19" cy="24" r="3.5" fill="#f97316" />
                <circle cx="29" cy="24" r="3.5" fill="#f97316" />
                <circle cx="20" cy="23" r="1.2" fill="#ffffff" />
                <circle cx="30" cy="23" r="1.2" fill="#ffffff" />
              </>
            ) : (
              // Friendly happy eyes
              <>
                <circle cx="19" cy="24" r="3" fill="#0d9488" />
                <circle cx="29" cy="24" r="3" fill="#0d9488" />
                <circle cx="20" cy="23" r="1" fill="#ffffff" />
                <circle cx="30" cy="23" r="1" fill="#ffffff" />
              </>
            )}

            {/* Cute Nose & Smile */}
            <circle cx="24" cy="28" r="2" fill="#0f172a" />
            <path d="M22 31 Q24 33 26 31" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Floating Pet Counter Heart */}
        {petCount > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow border border-white flex items-center gap-0.5">
            <Heart className="w-2.5 h-2.5 fill-current" /> {petCount}
          </span>
        )}

        {/* Tail wagging indicator badge */}
        {personality.tailWagging && !isSleeping && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-paw-orange border-2 border-white animate-bounce" title="Wagging tail!" />
        )}
      </div>

      {/* Speech Bubble / Personality Quip */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-100 mb-0.5">
          <span className="flex items-center gap-1.5">
            <span>Sparky</span>
            <span className="text-[10px] font-normal text-slate-400">
              {isSleeping ? '💤 Charging Snooze' : isAlert ? '🚨 High Alert' : '🐾 Society Friend'}
            </span>
          </span>
          <span className="text-[9px] text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline" onClick={handlePet}>
            Tap to pet
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 italic">
          "{petMessage || personality.quip}"
        </p>
      </div>
    </div>
  );
}

