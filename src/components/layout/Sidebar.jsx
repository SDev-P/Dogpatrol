import React from 'react';
import { 
  Map, 
  Footprints, 
  Flame, 
  ShieldAlert, 
  Users, 
  Settings,
  Sparkles,
  Radio,
  Navigation
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    dogs, 
    alertZones, 
    communityPosts,
    setIsSettingsModalOpen
  } = usePawPatrol();

  const navItems = [
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'gps', label: 'Live GPS', icon: Navigation, badge: 'LIVE', badgeColor: 'bg-emerald-500' },
    { id: 'iot', label: 'IoT Tracker', icon: Radio, badge: 'GPS', badgeColor: 'bg-teal-500' },
    { id: 'dogs', label: 'Dogs', icon: Footprints, badge: dogs.length },
    { id: 'history', label: 'History', icon: Flame },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: alertZones.length, badgeColor: 'bg-rose-500' },
    { id: 'community', label: 'Community', icon: Users, badge: communityPosts.length },
    { id: 'settings', label: 'Settings', icon: Settings, isModal: true }
  ];

  const handleTabClick = (item) => {
    if (item.isModal) {
      setIsSettingsModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <>
      {/* --- DESKTOP FLOATING SIDEBAR (Top Left, below navbar) --- */}
      <aside className="hidden md:flex absolute top-20 left-4 z-20 flex-col gap-1.5 pointer-events-auto">
        <div className="glass-panel p-1.5 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !item.isModal;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                <span className="whitespace-nowrap">{item.label}</span>

                {item.badge !== undefined && (
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badgeColor 
                      ? `${item.badgeColor} text-white`
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2 pointer-events-auto">
        <div className="glass-panel rounded-2xl px-2 py-1.5 shadow-2xl border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !item.isModal;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute top-0 right-1 w-2 h-2 rounded-full ${item.badgeColor || 'bg-brand-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
