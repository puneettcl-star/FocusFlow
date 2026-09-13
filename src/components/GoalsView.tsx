import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Award,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Goal } from '../types';
import { formatReadableDate, getTodayString } from '../utils/date';

interface GoalsViewProps {
  goals: Goal[];
  onOpenCreateModal: () => void;
  onUpdateProgress: (goalId: string, newValue: number, targetValue: number) => Promise<void>;
  onToggleComplete: (goalId: string, currentCompleted: boolean) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onOpenCreateModal,
  onUpdateProgress,
  onToggleComplete,
  onDeleteGoal,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const todayStr = getTodayString();

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals]);

  const filteredGoals = useMemo(() => {
    if (filter === 'active') return activeGoals;
    if (filter === 'completed') return completedGoals;
    return goals;
  }, [goals, filter, activeGoals, completedGoals]);

  const overallProgressPct = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalTarget = goals.reduce((acc, g) => acc + g.targetValue, 0);
    const totalCurrent = goals.reduce((acc, g) => acc + Math.min(g.currentValue, g.targetValue), 0);
    return totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  }, [goals]);

  const handleStartEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditValue(goal.currentValue);
  };

  const handleSaveEdit = async (goal: Goal) => {
    await onUpdateProgress(goal.id, editValue, goal.targetValue);
    setEditingGoalId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Target className="w-7 h-7 text-indigo-600" />
            <span>Study Goals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define measurable milestones, track continuous progress, and celebrate accomplishments.
          </p>
        </div>

        <button
          id="btn-create-goal-top"
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Goal</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active Goals
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {activeGoals.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Completed Goals
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {completedGoals.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Overall Progress
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {overallProgressPct}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'active' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Active ({activeGoals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'completed' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Completed ({completedGoals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            All Goals ({goals.length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {filter === 'completed' ? 'No Completed Goals Yet' : 'No Study Goals Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'completed'
                ? 'Complete your targets to see your milestones celebrated here.'
                : 'Set measurable targets like studying 25 hours or reading 10 textbook chapters to maintain steady momentum.'}
            </p>
          </div>
          {filter !== 'completed' && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const isCompleted = goal.completed;
            const progressPct = goal.targetValue > 0 
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 0;
            const isOverdue = !isCompleted && goal.targetDate < todayStr;
            const isDueToday = !isCompleted && goal.targetDate === todayStr;

            return (
              <div
                key={goal.id}
                id={`goal-card-${goal.id}`}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                  isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(goal.id, goal.completed)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 text-transparent'
                      }`}
                      title={isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div>
                      <h3 className={`text-sm font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete goal "${goal.title}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar & Value Display */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {editingGoalId === goal.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(Math.max(0, Number(e.target.value)))}
                            className="w-16 px-2 py-0.5 border border-indigo-400 rounded-md text-xs font-mono font-bold"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(goal)}
                            className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGoalId(null)}
                            className="px-1.5 py-0.5 text-slate-500 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(goal)}
                          className="font-mono font-black text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Click to edit progress number"
                        >
                          <span>{goal.currentValue}</span>
                          <span className="text-slate-400 font-normal">/ {goal.targetValue} {goal.unit}</span>
                        </button>
                      )}
                    </div>

                    <span className={`font-bold text-xs ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {progressPct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Controls & Target Date Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Target Date Pill */}
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {formatReadableDate(goal.targetDate)}</span>
                    {isOverdue && (
                      <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded font-bold">Overdue</span>
                    )}
                    {isDueToday && (
                      <span className="px-1.5 py-0.2 bg-amber-50 text-amber-600 rounded font-bold">Due Today</span>
                    )}
                  </div>

                  {/* Progress Quick Increments */}
                  {!isCompleted && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={goal.currentValue <= 0}
                        onClick={() => onUpdateProgress(goal.id, goal.currentValue - 1, goal.targetValue)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Decrement 1"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateProgress(goal.id, goal.currentValue + 1, goal.targetValue)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Add 1"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateProgress(goal.id, goal.currentValue + 5, goal.targetValue)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Add 5"
                      >
                        +5
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Completed!</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
