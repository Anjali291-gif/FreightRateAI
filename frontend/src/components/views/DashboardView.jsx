import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, BarChart2, Fuel, ArrowUpRight, Ship, ArrowRight,
  BrainCircuit, RefreshCw, AlertCircle, Database, CheckCircle2, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  ComposedChart, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { getSummary, getHistorical, getVessels, getDemand, getActivity } from '../../services/api';
import Card, { CardHeader, Badge, Btn } from '../common/UI';

export default function DashboardView() {
  const { navigate, backendOnline, checkConnection } = useApp();

  const [summary, setSummary] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [vesselsData, setVesselsData] = useState([]);
  const [demandData, setDemandData] = useState([]);
  const [activity, setActivity] = useState([]);

  const [selectedVesselFilter, setSelectedVesselFilter] = useState('');
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sumRes, histRes, vesRes, demRes, actRes] = await Promise.all([
        getSummary().catch(e => { console.warn('Summary err:', e); return null; }),
        getHistorical({
          vessel_type: selectedVesselFilter || undefined,
          commodity: selectedCommodityFilter || undefined,
          limit: 35,
        }).catch(e => { console.warn('Historical err:', e); return []; }),
        getVessels().catch(e => { console.warn('Vessels err:', e); return { vessels: [] }; }),
        getDemand().catch(e => { console.warn('Demand err:', e); return { trend: [] }; }),
        getActivity().catch(e => { console.warn('Activity err:', e); return []; }),
      ]);

      if (!sumRes && histRes.length === 0) {
        throw new Error('Unable to connect to live backend on http://localhost:8000. Please ensure FastAPI server is running.');
      }

      setSummary(sumRes);
      setHistoricalData(histRes);
      setVesselsData(vesRes?.vessels || []);
      setDemandData(demRes?.trend || []);
      setActivity(actRes);
    } catch (err) {
      setError(err.message || 'Failed to load live dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedVesselFilter, selectedCommodityFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Transform historical records into formatted chart data
  const chartPoints = historicalData.map(item => ({
    date: item.date,
    freight_rate: item.freight_rate,
    fuel_price: item.fuel_price,
    cargo_demand: item.cargo_demand,
    vessel_type: item.vessel_type,
    commodity: item.commodity,
    origin: item.origin,
    destination: item.destination,
  }));

  return (
    <div className="space-y-6 page-enter">
      {/* ── Offline Alert Banner ─────────────────────────────────── */}
      {!backendOnline && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <b>FastAPI backend is offline.</b> Run <code>python main.py</code> in the <code>backend/</code> directory to start the server.
            </span>
          </div>
          <Btn size="xs" variant="secondary" onClick={() => { checkConnection(); fetchDashboardData(); }}>
            <RefreshCw className="w-3 h-3 mr-1" /> Reconnect
          </Btn>
        </div>
      )}

      {/* ── Hero Banner ─────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden min-h-[160px] flex items-center shadow-md">
        <img
          src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1400&auto=format&fit=crop&q=80"
          alt="Cargo vessel at sea"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1422]/95 via-[#0B1422]/80 to-transparent" />
        <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded-full">
                SIH 2026 Prototype
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live ML Pipeline
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              FreightAI – Intelligent Freight Forecasting<br className="hidden md:block" /> &amp; Vessel Chartering System
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1.5 max-w-2xl">
              Real-time maritime market intelligence, predictive rate forecasting, and transparent chartering decision support.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Btn size="sm" onClick={() => navigate('forecast')}>
              <TrendingUp className="w-4 h-4 mr-1.5" /> Rate Forecast
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => navigate('decision')}>
              <BrainCircuit className="w-4 h-4 mr-1.5" /> Chartering Decision
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Live Metric Cards from /api/summary ──────────── */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-28 animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Avg Freight Rate */}
          <Card className="hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <TrendingUp className="w-4 h-4" />
              </div>
              <Badge color="blue">Live API</Badge>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              ${summary.average_freight_rate.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Freight Rate ($/MT)</div>
            <div className="text-[11px] text-slate-400 mt-1">Across 10,000 transactions</div>
          </Card>

          {/* Card 2: Cargo Demand Index */}
          <Card className="hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                <BarChart2 className="w-4 h-4" />
              </div>
              <Badge color="green">Baseline 100</Badge>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {summary.average_cargo_demand.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Cargo Demand Index</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              +1.16 above baseline
            </div>
          </Card>

          {/* Card 3: Bunker Fuel Price */}
          <Card className="hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900">
                <Fuel className="w-4 h-4" />
              </div>
              <Badge color="orange">VLSFO</Badge>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              ${summary.average_fuel_price.toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Fuel Price ($/MT)</div>
            <div className="text-[11px] text-slate-400 mt-1">Bunker OPEX index</div>
          </Card>

          {/* Card 4: Historical Dataset Rows */}
          <Card className="hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900">
                <Database className="w-4 h-4" />
              </div>
              <Badge color="blue">3 Years</Badge>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {summary.total_dataset_rows.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Dataset Rows</div>
            <div className="text-[11px] text-slate-400 mt-1">Zero missing values</div>
          </Card>

          {/* Card 5: Selected ML Model */}
          <Card className="hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <Badge color="purple">Deployed</Badge>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate" title={summary.selected_ml_model}>
              {summary.selected_ml_model}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">
              R² {(summary.r2_score * 100).toFixed(1)}% | MAE ${summary.mae.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">RMSE: ${summary.rmse.toFixed(2)}/ton</div>
          </Card>
        </div>
      ) : null}

      {/* ── Middle Row: Live Historical Chart (/api/historical) ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <Card>
            {/* Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Historical Freight Rate Trends</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Live data streamed from <code className="text-blue-500 dark:text-blue-400">/api/historical</code></p>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedVesselFilter}
                  onChange={e => setSelectedVesselFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">All Vessel Classes</option>
                  <option value="Capesize">Capesize</option>
                  <option value="Panamax">Panamax</option>
                  <option value="Supramax">Supramax</option>
                  <option value="VLCC">VLCC</option>
                  <option value="Container Post-Panamax">Container</option>
                  <option value="LNG Carrier">LNG Carrier</option>
                </select>

                <select
                  value={selectedCommodityFilter}
                  onChange={e => setSelectedCommodityFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">All Commodities</option>
                  <option value="Iron Ore">Iron Ore</option>
                  <option value="Crude Oil">Crude Oil</option>
                  <option value="Grain">Grain</option>
                  <option value="LNG">LNG</option>
                  <option value="Containerized Freight">Container</option>
                </select>

                <Btn size="xs" onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Btn>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-72 rounded-xl bg-slate-50 dark:bg-slate-950/70 p-2">
              {loading && chartPoints.length === 0 ? (
                <div className="h-full bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
              ) : chartPoints.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartPoints} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={1} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                      tickFormatter={v => `$${v}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', color: '#e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid #1e293b', paddingBottom: '5px', marginBottom: '6px' }}>
                              {label} · {d.origin} → {d.destination}
                            </div>
                            <div style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                              Freight Rate: <b>${d.freight_rate}/MT</b>
                            </div>
                            <div style={{ color: '#cbd5e1', marginTop: '3px' }}>
                              Vessel: {d.vessel_type} | Cargo: {d.commodity}
                            </div>
                            <div style={{ color: '#fb923c', marginTop: '2px' }}>
                              Fuel: ${d.fuel_price}/MT | Demand: {d.cargo_demand}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#64748b' }} />
                    <Line
                      type="monotone"
                      name="Freight Rate ($/MT)"
                      dataKey="freight_rate"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#60a5fa', stroke: '#1d4ed8', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  No historical records match the selected filters.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Demand Trend Snapshot (/api/demand) */}
        <div className="xl:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader
              title="Cargo Demand Trend"
              subtitle="Monthly index progression (/api/demand)"
              icon={BarChart2}
              iconColor="green"
            />
            <div className="h-64 flex-1 rounded-xl bg-slate-50 dark:bg-slate-950/70 p-2">
              {demandData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demandData.slice(-12)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={1} vertical={false} />
                    <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                    <Tooltip
                      formatter={(v) => [`${v} pts`, 'Avg Demand Index']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <defs>
                      <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="avg_demand" stroke="#10b981" strokeWidth={2.5} fill="url(#demandGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Loading demand trend...
                </div>
              )}
            </div>
            <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Market Demand Health:</span> Average index remains near 101.2, confirming steady chartering inquiry velocity.
            </div>
          </Card>
        </div>
      </div>

      {/* ── Bottom Row: Vessel Class Statistics (/api/vessels) ──────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Vessel Type Fleet &amp; Rate Metrics</h2>
              <p className="text-[11px] text-slate-400">Live aggregations streamed from <code>/api/vessels</code></p>
            </div>
          </div>
          <Btn variant="ghost" size="xs" onClick={() => navigate('vessels')}>
            Vessel Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="text-left py-2.5 px-3">Vessel Classification</th>
                <th className="text-right py-2.5 px-3">Fleet Sample</th>
                <th className="text-right py-2.5 px-3">Mean Capacity</th>
                <th className="text-right py-2.5 px-3">Mean Rate</th>
                <th className="text-right py-2.5 px-3">Min - Max Rate</th>
                <th className="text-left py-2.5 px-3">Primary Commodities</th>
                <th className="text-center py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vesselsData.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Ship className="w-3.5 h-3.5 text-blue-500" />
                    {v.vessel_type}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {v.count} voyages
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-300">
                    {Math.round(v.avg_dwt).toLocaleString()} DWT
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-blue-600 dark:text-blue-400">
                    ${v.avg_freight_rate.toFixed(2)}/MT
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    ${v.min_freight_rate.toFixed(1)} - ${v.max_freight_rate.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {v.common_commodities.join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Btn
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        navigate('forecast');
                      }}
                    >
                      Forecast →
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
