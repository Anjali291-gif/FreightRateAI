import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Fuel, Globe2, ArrowUpRight, Anchor
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  color: '#e2e8f0',
  fontSize: '11px',
  borderRadius: '10px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
};
const LABEL_STYLE = { color: '#94a3b8', fontWeight: 'bold' };
const GRID_STROKE = '#1e293b';
const AXIS_STROKE = '#334155';
const AXIS_TICK   = { fill: '#64748b', fontSize: 11 };

export default function MarketInsightsView() {
  const bdiSubIndices = [
    { name: 'Baltic Capesize (BCI)',   code: 'BCI',  val: '3,120', change: '+6.4%', share: 'Capesize 180k MT',  color: '#3b82f6' },
    { name: 'Baltic Panamax (BPI)',    code: 'BPI',  val: '1,640', change: '+3.2%', share: 'Panamax 75k MT',    color: '#8b5cf6' },
    { name: 'Baltic Supramax (BSI)',   code: 'BSI',  val: '1,290', change: '+1.8%', share: 'Supramax 58k MT',   color: '#10b981' },
    { name: 'Baltic Handysize (BHSI)', code: 'BHSI', val: '710',   change: '+0.5%', share: 'Handysize 38k MT',  color: '#f59e0b' },
  ];

  const bunkerHubs = [
    { hub: 'Singapore', vlsfo: 650, hsfo: 495, spread: 155 },
    { hub: 'Rotterdam', vlsfo: 598, hsfo: 480, spread: 118 },
    { hub: 'Fujairah',  vlsfo: 635, hsfo: 488, spread: 147 },
    { hub: 'Houston',   vlsfo: 610, hsfo: 490, spread: 120 },
  ];

  const historicalBDI = [
    { week: 'W1', bdi: 1680, bci: 2750 },
    { week: 'W2', bdi: 1720, bci: 2840 },
    { week: 'W3', bdi: 1765, bci: 2950 },
    { week: 'W4', bdi: 1805, bci: 3040 },
    { week: 'W5', bdi: 1842, bci: 3120 },
  ];

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" /> Global Macro Shipping Intelligence
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Market Indices &amp; Energy Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Baltic Exchange indices, bunker fuel spreads across key bunkering hubs, and chokepoint risks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Baltic Feed: Live Synced
        </div>
      </div>

      {/* ── Sub-index Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bdiSubIndices.map((idx) => (
          <div key={idx.code} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{idx.code}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> {idx.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{idx.val}</div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">{idx.name}</p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {idx.share}
            </span>
          </div>
        ))}
      </div>

      {/* ── Charts Section ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* BDI Trajectory Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Baltic Indices Multi-Week Momentum</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Comparing Capesize Index (BCI) against Composite BDI</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded" /> BCI Capesize
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-0.5 bg-slate-500 rounded" /> Composite BDI
              </span>
            </div>
          </div>

          <div className="h-72 rounded-xl bg-slate-50 dark:bg-slate-950/70 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalBDI} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="week" tick={AXIS_TICK} axisLine={{ stroke: AXIS_STROKE }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={AXIS_TICK} axisLine={{ stroke: AXIS_STROKE }} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
                <Line type="monotone" dataKey="bci" name="BCI Capesize" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="bdi" name="Composite BDI" stroke="#64748b" strokeWidth={2.5} dot={{ r: 3, fill: '#64748b', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Bunker Benchmarks */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Global Bunker Benchmarks</h3>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">$/Metric Ton</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            VLSFO (0.5% Sulphur) vs HSFO (3.5% Sulphur) price spread:
          </p>

          <div className="space-y-3 flex-1">
            {bunkerHubs.map((hub) => (
              <div key={hub.hub} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hub.hub}</span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700">
                    Spread: ${hub.spread}/MT
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">VLSFO</span>
                    <span className="font-bold text-slate-900 dark:text-white">${hub.vlsfo}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">HSFO (Scrubber)</span>
                    <span className="font-bold text-slate-900 dark:text-white">${hub.hsfo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Scrubber Premium Advantage:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Avg. Saving $3,450 / day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
