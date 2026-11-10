import React, { useState } from 'react';
import { 
  X, 
  Search, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Phone, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { robotService } from '../../services/robotService';

export default function LostDogRadarModal() {
  const { isLostDogRadarOpen, setIsLostDogRadarOpen, handleAddPost } = usePawPatrol();

  const [form, setForm] = useState({
    name: 'Leo',
    breed: 'Golden Retriever Mix',
    lastSeenLocation: 'Near East Perimeter Gate',
    color: 'Golden cream with red collar',
    contact: '+91 98470 55112',
    notes: 'Very friendly, responds to whistle. Escaped garden gate during courier delivery.',
    photo: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80'
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isLostDogRadarOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Start robot search mission
    robotService.startLostDogSearch({
      name: form.name,
      breed: form.breed,
      lastSeenLocation: form.lastSeenLocation,
      lat: 10.0092, // near East Perimeter Gate
      lng: 76.3660
    });

    // Push community alert post
    handleAddPost({
      author: `Missing Pet Alert: ${form.name}`,
      avatar: form.photo,
      role: 'Emergency Dispatch',
      badge: 'URGENT LOST PET',
      content: `🚨 MISSING DOG: ${form.name} (${form.breed}). Last seen at ${form.lastSeenLocation}. Sparky has initiated high-speed autonomous search. If spotted, call ${form.contact}.`,
      photo: form.photo
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsLostDogRadarOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Lost Dog Radar</h2>
              <p className="text-[10px] text-rose-100">Deploy Sparky for priority canine search & rescue</p>
            </div>
          </div>
          <button
            onClick={() => setIsLostDogRadarOpen(false)}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">Search Mission Engaged!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sparky is scanning coordinates near {form.lastSeenLocation}. Community alert broadcasted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto text-xs">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>The robot will prioritize areas where similar breeds were recently logged today.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pet Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Leo"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Breed / Size</label>
                <input
                  type="text"
                  required
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="e.g. Beagle / Medium"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Last Seen Location in Society</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.lastSeenLocation}
                  onChange={(e) => setForm({ ...form, lastSeenLocation: e.target.value })}
                  placeholder="e.g. Near Clubhouse Fountain"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 pl-8 pr-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="+91 9..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 pl-8 pr-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Distinct Features / Collar</label>
              <textarea
                rows="2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Distinct marks, color of collar, friendly or skittish..."
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLostDogRadarOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> Deploy Search Radar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

