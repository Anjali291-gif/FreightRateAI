import React, { useState } from 'react';
import { BarChart3, ChevronDown, ArrowUpRight, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { MOCK_MARKET_INSIGHTS } from '../../data/mockData';

export default function MarketInsights() {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const insights = MOCK_MARKET_INSIGHTS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Header with Time Selector */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Market Insights</h2>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="Last 90 Days">Last 90 Days</option>
          <option value="Year to Date">Year to Date</option>
        </select>
      </div>

      {/* 4 Mini Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {insights.miniStats.map((st) => (
          <div
            key={st.id}
            className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block truncate">{st.label}</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{st.value}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-1">
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
                {st.change}
              </span>
              <div className="w-12 h-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={st.data}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={st.color}
                      strokeWidth={1.8}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Freight Rate Trend Mini Chart */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Global Freight Rate Trend</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-0.5 bg-blue-600 rounded" /> Historical
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-600" /> Forecast
            </span>
          </div>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insights.globalTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-[10px]">
                        <p className="font-bold">{label}</p>
                        <p>Rate: ${payload[0].value || payload[1]?.value}/ton</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="historical" stroke="#2563EB" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="forecast" stroke="#6366F1" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
