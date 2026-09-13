import React, { useMemo } from 'react';
import { 
  Play, 
  Plus, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Task, Subject, FocusSession, UserProfile } from '../types';
import { 
  getGreeting, 
  formatHeaderDate, 
  formatReadableDate, 
  formatMinutes, 
  isDueToday, 
  isDueUpcoming, 
  isTaskOverdue 
} from '../utils/date';

interface DashboardProps {
  userProfile: UserProfile | null;
  tasks: Task[];
  subjects: Subject[];
  sessions: FocusSession[];
  todayStudyMinutes: number;
  onQuickStartFocus: () => void;
  onQuickAddTask: () => void;
  onViewAllTasks: () => void;
  onToggleComplete: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onOpenFocusWithTask: (taskId: string, subjectId?: string) => void;
  onNavigateToGoals?: () => void;
  onNavigateToProgress?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  tasks,
  subjects,
  sessions,
  todayStudyMinutes,
  onQuickStartFocus,
  onQuickAddTask,
  onViewAllTasks,
  onToggleComplete,
  onOpenFocusWithTask,
  onNavigateToGoals,
  onNavigateToProgress,
}) => {
  const greeting = getGreeting();
  const studentName = userProfile?.displayName || 'Student';
  const dailyGoalMinutes = userProfile?.dailyGoalMinutes || 120;
  const streak = userProfile?.currentStreak || 1;

  // Progress percentage toward daily goal
  const progressPercent = Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100));

  // Partition tasks for dashboard
  const { todayTasks, upcomingTasks, completedTodayCount, totalCompletedCount } = useMemo(() => {
    const today: Task[] = [];
    const upcoming: Task[] = [];
    let compToday = 0;
    let compTotal = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach(t => {
      if (t.completed) {
        compTotal++;
        if (t.completedAt && t.completedAt.startsWith(todayStr)) {
          compToday++;
        }
      } else {
        if (isDueToday(t.dueDate) || isTaskOverdue(t.dueDate, t.dueTime, false) || t.priority === 'urgent') {
          today.push(t);
        } else if (isDueUpcoming(t.dueDate)) {
          upcoming.push(t);
        } else {
          // General active tasks
          today.push(t);
        }
      }
    });

    return {
      todayTasks: today.slice(0, 5),
      upcomingTasks: upcoming.slice(0, 4),
      completedTodayCount: compToday,
      totalCompletedCount: compTotal,
    };
  }, [tasks]);

  // 7-day study breakdown
  const last7DaysData = useMemo(() => {
    const days: { dayName: string; minutes: number; dateStr: string }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });

      // sum sessions on that date
      const totalMins = sessions
        .filter(s => s.completedAt.startsWith(dateStr))
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      days.push({ dayName, minutes: totalMins, dateStr });
    }
    return days;
  }, [sessions]);

  const maxMinutesInWeek = Math.max(60, ...last7DaysData.map(d => d.minutes));

  return (
    <div id="dashboard-main-view" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Welcome Header & Quick Action Buttons */}
      <div className="bg-linear-to-r from-white via-indigo-50/30 to-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Active</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{formatHeaderDate()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {studentName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            {progressPercent >= 100
              ? 'Awesome commitment! You have reached your daily study goal today.'
              : `You are ${dailyGoalMinutes - todayStudyMinutes > 0 ? formatMinutes(dailyGoalMinutes - todayStudyMinutes) : '0m'} away from hitting today\'s target.`}
          </p>
        </div>

        {/* Quick Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-quick-add-task"
            type="button"
            onClick={onQuickAddTask}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Quick Add Task</span>
          </button>

          <button
            id="btn-quick-start-focus"
            type="button"
            onClick={onQuickStartFocus}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Quick Start Focus</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Study Time */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Focus</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatMinutes(todayStudyMinutes)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Goal: {formatMinutes(dailyGoalMinutes)}
            </div>
          </div>
          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] font-semibold text-indigo-600 text-right">
            {progressPercent}% accomplished
          </div>
        </div>

        {/* Metric 2: Study Streak */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              Consistent focus habit
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Log a focus session daily to keep your flame active.
          </div>
        </div>

        {/* Metric 3: Completed Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {completedTodayCount} <span className="text-xs text-slate-400 font-normal">today</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {totalCompletedCount} total tasks finished
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Pending study tasks:</span>
            <strong className="text-slate-800">{tasks.filter(t => !t.completed).length}</strong>
          </div>
        </div>

        {/* Metric 4: Daily Goal Status */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Goal</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {dailyGoalMinutes} <span className="text-xs text-slate-400 font-normal">mins</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {Math.floor(dailyGoalMinutes / 60)} hrs / day pace
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Overall Total:</span>
            <strong className="text-slate-800">{formatMinutes(userProfile?.totalStudyMinutes || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Tasks & Urgent Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Tasks Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Today's Focus Tasks</h2>
              </div>
              <button
                id="btn-dash-view-all-tasks"
                type="button"
                onClick={onViewAllTasks}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">
                    No active tasks scheduled for today.
                  </p>
                  <button
                    type="button"
                    onClick={onQuickAddTask}
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add a study task
                  </button>
                </div>
              ) : (
                todayTasks.map((task) => {
                  const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id, task.completed)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            {task.subjectName && (
                              <span 
                                className="font-medium px-1.5 py-0.2 rounded"
                                style={{
                                  backgroundColor: task.subjectColor ? `${task.subjectColor}20` : '#EEF2FF',
                                  color: task.subjectColor || '#4F46E5',
                                }}
                              >
                                {task.subjectName}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenFocusWithTask(task.id, task.subjectId)}
                        title="Start focus timer on this task"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 text-xs transition-colors shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Tasks Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Upcoming Assignments</h2>
              </div>
            </div>

            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="p-4 text-center border border-slate-100 rounded-2xl text-xs text-slate-400">
                  No upcoming tasks scheduled later this week.
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-slate-800 truncate block">{task.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {task.subjectName ? `${task.subjectName} • ` : ''}
                        Due {formatReadableDate(task.dueDate)}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Progress & Recent Focus Sessions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 7-Day Study Minutes Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Weekly Study Minutes</h2>
              </div>
              {onNavigateToProgress ? (
                <button
                  type="button"
                  onClick={onNavigateToProgress}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Full Analytics</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Last 7 Days</span>
              )}
            </div>

            {/* Simple Clean Bar Visualizer */}
            <div className="pt-2">
              <div className="h-32 flex items-end justify-between gap-2 px-1">
                {last7DaysData.map((d, index) => {
                  const barHeight = Math.max(8, (d.minutes / maxMinutesInWeek) * 100);
                  const isToday = index === 6;
                  return (
                    <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-mono text-slate-400">
                        {d.minutes > 0 ? `${d.minutes}m` : ''}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-full max-h-24 flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isToday ? 'bg-indigo-600' : 'bg-indigo-200 hover:bg-indigo-300'
                          }`}
                          style={{ height: `${barHeight}%` }}
                          title={`${d.dateStr}: ${d.minutes} mins`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Focus Sessions Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Recent Focus Sessions</h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {sessions.length} logged
              </span>
            </div>

            <div className="space-y-2.5">
              {sessions.length === 0 ? (
                <div className="p-4 text-center border border-slate-100 rounded-2xl text-xs text-slate-400">
                  No sessions logged yet. Start a focus session to build your log!
                </div>
              ) : (
                sessions.slice(0, 4).map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {sess.subjectName || 'General Study'}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                        +{sess.durationMinutes} mins
                      </span>
                    </div>

                    {sess.taskTitle && (
                      <p className="text-[11px] text-slate-600 truncate">
                        Task: {sess.taskTitle}
                      </p>
                    )}

                    {sess.notes && (
                      <p className="text-[10px] text-slate-500 italic truncate">
                        "{sess.notes}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pt-0.5">
                      {new Date(sess.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(sess.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
