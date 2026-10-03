import React, { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit, ShieldCheck, AlertCircle, RefreshCw,
  TrendingUp, Fuel, Clock, Activity, Anchor, Compass, Ship, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { postCharteringDecision } from '../../services/api';
import Card, { CardHeader, Badge, Btn } from '../common/UI';

const VESSEL_TYPES = [
  'Capesize', 'Panamax', 'Supramax', 'Handysize',
  'VLCC', 'Suezmax', 'Aframax', 'Container Post-Panamax', 'LNG Carrier'
];

const ROUTE_PRESETS = [
  { origin: 'Port Hedland', destination: 'Qingdao', distance_nm: 3650, vessel_type: 'Capesize', vessel_size: 185000, commodity: 'Iron Ore' },
  { origin: 'Tubarao', destination: 'Qingdao', distance_nm: 11200, vessel_type: 'Capesize', vessel_size: 180000, commodity: 'Iron Ore' },
  { origin: 'Santos', destination: 'Rotterdam', distance_nm: 5450, vessel_type: 'Panamax', vessel_size: 75000, commodity: 'Grain' },
  { origin: 'Ras Tanura', destination: 'Singapore', distance_nm: 3720, vessel_type: 'VLCC', vessel_size: 300000, commodity: 'Crude Oil' },
  { origin: 'Houston', destination: 'Rotterdam', distance_nm: 4850, vessel_type: 'Aframax', vessel_size: 105000, commodity: 'Refined Petroleum' },
  { origin: 'Shanghai', destination: 'Los Angeles', distance_nm: 5700, vessel_type: 'Container Post-Panamax', vessel_size: 110000, commodity: 'Containerized Freight' },
];

export default function AIDecisionView() {
  const { toast, backendOnline, checkConnection } = useApp();

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

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: ['vessel_size', 'distance_nm', 'fuel_price', 'cargo_demand', 'port_congestion'].includes(field)
        ? Number(value)
        : value
    }));
  };

  const handlePresetChange = (e) => {
    const found = ROUTE_PRESETS.find(p => `${p.origin} → ${p.destination}` === e.target.value);
    if (found) {
      setFormData(prev => ({
        ...prev,
        origin: found.origin,
        destination: found.destination,
        distance_nm: found.distance_nm,
        vessel_type: found.vessel_type,
        vessel_size: found.vessel_size,
        commodity: found.commodity,
      }));
    }
  };

  const executeDecisionAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await postCharteringDecision(formData);
      setDecision(res);
      toast('Chartering strategy generated successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to evaluate chartering decision.');
      toast(err.message || 'Decision evaluation error', 'error');
    } finally {
      setLoading(false);
    }
  }, [formData, toast]);

  useEffect(() => {
    executeDecisionAnalysis();
  }, []);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* ── Offline Banner ─────────────────────────────────── */}
      {!backendOnline && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>FastAPI backend is offline. Run <code>python main.py</code> in <code>backend/</code> to enable decision analysis.</span>
          </div>
          <Btn size="xs" variant="secondary" onClick={checkConnection}>Reconnect</Btn>
        </div>
      )}

      {/* ── Header ─────────────────────────────────── */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
              <BrainCircuit className="w-3.5 h-3.5" /> Quantitative Chartering Heuristics
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Decision Support &amp; Chartering Advisor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live rule-based commercial recommendation engine evaluating rate forecast, cargo demand elasticity, fuel OPEX, and port demurrage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="purple">Rule-Based Decision Logic</Badge>
            <Badge color="green">POST /api/chartering-decision</Badge>
          </div>
        </div>
      </Card>

      {/* ── Input Parameters ─────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Charter Scenario Inputs</h2>
            <p className="text-[11px] text-slate-400">Provide real-time market parameters for commercial strategy evaluation</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Preset:</span>
            <select
              onChange={handlePresetChange}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Cargo Qty (DWT)</label>
            <input
              type="number"
              value={formData.vessel_size}
              onChange={e => handleInputChange('vessel_size', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Vessel Type</label>
            <select
              value={formData.vessel_type}
              onChange={e => handleInputChange('vessel_type', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {VESSEL_TYPES.map(vt => <option key={vt} value={vt}>{vt}</option>)}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Origin Port</label>
            <input
              type="text"
              value={formData.origin}
              onChange={e => handleInputChange('origin', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Destination Port</label>
            <input
              type="text"
              value={formData.destination}
              onChange={e => handleInputChange('destination', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Fuel Price ($/MT)</label>
            <input
              type="number"
              value={formData.fuel_price}
              onChange={e => handleInputChange('fuel_price', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Port Congestion (Days)</label>
            <input
              type="number"
              step="0.5"
              value={formData.port_congestion}
              onChange={e => handleInputChange('port_congestion', e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Btn onClick={executeDecisionAnalysis} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <BrainCircuit className="w-4 h-4 mr-1.5" />}
            Evaluate Chartering Decision
          </Btn>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* ── Decision Result Cards ─────────────────────────────────── */}
      {decision && (
        <div className="space-y-5">
          {/* Primary Recommendation Banner */}
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 border border-emerald-400/50 dark:border-emerald-600/40 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge color="green">Primary Strategic Recommendation</Badge>
                  <Badge color="blue">Predicted Rate: ${decision.predicted_freight_rate.toFixed(2)} / MT</Badge>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                  {decision.recommendation}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {decision.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Market Signal Tier Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Demand Level</span>
                <Badge color={getTierColor(decision.demand_level)}>{decision.demand_level}</Badge>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formData.cargo_demand} pts
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Cargo demand indicator tier</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fuel Cost Exposure</span>
                <Badge color={getTierColor(decision.fuel_cost_level)}>{decision.fuel_cost_level}</Badge>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                ${formData.fuel_price} / MT
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Bunker price exposure tier</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Port Congestion Risk</span>
                <Badge color={getTierColor(decision.congestion_level)}>{decision.congestion_level}</Badge>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formData.port_congestion} Days
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Expected waiting time at port</div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Estimated Voyage Budget</span>
                <Badge color="purple">Total Cost</Badge>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                ${((decision.predicted_freight_rate * formData.vessel_size) / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-[11px] text-slate-400 mt-1">For {formData.vessel_size.toLocaleString()} DWT</div>
            </Card>
          </div>

          {/* Disclaimer Note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Demonstration Decision Support Disclaimer:</span>{' '}
              The chartering recommendation and risk classifications provided above are generated through deterministic maritime economic rules.
              This system provides computational decision support and is not guaranteed financial or commercial advice.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
