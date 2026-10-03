import React from 'react';

export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`
      bg-white dark:bg-slate-900
      rounded-2xl border border-slate-200/80 dark:border-slate-800
      shadow-sm
      ${padding ? 'p-5' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, iconColor = 'blue', action }) {
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900',
    green:  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900',
    sky:    'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  };
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[iconColor] ?? colorMap.blue}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg ${className}`} />;
}

export function Badge({ children, color = 'blue' }) {
  const map = {
    blue:   'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green:  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    orange: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    red:    'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    gray:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[color] ?? map.gray}`}>
      {children}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
                     text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
      Demo Data
    </span>
  );
}

export function Select({ label, value, onChange, options, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs font-semibold
                   text-slate-700 dark:text-slate-200
                   bg-slate-50 dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700
                   rounded-lg px-3 py-1.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                   cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'sm', disabled = false, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { xs: 'text-[11px] px-2.5 py-1', sm: 'text-xs px-3.5 py-1.5', md: 'text-sm px-4 py-2' };
  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    ghost:     'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
    outline:   'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
    danger:    'bg-rose-600 hover:bg-rose-700 text-white',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant] ?? variants.primary} ${className}`}>
      {children}
    </button>
  );
}
