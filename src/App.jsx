import React from 'react';
import { usePawPatrol } from './context/PawPatrolContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LiveMap from './components/map/LiveMap';
import MapControls from './components/map/MapControls';
import RobotStatusPanel from './components/panels/RobotStatusPanel';
import PatrolControlPanel from './components/panels/PatrolControlPanel';
import DogListPanel from './components/panels/DogListPanel';
import DogDetailModal from './components/panels/DogDetailModal';
import HeatmapTimeline from './components/panels/HeatmapTimeline';
import LostDogRadarModal from './components/panels/LostDogRadarModal';
import SafeWalkModal from './components/panels/SafeWalkModal';
import VoiceCommandBar from './components/panels/VoiceCommandBar';
import RobotPersonalityWidget from './components/panels/RobotPersonalityWidget';
import CommunityFeed from './components/panels/CommunityFeed';
import AlertsPanel from './components/panels/AlertsPanel';
import PatrolReportModal from './components/panels/PatrolReportModal';
import SettingsModal from './components/panels/SettingsModal';
import LocationModal from './components/panels/LocationModal';
import OnboardingTour from './components/panels/OnboardingTour';
import ToastContainer from './components/panels/ToastContainer';
import IoTTrackerPage from './components/pages/IoTTrackerPage';
import LiveGpsTrackingPage from './components/pages/LiveGpsTrackingPage';

export default function App() {
  const { activeTab } = usePawPatrol();

  if (activeTab === 'gps') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        <Navbar />
        <Sidebar />
        <div className="pt-16 h-full w-full">
          <LiveGpsTrackingPage />
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (activeTab === 'iot') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        <Navbar />
        <Sidebar />
        <div className="pt-16 h-full w-full">
          <IoTTrackerPage />
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Fullscreen Base Map */}
      <div className="absolute inset-0 z-0">
        <LiveMap />
      </div>

      {/* 2. Top Header Navigation */}
      <Navbar />

      {/* 3. Navigation Sidebar (Desktop Left Dock + Mobile Bottom Nav) */}
      <Sidebar />

      {/* 4. Map Action Controls (Layers, Recenter, Radius Slider, Zoom) */}
      <MapControls />

      {/* 5. Floating Dynamic Content Area (Responsive Overlays) */}
      <main className="absolute inset-0 pointer-events-none z-10">
        <div className="w-full h-full p-4 pt-20 pb-20 md:pb-6 flex justify-between gap-4">
          
          {/* Left Column (Desktop spacing for sidebar) */}
          <div className="hidden md:block w-36 pointer-events-none" />

          {/* Center / Secondary Overlay based on Active Tab */}
          <div className="flex-1 max-w-md pointer-events-auto overflow-hidden flex flex-col justify-end gap-3">
            {activeTab === 'map' && (
              <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Robot Personality Quip Widget */}
                <RobotPersonalityWidget />

                {/* Voice Command Bar */}
                <VoiceCommandBar />

                {/* Patrol Controls Ribbon */}
                <PatrolControlPanel />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 max-h-[80vh] overflow-y-auto">
                <HeatmapTimeline />
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 max-h-[80vh] overflow-y-auto">
                <AlertsPanel />
              </div>
            )}

            {activeTab === 'community' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 max-h-[80vh] overflow-y-auto">
                <CommunityFeed />
              </div>
            )}
          </div>

          {/* Right Column Panels */}
          <div className="w-80 sm:w-96 hidden lg:flex flex-col gap-3 pointer-events-auto max-h-full overflow-hidden">
            {/* Live Robot Telemetry & Camera Feed HUD */}
            <RobotStatusPanel />

            {/* Dog Roster / Active Detections */}
            <div className="flex-1 overflow-hidden">
              <DogListPanel />
            </div>
          </div>

          {/* Mobile Specific Drawer when 'dogs' tab is active */}
          {activeTab === 'dogs' && (
            <div className="lg:hidden fixed inset-x-4 top-20 bottom-20 z-30 pointer-events-auto animate-in fade-in zoom-in-95">
              <DogListPanel />
            </div>
          )}
        </div>
      </main>

      {/* 6. Floating Modals & System Alerts */}
      <DogDetailModal />
      <LostDogRadarModal />
      <SafeWalkModal />
      <PatrolReportModal />
      <SettingsModal />
      <LocationModal />
      <OnboardingTour />
      <ToastContainer />
    </div>
  );
}

