import React, { useState } from 'react';
import {
  FileText, Download, Eye, PlusCircle, Printer
} from 'lucide-react';
import { MOCK_REPORTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function ReportsView() {
  const { toast } = useApp();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [filterType, setFilterType] = useState('All');

  const filtered = filterType === 'All'
    ? reports
    : reports.filter(r => r.type?.includes(filterType));

  const handleDownloadCSV = (rep) => {
    const csv = `data:text/csv;charset=utf-8,Report Title,Type,Date,Author,Route,Commodity,Summary\n"${rep.title}","${rep.type}","${rep.date}","${rep.author}","${rep.route}","${rep.commodity}","${rep.summary}"`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `${rep.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast?.(`Downloaded: ${rep.title}`, 'success');
  };

  const FILTER_TABS = ['All', 'Forecast', 'Vessel', 'Cost', 'Risk'];

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Strategic Documentation
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Intelligence &amp; Executive Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated intelligence dossiers on freight volatility, fleet selection audits, and bunker sensitivity analyses.
          </p>
        </div>
        <button
          onClick={() => {
            const newRep = {
              id: `rep-${Date.now()}`,
              title: `Ad-hoc Freight Audit – ${new Date().toLocaleDateString()}`,
              type: 'Forecast Report',
              date: 'Just now',
              author: 'Live AI Generator',
              fileSize: '1.2 MB',
              route: 'Australia → China',
              commodity: 'Iron Ore',
              summary: 'Real-time snapshot generated from active dashboard parameters.',
            };
            setReports([newRep, ...reports]);
            setSelectedReport(newRep);
            toast?.('Generated fresh intelligence report', 'success');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Generate New Report
        </button>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab} Reports
          </button>
        ))}
      </div>

      {/* ── Reports Grid + Preview ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Report List */}
        <div className="lg:col-span-7 space-y-4">
          {filtered.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                      {rep.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {rep.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium flex-wrap">
                      <span>{rep.date}</span>
                      <span>•</span>
                      <span>{rep.author}</span>
                      <span>•</span>
                      <span className="font-mono">{rep.fileSize}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed pl-12 line-clamp-2">
                  {rep.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between pl-12">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Route: <span className="font-semibold text-slate-700 dark:text-slate-300">{rep.route}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedReport(rep); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadCSV(rep); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Dossier Panel */}
        <div className="lg:col-span-5">
          {selectedReport ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-20 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Document Dossier
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadCSV(selectedReport)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Export CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded uppercase border border-blue-100 dark:border-blue-900">
                  {selectedReport.type}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{selectedReport.title}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Published: {selectedReport.date} by {selectedReport.author}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
                {[
                  { label: 'Corridor',              value: selectedReport.route },
                  { label: 'Commodity',             value: selectedReport.commodity },
                  { label: 'Engine Classification', value: 'Ensemble LSTM Transformer' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">{label}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Target Confidence:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">94.2%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedReport.summary}
                </p>
              </div>

              <button
                onClick={() => handleDownloadCSV(selectedReport)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Complete Report Package
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              Select a report from the list to preview details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
