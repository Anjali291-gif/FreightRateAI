import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast || typeof toast === 'function' || !toast.message) return null;

  const iconByType = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 backdrop-blur-md max-w-sm">
        {iconByType[toast.type] || iconByType.info}
        <span className="text-xs font-medium text-slate-100">{toast.message}</span>
      </div>
    </div>
  );
}
