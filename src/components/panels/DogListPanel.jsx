import React, { useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function DogListPanel() {
  const {
    dogs,
    selectedDog,
    setSelectedDog,
    hoveredDogId,
    setHoveredDogId,
    flyToDog,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory
  } = usePawPatrol();

  // Filtered and sorted dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      // Search matching
      const matchesSearch = 
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dog.owner?.name && dog.owner.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dog.owner?.villa && dog.owner.villa.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category matching
      if (filterCategory === 'known') return dog.category === 'known';
      if (filterCategory === 'stray') return dog.category === 'stray';
      if (filterCategory === 'unknown') return dog.category === 'unknown';
      if (filterCategory === 'nearby') return dog.distanceFromRobot <= 100;

      return true; // 'all'
    }).sort((a, b) => a.distanceFromRobot - b.distanceFromRobot);
  }, [dogs, searchQuery, filterCategory]);

  const counts = useMemo(() => {
    return {
      all: dogs.length,
      known: dogs.filter(d => d.category === 'known').length,
      stray: dogs.filter(d => d.category === 'stray').length,
      unknown: dogs.filter(d => d.category === 'unknown').length,
      nearby: dogs.filter(d => d.distanceFromRobot <= 100).length
    };
  }, [dogs]);

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col h-full max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>Canine Roster & Detections</span>
            <span className="text-[11px] font-semibold bg-brand-500/15 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
              {filteredDogs.length}
            </span>
          </h2>
          <p className="text-[10px] text-slate-400">Live spatial indexing around Kakkanad</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative my-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, breed, or villa..."
          className="w-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 pl-9 pr-3 py-2 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'known', label: 'Known', count: counts.known },
          { id: 'stray', label: 'Strays', count: counts.stray },
          { id: 'unknown', label: 'Unknown', count: counts.unknown },
          { id: 'nearby', label: 'Nearby (<100m)', count: counts.nearby }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition flex items-center gap-1 ${
              filterCategory === tab.id
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] px-1 rounded-full ${
              filterCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Scrollable Dog List */}
      <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
        {filteredDogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No canines match this filter</p>
          </div>
        ) : (
          filteredDogs.map((dog) => {
            const isSelected = selectedDog?.id === dog.id;
            const isHovered = hoveredDogId === dog.id;

            let badgeColor = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            let icon = <ShieldCheck className="w-3 h-3 text-emerald-500" />;
            let tag = 'Known Pet';

            if (dog.category === 'stray') {
              badgeColor = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
              icon = <AlertTriangle className="w-3 h-3 text-rose-500" />;
              tag = 'Stray Dog';
            } else if (dog.category === 'unknown') {
              badgeColor = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
              icon = <HelpCircle className="w-3 h-3 text-amber-500" />;
              tag = 'Visitor / Guest';
            }

            return (
              <div
                key={dog.id}
                onClick={() => flyToDog(dog.id)}
                onMouseEnter={() => setHoveredDogId(dog.id)}
                onMouseLeave={() => setHoveredDogId(null)}
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  isSelected || isHovered
                    ? 'bg-brand-500/10 border-brand-500/60 shadow-md translate-x-1'
                    : 'bg-white/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/70 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Photo Avatar with status ring */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={dog.photo}
                      alt={dog.name}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    {dog.inRadius && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900" title="In Robot Radius" />
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {dog.name}
                      </h4>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${badgeColor}`}>
                        {icon}
                        <span>{tag}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {dog.breed} • {dog.size}
                    </div>

                    {/* Metadata bottom row */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dog.lastSeen}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-brand-600 dark:text-brand-400">
                        <MapPin className="w-3 h-3" />
                        {dog.distanceFromRobot}m away
                      </span>
                      <span className="bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-600 dark:text-slate-300">
                        {Math.round(dog.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

