import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error:   <AlertCircle  className="w-4 h-4 text-rose-400 shrink-0"    />,
  info:    <Info         className="w-4 h-4 text-blue-400 shrink-0"    />,
};

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-slate-900 text-white text-sm px-4 py-3
                     rounded-xl shadow-2xl border border-slate-700 max-w-sm animate-in
                     slide-in-from-bottom-3 fade-in duration-200"
        >
          {ICONS[t.type] ?? ICONS.info}
          <span className="flex-1 text-slate-100 text-xs font-medium">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} className="text-slate-500 hover:text-slate-300 ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
