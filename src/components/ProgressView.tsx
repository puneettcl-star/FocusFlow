import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Info,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import { FocusSession, Task, Subject, UserProfile, StudyStatistics } from '../types';
import { formatMinutes, getTodayString, getStartOfWeek, getStartOfMonth, formatReadableDate } from '../utils/date';

interface ProgressViewProps {
  sessions: FocusSession[];
  tasks: Task[];
  subjects: Subject[];
  userProfile: UserProfile | null;
  statistics?: StudyStatistics | null;
  onNavigateToTimer?: () => void;
  onNavigateToTasks?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  sessions,
  tasks,
  subjects,
  userProfile,
  statistics,
  onNavigateToTimer,
  onNavigateToTasks,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<7 | 14 | 30>(7);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const todayStr = getTodayString();
  const dailyGoalMinutes = userProfile?.dailyGoalMinutes || 120;
  const currentStreak = userProfile?.currentStreak || 0;

  // 1. Core time calculations
  const totalStudyMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  const todayStudyMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.completedAt && s.completedAt.startsWith(todayStr))
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions, todayStr]);

  const weeklyStudyMinutes = useMemo(() => {
    const monday = getStartOfWeek();
    return sessions
      .filter((s) => s.completedAt && new Date(s.completedAt) >= monday)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  const monthlyStudyMinutes = useMemo(() => {
    const startOfMonth = getStartOfMonth();
    return sessions
      .filter((s) => s.completedAt && new Date(s.completedAt) >= startOfMonth)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  // 2. Task metrics
  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // 3. Subject Breakdown
  const subjectBreakdown = useMemo(() => {
    if (sessions.length === 0) return [];

    const map: Record<string, { name: string; color: string; minutes: number; sessionCount: number }> = {};

    sessions.forEach((s) => {
      const subId = s.subjectId || 'unassigned';
      const subName = s.subjectName || 'General / Unassigned';
      const color = subjects.find((sub) => sub.id === s.subjectId)?.color || '#94A3B8';

      if (!map[subId]) {
        map[subId] = {
          name: subName,
          color,
          minutes: 0,
          sessionCount: 0,
        };
      }
      map[subId].minutes += s.durationMinutes || 0;
      map[subId].sessionCount += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.minutes - a.minutes);
    return list;
  }, [sessions, subjects]);

  // 4. Daily Goal percentage
  const dailyGoalPercent = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100));
  const dailyGoalRemaining = Math.max(0, dailyGoalMinutes - todayStudyMinutes);

  // 5. Daily study trend data for chart
  const dailyChartData = useMemo(() => {
    const days: { dateStr: string; label: string; weekday: string; minutes: number }[] = [];
    const now = new Date();

    for (let i = chartTimeframe - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // sum sessions for this date
      const dayMinutes = sessions
        .filter((s) => s.completedAt && s.completedAt.startsWith(dateStr))
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

      days.push({
        dateStr,
        label,
        weekday,
        minutes: dayMinutes,
      });
    }

    return days;
  }, [chartTimeframe, sessions]);

  const maxChartMinutes = useMemo(() => {
    const maxDay = Math.max(...dailyChartData.map((d) => d.minutes), 0);
    return Math.max(maxDay, dailyGoalMinutes, 60);
  }, [dailyChartData, dailyGoalMinutes]);

  const totalSessionsInWindow = useMemo(() => {
    return dailyChartData.reduce((acc, d) => acc + (d.minutes > 0 ? 1 : 0), 0);
  }, [dailyChartData]);

  // Average session length (only computed if sessions > 0 to avoid misleading 0/0 stats)
  const averageSessionMinutes = sessions.length > 0
    ? Math.round(totalStudyMinutes / sessions.length)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b theme-border">
        <div>
          <h1 className="text-2xl font-black theme-text-primary tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 theme-accent-text" />
            <span>Progress & Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm theme-text-muted mt-1">
            Real-time study metrics, focus time breakdown, and habit consistency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>Database Synced</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} Streak
            </span>
          </div>
        </div>
      </div>

      {/* Primary Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Time */}
        <div id="stat-total-study-time" className="theme-bg-card p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between theme-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Study Time</span>
            <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">
              {formatMinutes(totalStudyMinutes)}
            </div>
            <p className="text-[11px] theme-text-muted mt-1 font-medium">
              {sessions.length} completed {sessions.length === 1 ? 'session' : 'sessions'}
            </p>
          </div>
        </div>

        {/* Today's Study Time */}
        <div id="stat-today-study-time" className="theme-bg-card p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between theme-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Focus</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">
              {formatMinutes(todayStudyMinutes)}
            </div>
            <p className="text-[11px] theme-text-muted mt-1 font-medium">
              {dailyGoalPercent}% of daily goal ({formatMinutes(dailyGoalMinutes)})
            </p>
          </div>
        </div>

        {/* Weekly Study Time */}
        <div id="stat-weekly-study-time" className="theme-bg-card p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between theme-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Weekly Time</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">
              {formatMinutes(weeklyStudyMinutes)}
            </div>
            <p className="text-[11px] theme-text-muted mt-1 font-medium">
              Since Monday
            </p>
          </div>
        </div>

        {/* Monthly Study Time */}
        <div id="stat-monthly-study-time" className="theme-bg-card p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between theme-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Time</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">
              {formatMinutes(monthlyStudyMinutes)}
            </div>
            <p className="text-[11px] theme-text-muted mt-1 font-medium">
              This calendar month
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Daily Goal Progress + Tasks Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Goal Card */}
        <div id="card-daily-goal-progress" className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg theme-accent-subtle theme-accent-text flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold theme-text-primary">Daily Goal Progress</h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              dailyGoalPercent >= 100 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'theme-bg-subtle theme-text-secondary'
            }`}>
              {dailyGoalPercent >= 100 ? 'Goal Achieved! 🎉' : `${dailyGoalPercent}% Done`}
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="theme-text-muted opacity-20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={dailyGoalPercent >= 100 ? 'text-emerald-500' : 'theme-accent-text'}
                  strokeDasharray={`${dailyGoalPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs theme-text-primary">
                {dailyGoalPercent}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold theme-text-primary">
                {formatMinutes(todayStudyMinutes)} / {formatMinutes(dailyGoalMinutes)}
              </div>
              <p className="text-xs theme-text-muted">
                {dailyGoalRemaining > 0 
                  ? `${formatMinutes(dailyGoalRemaining)} left to reach your daily target.`
                  : 'You have exceeded your study target for today!'}
              </p>
            </div>
          </div>

          <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                dailyGoalPercent >= 100 ? 'bg-emerald-500' : 'bg-[var(--accent-primary)]'
              }`}
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks Completed Card */}
        <div id="card-tasks-completed-progress" className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold theme-text-primary">Tasks Completed</h2>
            </div>
            <span className="text-xs font-bold theme-text-muted">
              {completedTasksCount} of {totalTasksCount}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black theme-text-primary">{completedTasksCount}</span>
            <span className="text-xs font-medium theme-text-muted">tasks finished</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs theme-text-secondary font-medium">
              <span>Completion Rate</span>
              <span className="font-bold">{taskCompletionRate}%</span>
            </div>
            <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>

          {onNavigateToTasks && (
            <button
              type="button"
              onClick={onNavigateToTasks}
              className="text-xs font-semibold theme-accent-text hover:underline flex items-center gap-1 pt-1 transition-colors cursor-pointer"
            >
              <span>Manage Coursework Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Focus Consistency & Session Quality */}
        <div id="card-session-averages" className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold theme-text-primary">Study Consistency</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider block">
                Total Sessions
              </span>
              <span className="text-xl font-black theme-text-primary mt-1 block">
                {sessions.length}
              </span>
            </div>

            <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
              <span className="text-[11px] font-semibold theme-text-muted uppercase tracking-wider block">
                Avg Session
              </span>
              <span className="text-xl font-black theme-text-primary mt-1 block">
                {averageSessionMinutes !== null ? `${averageSessionMinutes}m` : '—'}
              </span>
            </div>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs theme-text-muted">
              No sessions completed yet. Study sessions will automatically record your average length and consistency.
            </p>
          ) : (
            <p className="text-xs theme-text-muted">
              {currentStreak > 0 
                ? `You have a ${currentStreak}-day active study streak. Keep it going!`
                : 'Complete a study session today to start your streak.'}
            </p>
          )}
        </div>
      </div>

      {/* Daily Study Time Chart (Interactive Clean SVG Bar Chart) */}
      <div id="section-daily-study-chart" className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold theme-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 theme-accent-text" />
              <span>Study Time History</span>
            </h2>
            <p className="text-xs theme-text-muted mt-0.5">
              Daily minutes studied compared to your daily target ({formatMinutes(dailyGoalMinutes)}).
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 theme-bg-subtle rounded-xl text-xs font-semibold theme-text-secondary self-start sm:self-auto border theme-border">
            <button
              type="button"
              onClick={() => setChartTimeframe(7)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                chartTimeframe === 7 ? 'theme-bg-card theme-accent-text font-bold shadow-2xs' : 'hover:theme-text-primary'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setChartTimeframe(14)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                chartTimeframe === 14 ? 'theme-bg-card theme-accent-text font-bold shadow-2xs' : 'hover:theme-text-primary'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setChartTimeframe(30)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                chartTimeframe === 30 ? 'theme-bg-card theme-accent-text font-bold shadow-2xs' : 'hover:theme-text-primary'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Insufficient Data Check */}
        {totalSessionsInWindow === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Study Data for Selected Timeframe</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You haven't recorded any focus sessions in the past {chartTimeframe} days. 
                Start a session in the Focus Timer tab to begin tracking your study analytics honestly.
              </p>
            </div>
            {onNavigateToTimer && (
              <button
                type="button"
                onClick={onNavigateToTimer}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Focus Session</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* SVG Visual Bars */}
            <div className="relative h-56 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b theme-border">
              {/* Daily target reference line */}
              <div 
                className="absolute left-0 right-0 border-b-2 border-dashed border-[var(--accent-primary)]/40 pointer-events-none flex justify-end z-0"
                style={{ bottom: `${Math.min(92, (dailyGoalMinutes / maxChartMinutes) * 100)}%` }}
              >
                <span className="text-[10px] font-semibold theme-accent-text theme-accent-subtle px-2 py-0.5 rounded-sm mr-2 -translate-y-2.5">
                  Target: {formatMinutes(dailyGoalMinutes)}
                </span>
              </div>

              {dailyChartData.map((d, idx) => {
                const heightPercent = maxChartMinutes > 0 ? (d.minutes / maxChartMinutes) * 100 : 0;
                const isHovered = hoveredBarIndex === idx;
                const isToday = d.dateStr === todayStr;
                const metTarget = d.minutes >= dailyGoalMinutes;

                return (
                  <div
                    key={d.dateStr}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 theme-bg-card theme-border border theme-text-primary text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in">
                        <div className="font-bold">{d.label} ({d.weekday})</div>
                        <div className="theme-text-muted">{formatMinutes(d.minutes)} studied</div>
                      </div>
                    )}

                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        isToday 
                          ? metTarget ? 'bg-emerald-500' : 'bg-[var(--accent-primary)]'
                          : metTarget ? 'bg-emerald-400/80' : d.minutes > 0 ? 'bg-[var(--chart-bar)]' : 'bg-[var(--bg-subtle)]'
                      } ${isHovered ? 'ring-2 ring-[var(--accent-primary)] ring-offset-1 opacity-90' : ''}`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-2 sm:gap-3 text-center">
              {dailyChartData.map((d) => (
                <div key={d.dateStr} className="flex-1 text-[10px] theme-text-muted truncate">
                  <span className="hidden sm:inline">{d.label}</span>
                  <span className="sm:hidden">{d.weekday}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject Study-Time Breakdown */}
      <div id="section-subject-breakdown" className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold theme-text-primary flex items-center gap-2">
              <PieChart className="w-4 h-4 theme-accent-text" />
              <span>Subject Study-Time Breakdown</span>
            </h2>
            <p className="text-xs theme-text-muted mt-0.5">
              Distribution of your study hours across your academic courses.
            </p>
          </div>
          <span className="text-xs font-semibold theme-text-muted">
            {subjectBreakdown.length} {subjectBreakdown.length === 1 ? 'Subject' : 'Subjects'} Active
          </span>
        </div>

        {subjectBreakdown.length === 0 ? (
          <div className="p-6 text-center theme-bg-subtle rounded-xl border border-dashed theme-border">
            <p className="text-xs theme-text-muted">
              No subject-specific study time recorded yet. When you start focus sessions, select your subject to track course distributions here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Proportional Colored Multi-Segment Progress Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-[var(--bg-subtle)] p-0.5">
              {subjectBreakdown.map((item) => {
                const pct = totalStudyMinutes > 0 
                  ? (item.minutes / totalStudyMinutes) * 100 
                  : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={item.name}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:opacity-90"
                    title={`${item.name}: ${formatMinutes(item.minutes)} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Detailed Subject List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjectBreakdown.map((item) => {
                const pct = totalStudyMinutes > 0 
                  ? Math.round((item.minutes / totalStudyMinutes) * 100) 
                  : 0;
                return (
                  <div 
                    key={item.name} 
                    className="p-3.5 rounded-xl border theme-border theme-bg-subtle flex items-center justify-between hover:theme-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold theme-text-primary truncate block">
                          {item.name}
                        </span>
                        <span className="text-[11px] theme-text-muted">
                          {item.sessionCount} {item.sessionCount === 1 ? 'session' : 'sessions'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold theme-text-primary block">
                        {formatMinutes(item.minutes)}
                      </span>
                      <span className="text-[10px] font-semibold theme-accent-text">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Focus Session Log Table */}
      {sessions.length > 0 && (
        <div className="theme-bg-card p-6 rounded-2xl border theme-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold theme-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 theme-text-secondary" />
              <span>Recent Focus Sessions</span>
            </h2>
            <span className="text-xs theme-text-muted">Showing last {Math.min(5, sessions.length)} sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b theme-border theme-text-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Subject</th>
                  <th className="pb-2.5">Task / Topic</th>
                  <th className="pb-2.5">Mode</th>
                  <th className="pb-2.5 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {sessions.slice(0, 5).map((s) => {
                  const dateStr = s.completedAt ? s.completedAt.split('T')[0] : '';
                  const timeStr = s.completedAt ? new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <tr key={s.id} className="hover:theme-bg-subtle transition-colors">
                      <td className="py-3 font-medium theme-text-primary whitespace-nowrap">
                        {formatReadableDate(dateStr)} <span className="theme-text-muted">{timeStr}</span>
                      </td>
                      <td className="py-3 theme-text-primary font-medium">
                        {s.subjectName || <span className="theme-text-muted italic">General</span>}
                      </td>
                      <td className="py-3 theme-text-secondary max-w-xs truncate">
                        {s.taskTitle || s.notes || <span className="theme-text-muted italic">—</span>}
                      </td>
                      <td className="py-3">
                        <span className="capitalize px-2 py-0.5 rounded-md theme-bg-subtle theme-text-secondary font-medium text-[11px] border theme-border">
                          {s.mode.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold theme-text-primary">
                        {formatMinutes(s.durationMinutes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
