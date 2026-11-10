import React from 'react';
import { 
  Footprints, 
  Sun, 
  Moon, 
  Settings, 
  FileText, 
  Radio, 
  HelpCircle,
  Bell,
  Sparkles,
  ShieldCheck,
  MapPin,
  Compass
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { SOCIETY_INFO } from '../../data/keralaSocietyData';
import { robotService } from '../../services/robotService';

export default function Navbar() {
  const { 
    activeTab,
    setActiveTab,
    theme, 
    toggleTheme, 
    setIsReportModalOpen, 
    setIsSettingsModalOpen, 
    setIsOnboardingOpen,
    setIsLocationModalOpen,
    currentLocationName,
    robotState,
    dogs,
    alertZones
  } = usePawPatrol();

  return (
    <header className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
      <div className="glass-panel rounded-2xl px-4 py-2.5 shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
        {/* Brand & Society */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            {/* Paw Icon */}
            <Footprints className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-1">
                <span>PawPatrol</span>
                <span className="text-[10px] font-mono font-bold bg-paw-orange/15 text-paw-orange px-1.5 py-0.2 rounded-md">
                  v2.4 AI
                </span>
              </h1>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 truncate max-w-[190px] sm:max-w-xs flex items-center gap-1 transition group"
              title="Click to customize robot location"
            >
              <MapPin className="w-2.5 h-2.5 text-brand-500 group-hover:scale-125 transition-transform" />
              <span className="group-hover:underline">{currentLocationName}</span>
            </button>
          </div>
        </div>

        {/* Center Status Pill */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100/70 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {robotService.isUsingRealHardware ? 'Hardware Stream' : 'Live Mock Stream'}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {dogs.length} Dogs Tracked
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {alertZones.length} Safety Zones
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Live GPS Tracking Standalone Page Button */}
          {activeTab === 'gps' ? (
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-brand-500/25 animate-pulse"
              title="Return to Society Live Map"
            >
              <span>← Society Map</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('gps')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-emerald-500/30 shadow-sm"
              title="Open Live GPS Tracking Page for Mounted Smartphone"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
              <span className="hidden sm:inline">Live GPS</span>
            </button>
          )}

          {/* IoT Tracker Standalone Page Button */}
          {activeTab === 'iot' ? (
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-brand-500/25 animate-pulse"
              title="Return to Society Live Map"
            >
              <span>← Society Map</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('iot')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500/20 to-brand-500/20 hover:from-teal-500/30 hover:to-brand-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-teal-500/30 shadow-sm"
              title="Open Separate IoT Robot GPS Tracker Page"
            >
              <Radio className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden sm:inline">IoT Rover</span>
            </button>
          )}

          {/* Relocate Robot Location */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold px-2.5 py-1.5 rounded-xl transition border border-brand-500/20 shadow-sm"
            title="Change robot location & GPS coordinates"
          >
            <Compass className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">Relocate</span>
          </button>

          {/* Daily Report */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-brand-500/20 shadow-sm"
            title="Download Daily Canine Audit Report PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Report</span>
          </button>

          {/* Onboarding Help Tour */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Welcome Tour & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Robot Hardware API & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

