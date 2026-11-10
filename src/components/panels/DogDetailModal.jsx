import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  User, 
  Phone, 
  Home, 
  Heart, 
  Share2, 
  Sparkles, 
  Award,
  Navigation
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function DogDetailModal() {
  const { 
    selectedDog, 
    setSelectedDog, 
    handleClaimDog, 
    flyToDog 
  } = usePawPatrol();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimForm, setClaimForm] = useState({
    name: '',
    villa: '',
    phone: '',
    ownerId: ''
  });
  const [copied, setCopied] = useState(false);

  if (!selectedDog) return null;

  const dog = selectedDog;

  const onClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimForm.name || !claimForm.villa || !claimForm.phone) return;

    const success = handleClaimDog(dog.id, {
      name: claimForm.name,
      villa: claimForm.villa,
      phone: claimForm.phone,
      ownerId: claimForm.ownerId || `PM-OWN-${Math.floor(1000 + Math.random() * 9000)}`
    });

    if (success) {
      setIsClaiming(false);
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Check out ${dog.name}'s Dog Passport on PawPatrol (Palm Meadows Enclave): ${dog.breed}, last spotted near ${dog.favoriteSpots?.[0] || 'Kakkanad'}.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Hero Photo */}
        <div className="relative h-48 w-full bg-slate-800">
          <img
            src={dog.photo}
            alt={dog.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => setSelectedDog(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category Tag pill */}
          <div className="absolute top-4 left-4">
            {dog.category === 'known' ? (
              <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5" /> Registered Resident Dog
              </span>
            ) : dog.category === 'stray' ? (
              <span className="bg-rose-500/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                <AlertTriangle className="w-3.5 h-3.5" /> Unclaimed Stray Dog
              </span>
            ) : (
              <span className="bg-amber-500/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                <HelpCircle className="w-3.5 h-3.5" /> Unknown / Visitor Dog
              </span>
            )}
          </div>

          {/* Hero details at bottom of photo */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{dog.name}</h2>
                <span className="bg-white/20 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full font-mono">
                  ID: {dog.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {dog.breed} • {dog.size} Size • AI Match {Math.round(dog.confidence * 100)}%
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedDog(null);
                flyToDog(dog.id);
              }}
              className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-2xl shadow flex items-center gap-1 text-xs font-semibold transition"
              title="Fly Map to Dog"
            >
              <Navigation className="w-4 h-4" /> Locate
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Last Sighted</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-brand-500" />
                {dog.lastSeen}
              </span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Distance</span>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {dog.distanceFromRobot}m from Sparky
              </span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Sightings</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-3 h-3 text-paw-amber" />
                {dog.sightingsCount || 12} Logs
              </span>
            </div>
          </div>

          {/* Owner & Registration Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-500" />
                Owner & Society Passport
              </span>
              {dog.collarId && (
                <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono px-2 py-0.5 rounded-full">
                  Collar: {dog.collarId}
                </span>
              )}
            </div>

            {dog.owner ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Owner Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dog.owner.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Residence:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dog.owner.villa}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{dog.owner.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Society RFID Badge:</span>
                  <span className="font-mono text-[11px] text-slate-500">{dog.owner.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  This canine has no verified owner on file. Is this your pet or a visiting guest's dog?
                </p>
                <button
                  onClick={() => setIsClaiming(true)}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5 mx-auto"
                >
                  <Heart className="w-3.5 h-3.5" /> Claim / Register My Dog
                </button>
              </div>
            )}
          </div>

          {/* Claim Modal Drawer */}
          {isClaiming && (
            <form onSubmit={onClaimSubmit} className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-700 dark:text-brand-300">Register as Pet Guardian</span>
                <button type="button" onClick={() => setIsClaiming(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={claimForm.name}
                  onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                  placeholder="e.g. Rahul Menon"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Villa / Flat No.</label>
                  <input
                    type="text"
                    required
                    value={claimForm.villa}
                    onChange={(e) => setClaimForm({ ...claimForm, villa: e.target.value })}
                    placeholder="e.g. Villa 45, Lotus Lane"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={claimForm.phone}
                    onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-xl text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-xl shadow transition mt-1"
              >
                Confirm Ownership & Issue Passport
              </button>
            </form>
          )}

          {/* Favourite Hangout Spots */}
          {dog.favoriteSpots && (
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Favourite Society Spots
              </span>
              <div className="flex flex-wrap gap-1.5">
                {dog.favoriteSpots.map((spot, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-slate-700/50">
                    <MapPin className="w-3 h-3 text-brand-500" />
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Behavior & Health Notes */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              AI Behavioral Assessment
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 leading-relaxed">
              {dog.behaviorNotes || "Peaceful canine exhibiting standard companion demeanor. No aggressive posturing observed during recent patrols."}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Share Passport'}</span>
          </button>

          <button
            onClick={() => setSelectedDog(null)}
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

