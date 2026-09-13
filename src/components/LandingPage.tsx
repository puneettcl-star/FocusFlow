import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  BarChart3, 
  Palette, 
  Flame, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Volume2, 
  Compass, 
  Layers, 
  Target, 
  GraduationCap, 
  Zap,
  LayoutDashboard,
  Moon,
  Sun,
  Timer
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES, ThemeColors } from '../utils/theme';
import { AppTheme } from '../types';
import { SEO_PAGES, updatePageSeo } from '../utils/seo';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
  onNavigate?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace,
  onNavigate,
}) => {
  const { theme, setTheme, isDark } = useTheme();

  // Update SEO metadata on mount
  useEffect(() => {
    updatePageSeo(SEO_PAGES.home);
  }, []);

  // Active theme showcase tab
  const [selectedShowcaseTheme, setSelectedShowcaseTheme] = useState<AppTheme>('calm');

  // Interactive Mini Hero Sandbox Timer State
  const [heroTimerRunning, setHeroTimerRunning] = useState(false);
  const [heroTimerSeconds, setHeroTimerSeconds] = useState(25 * 60);
  const [heroTimerMode, setHeroTimerMode] = useState<'pomodoro' | 'break'>('pomodoro');
  const [heroTasks, setHeroTasks] = useState([
    { id: '1', title: 'Calculus: Solve differential equations practice', subject: 'Math', completed: true },
    { id: '2', title: 'CS 106B: Implement priority queue tree', subject: 'CS', completed: false },
    { id: '3', title: 'Biology: Review cellular respiration flashcards', subject: 'Bio', completed: false },
  ]);

  // FAQ open states (index of expanded item, or null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Toggle mini hero task
  const toggleHeroTask = (id: string) => {
    setHeroTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Mini hero timer reset
  const resetHeroTimer = () => {
    setHeroTimerRunning(false);
    setHeroTimerSeconds(heroTimerMode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  const switchHeroMode = (mode: 'pomodoro' | 'break') => {
    setHeroTimerMode(mode);
    setHeroTimerRunning(false);
    setHeroTimerSeconds(mode === 'pomodoro' ? 25 * 60 : 5 * 60);
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showcaseThemesList: { id: AppTheme; name: string; tag: string; description: string }[] = [
    { id: 'calm', name: 'Calm Sage', tag: 'Natural & Restful', description: 'Mindful matcha herbs and balanced sage contrast to minimize cognitive strain during daytime study.' },
    { id: 'dark', name: 'Obsidian Night', tag: 'Deep OLED Black', description: 'True pitch-black canvas with indigo neon cues engineered for late-night exam prep.' },
    { id: 'light', name: 'Studio Light', tag: 'Minimal Crisp', description: 'Spacious editorial whitespace and balanced slate typography for distraction-free daylight reading.' },
    { id: 'ocean', name: 'Abyssal Ocean', tag: 'Deep Azure & Navy', description: 'Cool nautical tones with vibrant azure accents for calm, sustained immersion.' },
    { id: 'sakura', name: 'Sakura Pastel', tag: 'Gentle Rose', description: 'Soft cherry blossom pastels and gentle rose highlights for an uplifting, friendly environment.' },
    { id: 'cyber', name: 'Cyber Matrix', tag: 'High-Tech Neon', description: 'High-contrast neon synthwave glow with emerald telemetry for coding and analytical workflows.' },
    { id: 'classic', name: 'Classic Library', tag: 'Sepia Parchment', description: 'Warm sepia parchment and bookbinder amber tones inspired by historic quiet reading rooms.' },
  ];

  const activeThemeConfig: ThemeColors = THEMES[selectedShowcaseTheme] || THEMES.calm;

  const faqs = [
    {
      question: 'Is Focus Flow free to use for students?',
      answer: 'Yes. Focus Flow provides full core functionality for students—including task management, the Pomodoro focus timer, subject categorization, study calendar planning, and all 7 personalized themes—with no subscription wall.',
    },
    {
      question: 'How does the Focus Timer link to my coursework and tasks?',
      answer: 'When launching a focus session, you can select any active task and course subject. The timer automatically binds your study minutes to that specific assignment, updating your subject analytics, course hours, and daily streak as soon as the session finishes.',
    },
    {
      question: 'Will my study sessions and tasks synchronize across all my devices?',
      answer: 'Yes. Focus Flow is backed by Google Cloud Firestore. Your tasks, focus history, custom intervals, and progress statistics sync instantly between your desktop, laptop, and tablet.',
    },
    {
      question: 'How do the handcrafted themes reduce eye fatigue?',
      answer: 'Every theme in Focus Flow adheres strictly to WCAG AA contrast standards. Backgrounds avoid blinding 100% white (#FFFFFF) and instead use calibrated neutral offsets and soothing herbal, sepia, or deep OLED hues that prevent retinal fatigue during multi-hour study sessions.',
    },
    {
      question: 'Can I customize the timer lengths and ambient sounds?',
      answer: 'Yes. You can customize Pomodoro sprint duration (15 to 90 minutes), short breaks, long breaks, and long-break intervals. You can also choose from built-in acoustic completion chimes and ambient soundscapes like white noise, rainfall, and cafe hum.',
    },
    {
      question: 'How does the study planning workflow help prevent cramming?',
      answer: 'Instead of looking at an overwhelming list of deadlines, the Study Planner allows you to schedule tasks into designated study days ahead of time. You balance your weekly study load across courses and build consistent daily momentum.',
    },
  ];

  return (
    <div id="landing-page-root" className="min-h-screen theme-bg-app theme-text-primary selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300">
      {/* 1. Header / Navigation */}
      <header id="landing-header" className="sticky top-0 z-50 theme-nav-bg backdrop-blur-md theme-border border-b transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight theme-text-primary">Focus Flow</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md theme-bg-subtle theme-text-muted">
                STUDY OS
              </span>
            </div>
          </div>

          {/* Nav Anchors & Free Tools Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold theme-text-secondary">
            <a href="#features" className="hover:theme-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:theme-text-primary transition-colors">How It Works</a>
            <a href="#themes" className="hover:theme-text-primary transition-colors">Themes</a>
            {onNavigate && (
              <>
                <button 
                  type="button" 
                  onClick={() => onNavigate('/study-timer')} 
                  className="hover:theme-text-primary transition-colors cursor-pointer"
                >
                  Study Timer
                </button>
                <button 
                  type="button" 
                  onClick={() => onNavigate('/pomodoro-timer')} 
                  className="hover:theme-text-primary transition-colors cursor-pointer"
                >
                  Pomodoro 25/5
                </button>
                <button 
                  type="button" 
                  onClick={() => onNavigate('/study-planner')} 
                  className="hover:theme-text-primary transition-colors cursor-pointer"
                >
                  Study Planner
                </button>
              </>
            )}
            <a href="#faq" className="hover:theme-text-primary transition-colors">FAQ</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Quick Theme Switcher Button */}
            <button
              id="btn-header-theme-toggle"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl theme-bg-subtle hover:theme-border theme-border border transition-colors theme-text-secondary hover:theme-text-primary"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                id="btn-header-enter-workspace"
                onClick={onEnterWorkspace}
                className="flex items-center gap-2 px-4 py-2 rounded-xl theme-accent-bg text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Workspace</span>
              </button>
            ) : (
              <>
                <button
                  id="btn-header-signin"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="btn-header-get-started"
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl theme-accent-bg text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full theme-accent-subtle theme-accent-text text-xs font-bold mb-6 tracking-wide border theme-border shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Distraction-Free Study Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight theme-text-primary leading-[1.12] mb-6">
              The calm workspace for high-yield learning.
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-base sm:text-lg theme-text-secondary leading-relaxed max-w-2xl mx-auto mb-9">
              Focus Flow unites course task management, adaptive Pomodoro focus sessions, time-blocked daily study planning, and real-time progress analytics into one focused, aesthetic application.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              {isAuthenticated ? (
                <button
                  id="btn-hero-cta-workspace"
                  onClick={onEnterWorkspace}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl theme-accent-bg text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Your Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <>
                  <button
                    id="btn-hero-cta-get-started"
                    onClick={() => onOpenAuth('signup')}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl theme-accent-bg text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-hero-cta-signin"
                    onClick={() => onOpenAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl theme-bg-subtle theme-text-primary font-semibold text-sm border theme-border hover:theme-border-hover transition-all"
                  >
                    Sign In to Existing Account
                  </button>
                </>
              )}
            </div>

            {/* Trust bullet line */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold theme-text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Distraction Ads</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cloud Firestore Sync</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>7 Handcrafted Eye-Friendly Themes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>No Credit Card Required</span>
              </span>
            </div>
          </div>

          {/* Interactive Hero Product Sandbox / Mockup */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl theme-border border shadow-2xl theme-bg-card overflow-hidden transition-all">
              {/* Window Titlebar */}
              <div className="px-4 py-3 theme-bg-subtle theme-border border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono theme-text-muted hidden sm:inline">focusflow.app/workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold theme-text-secondary">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Flame className="w-3 h-3 fill-amber-500" />
                    <span>7 Day Streak</span>
                  </div>
                </div>
              </div>

              {/* Interactive Mockup Body */}
              <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Mini Sandbox: Interactive Pomodoro Widget */}
                <div className="md:col-span-6 flex flex-col justify-between theme-bg-subtle p-5 rounded-xl border theme-border">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider theme-text-muted">Focus Sprint</span>
                      <div className="flex items-center gap-1 p-0.5 rounded-lg theme-bg-card border theme-border">
                        <button
                          id="btn-sandbox-mode-pomo"
                          onClick={() => switchHeroMode('pomodoro')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            heroTimerMode === 'pomodoro' ? 'theme-accent-bg text-white' : 'theme-text-muted'
                          }`}
                        >
                          25m Pomodoro
                        </button>
                        <button
                          id="btn-sandbox-mode-break"
                          onClick={() => switchHeroMode('break')}
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                            heroTimerMode === 'break' ? 'theme-accent-bg text-white' : 'theme-text-muted'
                          }`}
                        >
                          5m Break
                        </button>
                      </div>
                    </div>

                    {/* Timer Digits */}
                    <div className="text-center py-4">
                      <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight theme-text-primary">
                        {formatSeconds(heroTimerSeconds)}
                      </span>
                      <p className="text-xs theme-text-muted mt-1 flex items-center justify-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>Studying: Computer Science • Recursive Lab</span>
                      </p>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center justify-center gap-3 pt-3 border-t theme-border">
                    <button
                      id="btn-sandbox-toggle-run"
                      onClick={() => setHeroTimerRunning(!heroTimerRunning)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl theme-accent-bg text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
                    >
                      {heroTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Timer</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Focus</span>
                        </>
                      )}
                    </button>
                    <button
                      id="btn-sandbox-reset"
                      onClick={resetHeroTimer}
                      className="p-2 rounded-xl theme-bg-card hover:theme-border border theme-border transition-colors theme-text-muted hover:theme-text-primary"
                      title="Reset timer"
                      aria-label="Reset timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Mini Sandbox: Prioritized Tasks */}
                <div className="md:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider theme-text-muted">Today's Priority Queue</span>
                      <span className="text-xs font-bold theme-accent-text">3 Tasks Planned</span>
                    </div>

                    <div className="space-y-2">
                      {heroTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => toggleHeroTask(t.id)}
                          className="flex items-center gap-3 p-3 rounded-xl border theme-border theme-bg-card hover:theme-border-hover cursor-pointer transition-all"
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              t.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'theme-border hover:border-slate-400'
                            }`}
                          >
                            {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${t.completed ? 'line-through theme-text-muted' : 'theme-text-primary'}`}>
                              {t.title}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {t.subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-4 border-t theme-border flex items-center justify-between text-xs theme-text-secondary">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>2h 45m focused today</span>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Goal 80% complete</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 sm:py-28 theme-bg-subtle border-y theme-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider theme-accent-text">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text-primary mt-2">
              Engineered specifically for academic mastery.
            </h2>
            <p className="text-sm sm:text-base theme-text-secondary mt-3 leading-relaxed">
              Every feature in Focus Flow is intentionally crafted to strip away mental friction, keep coursework organized, and protect your deep focus state.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Task Management */}
            <div id="feature-card-tasks" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Relational Course Task Management</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Organize homework, problem sets, and reading lists tied directly to academic subjects. Flag urgent priorities, calculate Pomodoro block estimations, and never miss an overdue deadline.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <Zap className="w-3.5 h-3.5" />
                <span>Priority matrix & overdue alerts</span>
              </div>
            </div>

            {/* Feature 2: Focus Mode */}
            <div id="feature-card-focus" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Deep Focus Timer & Distraction Blocker</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Switch between 25-minute Pomodoro sprints or freeform Stopwatch sessions. Enjoy calming acoustic chimes, ambient noise soundscapes, and full-screen immersion without browser distractions.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Soundscapes & auto-break cycles</span>
              </div>
            </div>

            {/* Feature 3: Study Planning */}
            <div id="feature-card-planner" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Visual Study Planner & Time Blocking</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Map your week with drag-and-drop daily study scheduling. Assign tasks to specific calendar dates to balance your course workload across midterms and avoid frantic all-nighters.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Daily scheduling & workload balance</span>
              </div>
            </div>

            {/* Feature 4: Progress Tracking */}
            <div id="feature-card-progress" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Academic Velocity & Analytics</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Automated telemetry calculates total focus minutes, weekly time heatmaps, subject distributions, and consecutive study streaks. Review your pace and celebrate measurable progress.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak tracking & subject distribution</span>
              </div>
            </div>

            {/* Feature 5: Personalized Themes */}
            <div id="feature-card-themes" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Ergonomic Personalized Themes</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Study without visual fatigue. Choose from 7 curated color atmospheres: from restful matcha greens and classic sepia parchment to obsidian OLED dark mode and cyber neon.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <Palette className="w-3.5 h-3.5" />
                <span>7 WCAG AA certified palettes</span>
              </div>
            </div>

            {/* Feature 6: Measurable Goals */}
            <div id="feature-card-goals" className="theme-bg-card p-6 rounded-2xl border theme-border hover:theme-border-hover transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Quantifiable Semester Goals</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed mb-4">
                  Define high-level milestones—like "Complete 50 practice exams" or "Log 100 hours of MCAT prep". Track dynamic completion percentages and celebrate each milestone.
                </p>
              </div>
              <div className="pt-4 border-t theme-border flex items-center gap-2 text-xs font-semibold theme-accent-text">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Target dates & visual progress bars</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Theme Showcase Section */}
      <section id="themes" className="py-20 sm:py-28 theme-bg-app transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider theme-accent-text">Theme Showcase</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text-primary mt-2">
              Tailored for your focus environment.
            </h2>
            <p className="text-sm sm:text-base theme-text-secondary mt-3 leading-relaxed">
              Long study sessions demand thoughtful visual ergonomics. Switch between light, dark, and specialized color palettes with mathematical contrast calibration.
            </p>
          </div>

          {/* Theme Pill Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {showcaseThemesList.map(t => (
              <button
                key={t.id}
                id={`theme-pill-${t.id}`}
                onClick={() => setSelectedShowcaseTheme(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedShowcaseTheme === t.id
                    ? 'theme-accent-bg text-white border-transparent shadow-xs'
                    : 'theme-bg-card theme-border theme-text-secondary hover:theme-text-primary hover:theme-border-hover'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full border border-black/10" 
                  style={{ backgroundColor: THEMES[t.id].preview.accent }} 
                />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Live Theme Preview Display */}
          <div className="max-w-3xl mx-auto">
            <div 
              className="p-6 sm:p-8 rounded-3xl border shadow-xl transition-all"
              style={{
                backgroundColor: activeThemeConfig.variables['--bg-card'],
                borderColor: activeThemeConfig.variables['--border-theme'],
                color: activeThemeConfig.variables['--text-primary'],
              }}
            >
              {/* Theme Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4" style={{ borderColor: activeThemeConfig.variables['--border-theme'] }}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-extrabold" style={{ color: activeThemeConfig.variables['--text-primary'] }}>
                      {activeThemeConfig.name} Theme
                    </h3>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: activeThemeConfig.variables['--accent-subtle'],
                        color: activeThemeConfig.variables['--accent-text']
                      }}
                    >
                      {activeThemeConfig.isDark ? 'Dark Ergonomics' : 'Light Ergonomics'}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: activeThemeConfig.variables['--text-secondary'] }}>
                    {activeThemeConfig.tagline}
                  </p>
                </div>

                {/* Apply Theme Button */}
                <button
                  id="btn-apply-theme-to-app"
                  onClick={() => setTheme(selectedShowcaseTheme)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                  style={{
                    backgroundColor: activeThemeConfig.variables['--accent-primary'],
                    color: '#FFFFFF'
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Theme to Session</span>
                </button>
              </div>

              {/* Simulated Mini App Elements inside Active Theme */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Simulated Timer Widget */}
                <div 
                  className="p-4 rounded-xl border flex flex-col justify-between"
                  style={{ 
                    backgroundColor: activeThemeConfig.variables['--bg-subtle'],
                    borderColor: activeThemeConfig.variables['--border-theme']
                  }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: activeThemeConfig.variables['--text-muted'] }}>
                    Focus Timer
                  </span>
                  <div className="text-2xl font-mono font-bold my-2" style={{ color: activeThemeConfig.variables['--text-primary'] }}>
                    25:00
                  </div>
                  <span 
                    className="text-[10px] font-bold inline-block"
                    style={{ color: activeThemeConfig.variables['--accent-text'] }}
                  >
                    Pomodoro Interval
                  </span>
                </div>

                {/* Simulated Task Chip */}
                <div 
                  className="p-4 rounded-xl border flex flex-col justify-between"
                  style={{ 
                    backgroundColor: activeThemeConfig.variables['--bg-subtle'],
                    borderColor: activeThemeConfig.variables['--border-theme']
                  }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: activeThemeConfig.variables['--text-muted'] }}>
                    Course Assignment
                  </span>
                  <p className="text-xs font-semibold my-2 truncate" style={{ color: activeThemeConfig.variables['--text-primary'] }}>
                    Molecular Biology Quiz #4
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: activeThemeConfig.variables['--text-secondary'] }}>
                    <Clock className="w-3 h-3" />
                    <span>Due tomorrow</span>
                  </div>
                </div>

                {/* Simulated Streak Badge */}
                <div 
                  className="p-4 rounded-xl border flex flex-col justify-between"
                  style={{ 
                    backgroundColor: activeThemeConfig.variables['--bg-subtle'],
                    borderColor: activeThemeConfig.variables['--border-theme']
                  }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: activeThemeConfig.variables['--text-muted'] }}>
                    Daily Habit
                  </span>
                  <div className="flex items-center gap-1.5 text-lg font-bold my-1 text-amber-500">
                    <Flame className="w-5 h-5 fill-amber-500" />
                    <span>7 Days</span>
                  </div>
                  <span className="text-[10px]" style={{ color: activeThemeConfig.variables['--text-secondary'] }}>
                    Continuous study momentum
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 theme-bg-subtle border-y theme-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider theme-accent-text">The Focus Flow Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text-primary mt-2">
              Plan → Focus → Track → Improve
            </h2>
            <p className="text-sm sm:text-base theme-text-secondary mt-3 leading-relaxed">
              A proven, scientific feedback loop that transforms chaotic study habits into calm, predictable academic excellence.
            </p>
          </div>

          {/* 4 Steps Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Plan */}
            <div id="step-card-plan" className="theme-bg-card p-6 rounded-2xl border theme-border relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Plan</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                  Categorize courses and break major assignments into prioritized task blocks. Allocate them across the study calendar to balance your workload.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t theme-border text-xs font-semibold theme-text-muted flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                <span>Time-blocked calendar</span>
              </div>
            </div>

            {/* Step 2: Focus */}
            <div id="step-card-focus" className="theme-bg-card p-6 rounded-2xl border theme-border relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Focus</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                  Bind the timer to your specific task. Choose your preferred interval and ambient audio to eliminate distractions and induce flow state.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t theme-border text-xs font-semibold theme-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>25m Pomodoro sprints</span>
              </div>
            </div>

            {/* Step 3: Track */}
            <div id="step-card-track" className="theme-bg-card p-6 rounded-2xl border theme-border relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Track</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                  Every minute studied and task completed automatically syncs to your personal cloud database, updating streaks and subject hours in real time.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t theme-border text-xs font-semibold theme-text-muted flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Automated cloud telemetry</span>
              </div>
            </div>

            {/* Step 4: Improve */}
            <div id="step-card-improve" className="theme-bg-card p-6 rounded-2xl border theme-border relative flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black text-sm mb-4">
                  04
                </div>
                <h3 className="text-base font-bold theme-text-primary mb-2">Improve</h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                  Review weekly time distributions, identify subjects needing more attention, adjust your target intervals, and crush long-term semester goals.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t theme-border text-xs font-semibold theme-text-muted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Semester velocity review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 theme-bg-app transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider theme-accent-text">Frequently Asked Questions</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-text-primary mt-2">
              Got questions? We've got answers.
            </h2>
            <p className="text-sm sm:text-base theme-text-secondary mt-3 leading-relaxed">
              Everything you need to know about setting up your study workspace and building consistent focus.
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  id={`faq-item-${idx}`}
                  className="rounded-2xl border theme-border theme-bg-card overflow-hidden transition-all"
                >
                  <button
                    id={`btn-faq-toggle-${idx}`}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base theme-text-primary hover:theme-border-hover transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="shrink-0 p-1 rounded-lg theme-bg-subtle theme-text-secondary">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm theme-text-secondary leading-relaxed border-t theme-border">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section id="final-cta" className="py-20 sm:py-24 theme-bg-subtle border-t theme-border transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 rounded-3xl theme-accent-bg text-white shadow-2xl relative overflow-hidden text-center">
            <div className="max-w-2xl mx-auto relative z-10">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Start Your First Focus Session
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Ready to transform your study routine?
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-8 max-w-lg mx-auto">
                Join ambitious students who plan their coursework with clarity, focus without digital noise, and achieve their academic goals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {isAuthenticated ? (
                  <button
                    id="btn-final-cta-workspace"
                    onClick={onEnterWorkspace}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to My Workspace</span>
                  </button>
                ) : (
                  <>
                    <button
                      id="btn-final-cta-signup"
                      onClick={() => onOpenAuth('signup')}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      id="btn-final-cta-login"
                      onClick={() => onOpenAuth('login')}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Private Firestore Database</span>
                </span>
                <span>•</span>
                <span>Instant Setup</span>
                <span>•</span>
                <span>Always Free for Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer id="landing-footer" className="theme-bg-app border-t theme-border py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight theme-text-primary">Focus Flow</span>
              </div>
              <p className="text-xs theme-text-secondary leading-relaxed max-w-sm mb-4">
                The all-in-one distraction-free study operating system designed for students, researchers, and self-directed learners.
              </p>
              <p className="text-[11px] theme-text-muted">
                Built with React, TypeScript, Tailwind CSS, and Cloud Firestore.
              </p>
            </div>

            {/* Column 2: Free Study Tools */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider theme-text-primary mb-3">Free Tools</h4>
              <ul className="space-y-2 text-xs theme-text-secondary">
                {onNavigate ? (
                  <>
                    <li><button type="button" onClick={() => onNavigate('/study-timer')} className="hover:theme-text-primary transition-colors text-left">Study Timer</button></li>
                    <li><button type="button" onClick={() => onNavigate('/pomodoro-timer')} className="hover:theme-text-primary transition-colors text-left">Pomodoro Timer</button></li>
                    <li><button type="button" onClick={() => onNavigate('/study-planner')} className="hover:theme-text-primary transition-colors text-left">Study Planner</button></li>
                    <li><button type="button" onClick={() => onNavigate('/focus-timer')} className="hover:theme-text-primary transition-colors text-left">Focus Timer</button></li>
                  </>
                ) : (
                  <>
                    <li><a href="/study-timer" className="hover:theme-text-primary transition-colors">Study Timer</a></li>
                    <li><a href="/pomodoro-timer" className="hover:theme-text-primary transition-colors">Pomodoro Timer</a></li>
                    <li><a href="/study-planner" className="hover:theme-text-primary transition-colors">Study Planner</a></li>
                    <li><a href="/focus-timer" className="hover:theme-text-primary transition-colors">Focus Timer</a></li>
                  </>
                )}
              </ul>
            </div>

            {/* Column 3: Themes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider theme-text-primary mb-3">Themes</h4>
              <ul className="space-y-2 text-xs theme-text-secondary">
                <li><button onClick={() => setTheme('calm')} className="hover:theme-text-primary transition-colors text-left">Calm Sage</button></li>
                <li><button onClick={() => setTheme('dark')} className="hover:theme-text-primary transition-colors text-left">Obsidian Night</button></li>
                <li><button onClick={() => setTheme('light')} className="hover:theme-text-primary transition-colors text-left">Studio Light</button></li>
                <li><button onClick={() => setTheme('ocean')} className="hover:theme-text-primary transition-colors text-left">Abyssal Ocean</button></li>
                <li><button onClick={() => setTheme('sakura')} className="hover:theme-text-primary transition-colors text-left">Sakura Pastel</button></li>
              </ul>
            </div>

            {/* Column 4: Study Methods */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider theme-text-primary mb-3">Study Science</h4>
              <ul className="space-y-2 text-xs theme-text-secondary">
                <li><a href="#how-it-works" className="hover:theme-text-primary transition-colors">Pomodoro Technique</a></li>
                <li><a href="#how-it-works" className="hover:theme-text-primary transition-colors">Time-Blocking Guide</a></li>
                <li><a href="#how-it-works" className="hover:theme-text-primary transition-colors">Active Recall Routine</a></li>
                <li><a href="#how-it-works" className="hover:theme-text-primary transition-colors">Spaced Repetition</a></li>
                <li><a href="/sitemap.xml" className="hover:theme-text-primary transition-colors">Sitemap XML</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright and Legal Bar */}
          <div className="pt-8 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs theme-text-muted">
            <p>© {new Date().getFullYear()} Focus Flow. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                type="button" 
                onClick={() => onNavigate ? onNavigate('/privacy') : window.location.href = '/privacy'} 
                className="hover:theme-text-primary transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => onNavigate ? onNavigate('/terms') : window.location.href = '/terms'} 
                className="hover:theme-text-primary transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => onNavigate ? onNavigate('/support') : window.location.href = '/support'} 
                className="hover:theme-text-primary transition-colors cursor-pointer"
              >
                Support & Contact
              </button>
              <span>•</span>
              <span>Encrypted Cloud Storage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
