import React, { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, X, Sun, Moon, Mic, MicOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NOTIFS = [
  { id: 1, text: 'Live ML Model loaded: Gradient Boosting Regressor (R²: 0.9938)', time: 'Just now', unread: true },
  { id: 2, text: 'Historical freight database synced: 10,000 maritime records', time: '10m', unread: true },
  { id: 3, text: 'Average freight rate updated across global shipping routes', time: '1h', unread: false },
];

export default function Header() {
  const {
    sidebarOpen, setSidebarOpen,
    backendOnline, backendChecking, backendError, checkConnection,
    theme, toggleTheme,
    isListening, toggleVoiceCommands,
    notifOpen, setNotifOpen,
  } = useApp();

  const [search, setSearch] = useState('');
  const unread = NOTIFS.filter(n => n.unread).length;

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center gap-3 sticky top-0 z-30 shadow-xs transition-colors">
      {/* Hamburger (mobile) */}
      <button
        className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Search route, commodity, vessel..."
          className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                     placeholder-slate-400 text-slate-700 dark:text-slate-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Voice Command Button */}
        <button
          onClick={toggleVoiceCommands}
          title={isListening ? "Listening... Click to stop" : "Activate Voice Command"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            isListening
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-500/40 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-rose-600 animate-spin" />
              <span className="hidden md:inline">Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden md:inline">Voice</span>
            </>
          )}
        </button>

        {/* Theme Toggle Button — visible pill */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm transition-all select-none ${
            theme === 'dark'
              ? 'bg-slate-800 border-yellow-400 text-yellow-300 hover:bg-slate-700 hover:border-yellow-300'
              : 'bg-white border-slate-800 text-slate-800 hover:bg-slate-100 hover:border-blue-600 hover:text-blue-600'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Live Backend Status Badge */}
        <button
          onClick={checkConnection}
          title={backendOnline ? "Connected to FastAPI on port 8000" : `Backend Offline: ${backendError || 'Cannot connect'}. Click to re-check.`}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
            backendChecking
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              : backendOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendChecking
                ? 'bg-amber-500 animate-spin'
                : backendOnline
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline">
            {backendChecking
              ? 'Connecting...'
              : backendOnline
              ? 'FastAPI Live'
              : 'Backend Offline'}
          </span>
          <RefreshCw className={`w-3 h-3 text-slate-400 hover:text-slate-600 ${backendChecking ? 'animate-spin' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">System Alerts</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded-full">
                    {unread} new
                  </span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {NOTIFS.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${n.unread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{n.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-blue-500/20">
            SIH
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600">FreightAI</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
