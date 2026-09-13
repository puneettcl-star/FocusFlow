import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  Brain, 
  Zap, 
  Coffee, 
  Target,
  Sliders
} from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { SEO_PAGES, updatePageSeo } from '../../utils/seo';

interface StudyTimerPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

type IntervalMode = '50-10' | '90-20' | '25-5' | 'custom';

export const StudyTimerPage: React.FC<StudyTimerPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace
}) => {
  // Update SEO metadata on mount
  useEffect(() => {
    updatePageSeo(SEO_PAGES.studyTimer);
    window.scrollTo(0, 0);
  }, []);

  // Timer Configuration State
  const [selectedMode, setSelectedMode] = useState<IntervalMode>('50-10');
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [isBreak, setIsBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(50 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [taskName, setTaskName] = useState('');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Audio & Ambient State
  const [ambientSound, setAmbientSound] = useState<'off' | 'whitenoise' | 'rain' | 'binaural'>('off');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioNode | null>(null);

  // Switch Interval Mode
  const handleModeChange = (mode: IntervalMode) => {
    setSelectedMode(mode);
    setIsRunning(false);
    setIsBreak(false);
    let sec = 50 * 60;
    if (mode === '50-10') sec = 50 * 60;
    if (mode === '90-20') sec = 90 * 60;
    if (mode === '25-5') sec = 25 * 60;
    if (mode === 'custom') sec = customMinutes * 60;
    setTotalSeconds(sec);
    setSecondsRemaining(sec);
  };

  // Timer Interval Loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      // Transition from Study to Break or vice-versa
      playChime();
      if (!isBreak) {
        setIsBreak(true);
        setCompletedSessionsCount((c) => c + 1);
        let breakSec = 10 * 60;
        if (selectedMode === '50-10') breakSec = 10 * 60;
        if (selectedMode === '90-20') breakSec = 20 * 60;
        if (selectedMode === '25-5') breakSec = 5 * 60;
        if (selectedMode === 'custom') breakSec = 10 * 60;
        setTotalSeconds(breakSec);
        setSecondsRemaining(breakSec);
      } else {
        setIsBreak(false);
        let workSec = 50 * 60;
        if (selectedMode === '50-10') workSec = 50 * 60;
        if (selectedMode === '90-20') workSec = 90 * 60;
        if (selectedMode === '25-5') workSec = 25 * 60;
        if (selectedMode === 'custom') workSec = customMinutes * 60;
        setTotalSeconds(workSec);
        setSecondsRemaining(workSec);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, isBreak, selectedMode, customMinutes]);

  // Audio Synthesizer for Bell Chime
  const playChime = () => {
    if (isSoundMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (_) {}
  };

  // Web Audio Ambient Synthesizer
  const toggleAmbientSound = (type: 'off' | 'whitenoise' | 'rain' | 'binaural') => {
    if (ambientNodeRef.current) {
      try {
        (ambientNodeRef.current as any).disconnect();
      } catch (_) {}
      ambientNodeRef.current = null;
    }
    setAmbientSound(type);
    if (type === 'off') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'whitenoise') {
        // Buffer of white noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.04;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start();
        ambientNodeRef.current = noise;
      } else if (type === 'binaural') {
        // 40Hz Gamma frequency carrier
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        osc1.frequency.value = 200;
        osc2.frequency.value = 240; // 40Hz difference
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        ambientNodeRef.current = gain;
      }
    } catch (_) {}
  };

  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <PublicHeader 
        currentPath="/study-timer" 
        onNavigate={onNavigate} 
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Breadcrumb Navigation for SEO */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Free Study Timer</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Online Study Timer for Deep Work & Exam Prep</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Study Timer for Students
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Science-backed interval study timer designed to sustain high cognitive stamina, prevent mental fatigue, and maximize information retention.
          </p>
        </section>

        {/* Interactive Main Timer Application */}
        <section className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8" aria-label="Interactive Study Timer Tool">
          {/* Preset interval switches */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: '50-10', label: '50/10 Rule', desc: 'Optimal Retention' },
              { id: '90-20', label: '90m Ultradian', desc: 'Deep Immersion' },
              { id: '25-5', label: '25/5 Pomodoro', desc: 'Agile Sprints' },
              { id: 'custom', label: 'Custom', desc: `${customMinutes}m` }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id as IntervalMode)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedMode === m.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div>{m.label}</div>
                <div className="text-[10px] opacity-75 font-normal">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Current study task prompt */}
          <div className="max-w-md mx-auto">
            <label htmlFor="study-task-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 text-center">
              Current Focus Objective
            </label>
            <input
              id="study-task-input"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Organic Chemistry Chapter 4 Reaction Mechanisms..."
              className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Circular Progress & Clock Readout */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`transition-all duration-500 ease-out ${
                    isBreak ? 'stroke-emerald-500' : 'stroke-indigo-600'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1 ${
                  isBreak 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {isBreak ? 'Restful Break' : 'Deep Study Block'}
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-tight tabular-nums font-mono text-slate-900 dark:text-white">
                  {timeFormatted}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-medium">
                  {isBreak ? 'Step away & hydrate' : `${Math.round(progressPercent)}% elapsed`}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Study Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? 'Pause Session' : 'Begin Study Block'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                isSoundMuted
                  ? 'border-rose-300 text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSoundMuted ? 'Unmute Audio Alert' : 'Mute Audio Alert'}
              aria-label={isSoundMuted ? 'Unmute Alert' : 'Mute Alert'}
            >
              {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Ambient Soundscape Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Background Soundscape:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['off', 'whitenoise', 'binaural'] as const).map((snd) => (
                <button
                  key={snd}
                  type="button"
                  onClick={() => toggleAmbientSound(snd)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    ambientSound === snd
                      ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {snd === 'off' && 'Off'}
                  {snd === 'whitenoise' && 'White Noise'}
                  {snd === 'binaural' && '40Hz Binaural Beats'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section: The Science of Interval Studying */}
        <section className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The Cognitive Science Behind Study Intervals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Why marathon studying without planned breaks leads to pseudo-work and severe retention decay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Overcoming the Vigilance Decrement
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Neuroscience research proves continuous human vigilance precipitously drops after 45–50 minutes of intense focus. A short 10-minute rest fully resets executive attention networks.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Memory Consolidation & Offline Replay
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                During waking rest periods, the hippocampus replays recently learned information at 20x real-time speed, cementing concepts into durable long-term synaptic connections.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Preventing Cognitive Burnout
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Studying 4 hours in structured 50/10 intervals produces higher test comprehension and significantly lower mental exhaustion than an unbroken 4-hour cramming session.
              </p>
            </article>
          </div>
        </section>

        {/* Pre-Session Focus Checklist */}
        <section className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-slate-100 dark:from-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              High-Performance Protocol
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              5-Minute Pre-Study Focus Checklist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Complete these 4 physical steps before pressing start on your timer to ensure deep cognitive immersion:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold">1. Phone Out of Sight</strong>
                <span className="text-slate-500 dark:text-slate-400">Placing your phone face-down in another room increases available working memory capacity by up to 26%.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold">2. Single Visible Deliverable</strong>
                <span className="text-slate-500 dark:text-slate-400">Define a single physical output: 5 practice problems solved or 2 essay paragraphs outlined.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold">3. Hydration Ready</strong>
                <span className="text-slate-500 dark:text-slate-400">Even mild 1% dehydration degrades working memory and increases mental fatigue during complex study tasks.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block font-semibold">4. Fullscreen Distraction Filter</strong>
                <span className="text-slate-500 dark:text-slate-400">Close social media, email, and extraneous browser tabs before initiating the countdown timer.</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions about Study Timers
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>What is the difference between 50/10 and the 25/5 Pomodoro technique?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-indigo-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                The 25/5 Pomodoro method is ideal for overcoming initial procrastination and handling rapid administrative tasks. The 50/10 rule is designed for deep conceptual study, mathematics, medical memorization, and essay writing where entering a state of flow requires 15–20 minutes of ramp-up time.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>How should I spend my study breaks?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-indigo-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Effective study breaks require low cognitive stimulation: walking around, stretching, getting water, or resting your eyes. Avoid scrolling TikTok, Instagram, or reading news, as high-dopamine digital consumption impairs the brain’s offline memory consolidation process.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>Can I track my study history across subjects?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-indigo-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Yes. Focus Flow provides an integrated student workspace where all timer sessions automatically sync to your custom subjects, calculating daily streaks, weekly study hours, and exam readiness scores.
              </p>
            </details>
          </div>
        </section>

        {/* Natural Focus Flow CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white text-center space-y-6 shadow-xl shadow-indigo-600/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
              Upgrade Your Study Routine
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Track your study stats, tasks, and subjects with Focus Flow
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Never lose track of your revision hours. Get personal study streak tracking, spaced repetition planners, and 7 aesthetic study themes—completely free.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-600 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Create Free Student Account
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/pomodoro-timer')}
              className="px-5 py-3 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-400/40 transition-colors cursor-pointer"
            >
              Explore Pomodoro Timer
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
