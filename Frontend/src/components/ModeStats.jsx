import React, { useEffect, useState } from 'react';

const MODE_CONFIG = {
  creative:    { label: 'Creative',    icon: '✨', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)'  },
  coding:      { label: 'Coding',      icon: '⚡', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.25)'  },
  explanation: { label: 'Explanation', icon: '🧠', color: '#a78bfa', bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.25)'  },
};

function StatBar({ value, max, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(max > 0 ? (value / max) * 100 : 0), 300);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color},${color}80)`, boxShadow: `0 0 5px ${color}50` }} />
    </div>
  );
}

export default function ModeStats({ stats, currentMode }) {
  const cfg = MODE_CONFIG[currentMode] || MODE_CONFIG.creative;
  const s = stats[currentMode] || { wins: 0, losses: 0, draws: 0 };
  const total = s.wins + s.losses + s.draws;
  const winPct = total > 0 ? Math.round((s.wins / total) * 100) : 0;

  const rows = [
    { label: 'MISTRAL',   value: s.wins,   color: '#10b981', icon: '🏆' },
    { label: 'COHERE', value: s.losses, color: '#f87171', icon: '🏆' },
    { label: 'Draws',  value: s.draws,  color: '#94a3b8', icon: '🤝' },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden anim-slide-up"
      style={{ border: `1px solid ${cfg.border}` }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: cfg.bg }}>
        <span className="text-base">{cfg.icon}</span>
        <div>
          <p className="text-white font-bold text-sm">{cfg.label} Mode Stats</p>
          <p className="text-slate-500 text-[10px]">{total} battles in this mode</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Win percentage */}
        <div className="flex items-end justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">HEAD 2 HEAD%</span>
          <span className="font-black text-3xl tabular-nums" style={{ color: cfg.color, lineHeight: 1 }}>{winPct}%</span>
        </div>

        {/* Win rate bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${winPct}%`,
              background: `linear-gradient(90deg,${cfg.color},${cfg.color}70)`,
              boxShadow: `0 0 8px ${cfg.color}60`,
              transitionDelay: '200ms',
            }} />
        </div>

        {/* Stats rows */}
        <div className="space-y-2 pt-1">
          {rows.map(row => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="text-xs">{row.icon}</span>
              <span className="text-xs text-slate-400 w-12 shrink-0">{row.label}</span>
              <StatBar value={row.value} max={total || 1} color={row.color} />
              <span className="text-xs font-bold tabular-nums w-4 text-right" style={{ color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Battle count chip */}
        {total === 0 && (
          <p className="text-center text-xs text-slate-600 py-2">
            No battles yet in {cfg.label} mode. Start one! 🚀
          </p>
        )}
      </div>
    </div>
  );
}
