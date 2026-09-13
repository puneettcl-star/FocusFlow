import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Timer, 
  ArrowRight, 
  Brain, 
  Zap, 
  Coffee, 
  Flame, 
  Check, 
  HelpCircle,
  Calculator,
  Target
} from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { SEO_PAGES, updatePageSeo } from '../../utils/seo';

interface PomodoroTimerPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

type PomoMode = 'pomo' | 'shortBreak' | 'longBreak';

export const PomodoroTimerPage: React.FC<PomodoroTimerPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace
}) => {
  useEffect(() => {
    updatePageSeo(SEO_PAGES.pomodoroTimer);
    window.scrollTo(0, 0);
  }, []);

  // Pomodoro Cycle & Timer State
  const [activeMode, setActiveMode] = useState<PomoMode>('pomo');
  const [cycleCount, setCycleCount] = useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [completedPomos, setCompletedPomos] = useState<number>(0);

  // Calculator State
  const [calcHours, setCalcHours] = useState<number>(3);

  // Switch Mode
  const handleModeSwitch = (mode: PomoMode) => {
    setActiveMode(mode);
    setIsRunning(false);
    let sec = 25 * 60;
    if (mode === 'pomo') sec = 25 * 60;
    if (mode === 'shortBreak') sec = 5 * 60;
    if (mode === 'longBreak') sec = 15 * 60;
    setTotalSeconds(sec);
    setSecondsRemaining(sec);
  };

  // Timer Tick
  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      playAlertTone();
      if (activeMode === 'pomo') {
        setCompletedPomos((p) => p + 1);
        if (cycleCount % 4 === 0) {
          handleModeSwitch('longBreak');
        } else {
          handleModeSwitch('shortBreak');
        }
        setCycleCount((c) => (c % 4) + 1);
      } else {
        handleModeSwitch('pomo');
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining, activeMode, cycleCount]);

  // Extend current session (+5 mins)
  const addFiveMinutes = () => {
    setSecondsRemaining((s) => s + 5 * 60);
    setTotalSeconds((t) => t + 5 * 60);
  };

  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {}
  };

  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  // Calculator calculations
  const totalMinutes = calcHours * 60;
  const estimatedPomos = Math.floor(totalMinutes / 30);
  const estimatedBreakMins = estimatedPomos * 5;
  const estimatedFocusMins = estimatedPomos * 25;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <PublicHeader 
        currentPath="/pomodoro-timer" 
        onNavigate={onNavigate} 
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Free Pomodoro Timer</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <Timer className="w-3.5 h-3.5" />
            <span>Online Pomodoro Timer with 4-Cycle Flow Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Online Pomodoro Timer
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Eliminate procrastination with the 25/5 Pomodoro Technique. High-intensity study sprints paired with structured rest periods.
          </p>
        </section>

        {/* Interactive Pomodoro Application */}
        <section className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8" aria-label="Interactive Pomodoro Timer">
          {/* Mode Selector */}
          <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleModeSwitch('pomo')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'pomo'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('shortBreak')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'shortBreak'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('longBreak')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'longBreak'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Current Task Input */}
          <div className="max-w-md mx-auto text-center space-y-1">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you tackling during this sprint?"
              className="w-full text-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Clock Display */}
          <div className="relative flex flex-col items-center justify-center py-2">
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
                    activeMode === 'pomo'
                      ? 'stroke-rose-600'
                      : activeMode === 'shortBreak'
                      ? 'stroke-emerald-500'
                      : 'stroke-indigo-600'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  {[1, 2, 3, 4].map((dot) => (
                    <span
                      key={dot}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        dot <= cycleCount
                          ? 'bg-rose-600 dark:bg-rose-400'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-bold text-slate-400 ml-1">
                    Sprint {cycleCount}/4
                  </span>
                </div>

                <span className="text-5xl sm:text-6xl font-black tracking-tight tabular-nums font-mono text-slate-900 dark:text-white">
                  {timeDisplay}
                </span>
                <span className="text-xs text-slate-500 mt-1 font-medium">
                  {completedPomos} Pomodoros completed today
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Pomodoro Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? 'Pause Pomodoro' : 'Start Pomodoro'}</span>
            </button>

            <button
              type="button"
              onClick={addFiveMinutes}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Extend 5 Minutes (+5m)"
              aria-label="Extend Pomodoro 5 Minutes"
            >
              <Plus className="w-4 h-4" />
              <span>5m</span>
            </button>
          </div>
        </section>

        {/* Pomodoro Study Session Calculator */}
        <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Interactive Study Calculator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Plan Your Daily Pomodoro Capacity
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Study Window:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[1, 2, 3, 4, 6].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCalcHours(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      calcHours === h
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase">Target Pomodoros</span>
              <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{estimatedPomos} Sprints</p>
              <span className="text-[10px] text-rose-800/70 dark:text-rose-400/80">{estimatedFocusMins} mins pure focus</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">Scheduled Rest</span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{estimatedBreakMins} Mins</p>
              <span className="text-[10px] text-emerald-800/70 dark:text-emerald-400/80">Recharges cognitive energy</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase">4-Cycle Milestones</span>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{Math.floor(estimatedPomos / 4)} Cycles</p>
              <span className="text-[10px] text-indigo-800/70 dark:text-indigo-400/80">Includes long recovery breaks</span>
            </div>
          </div>
        </section>

        {/* The Pomodoro Technique Guide */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              The 5 Principles of the Pomodoro Technique
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Developed by Francesco Cirillo in the late 1980s, the Pomodoro Technique transforms time from an anxious enemy into an ally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-extrabold">1</span>
                <span>The Indivisibility Rule</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A Pomodoro is atomic. It cannot be split into halves. If you get interrupted halfway through, you must either void the Pomodoro or postpone the interruption until the timer rings.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-extrabold">2</span>
                <span>The Internal Interruption Sheet</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When an unrelated thought strikes ("I need to text my friend back"), write it down on a quick notepad beside you immediately, and resume focus. Never act on it mid-sprint.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-extrabold">3</span>
                <span>Overcoming Parkinson's Law</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Parkinson’s law states work expands to fill the time allocated. By constraining an assignment to 2 Pomodoros (50 minutes), your brain enters an urgent, high-efficiency execution mode.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-extrabold">4</span>
                <span>Active Recovery Protects Stamina</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The 5-minute break is mandatory even if you feel energized. Skipping breaks creates invisible cognitive friction that results in severe afternoon exhaustion.
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
                <span>Is the Pomodoro Technique effective for students with ADHD?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-rose-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Yes. Many neurodivergent students find 25 minutes to be the ideal time horizon because it eliminates the overwhelming dread of starting a massive project. The visual countdown provides constant, non-threatening accountability.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>What if I am in a flow state when the 25 minutes end?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-rose-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Use the "+5m" Flow Extender button to smoothly prolong your sprint. However, avoid running for more than 50 minutes without a recovery window, as true flow eventually degrades into mental fatigue.
              </p>
            </details>
          </div>
        </section>

        {/* Focus Flow CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-rose-600 text-white text-center space-y-6 shadow-xl shadow-rose-600/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-200">
              Complete Student Productivity
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to link your Pomodoro sprints to actual coursework?
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              Focus Flow syncs your completed sprints to coursework subjects, calculates streaks, and organizes your study calendar in one unified dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-rose-600 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Get Started with Focus Flow Free
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/study-planner')}
              className="px-5 py-3 rounded-xl bg-rose-700/80 hover:bg-rose-700 text-white font-semibold text-xs border border-rose-400/40 transition-colors cursor-pointer"
            >
              Check Out Study Planner
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
