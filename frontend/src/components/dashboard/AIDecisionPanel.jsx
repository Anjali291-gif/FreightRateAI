import React from 'react';
import { BrainCircuit, CheckCircle2, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_AI_DECISION } from '../../data/mockData';

export default function AIDecisionPanel() {
  const { setActiveTab } = useApp();
  const decision = MOCK_AI_DECISION;

  const riskBadgeClass = (risk) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">AI Decision Support</h2>
          </div>
          <button
            onClick={() => setActiveTab('decision')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Detailed Optimizer →
          </button>
        </div>

        {/* Recommended Action Box (Green Banner matching reference image) */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-left relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                {decision.actionTitle}
              </h3>
              <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed font-medium">
                {decision.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Comparison Table */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Cost Comparison</span>
            <span className="text-[11px] text-slate-400">Fixed rate locking vs Delay</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                  <th className="py-2.5 px-3">Option</th>
                  <th className="py-2.5 px-3">Total Estimated Cost</th>
                  <th className="py-2.5 px-3">Expected Freight Rate</th>
                  <th className="py-2.5 px-3 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {decision.costComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.option}</td>
                    <td className="py-2.5 px-3 font-mono">{row.estimatedCost}</td>
                    <td className="py-2.5 px-3">{row.expectedRate}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${riskBadgeClass(row.risk)}`}>
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Factors Considered */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">Key Factors Considered</span>
          <ul className="space-y-1.5">
            {decision.keyFactors.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
