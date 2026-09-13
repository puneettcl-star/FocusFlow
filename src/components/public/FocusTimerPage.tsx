import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Moon, 
  Sun, 
  Brain, 
  Flame, 
  EyeOff, 
  Zap, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { SEO_PAGES, updatePageSeo } from '../../utils/seo';

interface FocusTimerPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

type FocusTheme = 'oled' | 'sepia' | 'matcha' | 'slate';

export const FocusTimerPage: React.FC<FocusTimerPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace
}) => {
  useEffect(() => {
    updatePageSeo(SEO_PAGES.focusTimer);
    window.scrollTo(0, 0);
  }, []);

  // Timer State
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusTheme, setFocusTheme] = useState<FocusTheme>('slate');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commitmentPledge, setCommitmentPledge] = useState(false);

  // Ambient audio state
  const [activeNoise, setActiveNoise] = useState<'off' | 'brown' | 'alpha'>('off');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundSourceRef = useRef<AudioNode | null>(null);

  // Set duration
  const handleSelectMinutes = (m: number) => {
    setDurationMinutes(m);
    setIsRunning(false);
    setSecondsRemaining(m * 60);
  };

  // Timer tick
  useEffect(() => {
    let t: any = null;
    if (isRunning && secondsRemaining > 0) {
      t = setInterval(() => {
        setSecondsRemaining(s => s - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      playGong();
    }
    return () => clearInterval(t);
  }, [isRunning, secondsRemaining]);

  const playGong = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch (_) {}
  };

  const toggleNoise = (noiseType: 'off' | 'brown' | 'alpha') => {
    if (soundSourceRef.current) {
      try {
        (soundSourceRef.current as any).disconnect();
      } catch (_) {}
      soundSourceRef.current = null;
    }
    setActiveNoise(noiseType);
    if (noiseType === 'off') return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (noiseType === 'brown') {
        // Brown noise generation
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 1.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(ctx.destination);
        noise.start();
        soundSourceRef.current = noise;
      } else if (noiseType === 'alpha') {
        // 10Hz Alpha relaxation focus carrier
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.04;
        osc1.frequency.value = 150;
        osc2.frequency.value = 160; // 10Hz difference
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        soundSourceRef.current = gain;
      }
    } catch (_) {}
  };

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Theme palettes
  const themeStyles: Record<FocusTheme, { bg: string; text: string; sub: string; accent: string; card: string }> = {
    slate: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      sub: 'text-slate-400',
      accent: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      card: 'bg-slate-900 border-slate-800'
    },
    oled: {
      bg: 'bg-black',
      text: 'text-neutral-100',
      sub: 'text-neutral-500',
      accent: 'bg-neutral-800 hover:bg-neutral-700 text-white',
      card: 'bg-neutral-950 border-neutral-900'
    },
    sepia: {
      bg: 'bg-[#F4ECE1]',
      text: 'text-[#4A3B32]',
      sub: 'text-[#7D6B5D]',
      accent: 'bg-[#8C5E3C] hover:bg-[#724B2F] text-amber-50',
      card: 'bg-[#EFE5D5] border-[#DECDBB]'
    },
    matcha: {
      bg: 'bg-[#1D2B24]',
      text: 'text-[#E1EBE4]',
      sub: 'text-[#88A393]',
      accent: 'bg-[#406852] hover:bg-[#325241] text-emerald-50',
      card: 'bg-[#25372E] border-[#2F473B]'
    }
  };

  const curStyle = themeStyles[focusTheme];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <PublicHeader 
        currentPath="/focus-timer" 
        onNavigate={onNavigate} 
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Minimalist Focus Timer</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Distraction-Free Ambient Focus Clock</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Minimalist Focus Timer
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Zero clutter, zero visual distraction. Full-screen immersion designed for intense problem-solving, programming, and long-form thesis writing.
          </p>
        </section>

        {/* Focus Timer Application Sandbox */}
        <section 
          className={`max-w-3xl mx-auto rounded-3xl border p-6 sm:p-12 shadow-2xl space-y-8 transition-colors ${curStyle.bg} ${curStyle.text} border-slate-800/80`}
          aria-label="Minimalist Focus Timer Canvas"
        >
          {/* Top Bar: Minutes & Themes */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5">
              {[25, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMinutes(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    durationMinutes === m
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`text-[11px] font-medium ${curStyle.sub}`}>Atmosphere:</span>
              {(['slate', 'oled', 'sepia', 'matcha'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFocusTheme(t)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                    focusTheme === t
                      ? 'bg-white text-slate-950'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Huge Minimalist Readout */}
          <div className="text-center py-6 sm:py-12 space-y-4">
            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter tabular-nums select-none">
              {timeFormatted}
            </div>

            {/* Commitment Pledge */}
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setCommitmentPledge(!commitmentPledge)}
                className={`text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer inline-flex items-center gap-2 ${
                  commitmentPledge
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {commitmentPledge ? 'Deep Focus Pledge Active: No Tabs Allowed' : 'Click to Pledge Undivided Attention'}
                </span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setSecondsRemaining(durationMinutes * 60);
              }}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : curStyle.accent
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? 'Pause Flow' : 'Enter Focus Flow'}</span>
            </button>
          </div>

          {/* Bottom Ambient Soundbar */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className={`flex items-center gap-2 ${curStyle.sub}`}>
              <Brain className="w-4 h-4" />
              <span>Ambient Sound:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['off', 'brown', 'alpha'] as const).map((ns) => (
                <button
                  key={ns}
                  type="button"
                  onClick={() => toggleNoise(ns)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeNoise === ns
                      ? 'bg-white text-slate-900 font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  {ns === 'off' && 'Silence'}
                  {ns === 'brown' && 'Deep Brown Noise'}
                  {ns === 'alpha' && '10Hz Alpha Waves'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Work Science: Attention Residue */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The Science of Distraction Elimination
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Why even a 2-second phone glance destroys deep intellectual work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Attention Residue
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dr. Sophie Leroy’s landmark cognitive research shows that when you switch from studying to checking a notification, your attention does not follow immediately. A residue of attention remains stuck on the prior thought for 15 to 25 minutes.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Myelination of Neural Pathways
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deep, uninterrupted concentration stimulates oligodendrocytes to lay down layers of myelin around your brain’s axons. This physical insulation allows complex thoughts to fire 10x faster and with greater clarity.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monk Mode Rituals
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                By entering a full-screen, high-contrast dark timer with brown noise, you remove all peripheral optical stimuli, helping the visual cortex prioritize text comprehension and analytical logic.
              </p>
            </article>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>What is the difference between white noise and brown noise?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-amber-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                White noise has equal power across all audible frequencies and sounds like television static or hissing. Brown noise drops in frequency power, creating a deep, soothing rumble like heavy rain or distant waterfalls. Studies show brown noise is significantly more comfortable for sustained study blocks.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>How can I prevent switching tabs during a study session?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-amber-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Place the Focus Timer in full-screen mode and activate the commitment pledge. If you need online study materials, open them side-by-side or print notes physically to avoid browsing rabbit holes.
              </p>
            </details>
          </div>
        </section>

        {/* Focus Flow CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-amber-600 text-white text-center space-y-6 shadow-xl shadow-amber-600/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
              Personalized Student Workspace
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Bring your focus timer into a complete study command center
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
              Log daily study hours, manage subject assignments, set weekly target goals, and enjoy 7 aesthetic study themes on Focus Flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-amber-700 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Create Free Account on Focus Flow
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/study-timer')}
              className="px-5 py-3 rounded-xl bg-amber-700/80 hover:bg-amber-700 text-white font-semibold text-xs border border-amber-400/40 transition-colors cursor-pointer"
            >
              Explore 50/10 Study Timer
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
