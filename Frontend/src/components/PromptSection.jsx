import React, { useState, useRef } from 'react';

const MODES = [
  {
    id: 'creative',
    label: 'Creative',
    icon: '✨',
    desc: 'Imaginative writing & brainstorming',
    color: '#fbbf24',
    placeholder: 'Write a story about a robot who discovers emotions...',
  },
  {
    id: 'coding',
    label: 'Coding',
    icon: '⚡',
    desc: 'Code generation & debugging',
    color: '#60a5fa',
    placeholder: 'Implement a binary search tree with insertion and traversal...',
  },
  {
    id: 'explanation',
    label: 'Explanation',
    icon: '🧠',
    desc: 'Concepts & deep-dives',
    color: '#a78bfa',
    placeholder: 'Explain how transformers work in large language models...',
  },
];

export default function PromptSection({ onBattle, isLoading, selectedMode, onModeChange }) {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const mode = MODES.find(m => m.id === selectedMode) || MODES[0];

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onBattle({ prompt: prompt.trim(), mode: selectedMode });
  };

  const handleKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
  };

  const inputBorderColor = focused
    ? mode.id === 'creative' ? 'rgba(251,191,36,0.5)' : mode.id === 'coding' ? 'rgba(59,130,246,0.5)' : 'rgba(139,92,246,0.5)'
    : 'rgba(255,255,255,0.08)';
  const inputShadow = focused
    ? mode.id === 'creative' ? '0 0 0 3px rgba(251,191,36,0.1), 0 12px 40px rgba(0,0,0,0.3)' : mode.id === 'coding' ? '0 0 0 3px rgba(59,130,246,0.12), 0 12px 40px rgba(0,0,0,0.3)' : '0 0 0 3px rgba(139,92,246,0.12), 0 12px 40px rgba(0,0,0,0.3)'
    : '0 8px 32px rgba(0,0,0,0.25)';

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Mode selector */}
      <div className="flex gap-3 mb-5 justify-center flex-wrap">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`mode-btn glass-light flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold anim-slide-up delay-${i + 1}`}
            style={{ opacity: 0, color: selectedMode === m.id ? undefined : '#64748b' }}
            data-active={selectedMode === m.id}
            {...(selectedMode === m.id ? { className: `mode-btn active-${m.id} glass-light flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold anim-slide-up delay-${i + 1}` } : {})}
          >
            <span className="text-base">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <p className="text-center text-xs mb-4 anim-fade-in" style={{ color: mode.color, opacity: 0.8 }}>
        {mode.desc}
      </p>

      {/* Input box */}
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          background: 'rgba(13,17,28,0.8)',
          border: `1px solid ${inputBorderColor}`,
          boxShadow: inputShadow,
        }}
      >
        <div className="absolute left-4 top-[18px] opacity-40">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKey}
          placeholder={mode.placeholder}
          rows={4}
          className="w-full resize-none bg-transparent text-white text-sm leading-relaxed outline-none placeholder-slate-600"
          style={{ padding: '18px 18px 14px 44px' }}
        />
        <div className="flex items-center justify-between px-4 pb-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">{prompt.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600 hidden sm:block">Ctrl+Enter to submit</span>
          </div>
          <button
            id="battle-btn"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="btn-battle flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="dot w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                  <span className="dot w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                  <span className="dot w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                </span>
                Battling…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Start Battle
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
