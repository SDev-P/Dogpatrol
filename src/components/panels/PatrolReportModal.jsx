import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  CheckCircle, 
  Footprints, 
  AlertTriangle, 
  ShieldCheck, 
  BatteryCharging,
  Printer
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { generateDailyPatrolReport } from '../../services/pdfService';
import { SOCIETY_INFO } from '../../data/keralaSocietyData';

export default function PatrolReportModal() {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    robotState, 
    dogs, 
    alertZones, 
    addToast 
  } = usePawPatrol();

  const [isExporting, setIsExporting] = useState(false);

  if (!isReportModalOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      generateDailyPatrolReport({
        robotState,
        dogs,
        alertZones,
        distanceCovered: robotState.distanceCoveredToday || 8.42,
        incidentsResolved: 3
      });

      addToast({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Official PawPatrol Daily Canine Audit PDF generated.'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const knownCount = dogs.filter(d => d.category === 'known').length;
  const strayCount = dogs.filter(d => d.category === 'stray').length;
  const unknownCount = dogs.filter(d => d.category === 'unknown').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-brand-700 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Daily Society Patrol Report</h2>
              <p className="text-[10px] text-teal-100">{SOCIETY_INFO.name} • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Executive Summary Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-[9px] text-slate-400 uppercase font-medium block">Distance</span>
              <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                {robotState.distanceCoveredToday} km
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-[9px] text-slate-400 uppercase font-medium block">Dogs Audited</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {dogs.length}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-[9px] text-slate-400 uppercase font-medium block">Strays Logged</span>
              <span className="text-sm font-black text-rose-500">
                {strayCount}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
              <span className="text-[9px] text-slate-400 uppercase font-medium block">Safety Zones</span>
              <span className="text-sm font-black text-amber-500">
                {alertZones.length}
              </span>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-brand-500" />
              Canine Census Breakdown
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered Resident Dogs
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{knownCount} pets ({Math.round(knownCount/dogs.length*100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Stray / Unclaimed Dogs
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{strayCount} strays</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Visiting / Unregistered Dogs
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{unknownCount} dogs</span>
              </div>
            </div>
          </div>

          {/* Incidents & Alert Zones */}
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Active Aggression & Safety Zones
            </h4>
            <div className="space-y-1.5">
              {alertZones.map(zone => (
                <div key={zone.id} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span>{zone.name}</span>
                    <span className="uppercase text-[9px]">{zone.severity} priority</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{zone.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Robot Fleet Health */}
          <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">Robot Sparky (ROBO-09)</span>
                <span className="text-[10px] text-slate-400">Dock Alpha • Solar Cells 100% Operational</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Optimal (98%)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Dismiss
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

