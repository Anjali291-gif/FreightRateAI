import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, RefreshCw, AlertCircle, CheckCircle2,
  Calendar, Ship, Compass, Anchor, Fuel, Activity, CloudSun, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { postForecast, getHistorical, getSummary } from '../../services/api';
import Card, { CardHeader, Badge, Btn } from '../common/UI';

// Canonical route presets with baseline distances and typical vessels
const ROUTE_PRESETS = [
  { origin: 'Port Hedland', destination: 'Qingdao', distance_nm: 3650, vessel_type: 'Capesize', vessel_size: 185000, commodity: 'Iron Ore' },
  { origin: 'Tubarao', destination: 'Qingdao', distance_nm: 11200, vessel_type: 'Capesize', vessel_size: 180000, commodity: 'Iron Ore' },
  { origin: 'Santos', destination: 'Rotterdam', distance_nm: 5450, vessel_type: 'Panamax', vessel_size: 75000, commodity: 'Grain' },
  { origin: 'Ras Tanura', destination: 'Singapore', distance_nm: 3720, vessel_type: 'VLCC', vessel_size: 300000, commodity: 'Crude Oil' },
  { origin: 'Houston', destination: 'Rotterdam', distance_nm: 4850, vessel_type: 'Aframax', vessel_size: 105000, commodity: 'Refined Petroleum' },
  { origin: 'Shanghai', destination: 'Los Angeles', distance_nm: 5700, vessel_type: 'Container Post-Panamax', vessel_size: 110000, commodity: 'Containerized Freight' },
  { origin: 'Ras Laffan', destination: 'Tokyo', distance_nm: 6550, vessel_type: 'LNG Carrier', vessel_size: 85000, commodity: 'LNG' },
  { origin: 'Newcastle', destination: 'Mumbai', distance_nm: 5900, vessel_type: 'Capesize', vessel_size: 175000, commodity: 'Thermal Coal' },
  { origin: 'Singapore', destination: 'Dubai', distance_nm: 3400, vessel_type: 'Supramax', vessel_size: 55000, commodity: 'Steel Coils' },
];

const VESSEL_TYPES = [
  'Capesize', 'Panamax', 'Supramax', 'Handysize',
  'VLCC', 'Suezmax', 'Aframax', 'Container Post-Panamax', 'LNG Carrier'
];

const COMMODITIES = [
  'Iron Ore', 'Crude Oil', 'Thermal Coal', 'Grain',
  'LNG', 'Containerized Freight', 'Steel Coils', 'Chemicals', 'Refined Petroleum', 'Bauxite'
];

const WEATHER_OPTIONS = ['Calm', 'Moderate', 'Rough Sea', 'Stormy', 'Monsoon/Tropical Cyclone'];

export default function ForecastView() {
  const { toast, backendOnline, checkConnection } = useApp();

  // Form State matching backend requirements
  const [formData, setFormData] = useState({
    date: '2026-10-03',
    vessel_type: 'Capesize',
    vessel_size: 185000,
    origin: 'Port Hedland',
    destination: 'Qingdao',
    commodity: 'Iron Ore',
    distance_nm: 3650,
    fuel_price: 625,
    cargo_demand: 105,
    weather_condition: 'Calm',
    port_congestion: 2.0,
  });

  const [forecastResult, setForecastResult] = useState(null);
  const [modelSummary, setModelSummary] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch model evaluation metrics on mount
  useEffect(() => {
    getSummary()
      .then(sum => setModelSummary(sum))
      .catch(e => console.warn('Could not load summary:', e));
  }, []);

  // Preset Route Selection Helper
  const handleRoutePreset = (e) => {
    const selected = ROUTE_PRESETS.find(p => `${p.origin} → ${p.destination}` === e.target.value);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        origin: selected.origin,
        destination: selected.destination,
        distance_nm: selected.distance_nm,
        vessel_type: selected.vessel_type,
        vessel_size: selected.vessel_size,
        commodity: selected.commodity,
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'vessel_size' || field === 'distance_nm' || field === 'fuel_price' || field === 'cargo_demand' || field === 'port_congestion'
        ? Number(value)
        : value
    }));
  };

  // Execute Real POST /api/forecast
  const executeForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call POST /api/forecast
      const result = await postForecast(formData);
      setForecastResult(result);

      // 2. Fetch actual historical records for route context
      const hist = await getHistorical({
        vessel_type: formData.vessel_type,
        commodity: formData.commodity,
        limit: 25,
      }).catch(() => []);
      setHistoricalData(hist);

      toast(`Predicted rate: $${result.predicted_freight_rate.toFixed(2)}/MT (${result.model})`, 'success');
    } catch (err) {
      setError(err.message || 'Forecast request failed. Please check backend connection.');
      toast(err.message || 'Forecast error', 'error');
    } finally {
      setLoading(false);
    }
  }, [formData, toast]);

  // Run initial forecast
  useEffect(() => {
    executeForecast();
  }, []);

  return (
    <div className="space-y-6 page-enter">
      {/* ── Offline Banner ─────────────────────────────────── */}
      {!backendOnline && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>FastAPI backend is offline. Run <code>python main.py</code> in <code>backend/</code> to enable live ML forecasting.</span>
          </div>
          <Btn size="xs" variant="secondary" onClick={checkConnection}>Reconnect</Btn>
        </div>
      )}

      {/* ── Header ─────────────────────────────────── */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Deployed Machine Learning Pipeline
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Freight Rate Forecasting Studio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live inference via FastAPI endpoint <code>POST /api/forecast</code> using the trained{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {forecastResult?.model || modelSummary?.selected_ml_model || 'Gradient Boosting Regressor'}
              </span>
            </p>
          </div>
          {modelSummary && (
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Model R²</span>
                <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                  {(modelSummary.r2_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Test MAE</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${modelSummary.mae.toFixed(2)}/t
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Form & Parameter Inputs ─────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Voyage Input Parameters</h2>
            <p className="text-[11px] text-slate-400">Select route preset or specify custom maritime voyage attributes</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Route:</span>
            <select
              onChange={handleRoutePreset}
              defaultValue="Port Hedland → Qingdao"
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {ROUTE_PRESETS.map((p, idx) => (
                <option key={idx} value={`${p.origin} → ${p.destination}`}>
                  {p.origin} → {p.destination} ({p.vessel_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Date */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Voyage Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Vessel Type */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Vessel Type</label>
            <div className="relative">
              <Ship className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={formData.vessel_type}
                onChange={e => handleInputChange('vessel_type', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                {VESSEL_TYPES.map(vt => <option key={vt} value={vt}>{vt}</option>)}
              </select>
            </div>
          </div>

          {/* Vessel Size (DWT) */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Vessel Size (DWT)</label>
            <input
              type="number"
              min="10000"
              max="400000"
              value={formData.vessel_size}
              onChange={e => handleInputChange('vessel_size', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>

          {/* Commodity */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Commodity</label>
            <select
              value={formData.commodity}
              onChange={e => handleInputChange('commodity', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Origin Port */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Origin Port</label>
            <div className="relative">
              <Anchor className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={formData.origin}
                onChange={e => handleInputChange('origin', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
              />
            </div>
          </div>

          {/* Destination Port */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Destination Port</label>
            <div className="relative">
              <Compass className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={formData.destination}
                onChange={e => handleInputChange('destination', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
              />
            </div>
          </div>

          {/* Distance (nm) */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Distance (nm)</label>
            <input
              type="number"
              value={formData.distance_nm}
              onChange={e => handleInputChange('distance_nm', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>

          {/* Fuel Price ($/MT) */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Bunker Fuel ($/MT)</label>
            <div className="relative">
              <Fuel className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                value={formData.fuel_price}
                onChange={e => handleInputChange('fuel_price', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Cargo Demand */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Cargo Demand Index</label>
            <div className="relative">
              <Activity className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                step="0.5"
                value={formData.cargo_demand}
                onChange={e => handleInputChange('cargo_demand', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Weather Condition */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Weather Condition</label>
            <div className="relative">
              <CloudSun className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={formData.weather_condition}
                onChange={e => handleInputChange('weather_condition', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Port Congestion (days) */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Port Congestion (Days)</label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                step="0.5"
                value={formData.port_congestion}
                onChange={e => handleInputChange('port_congestion', e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <Btn onClick={executeForecast} disabled={loading} className="w-full h-[34px] flex items-center justify-center">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <TrendingUp className="w-4 h-4 mr-1.5" />}
              Generate Forecast
            </Btn>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* ── Forecast Result Display ─────────────────────────────────── */}
      {forecastResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Primary Predicted Rate Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg shadow-blue-900/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-bold tracking-wider text-blue-200">
                  Predicted Freight Rate
                </span>
                <Badge color="green">API Verified</Badge>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold font-mono tracking-tight">
                  ${forecastResult.predicted_freight_rate.toFixed(2)}
                </span>
                <span className="text-sm text-blue-100 font-medium">
                  {forecastResult.currency} / {forecastResult.unit}
                </span>
              </div>

              <div className="text-xs text-blue-100 mt-2 border-t border-blue-500/40 pt-2.5">
                Model: <b>{forecastResult.model}</b>
              </div>

              <div className="mt-4 bg-white/10 rounded-xl p-3 text-xs space-y-1 backdrop-blur-xs">
                <div className="flex justify-between text-blue-100">
                  <span>Route:</span>
                  <span className="font-semibold text-white">{formData.origin} → {formData.destination}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>Distance:</span>
                  <span className="font-mono text-white">{formData.distance_nm} nm</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>Cargo / Vessel:</span>
                  <span className="text-white">{formData.commodity} ({formData.vessel_type})</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>Total Voyage Cost Est.:</span>
                  <span className="font-bold text-white font-mono">
                    ${((forecastResult.predicted_freight_rate * formData.vessel_size) / 1_000_000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>

            {/* Model Evaluation Metrics from Summary */}
            {modelSummary && (
              <Card>
                <div className="text-xs font-bold text-slate-800 dark:text-white mb-2">
                  Validation Benchmark Metrics
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Test R² Score:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {modelSummary.r2_score}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Mean Absolute Error (MAE):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${modelSummary.mae.toFixed(2)} / MT
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Root Mean Sq. Error (RMSE):</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      ${modelSummary.rmse.toFixed(2)} / MT
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Historical Voyage Comparison Chart */}
          <div className="lg:col-span-8">
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Historical Voyage Rate Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Recent actual voyages for {formData.vessel_type} carrying {formData.commodity}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                  Forecast: ${forecastResult.predicted_freight_rate.toFixed(2)}/t
                </span>
              </div>

              <div className="h-64 flex-1">
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={historicalData.map(h => ({
                        date: h.date,
                        rate: h.freight_rate,
                        port: `${h.origin} → ${h.destination}`,
                      }))}
                      margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700">
                              <div className="text-slate-400 pb-1 mb-1 border-b border-slate-800">{label}</div>
                              <div className="text-blue-400 font-bold font-mono">
                                Rate: ${payload[0].value}/MT
                              </div>
                              <div className="text-slate-300 text-[10px] mt-0.5">{payload[0].payload.port}</div>
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        name="Historical Voyage Rate"
                        dataKey="rate"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#2563EB' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Loading historical reference voyages...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
