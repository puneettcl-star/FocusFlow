import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Play, 
  ArrowRight, 
  BookOpen, 
  CalendarDays, 
  ListFilter,
  Flame,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import { Task, Subject, PlannerViewMode } from '../types';
import { 
  getTodayString, 
  formatReadableDate, 
  isTaskOverdue, 
  getOverdueText,
  isDueToday 
} from '../utils/date';

interface StudyPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleComplete: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onAssignTaskDate: (taskId: string, dateStr: string) => Promise<void>;
  onOpenCreateTaskWithDate: (dateStr: string) => void;
  onStartFocusOnTask: (taskId: string, subjectId?: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  subjects,
  onToggleComplete,
  onAssignTaskDate,
  onOpenCreateTaskWithDate,
  onStartFocusOnTask,
}) => {
  const [viewMode, setViewMode] = useState<PlannerViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const d = new Date();
    // Start with Monday of current week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Modal / popover for assigning task to date
  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [targetScheduleDate, setTargetScheduleDate] = useState<string>(getTodayString());

  // Week days calculation
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[] = [];
    const todayStr = getTodayString();

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [weekStartDate]);

  // Tasks for selected day in Daily View
  const dailyTasks = useMemo(() => {
    return tasks.filter(t => {
      const scheduled = t.scheduledDate || t.dueDate;
      return scheduled === selectedDate;
    });
  }, [tasks, selectedDate]);

  // Upcoming deadlines (next 14 days, sorted by dueDate)
  const upcomingDeadlines = useMemo(() => {
    const todayStr = getTodayString();
    return tasks
      .filter(t => !t.completed && t.dueDate && (t.dueDate >= todayStr || isTaskOverdue(t.dueDate, t.dueTime, false)))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 6);
  }, [tasks]);

  // Unscheduled tasks
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && !t.scheduledDate && !t.dueDate);
  }, [tasks]);

  // Daily view navigation
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleJumpToday = () => {
    setSelectedDate(getTodayString());
  };

  // Weekly view navigation
  const handlePrevWeek = () => {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  };

  const handleCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setWeekStartDate(monday);
  };

  // Reschedule handler
  const handleConfirmReschedule = async () => {
    if (!reschedulingTask || !targetScheduleDate) return;
    await onAssignTaskDate(reschedulingTask.id, targetScheduleDate);
    setReschedulingTask(null);
  };

  const formattedSelectedDateHeader = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div id="study-planner-container" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            <span>Study Planner</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan study schedules, allocate study dates for assignments, and meet deadlines on time.
          </p>
        </div>

        {/* View Switcher: Daily vs Weekly */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              id="planner-view-daily-btn"
              type="button"
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Daily View</span>
            </button>
            <button
              id="planner-view-weekly-btn"
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Weekly View</span>
            </button>
          </div>

          <button
            id="planner-add-task-btn"
            type="button"
            onClick={() => onOpenCreateTaskWithDate(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* Main Planner Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Calendar Views (Daily or Weekly) - 8 cols */}
        <div className="lg:col-span-8 space-y-6">

          {/* DAILY VIEW */}
          {viewMode === 'daily' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {/* Daily Navigator Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-prev-day"
                    type="button"
                    onClick={handlePrevDay}
                    title="Previous Day"
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-next-day"
                    type="button"
                    onClick={handleNextDay}
                    title="Next Day"
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-today-day"
                    type="button"
                    onClick={handleJumpToday}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    {formattedSelectedDateHeader}
                  </span>
                  {selectedDate === getTodayString() && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Today
                    </span>
                  )}
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              {/* Tasks Scheduled for this day */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Scheduled Tasks ({dailyTasks.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => onOpenCreateTaskWithDate(selectedDate)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add for this date
                  </button>
                </div>

                {dailyTasks.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-500">
                      No study tasks scheduled for this date.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">
                      Plan ahead by assigning tasks from your unscheduled queue or creating a new assignment.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenCreateTaskWithDate(selectedDate)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-colors"
                    >
                      + Schedule Study Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dailyTasks.map((task) => {
                      const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            task.completed
                              ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                              : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onToggleComplete(task.id, task.completed)}
                              className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                  {task.title}
                                </span>
                                {task.priority === 'urgent' && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                    Urgent
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                {task.subjectName && (
                                  <span 
                                    className="px-2 py-0.5 rounded-md font-semibold"
                                    style={{
                                      backgroundColor: task.subjectColor ? `${task.subjectColor}15` : '#EEF2FF',
                                      color: task.subjectColor || '#4F46E5',
                                    }}
                                  >
                                    {task.subjectName}
                                  </span>
                                )}

                                {task.dueTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.dueTime}
                                  </span>
                                )}

                                {task.dueDate && task.dueDate !== selectedDate && (
                                  <span className="text-amber-700 font-medium">
                                    Deadline: {formatReadableDate(task.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingTask(task);
                                setTargetScheduleDate(selectedDate);
                              }}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Reschedule
                            </button>

                            {!task.completed && (
                              <button
                                type="button"
                                onClick={() => onStartFocusOnTask(task.id, task.subjectId)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Focus</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WEEKLY VIEW */}
          {viewMode === 'weekly' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {/* Weekly Navigator Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-prev-week"
                    type="button"
                    onClick={handlePrevWeek}
                    title="Previous Week"
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-next-week"
                    type="button"
                    onClick={handleNextWeek}
                    title="Next Week"
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-this-week"
                    type="button"
                    onClick={handleCurrentWeek}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Current Week
                  </button>
                </div>

                <div className="text-sm font-bold text-slate-900">
                  {weekDays[0].dayName}, {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].dayName}, {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* 7 Days Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const dayTasks = tasks.filter(t => {
                    const scheduled = t.scheduledDate || t.dueDate;
                    return scheduled === day.dateStr;
                  });

                  return (
                    <div
                      key={day.dateStr}
                      className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[220px] transition-all ${
                        day.isToday
                          ? 'bg-indigo-50/30 border-indigo-200 shadow-2xs'
                          : 'bg-slate-50/50 border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="pb-2 mb-2 border-b border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className={`text-[11px] font-bold block ${day.isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {day.dayName}
                          </span>
                          <span className={`text-base font-extrabold ${day.isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {day.dayNumber}
                          </span>
                        </div>
                        {day.isToday && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" title="Today" />
                        )}
                      </div>

                      {/* Scheduled Tasks on this Day */}
                      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-48">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedDate(day.dateStr);
                              setViewMode('daily');
                            }}
                            className="p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer text-left"
                            title={`${t.title} (${t.subjectName || 'General'})`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                style={{ backgroundColor: t.subjectColor || '#6366F1' }}
                              />
                              <span className={`text-[10px] font-semibold truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {t.title}
                              </span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length === 0 && (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-400 italic py-4">
                            No tasks
                          </div>
                        )}
                      </div>

                      {/* Quick Add on this Day */}
                      <button
                        type="button"
                        onClick={() => onOpenCreateTaskWithDate(day.dateStr)}
                        className="mt-2 w-full py-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Upcoming Deadlines & Task Allocation Queue - 4 cols */}
        <div className="lg:col-span-4 space-y-6">

          {/* Upcoming Deadlines Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Next 14 days</span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center">
                  No upcoming deadlines detected. You are caught up!
                </p>
              ) : (
                upcomingDeadlines.map((task) => {
                  const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
                  const isToday = isDueToday(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isOverdue
                          ? 'bg-rose-50/50 border-rose-200'
                          : isToday
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50/50 border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            {task.subjectName && (
                              <span 
                                className="font-semibold"
                                style={{ color: task.subjectColor || '#4F46E5' }}
                              >
                                {task.subjectName}
                              </span>
                            )}
                            <span className={`font-semibold ${isOverdue ? 'text-rose-600' : isToday ? 'text-amber-800' : 'text-slate-500'}`}>
                              {isOverdue ? 'Overdue!' : isToday ? 'Due Today' : `Due ${formatReadableDate(task.dueDate)}`}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onStartFocusOnTask(task.id, task.subjectId)}
                          title="Focus on this deadline"
                          className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Unscheduled Tasks Allocation Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Unscheduled Tasks</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                {unscheduledTasks.length} pending
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Assign these tasks to specific study dates so they appear directly in your schedule.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {unscheduledTasks.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  All active tasks have scheduled study dates!
                </div>
              ) : (
                unscheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate flex-1 pr-2">{t.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReschedulingTask(t);
                        setTargetScheduleDate(selectedDate);
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 shrink-0"
                    >
                      Assign Date
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Reschedule Date Modal */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Assign Study Date
            </h3>
            <p className="text-xs text-slate-600">
              Choose when you plan to study and work on: <br />
              <strong className="text-slate-900">{reschedulingTask.title}</strong>
            </p>

            {/* Quick date shortcuts */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTargetScheduleDate(getTodayString())}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setTargetScheduleDate(d.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  setTargetScheduleDate(d.toISOString().split('T')[0]);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                In 2 Days
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pick Custom Date
              </label>
              <input
                type="date"
                value={targetScheduleDate}
                onChange={(e) => setTargetScheduleDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
