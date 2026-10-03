import React from 'react';
import {
  LayoutDashboard, TrendingUp, Ship, BrainCircuit,
  BarChart2, FileText, X, Anchor
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',           icon: LayoutDashboard },
  { id: 'forecast',  label: 'Freight Forecast',    icon: TrendingUp      },
  { id: 'vessels',   label: 'Vessel Selection',    icon: Ship            },
  { id: 'decision',  label: 'AI Decision Support', icon: BrainCircuit    },
  { id: 'insights',  label: 'Market Insights',     icon: BarChart2       },
  { id: 'reports',   label: 'Reports',             icon: FileText        },
];

export default function Sidebar() {
  const { page, navigate, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        w-64 border-r
        bg-white border-slate-200 text-slate-700
        dark:bg-[#0B1422] dark:border-slate-800/50 dark:text-slate-300
        transform transition-transform duration-250
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">FreightAI</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Intelligent Freight &amp; Chartering</div>
              </div>
            </div>
            <button
              className="lg:hidden text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  text-left transition-all duration-150
                  ${active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'}
                `}
              >
                <Icon
                  className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                  style={{ width: '18px', height: '18px' }}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-700">
            <svg viewBox="0 0 90 48" className="w-16 h-10 fill-none stroke-current stroke-[1.5]">
              <path d="M8 38 C28 43, 62 43, 82 38" strokeLinecap="round" />
              <path d="M16 38 L22 26 L68 26 L74 38 Z" fill="rgba(59,130,246,0.1)" />
              <path d="M36 26 L36 16 L46 16 L46 26" />
              <path d="M50 26 L50 20 L58 20 L58 26" />
              <path d="M26 32 L64 32" strokeDasharray="2 3" opacity="0.5" />
              <path d="M70 12 Q72 10 74 12 Q76 10 78 12" strokeWidth="1.2" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center italic leading-relaxed">
            "Better Forecasts.<br />Smarter Chartering.<br />A Stronger Tomorrow."
          </p>
        </div>
      </aside>
    </>
  );
}
