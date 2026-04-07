import React, { useState, useEffect } from 'react';

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch {}
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
      style={{
        background: done ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
        border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
        color: done ? '#10b981' : '#94a3b8',
      }}>
      {done
        ? <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Copied</>
        : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy</>
      }
    </button>
  );
}

/** Very lightweight markdown renderer */
function MD({ content }) {
  const lines = content.split('\n');
  const out = [];
  let k = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('### '))      out.push(<h3 key={k++} className="font-bold text-white text-sm mt-4 mb-1.5">{l.slice(4)}</h3>);
    else if (l.startsWith('## '))  out.push(<h2 key={k++} className="font-bold text-white text-base mt-4 mb-2">{l.slice(3)}</h2>);
    else if (l.startsWith('# '))   out.push(<h1 key={k++} className="font-extrabold text-white text-lg mt-4 mb-2">{l.slice(2)}</h1>);
    else if (l.startsWith('- ') || l.startsWith('* ')) {
      out.push(
        <div key={k++} className="flex items-start gap-2 py-0.5">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#7c3aed' }}></span>
          <span className="text-slate-300 text-xs leading-relaxed">{l.slice(2)}</span>
        </div>
      );
    } else if (l.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      out.push(
        <pre key={k++} className="my-2 p-3 rounded-xl text-xs leading-relaxed overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', color: '#86efac' }}>
          {code.join('\n')}
        </pre>
      );
    } else if (l === '') {
      out.push(<div key={k++} className="h-1.5" />);
    } else {
      const html = l
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded text-emerald-300 text-xs" style="background:rgba(0,0,0,0.35)">$1</code>');
      out.push(<p key={k++} className="text-slate-300 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />);
    }
  }
  return <div className="space-y-0.5">{out}</div>;
}

export default function SolutionCard({ side, modelName, modelIcon, response, isLoading, isWinner, modeColor }) {
  const [expanded, setExpanded] = useState(false);
  const [show, setShow] = useState(false);

  const isLeft = side === 'left';
  const accent = modeColor || (isLeft ? '#60a5fa' : '#a78bfa');
  const label = isLeft ? 'Solution 1' : 'Solution 2';

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setShow(true), isLeft ? 80 : 160);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [isLoading]);

  /* ─── Skeleton ─── */
  if (isLoading) {
    return (
      <div className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid rgba(255,255,255,0.07)` }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="skeleton w-9 h-9 rounded-xl"></div>
          <div>
            <div className="skeleton w-24 h-3.5 rounded mb-2"></div>
            <div className="skeleton w-14 h-2.5 rounded"></div>
          </div>
        </div>
        <div className="p-5 space-y-2.5">
          {[95,80,88,65,75,50,70,60].map((w,i)=>(
            <div key={i} className="skeleton rounded" style={{ width:`${w}%`, height:'11px' }}></div>
          ))}
          <div className="flex items-center gap-2 mt-4">
            <span className="dot w-2 h-2 rounded-full inline-block" style={{ background: accent }}></span>
            <span className="dot w-2 h-2 rounded-full inline-block" style={{ background: accent }}></span>
            <span className="dot w-2 h-2 rounded-full inline-block" style={{ background: accent }}></span>
            <span className="text-xs ml-1" style={{ color: accent }}>Generating…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const preview = response.length > 900 ? response.slice(0, 900) + '…' : response;
  const shown   = expanded ? response : preview;
  const canExpand = response.length > 900;

  return (
    <div
      className={`glass rounded-2xl overflow-hidden transition-all duration-500 ${show ? 'anim-slide-up' : 'opacity-0'} ${isWinner ? 'winner-glow' : ''}`}
      style={{
        border: isWinner ? '1px solid rgba(16,185,129,0.45)' : `1px solid rgba(255,255,255,0.07)`,
        opacity: show ? undefined : 0,
      }}
    >
      {/* Winner ribbon */}
      {isWinner && (
        <div className="flex items-center justify-center gap-2 py-1.5 text-xs font-bold tracking-widest uppercase"
          style={{ background: 'linear-gradient(90deg,rgba(16,185,129,0.18),rgba(16,185,129,0.06))', color: '#34d399' }}>
          <span className="crown text-base">👑</span> Winner <span className="crown text-base">👑</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: `linear-gradient(135deg,${accent}12,transparent)` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            {modelIcon}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{modelName}</p>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>{label}</span>
          </div>
        </div>
        <CopyBtn text={response} />
      </div>

      {/* Content */}
      <div className="p-5 max-h-[480px] overflow-y-auto">
        <MD content={shown} />
      </div>

      {/* Expand */}
      {canExpand && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-80"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: accent }}>
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
          {expanded ? 'Collapse' : `Show full response`}
        </button>
      )}
    </div>
  );
}
