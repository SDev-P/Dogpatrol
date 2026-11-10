import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Radar, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check,
  Footprints
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function OnboardingTour() {
  const { isOnboardingOpen, completeOnboarding } = usePawPatrol();
  const [step, setStep] = useState(0);

  if (!isOnboardingOpen) return null;

  const steps = [
    {
      title: "Welcome to PawPatrol 🐾",
      subtitle: "Autonomous Canine Sentinel Dashboard",
      description: "Meet Sparky (ROBO-DOG-09), our autonomous robot patrolling Palm Meadows Residential Enclave in Kakkanad, Kochi. It detects dogs in real time, classifies breeds, and keeps the community safe.",
      icon: <Footprints className="w-8 h-8 text-brand-500" />,
      color: "from-brand-600 to-teal-500"
    },
    {
      title: "Live Map & Detection Radius 📡",
      subtitle: "Dynamic Sensor Envelope",
      description: "Watch Sparky navigate society roads with a live GPS heading and breadcrumb trail. Use the radar slider in the top-right to adjust detection range from 50m to 1km. Switch between Street and Satellite views anytime.",
      icon: <Radar className="w-8 h-8 text-paw-orange" />,
      color: "from-paw-orange to-amber-500"
    },
    {
      title: "Dog Passports & Safe Walk Escorts 🛡️",
      subtitle: "Community Safety & Pet Profiles",
      description: "Every canine has an auto-generated biometric passport with visit history and owner contacts. Tapping 'Safe Walk with Me' commands Sparky to escort residents at night while safely circumventing barking alert zones.",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      color: "from-emerald-600 to-teal-600"
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-brand-500/30 text-slate-800 dark:text-slate-100 flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step Visual Banner */}
        <div className={`p-6 bg-gradient-to-tr ${current.color} text-white flex flex-col items-center text-center relative`}>
          <button
            onClick={completeOnboarding}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 shadow-inner">
            {current.icon}
          </div>

          <span className="text-[10px] font-mono tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full mb-1">
            Step {step + 1} of {steps.length}
          </span>
          <h2 className="text-xl font-bold">{current.title}</h2>
          <p className="text-xs text-white/80 mt-0.5">{current.subtitle}</p>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
            {current.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === i ? 'w-6 bg-brand-600 dark:bg-brand-400' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={completeOnboarding}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Skip Tour
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-1.5 transition active:scale-95"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

