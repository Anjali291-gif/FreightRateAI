import React, { useState, useEffect, useMemo } from 'react';
import { Ship, Search, ChevronUp, ChevronDown, X, Check, LayoutGrid, List } from 'lucide-react';
import { searchVessels } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Card, { Badge, Btn, DemoTag } from '../common/UI';
import confetti from 'canvas-confetti';

const ORIGINS      = ['Australia', 'Brazil', 'US Gulf', 'Indonesia', 'South Africa'];
const DESTINATIONS = ['China', 'India', 'Japan', 'Europe', 'South Korea'];

const INPUT_CLS = `w-full text-xs font-semibold
  text-slate-700 dark:text-slate-200
  bg-slate-50 dark:bg-slate-800
  border border-slate-200 dark:border-slate-700
  rounded-lg px-3 py-1.5
  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400`;

/* ── Charter Modal ─────────────────────────────────────────────── */
function VesselDetailModal({ vessel, onClose }) {
  const [type, setType] = useState('Voyage Charter');
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(null);
  const { toast } = useApp();

  if (!vessel) return null;

  const handleCharter = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 600));
    const result = {
      ref: `CH-${Math.floor(100000 + Math.random() * 900000)}`,
      vessel: vessel.name,
      rate: '$25.40/ton',
      cost: vessel.computedCostLabel ?? `$${vessel.estimatedCostBase}M`,
    };
    setDone(result);
    try { confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } }); } catch {}
    toast?.(`Fixture confirmed for ${vessel.name}! Ref: ${result.ref}`, 'success');
    setConfirming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden">

        {/* Modal header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base">{vessel.name}</div>
              <div className="text-xs text-slate-400">{vessel.type} · {vessel.flag} · {vessel.subtype}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50 dark:border-emerald-900">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Charter Fixed!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                Fixture note generated. Ref: <strong className="text-slate-800 dark:text-slate-200 font-mono">{done.ref}</strong>
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left max-w-xs mx-auto mb-4">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Vessel:</span><span className="font-bold text-slate-800 dark:text-slate-200">{done.vessel}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Agreed Rate:</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{done.rate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Total Cost:</span><span className="font-bold text-slate-800 dark:text-slate-200">{done.cost}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Charter Type:</span><span className="font-bold text-slate-800 dark:text-slate-200">{type}</span></div>
              </div>
              <Btn onClick={onClose}>Close</Btn>
            </div>
          ) : (
            <>
              {/* Vessel quick specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="sm:col-span-1 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={vessel.image || '/assets/vessels/fallback.svg'}
                    alt={vessel.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/assets/vessels/fallback.svg'; }}
                  />
                </div>
                <div className="sm:col-span-2 grid grid-cols-2 gap-2.5 text-xs">
                  {[
                    { l: 'DWT',      v: (vessel.dwt?.toLocaleString() ?? '-') + ' MT' },
                    { l: 'Capacity', v: (vessel.capacity?.toLocaleString() ?? '-') + ' MT' },
                    { l: 'Speed',    v: (vessel.speed ?? '-') + ' knots' },
                    { l: 'Fuel/Day', v: vessel.fuelBurn ?? '-' },
                    { l: 'Scrubber',v: vessel.scrubber ? 'Yes (HSFO)' : 'No (VLSFO)' },
                    { l: 'CII Rating', v: vessel.greenRating ?? '-' },
                  ].map(s => (
                    <div key={s.l} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                      <div className="text-[10px] text-slate-400">{s.l}</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost summary */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-4 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">Estimated Freight Cost</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                    {vessel.computedCostLabel ?? `$${vessel.estimatedCostBase}M`}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Based on current freight rate $25.40/ton</div>
                </div>
                <Badge color="green">{vessel.availability ?? 'Available'}</Badge>
              </div>

              {/* Charter type */}
              <div className="mb-5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Charter Type</div>
                <div className="grid grid-cols-3 gap-2">
                  {['Voyage Charter', 'Time Charter', 'COA'].map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border cursor-pointer transition text-center ${
                        type === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Btn variant="outline" onClick={onClose}>Cancel</Btn>
                <Btn onClick={handleCharter} disabled={confirming}>
                  {confirming ? 'Confirming...' : 'Confirm Charter Fixture'}
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main View ─────────────────────────────────────────────────── */
export default function VesselSelectionView() {
  const { cargoQty, setCargoQty, origin, setOrigin, dest, setDest, reqDate, setReqDate, toast } = useApp();

  const [vessels,  setVessels]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchQ,  setSearchQ]  = useState('');
  const [filterAv, setFilterAv] = useState('All');
  const [sortKey,  setSortKey]  = useState('cost');
  const [sortDir,  setSortDir]  = useState('asc');
  const [viewMode, setViewMode] = useState('table');
  const [selected, setSelected] = useState(null);

  const handleFind = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const list = await searchVessels({ cargoQuantity: cargoQty, origin, destination: dest, requiredDate: reqDate });
      setVessels(list);
      toast?.(`Found ${list.length} vessels for ${origin} → ${dest}`, 'success');
    } finally { setLoading(false); }
  };

  useEffect(() => { handleFind(); }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />;
  };

  const filtered = useMemo(() => {
    let list = [...vessels];
    if (filterAv !== 'All') list = list.filter(v => v.availability === filterAv);
    if (searchQ) list = list.filter(v =>
      v.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      v.type?.toLowerCase().includes(searchQ.toLowerCase())
    );
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'cost')     return dir * ((a.computedCost ?? 0) - (b.computedCost ?? 0));
      if (sortKey === 'capacity') return dir * ((a.capacity ?? 0) - (b.capacity ?? 0));
      return 0;
    });
    return list;
  }, [vessels, filterAv, searchQ, sortKey, sortDir]);

  const TH = 'text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 py-3 px-3';

  return (
    <div className="space-y-5 page-enter">

      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <Ship className="w-3.5 h-3.5" /> Fleet Selection
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Vessel Charter Directory</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse and select bulk carriers with live availability and AI-optimized cost estimations.
            </p>
          </div>
          <DemoTag />
        </div>
      </Card>

      {/* Search Form */}
      <Card>
        <form onSubmit={handleFind} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cargo Quantity (MT)</label>
            <input type="number" value={cargoQty} onChange={e => setCargoQty(e.target.value)}
              className={INPUT_CLS} placeholder="50,000" />
          </div>
          <div className="lg:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Origin</label>
            <select value={origin} onChange={e => setOrigin(e.target.value)} className={INPUT_CLS}>
              {ORIGINS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination</label>
            <select value={dest} onChange={e => setDest(e.target.value)} className={INPUT_CLS}>
              {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required Date</label>
            <input type="text" value={reqDate} onChange={e => setReqDate(e.target.value)}
              className={INPUT_CLS} placeholder="15 Oct 2025" />
          </div>
          <div className="lg:col-span-1">
            <label className="text-[10px] text-transparent block mb-1">·</label>
            <Btn className="w-full" disabled={loading}>
              {loading ? 'Finding...' : 'Find Vessels'}
            </Btn>
          </div>
        </form>
      </Card>

      {/* Filters + View Toggle */}
      {searched && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search vessels..."
              className="pl-8 pr-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48"
            />
          </div>

          <select value={filterAv} onChange={e => setFilterAv(e.target.value)}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="All">All Status</option>
            <option value="Available">Available Only</option>
            <option value="Limited">Limited Only</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} vessels</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
              {[{ id: 'table', icon: List }, { id: 'grid', icon: LayoutGrid }].map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => setViewMode(id)}
                  className={`p-1.5 rounded-lg cursor-pointer transition ${
                    viewMode === id
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding={false}>
          {loading ? (
            <div className="space-y-3 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 && searched ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <Ship className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No vessels matched your criteria</p>
              <p className="text-xs mt-1">Try adjusting cargo quantity or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <th className={`${TH} text-left`}>Vessel Name</th>
                    <th className={`${TH} text-left`}>Type</th>
                    <th className={`${TH} text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none`} onClick={() => toggleSort('capacity')}>
                      Capacity <SortIcon k="capacity" />
                    </th>
                    <th className={`${TH} text-right`}>Age</th>
                    <th className={`${TH} text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none`} onClick={() => toggleSort('cost')}>
                      Est. Cost <SortIcon k="cost" />
                    </th>
                    <th className={`${TH} text-center`}>Availability</th>
                    <th className={`${TH} text-center`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.image || '/assets/vessels/fallback.svg'}
                            alt={v.name}
                            className="w-10 h-7 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            onError={e => { e.currentTarget.src = '/assets/vessels/fallback.svg'; }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{v.owner} · {v.flag}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{v.type}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {v.capacity?.toLocaleString()} MT
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400">{v.age} yrs</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {v.computedCostLabel ?? `$${v.estimatedCostBase}M`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge color={v.availability === 'Available' ? 'green' : 'orange'}>{v.availability}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Btn size="xs" onClick={() => setSelected(v)}>Select</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))
          ) : filtered.map(v => (
            <div key={v.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
              <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={v.image || '/assets/vessels/fallback.svg'}
                  alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={e => { e.currentTarget.src = '/assets/vessels/fallback.svg'; }}
                />
                <div className="absolute top-2 right-2">
                  <Badge color={v.availability === 'Available' ? 'green' : 'orange'}>{v.availability}</Badge>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  {v.greenRating}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="font-bold text-slate-900 dark:text-white text-base">{v.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{v.type} · {v.owner}</div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div><div className="text-[10px] text-slate-400">Capacity</div><div className="font-semibold text-slate-700 dark:text-slate-300">{v.capacity?.toLocaleString()} MT</div></div>
                  <div><div className="text-[10px] text-slate-400">Age</div><div className="font-semibold text-slate-700 dark:text-slate-300">{v.age} yrs</div></div>
                  <div><div className="text-[10px] text-slate-400">Speed</div><div className="font-semibold text-slate-700 dark:text-slate-300">{v.speed} kts</div></div>
                  <div><div className="text-[10px] text-slate-400">Scrubber</div><div className={`font-semibold ${v.scrubber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{v.scrubber ? 'Yes' : 'No'}</div></div>
                </div>
                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-400">Est. Freight</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{v.computedCostLabel ?? `$${v.estimatedCostBase}M`}</span>
                  </div>
                  <Btn className="w-full" onClick={() => setSelected(v)}>Select Vessel</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <VesselDetailModal vessel={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
