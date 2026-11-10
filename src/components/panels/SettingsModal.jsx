import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  Radio, 
  Wifi, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  CheckCircle,
  Copy,
  Info,
  MapPin,
  Compass
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { robotService } from '../../services/robotService';

export default function SettingsModal() {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    theme, 
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    currentLocationName,
    setIsLocationModalOpen,
    robotState,
    addToast
  } = usePawPatrol();

  const [apiUrl, setApiUrl] = useState(robotService.apiUrl || 'http://192.168.1.120:8000');
  const [wsUrl, setWsUrl] = useState(robotService.wsUrl || 'ws://192.168.1.120:8000/ws/telemetry');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleConnectHardware = (e) => {
    e.preventDefault();
    setIsConnecting(true);

    setTimeout(() => {
      robotService.connectWebSocket(wsUrl);
      setIsConnecting(false);
      addToast({
        type: 'info',
        title: 'Connection Attempted',
        message: `Attempting connection to ${wsUrl}. If offline, simulation mode continues seamlessly.`
      });
    }, 1000);
  };

  const sampleJson = `{
  "robot": {
    "lat": 10.0095,
    "lng": 76.3638,
    "battery": 88,
    "speed": 3.4,
    "mode": "Patrolling",
    "heading": 45,
    "distanceCovered": 8.42
  },
  "dogs": [
    {
      "id": "dog-1",
      "lat": 10.0099,
      "lng": 76.3642,
      "name": "Bruno",
      "known": true,
      "confidence": 0.98,
      "lastSeen": "Just now"
    }
  ]
}`;

  const copyJsonFormat = () => {
    navigator.clipboard?.writeText(sampleJson);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="text-sm font-bold">PawPatrol System Settings</h2>
              <p className="text-[10px] text-slate-400">Hardware connectivity & dashboard preferences</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Location Deployment Card */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-500" />
                Robot Operating Location
              </span>
              <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                {robotState.lat.toFixed(4)}, {robotState.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-300 font-medium text-xs truncate">
                {currentLocationName}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-3 py-1.5 rounded-xl transition shadow text-xs flex items-center gap-1 flex-shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" /> Change Location
              </button>
            </div>
          </div>

          {/* Hardware Connection Card */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-500" />
                Physical Robot Telemetry Feed
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                robotService.isUsingRealHardware 
                  ? 'bg-emerald-500/20 text-emerald-500 font-bold'
                  : 'bg-amber-500/20 text-amber-500 font-bold'
              }`}>
                {robotService.isUsingRealHardware ? 'LIVE HARDWARE' : 'MOCK SIMULATOR'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect your autonomous rover's ROS / Raspberry Pi / ESP32 WebSocket server. The dashboard will automatically switch from simulated telemetry to your real rover's coordinates.
            </p>

            <form onSubmit={handleConnectHardware} className="space-y-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Robot API REST Endpoint
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://192.168.1.100:8000"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Robot WebSocket URL (Telemetry Stream)
                </label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://192.168.1.100:8000/ws/telemetry"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <Radio className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                <span>{isConnecting ? 'Connecting...' : 'Connect to Real Robot Feed'}</span>
              </button>
            </form>
          </div>

          {/* Expected JSON Telemetry Schema */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-500" /> Expected Robot JSON Packet Schema
              </span>
              <button
                onClick={copyJsonFormat}
                className="text-[10px] text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
              >
                <Copy className="w-3 h-3" /> {copiedFormat ? 'Copied!' : 'Copy Schema'}
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-2.5 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {sampleJson}
            </pre>
          </div>

          {/* Appearance & Sound Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Preferences & Audio
            </span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <div>
                  <span className="font-semibold block">Color Theme</span>
                  <span className="text-[10px] text-slate-400">Current mode: {theme.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-xl font-bold transition hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <div>
                  <span className="font-semibold block">Voice Feedback Audio</span>
                  <span className="text-[10px] text-slate-400">SpeechSynthesis robot voice</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs px-5 py-2 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

