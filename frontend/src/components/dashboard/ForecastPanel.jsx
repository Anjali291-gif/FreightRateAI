import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, Check, SlidersHorizontal, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

export default function ForecastPanel() {
  const { 
    route, 
    setRoute, 
    commodity, 
    setCommodity, 
    period, 
    setPeriod,
    showToast 
  } = useApp();

  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ routes: [], commodities: [], periods: [] });

  // Temporary selected filter states before "Apply" is clicked
  const [tempRoute, setTempRoute] = useState(route);
  const [tempCommodity, setTempCommodity] = useState(commodity);
  const [tempPeriod, setTempPeriod] = useState(period);

  useEffect(() => {
    const fetchOptions = async () => {
      const opts = await apiService.getFilterOptions();
      setFilterOptions(opts);
    };
    fetchOptions();
  }, []);

  const loadForecast = async (r, c, p) => {
    setLoading(true);
    try {
      const data = await apiService.getForecast(r, c, p);
      setForecastData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(route, commodity, period);
  }, [route, commodity, period]);

  const handleApply = () => {
    setRoute(tempRoute);
    setCommodity(tempCommodity);
    setPeriod(tempPeriod);
    loadForecast(tempRoute, tempCommodity, tempPeriod);
    showToast(`Forecast updated for ${tempRoute} (${tempCommodity})`, 'success');
  };

  // Custom chart tooltip for professional display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-sans backdrop-blur-sm">
          <p className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1 mb-2">{label}</p>
          {dataPoint.historical !== null && (
            <div className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Historical Rate:
              </span>
              <span className="font-bold text-white">${dataPoint.historical}/ton</span>
            </div>
          )}
          {dataPoint.forecast !== null && (
            <div className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                ML Forecast:
              </span>
              <span className="font-bold text-white">${dataPoint.forecast}/ton</span>
            </div>
          )}
          {dataPoint.upper !== null && dataPoint.lower !== null && (
            <div className="text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800 flex justify-between gap-2">
              <span>95% CI Range:</span>
              <span className="font-mono text-slate-300">${dataPoint.lower} - ${dataPoint.upper}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Header & Filter Controls Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Freight Rate Forecast</h2>
          </div>
        </div>

        {/* Dropdown Filters & Apply Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Route Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Route</label>
            <select
              value={tempRoute}
              onChange={(e) => setTempRoute(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Australia → China">Australia → China</option>
              <option value="Brazil → China">Brazil → China</option>
              <option value="US Gulf → China">US Gulf → China</option>
              <option value="Indonesia → India">Indonesia → India</option>
            </select>
          </div>

          {/* Commodity Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Commodity</label>
            <select
              value={tempCommodity}
              onChange={(e) => setTempCommodity(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Iron Ore">Iron Ore</option>
              <option value="Coal">Coal</option>
              <option value="Grain">Grain</option>
              <option value="Bauxite">Bauxite</option>
            </select>
          </div>

          {/* Forecast Period Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Forecast Period</label>
            <select
              value={tempPeriod}
              onChange={(e) => setTempPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="7 Days">7 Days</option>
              <option value="14 Days">14 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
            </select>
          </div>

          {/* Apply Button */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] text-transparent mb-1 select-none">Action</span>
            <button
              onClick={handleApply}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-xs transition duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart + Forecast Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Side Recharts Interactive Line/Area Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-500">
              Freight Rate Forecast ($/ton)
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-blue-600 rounded" />
                <span className="text-slate-600 font-medium">Historical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-indigo-600" />
                <span className="text-slate-600 font-medium">Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-100 rounded-xs border border-indigo-200" />
                <span className="text-slate-400 text-[11px]">Confidence Area</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {forecastData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={forecastData.timeline}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 3', 'dataMax + 3']}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Confidence Interval shaded band */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#818CF8"
                    fillOpacity={0.12}
                    isAnimationActive={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                    isAnimationActive={true}
                  />

                  {/* Historical Rate Solid Line */}
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#2563EB', stroke: '#EFF6FF', strokeWidth: 2 }}
                    connectNulls={false}
                  />

                  {/* Forecast Rate Dashed Line */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366F1', stroke: '#EEF2FF', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Loading forecast models...
              </div>
            )}
          </div>
        </div>

        {/* Right Side Forecast Summary Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Forecast Summary</span>
                <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  ML Confidence 94.2%
                </span>
              </div>

              {/* Current Rate Block */}
              <div className="pb-3.5 border-b border-slate-200/70">
                <span className="text-xs text-slate-500 font-medium">Current Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    ${forecastData ? forecastData.currentRate.toFixed(2) : '25.40'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ ton</span>
                </div>
              </div>

              {/* Horizon Forecasts list */}
              <div className="space-y-3.5 pt-3.5">
                {/* 7-Day Forecast */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">7-Day Forecast</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      ${forecastData ? forecastData.forecast7d.toFixed(2) : '27.10'}
                      <span className="text-[11px] text-slate-400 font-normal"> / ton</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {forecastData ? forecastData.change7d : '+6.7%'}
                    </span>
                  </div>
                </div>

                {/* 14-Day Forecast */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">14-Day Forecast</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      ${forecastData ? forecastData.forecast14d.toFixed(2) : '28.90'}
                      <span className="text-[11px] text-slate-400 font-normal"> / ton</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {forecastData ? forecastData.change14d : '+13.8%'}
                    </span>
                  </div>
                </div>

                {/* 30-Day Forecast */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">30-Day Forecast</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      ${forecastData ? forecastData.forecast30d.toFixed(2) : '29.80'}
                      <span className="text-[11px] text-slate-400 font-normal"> / ton</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {forecastData ? forecastData.change30d : '+17.3%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note at bottom */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Surge driven by Q4 iron ore restocking &amp; fuel spread.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
