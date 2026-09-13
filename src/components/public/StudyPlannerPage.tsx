import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Zap, 
  Check, 
  HelpCircle, 
  Layers, 
  Target, 
  Clock,
  ChevronRight,
  ListTodo,
  TrendingUp,
  Download
} from 'lucide-react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { SEO_PAGES, updatePageSeo } from '../../utils/seo';

interface StudyPlannerPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

interface GeneratedStage {
  dayOffset: number;
  label: string;
  stageName: string;
  technique: string;
  description: string;
  completed: boolean;
}

export const StudyPlannerPage: React.FC<StudyPlannerPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace
}) => {
  useEffect(() => {
    updatePageSeo(SEO_PAGES.studyPlanner);
    window.scrollTo(0, 0);
  }, []);

  // Planner Generator Input State
  const [subjectName, setSubjectName] = useState('Organic Chemistry');
  const [daysUntilExam, setDaysUntilExam] = useState(21);
  const [intensity, setIntensity] = useState<'moderate' | 'rigorous' | 'mastery'>('rigorous');

  // Interactive schedule stages
  const [scheduleStages, setScheduleStages] = useState<GeneratedStage[]>([
    {
      dayOffset: 1,
      label: 'Day 1',
      stageName: 'Deep Comprehension & Concept Mapping',
      technique: 'Active Encoding',
      description: 'First read through syllabus concepts. Formulate mental models and write flashcards in your own words.',
      completed: true
    },
    {
      dayOffset: 3,
      label: 'Day 3',
      stageName: 'First Active Recall Drill',
      technique: 'Spaced Retrieval 1',
      description: 'Test yourself without notes on high-yield formulas and concepts created during Day 1.',
      completed: false
    },
    {
      dayOffset: 7,
      label: 'Day 7',
      stageName: 'Hard Problem Solving & Interleaving',
      technique: 'Spaced Retrieval 2',
      description: 'Solve mixed practice problems from past exam papers to strengthen cognitive retrieval paths.',
      completed: false
    },
    {
      dayOffset: 14,
      label: 'Day 14',
      stageName: 'Timed Mock Exam Simulation',
      technique: 'Testing Effect',
      description: 'Sit a complete past paper under strict exam timing. Score mistakes and catalog blind spots.',
      completed: false
    },
    {
      dayOffset: 20,
      label: 'Day 20 (Eve)',
      stageName: 'High-Yield Memory Consolidation',
      technique: 'Final Priming',
      description: 'Light review of summary cheat sheets and error logs. Early sleep for neurological consolidation.',
      completed: false
    }
  ]);

  const toggleStage = (index: number) => {
    setScheduleStages(prev => prev.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const d = Math.max(7, daysUntilExam);
    const day3 = Math.round(d * 0.15);
    const day7 = Math.round(d * 0.4);
    const day14 = Math.round(d * 0.75);
    const dayFinal = d - 1;

    setScheduleStages([
      {
        dayOffset: 1,
        label: 'Day 1',
        stageName: `Deep Encoding: ${subjectName} Core Foundations`,
        technique: 'Active Encoding',
        description: 'Read primary chapters, derive key equations, and construct your initial concept map without distractions.',
        completed: false
      },
      {
        dayOffset: day3,
        label: `Day ${day3}`,
        stageName: 'Immediate Retrieval & Flashcard Testing',
        technique: 'Spaced Retrieval 1',
        description: 'Test yourself with closed-book active recall. Focus on 20% of concepts that cause 80% of confusion.',
        completed: false
      },
      {
        dayOffset: day7,
        label: `Day ${day7}`,
        stageName: 'Interleaved Practice Questions',
        technique: 'Spaced Retrieval 2',
        description: 'Mix questions from different chapters to prevent pattern matching and force deeper neural understanding.',
        completed: false
      },
      {
        dayOffset: day14,
        label: `Day ${day14}`,
        stageName: 'Simulated Timed Exam Under Pressure',
        technique: 'Testing Effect',
        description: 'Simulate exact exam conditions. Time yourself, eliminate notes, and diagnose remaining weak topics.',
        completed: false
      },
      {
        dayOffset: dayFinal,
        label: `Day ${dayFinal}`,
        stageName: 'Final Weak-Spot Polish & Rest',
        technique: 'Memory Consolidation',
        description: 'Review mistake log only. Prioritize 8 hours of sleep to ensure peak synaptic plasticity on test day.',
        completed: false
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <PublicHeader 
        currentPath="/study-planner" 
        onNavigate={onNavigate} 
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <button type="button" onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Free Study Planner</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Spaced Repetition Exam Timetable Generator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Online Study Planner
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Build a scientifically optimized study schedule based on the Ebbinghaus forgetting curve. Master your syllabus without last-minute all-nighters.
          </p>
        </section>

        {/* Interactive Schedule Generator Tool */}
        <section className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-8" aria-label="Interactive Study Planner Generator">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="planner-subject-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Subject / Exam Topic
              </label>
              <input
                id="planner-subject-input"
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Molecular Biology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="planner-days-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Days Until Exam ({daysUntilExam} days)
              </label>
              <input
                id="planner-days-input"
                type="range"
                min="7"
                max="60"
                value={daysUntilExam}
                onChange={(e) => setDaysUntilExam(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Revision Target
              </label>
              <div className="flex items-center gap-1.5">
                {(['moderate', 'rigorous', 'mastery'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      intensity === lvl
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3 text-center pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Recalculate Spaced Repetition Timetable</span>
              </button>
            </div>
          </form>

          {/* Generated Interactive Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Spaced Revision Roadmap for {subjectName}</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                {scheduleStages.filter(s => s.completed).length} of {scheduleStages.length} checkpoints achieved
              </span>
            </div>

            <div className="space-y-3">
              {scheduleStages.map((stage, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleStage(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    stage.completed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-slate-50/70 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    stage.completed 
                      ? 'bg-emerald-600 text-white' 
                      : 'border-2 border-slate-300 dark:border-slate-600'
                  }`}>
                    {stage.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {stage.label}
                        </span>
                        <h3 className={`text-xs font-bold ${stage.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {stage.stageName}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {stage.technique}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology: The Ebbinghaus Forgetting Curve */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Why Traditional Study Schedules Fail
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Without scheduled intervals, students forget over 70% of new information within 48 hours of initial reading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Active Recall vs. Re-Reading
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Passive re-reading creates an illusion of competence. Testing yourself with closed books forces neural retrieval, strengthening memory traces by over 300%.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Interleaved Subject Scheduling
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Block studying one single subject all day leads to boredom and shallow processing. Alternating two contrasting subjects creates higher cognitive engagement.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                The 80% Buffer Principle
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Schedule study tasks for only 80% of your available hours. The remaining 20% absorbs inevitable life delays and prevents schedule collapse.
              </p>
            </article>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions about Study Planning
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>How many hours a day should a student study for finals?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-emerald-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Empirical cognitive research suggests that 4–6 hours of high-intensity, undistracted focused study with intervals is the maximum effective limit for human working memory per day. Studying beyond 7 hours without rest yields diminishing returns and degrades test performance.
              </p>
            </details>

            <details className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                <span>Can I synchronize my study schedule with a calendar?</span>
                <HelpCircle className="w-4 h-4 text-slate-400 group-open:text-emerald-600 transition-colors" />
              </summary>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                Yes. Focus Flow contains an interactive Study Planner with a visual 7-day calendar, assignment deadlines, subject filtering, and automatic task prioritization.
              </p>
            </details>
          </div>
        </section>

        {/* Focus Flow CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-emerald-600 text-white text-center space-y-6 shadow-xl shadow-emerald-600/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Interactive Study Workspace
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Turn your study schedule into an organized action plan
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Focus Flow connects your daily schedule with real-time timers, subjects, homework checklists, and study stamina stats.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-emerald-700 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Start Planning Free on Focus Flow
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/focus-timer')}
              className="px-5 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-400/40 transition-colors cursor-pointer"
            >
              Open Minimalist Focus Timer
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
