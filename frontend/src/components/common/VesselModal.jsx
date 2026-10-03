import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Ship, 
  ShieldCheck, 
  Fuel, 
  Gauge, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Award, 
  FileCheck2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';

export default function VesselModal() {
  const { 
    selectedVessel, 
    setSelectedVessel, 
    isVesselModalOpen, 
    setIsVesselModalOpen, 
    cargoQuantity, 
    origin, 
    destination, 
    requiredDate,
    showToast 
  } = useApp();

  const [charterType, setCharterType] = useState('Voyage Charter');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  if (!isVesselModalOpen || !selectedVessel) return null;

  const handleConfirmCharter = async () => {
    setSubmitting(true);
    try {
      const result = await apiService.executeCharter(selectedVessel, {
        charterType,
        cargoQuantity,
        origin,
        destination,
        laycan: requiredDate
      });

      setSuccessResult(result);
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
      showToast(`Fixture confirmed for ${selectedVessel.name}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to confirm charter', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVesselModalOpen(false);
    setSuccessResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{selectedVessel.name}</h3>
              <p className="text-xs text-slate-300 font-medium">{selectedVessel.type} • IMO: {selectedVessel.dwt ? `9${selectedVessel.age}843` : '9784321'} • Flag: {selectedVessel.flag}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successResult ? (
            /* Confirmation Screen */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
                <FileCheck2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Vessel Charter Confirmed!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Electronic fixture note generated with reference{' '}
                <span className="font-mono font-bold text-slate-800">{successResult.charterRef}</span>.
                Recap has been dispatched to vessel master &amp; chartering broker.
              </p>

              <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vessel:</span>
                  <span className="font-bold text-slate-800">{selectedVessel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-bold text-slate-800">{origin} → {destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Freight Rate:</span>
                  <span className="font-bold text-emerald-600">{successResult.confirmedRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Fixture Value:</span>
                  <span className="font-bold text-slate-900">{successResult.totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Laycan Window:</span>
                  <span className="font-bold text-slate-800">{requiredDate}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Vessel Spec & Booking Details */
            <div>
              {/* Image & Quick Specs banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-200 h-32">
                  <img
                    src={selectedVessel.image || '/assets/vessels/fallback.svg'}
                    alt={selectedVessel.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/assets/vessels/fallback.svg'; }}
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Deadweight (DWT)</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedVessel.dwt?.toLocaleString()} MT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Commercial Capacity</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedVessel.capacity?.toLocaleString()} tonnes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Design Speed</span>
                    <span className="font-bold text-slate-800">{selectedVessel.speedKnots} knots</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fuel Consumption</span>
                    <span className="font-bold text-slate-800">{selectedVessel.fuelConsumption}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Scrubber Fitted</span>
                    <span className={`font-semibold ${selectedVessel.scrubberFitted ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {selectedVessel.scrubberFitted ? 'Yes (HSFO Eligible)' : 'No (VLSFO Only)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IMO CII Green Rating</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      Rating {selectedVessel.greenRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chartering Calculation Details */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-blue-900 uppercase tracking-wide">Chartering Quotation Breakdown</span>
                  <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">AI Optimized</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Estimated Cost:</span>
                    <div className="text-lg font-bold text-slate-900 font-mono">{selectedVessel.estimatedCost}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Voyage Distance:</span>
                    <div className="text-sm font-semibold text-slate-800 font-mono">3,600 NM</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Current Position:</span>
                    <div className="text-sm font-semibold text-slate-800">{selectedVessel.currentPort}</div>
                  </div>
                </div>
              </div>

              {/* Charter Type Selection */}
              <div className="mb-5">
                <label className="text-xs font-bold text-slate-700 block mb-2">Charter Contract Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Voyage Charter', 'Time Charter', 'COA (Consecutive)'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCharterType(type)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                        charterType === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCharter}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Locking Fixture...' : 'Confirm Charter Fixture'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
