import React from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ShieldAlert, 
  Footprints 
} from 'lucide-react';
import { usePawPatrol } from '../../context/PawPatrolContext';

export default function ToastContainer() {
  const { toasts, dismissToast, flyToDog } = usePawPatrol();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => {
        let border = 'border-brand-500/30';
        let icon = <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />;

        if (toast.type === 'success') {
          border = 'border-emerald-500/40';
          icon = <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          border = 'border-amber-500/40';
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
        } else if (toast.type === 'danger') {
          border = 'border-rose-500/40';
          icon = <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto glass-panel w-full p-3 rounded-2xl shadow-xl border ${border} text-slate-800 dark:text-slate-100 flex items-start gap-2.5 animate-in slide-in-from-top-3 fade-in duration-200 transition-all`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight flex items-center justify-between">
                <span>{toast.title}</span>
                {toast.dogId && (
                  <button
                    onClick={() => flyToDog(toast.dogId)}
                    className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                  >
                    View Dog
                  </button>
                )}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

