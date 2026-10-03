import React, { useState, useEffect } from 'react';
import { Ship, Search, Calendar, MapPin, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

export default function VesselSelection() {
  const { 
    cargoQuantity, 
    setCargoQuantity, 
    origin, 
    setOrigin, 
    destination, 
    setDestination, 
    requiredDate, 
    setRequiredDate,
    handleSelectVessel,
    setActiveTab,
    showToast
  } = useApp();

  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Local form inputs
  const [inputQty, setInputQty] = useState(cargoQuantity);
  const [inputOrigin, setInputOrigin] = useState(origin);
  const [inputDest, setInputDest] = useState(destination);
  const [inputDate, setInputDate] = useState(requiredDate);

  const fetchVessels = async (qty, orig, dest, date) => {
    setLoading(true);
    try {
      const list = await apiService.searchVessels({
        cargoQuantity: qty,
        origin: orig,
        destination: dest,
        requiredDate: date
      });
      // Show first 5 on the dashboard matching reference image
      setVessels(list.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels(cargoQuantity, origin, destination, requiredDate);
  }, []);

  const handleFindVessels = (e) => {
    e.preventDefault();
    setCargoQuantity(Number(inputQty));
    setOrigin(inputOrigin);
    setDestination(inputDest);
    setRequiredDate(inputDate);
    fetchVessels(inputQty, inputOrigin, inputDest, inputDate);
    showToast(`Found matching vessels for ${inputOrigin} → ${inputDest}`, 'info');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
      {/* Title & "View All Vessels" link */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Ship className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Vessel Selection</h2>
        </div>
        <button
          onClick={() => setActiveTab('vessels')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition hover:translate-x-0.5"
        >
          View All Vessels <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Form matching reference */}
      <form onSubmit={handleFindVessels} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-4 items-end">
        {/* Cargo Quantity */}
        <div className="lg:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Cargo Quantity (tonnes)
          </label>
          <input
            type="number"
            value={inputQty}
            onChange={(e) => setInputQty(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="50,000"
          />
        </div>

        {/* Origin */}
        <div className="lg:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Origin
          </label>
          <select
            value={inputOrigin}
            onChange={(e) => setInputOrigin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="Australia">Australia</option>
            <option value="Brazil">Brazil</option>
            <option value="US Gulf">US Gulf</option>
            <option value="Indonesia">Indonesia</option>
          </select>
        </div>

        {/* Destination */}
        <div className="lg:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Destination
          </label>
          <select
            value={inputDest}
            onChange={(e) => setInputDest(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="China">China</option>
            <option value="India">India</option>
            <option value="Japan">Japan</option>
            <option value="Europe">Europe</option>
          </select>
        </div>

        {/* Required Date */}
        <div className="lg:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Required Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg pl-8 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Find Vessels Button */}
        <div className="lg:col-span-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-2 rounded-lg shadow-xs transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Finding...' : 'Find Vessels'}
          </button>
        </div>
      </form>

      {/* Vessels Data Table matching reference */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200/60">
              <th className="py-3 px-4">Vessel Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Capacity (tonnes)</th>
              <th className="py-3 px-3">Age (yrs)</th>
              <th className="py-3 px-3">Estimated Freight Cost</th>
              <th className="py-3 px-3">Availability</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {vessels.map((v) => {
              const isAvailable = v.availabilityStatus === 'available';
              return (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Vessel Name with Thumbnail */}
                  <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-3">
                    <img
                      src={v.image || '/assets/vessels/fallback.svg'}
                      alt={v.name}
                      className="w-10 h-7 object-cover rounded-md border border-slate-200 shadow-2xs"
                      onError={e => { e.currentTarget.src = '/assets/vessels/fallback.svg'; }}
                    />
                    <div>
                      <span className="block font-bold text-slate-800">{v.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{v.flag} • DWT {v.dwt.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-2.5 px-3 text-slate-600">{v.type}</td>

                  {/* Capacity */}
                  <td className="py-2.5 px-3 font-mono">{v.capacity.toLocaleString()}</td>

                  {/* Age */}
                  <td className="py-2.5 px-3 font-mono">{v.age}</td>

                  {/* Estimated Freight Cost */}
                  <td className="py-2.5 px-3 font-bold font-mono text-slate-800">{v.estimatedCost}</td>

                  {/* Availability badge */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {v.availability}
                    </span>
                  </td>

                  {/* Select Button */}
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleSelectVessel(v)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs transition duration-150 cursor-pointer"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
