import { useState, useCallback, useEffect } from 'react'
import './index.css'
import PromptSection from './components/PromptSection'
import SolutionCard  from './components/SolutionCard'
import JudgePanel    from './components/JudgePanel'
import ModeStats     from './components/ModeStats'
import axios from 'axios'

// ─── Config ───────────────────────────────────────────────────────────────────
const MODEL_1 = { name: 'MISTRAL-AI',      icon: '🤖', color: '#60a5fa' }
const MODEL_2 = { name: 'COHERE-AI',  icon: '🧠', color: '#a78bfa' }

const MODE_COLORS = {
  creative:    '#fbbf24',
  coding:      '#60a5fa',
  explanation: '#a78bfa',
}

const STATS_KEY = 'arena_mode_stats_v1'

const DEFAULT_STATS = {
  creative:    { wins: 0, losses: 0, draws: 0 },
  coding:      { wins: 0, losses: 0, draws: 0 },
  explanation: { wins: 0, losses: 0, draws: 0 },
}

// ─── Mock API — replace with your real fetch ──────────────────────────────────


// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ mode }) {
  const modeColor = MODE_COLORS[mode] || '#a78bfa'
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-3.5"
      style={{ background: 'rgba(7,9,15,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }}>⚔️</div>
        <span className="font-black text-white text-base tracking-tight">
          AI <span className="text-grad">Battle</span> Arena
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: `${modeColor}12`, border: `1px solid ${modeColor}30`, color: modeColor }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: modeColor }}></span>
          Gemini Judge Active
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live
        </div>
      </div>
    </nav>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode]           = useState('coding')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult]       = useState(null)  // { problem, solution_1, solution_2, judge }
  const [stats, setStats]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || DEFAULT_STATS }
    catch { return DEFAULT_STATS }
  })

  const modeColor = MODE_COLORS[mode] || '#a78bfa'

  // Persist stats
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }, [stats])

  const handleBattle = useCallback(async ({ prompt, mode: m }) => {
    setIsLoading(true)
    setResult(null)
    setMode(m)
    try {
      // ── Replace mockBattle with your real API ──────────────────────────────
      
      const response=await axios.post("http://localhost:3000/get-graph",{
        prompt:prompt
      });

      const data=response.data.result;
      console.log(data);
      // ──────────────────────────────────────────────────────────────────────

      setResult(data)

      // Update mode stats
      const j = data.judge
      const outcome =
        j.solution_1_score > j.solution_2_score ? 'wins' :
        j.solution_2_score > j.solution_1_score ? 'losses' : 'draws'

      setStats(prev => ({
        ...prev,
        [m]: {
          ...prev[m],
          [outcome]: (prev[m]?.[outcome] || 0) + 1
        }
      }))

    } catch (err) {
      console.error('Battle error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRematch = useCallback(() => {
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleModeChange = useCallback((m) => {
    setMode(m)
    if (!isLoading) setResult(null)
  }, [isLoading])

  const winner = result?.judge
    ? result.judge.solution_1_score > result.judge.solution_2_score ? 1
    : result.judge.solution_2_score > result.judge.solution_1_score ? 2 : 0
    : null

  return (
    <div className="min-h-screen bg-grid" style={{ background: '#07090f' }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div className="orb1 absolute rounded-full"
          style={{ width:560, height:560, top:'-120px', left:'-80px', background:'radial-gradient(circle,rgba(59,130,246,0.075) 0%,transparent 70%)' }} />
        <div className="orb2 absolute rounded-full"
          style={{ width:480, height:480, top:'30%', right:'-60px', background:'radial-gradient(circle,rgba(124,58,237,0.08) 0%,transparent 70%)' }} />
        <div className="orb1 absolute rounded-full"
          style={{ width:360, height:360, bottom:'8%', left:'25%', background:'radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)' }} />
      </div>

      <Navbar mode={mode} />

      <main className="relative z-10 pt-20">

        {/* ── TOP: Hero + Prompt ─────────────────────────────────────────── */}
        <section className="flex flex-col items-center px-4 pt-12 pb-10">

          {/* Badge */}
          <div className="anim-slide-up mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: `${modeColor}10`, border: `1px solid ${modeColor}25`, color: modeColor }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: modeColor }}></span>
            MISTRAL-AI vs COHERE-AI · Judged by Gemini
          </div>

          {/* Headline */}
          <h1 className="anim-slide-up delay-1 text-center font-black tracking-tight mb-3"
            style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', lineHeight: 1.08 }}>
            <span className="text-grad">AI Battle</span>
            <span className="text-white"> Arena</span>
          </h1>
          <p className="anim-slide-up delay-2 text-center text-slate-400 text-sm mb-10 max-w-lg" style={{ lineHeight: 1.75 }}>
            Enter a prompt, pick a mode, and watch two AI models go head-to-head.
            Gemini evaluates and crowns the winner.
          </p>

          {/* Prompt + mode selector */}
          <div className="w-full max-w-2xl anim-slide-up delay-3">
            <PromptSection
              onBattle={handleBattle}
              isLoading={isLoading}
              selectedMode={mode}
              onModeChange={handleModeChange}
            />
          </div>
        </section>

        {/* ── MIDDLE: Battle results ─────────────────────────────────────── */}
        {(isLoading || result) && (
          <section className="px-4 pb-8 max-w-[1400px] mx-auto">
            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,transparent,${modeColor}40)` }} />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${modeColor}10`, border: `1px solid ${modeColor}25`, color: modeColor }}>
                <span className="animate-pulse w-1.5 h-1.5 rounded-full" style={{ background: modeColor }}></span>
                Battle Arena
              </div>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${modeColor}40,transparent)` }} />
            </div>

            {/* Problem pill */}
            {result?.problem && (
              <div className="mb-6 px-4 py-3 rounded-xl anim-fade-in"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mr-2">Prompt:</span>
                <span className="text-slate-300 text-xs">{result.problem}</span>
              </div>
            )}

            {/* 3-column layout on xl, stacked below */}
            <div className="grid gap-5 xl:grid-cols-[1fr_300px_1fr] items-start">

              {/* Solution 1 */}
              <SolutionCard
                side="left"
                modelName={MODEL_1.name}
                modelIcon={MODEL_1.icon}
                response={result?.solution_1}
                isLoading={isLoading}
                isWinner={winner === 1}
                modeColor={MODEL_1.color}
              />

              {/* Right panel: Judge + Stats (stacked) */}
              <div className="order-last xl:order-none space-y-4">
                <JudgePanel
                  judgeData={result?.judge}
                  isLoading={isLoading}
                  model1Name={MODEL_1.name}
                  model1Icon={MODEL_1.icon}
                  model2Name={MODEL_2.name}
                  model2Icon={MODEL_2.icon}
                  modeColor={modeColor}
                  onRematch={result ? handleRematch : null}
                />
                {!isLoading && (
                  <ModeStats stats={stats} currentMode={mode} />
                )}
              </div>

              {/* Solution 2 */}
              <SolutionCard
                side="right"
                modelName={MODEL_2.name}
                modelIcon={MODEL_2.icon}
                response={result?.solution_2}
                isLoading={isLoading}
                isWinner={winner === 2}
                modeColor={MODEL_2.color}
              />
            </div>
          </section>
        )}

        {/* ── BOTTOM: Mode Stats when no battle yet ─────────────────────── */}
        {!isLoading && !result && (
          <section className="px-4 pb-16 max-w-sm mx-auto">
            <ModeStats stats={stats} currentMode={mode} />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-8 px-6 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>⚔️</span>
            <span className="text-xs text-slate-500 font-medium">AI Battle Arena</span>
          </div>
          <p className="text-[11px] text-slate-700">GPT-4o vs Claude 3.5 · Judged by Gemini · Built for developers</p>
          <div className="flex gap-4">
            {['GitHub', 'Discord'].map(s => (
              <a key={s} href="#" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}