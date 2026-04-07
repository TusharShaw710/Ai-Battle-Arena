import React, { useState, useEffect, useRef } from 'react';

/* ── Animated radial score ring ────────────────────────────────────────────── */
function ScoreRing({ score, color, size = 96, delay = 0 }) {
  const [progress, setProgress] = useState(0);
  const [numDisplay, setNumDisplay] = useState(0);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(score / 10);
      // Count-up
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setNumDisplay(+(score * eased).toFixed(1));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const offset = circ - progress * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: `stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
              filter: `drop-shadow(0 0 5px ${color}90)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-white tabular-nums" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{numDisplay.toFixed(1)}</span>
          <span className="text-slate-500 text-[10px] mt-0.5">/10</span>
        </div>
      </div>
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────────────────── */
function Bar({ score, color, label, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(score * 10), delay + 300);
    return () => clearTimeout(t);
  }, [score, delay]);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-[1300ms] ease-out"
          style={{ width: `${w}%`, background: `linear-gradient(90deg,${color},${color}80)`, boxShadow: `0 0 6px ${color}60` }} />
      </div>
    </div>
  );
}

/* ── Reasoning block ──────────────────────────────────────────────────────── */
function Reasoning({ title, icon, text, color, isWinner }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <button className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
          {isWinner && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
              Winner ✓
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <p className="px-4 pb-3.5 text-xs text-slate-300 leading-relaxed" style={{ borderTop: `1px solid ${color}15` }}>
          {text}
        </p>
      )}
    </div>
  );
}

/* ── Main JudgePanel ──────────────────────────────────────────────────────── */
export default function JudgePanel({
  judgeData, isLoading,
  model1Name, model1Icon,
  model2Name, model2Icon,
  modeColor, onRematch,
}) {
  const [show, setShow] = useState(false);
  const accent = modeColor || '#a78bfa';

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* ─── Skeleton ─── */
  if (isLoading) return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${accent}30` }}>
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)',background:`linear-gradient(135deg,${accent}10,transparent)` }}>
        <div className="skeleton w-10 h-10 rounded-xl"></div>
        <div><div className="skeleton w-28 h-4 rounded mb-2"></div><div className="skeleton w-40 h-3 rounded"></div></div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-around">
          <div className="skeleton w-20 h-20 rounded-full"></div>
          <div className="skeleton w-20 h-20 rounded-full"></div>
        </div>
        {[1,2,3,4,5].map(i=><div key={i} className="skeleton h-2.5 rounded" style={{width:`${70+i*5}%`}}></div>)}
      </div>
    </div>
  );

  if (!judgeData) return null;

  const { solution_1_score, solution_2_score, solution_1_reasoning, solution_2_reasoning } = judgeData;
  const winner = solution_1_score > solution_2_score ? 1 : solution_2_score > solution_1_score ? 2 : 0;
  const gap = Math.abs(solution_1_score - solution_2_score).toFixed(1);

  return (
    <div className={`glass h-145 rounded-2xl overflow-y-auto transition-all duration-500 ${show ? 'anim-slide-up' : 'opacity-0'}`}
      style={{ border: `1px solid ${accent}35`, boxShadow: `0 0 50px ${accent}10, 0 4px 30px rgba(0,0,0,0.4)` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: `linear-gradient(135deg,${accent}10,rgba(59,130,246,0.05))` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${accent}20`, border: `1px solid ${accent}35` }}>
            ⚖️
          </div>
          <div>
            <p className="text-white font-bold text-sm">Gemini Judge</p>
            <p className="text-xs text-slate-500">AI-powered evaluation</p>
          </div>
        </div>
        {onRematch && (
          <button onClick={onRematch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Rematch
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">

        {/* Winner banner */}
        {winner !== 0 && (
          <div className="flex items-center justify-center gap-3 py-3 rounded-xl anim-pop-in"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.03))', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="crown text-xl">👑</span>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">Battle Winner</p>
              <p className="text-white font-bold text-sm mt-0.5">{winner === 1 ? model1Name : model2Name}</p>
              <p className="text-[10px] text-slate-500">Wins by {gap} points</p>
            </div>
            <span className="crown text-xl">👑</span>
          </div>
        )}
        {winner === 0 && (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
            style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)' }}>
            <span className="text-lg">🤝</span>
            <span className="text-slate-300 font-semibold text-sm">It's a Draw!</span>
          </div>
        )}

        {/* Score rings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{model1Icon}</span>
              <span className="text-xs font-semibold text-slate-300">{model1Name}</span>
            </div>
            <ScoreRing score={solution_1_score} color={winner === 1 ? '#10b981' : '#60a5fa'} delay={200} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{model2Icon}</span>
              <span className="text-xs font-semibold text-slate-300">{model2Name}</span>
            </div>
            <ScoreRing score={solution_2_score} color={winner === 2 ? '#10b981' : accent} delay={400} />
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Score Comparison</p>
          <Bar score={solution_1_score} color={winner === 1 ? '#10b981' : '#60a5fa'} label={model1Name} delay={200} />
          <Bar score={solution_2_score} color={winner === 2 ? '#10b981' : accent} label={model2Name} delay={400} />
        </div>

        {/* Reasoning */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Judge Reasoning</p>
          <Reasoning
            title={model1Name} icon={winner===1?'✅':model1Icon}
            text={solution_1_reasoning}
            color={winner===1?'#10b981':'#60a5fa'}
            isWinner={winner===1}
          />
          <Reasoning
            title={model2Name} icon={winner===2?'✅':model2Icon}
            text={solution_2_reasoning}
            color={winner===2?'#10b981':accent}
            isWinner={winner===2}
          />
        </div>
      </div>
    </div>
  );
}
