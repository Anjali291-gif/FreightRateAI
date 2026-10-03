import React from 'react';
import { 
  TrendingUp, 
  Ship, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Leaf, 
  BrainCircuit 
} from 'lucide-react';
import { MOCK_RECENT_ACTIVITY } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const iconMap = {
  Brain: BrainCircuit,
  Ship: Ship,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  FileText: FileText
};

export default function RecentActivity() {
  const { setActiveTab } = useApp();
  const activities = MOCK_RECENT_ACTIVITY;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Recent Activity</h2>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition hover:translate-x-0.5"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Timeline Items */}
        <div className="divide-y divide-slate-100 mt-2">
          {activities.map((item) => {
            const IconComponent = iconMap[item.icon] || Ship;
            return (
              <div key={item.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/60 transition rounded-lg px-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainable Shipping Green Banner (Exact match from bottom right of reference) */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-lg" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">Sustainable Shipping</div>
            <div className="text-[11px] text-sky-100 font-medium">for a Greener Future</div>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/30 shrink-0 relative z-10">
          IMO 2030 Ready
        </span>
      </div>
    </div>
  );
}
