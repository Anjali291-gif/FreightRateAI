import React from 'react';
import { Waves } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-700/30 mb-6 bg-slate-900 min-h-[170px] flex items-center">
      {/* Background Cargo Ship Image */}
      <img
        src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1600&auto=format&fit=crop&q=85"
        alt="Cargo Vessel sailing in open ocean"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-75"
      />

      {/* Deep Navy/Oceanic Gradient Overlay matching reference */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/85 to-transparent" />
      <div className="absolute inset-0 bg-blue-950/20 mix-blend-overlay" />

      {/* Banner Content Container */}
      <div className="relative z-10 w-full px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Headline & Subtitles */}
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-sm font-sans">
            AI-Powered Freight Forecasting<br className="hidden sm:inline" /> &amp; Vessel Chartering System
          </h1>
          <div className="mt-3 flex items-center flex-wrap gap-2 text-xs md:text-sm text-slate-200/90 font-medium">
            <span>Predict freight rates</span>
            <span className="text-slate-400">|</span>
            <span>Optimize vessel selection</span>
            <span className="text-slate-400">|</span>
            <span>Make data-driven decisions</span>
          </div>
        </div>

        {/* Right Glassy Quote Card */}
        <div className="hidden lg:flex items-center shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3.5 rounded-xl shadow-lg text-right max-w-xs">
            <p className="text-xs italic text-slate-100 font-light leading-relaxed">
              &ldquo;Smarter logistics today for a more connected tomorrow.&rdquo;
            </p>
            <div className="mt-2 flex justify-end text-sky-300">
              <Waves className="w-5 h-4 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
