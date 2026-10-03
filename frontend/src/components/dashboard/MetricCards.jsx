import React, { useEffect, useState } from 'react';
import { Ship, BarChart3, Fuel, TrendingUp, Anchor, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import apiService from '../../services/api';

const iconMap = {
  Ship: Ship,
  BarChart3: BarChart3,
  Fuel: Fuel,
  TrendingUp: TrendingUp,
  Anchor: Anchor
};

const badgeStyles = {
  Ship: 'bg-blue-50 text-blue-600 border-blue-100',
  BarChart3: 'bg-purple-50 text-purple-600 border-purple-100',
  Fuel: 'bg-amber-50 text-amber-600 border-amber-100',
  TrendingUp: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Anchor: 'bg-sky-50 text-sky-600 border-sky-100'
};

export default function MetricCards() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await apiService.getMetrics();
        if (isMounted) {
          setMetrics(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs h-28 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
            <div className="h-7 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((m) => {
        const IconComponent = iconMap[m.icon] || Ship;
        const iconStyle = badgeStyles[m.icon] || 'bg-blue-50 text-blue-600 border-blue-100';

        return (
          <div
            key={m.id}
            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
          >
            {/* Top row: Icon and Title */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconStyle} shrink-0`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 line-clamp-1">{m.title}</span>
            </div>

            {/* Middle and Bottom Row with Value, Subtitle/Change, and Sparkline */}
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">{m.value}</span>
                  {m.unit && <span className="text-xs font-medium text-slate-400">{m.unit}</span>}
                </div>

                {m.change ? (
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{m.change}</span>
                    <span className="text-slate-400 font-normal ml-0.5">{m.period}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-1 font-normal line-clamp-1">
                    {m.subtitle}
                  </div>
                )}
              </div>

              {/* Sparkline chart */}
              {m.sparklineData && (
                <div className="w-16 h-9 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke={m.sparklineColor || '#2563EB'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
