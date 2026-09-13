import React, { useState } from 'react';
import { X, Target, Calendar, CheckCircle, Hash, AlertCircle, Loader2 } from 'lucide-react';
import { getTodayString } from '../utils/date';
import { parseAppError } from '../utils/errorParser';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    targetDate: string;
    targetValue: number;
    currentValue?: number;
    unit: string;
  }) => Promise<void>;
}

const COMMON_UNITS = ['hours', 'tasks', 'sessions', 'chapters', 'problem sets', 'mock tests'];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    // Default to end of current month or 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [targetValue, setTargetValue] = useState(10);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('hours');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return;
    }
    if (targetValue <= 0) {
      setError('Target value must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue) || 0,
        unit: unit.trim() || 'tasks',
      });
      // Reset form
      setTitle('');
      setDescription('');
      setCurrentValue(0);
      setTargetValue(10);
      onClose();
    } catch (err: unknown) {
      const parsed = parseAppError(err, 'goal creation');
      setError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg theme-bg-card rounded-3xl border theme-border shadow-2xl p-6 sm:p-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b theme-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold theme-text-primary">Create Study Goal</h2>
              <p className="text-xs theme-text-muted">Set a measurable target and deadline for your studies.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl theme-text-muted hover:theme-text-primary hover:theme-bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Title */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Complete 20 Calculus Problem Sets, Study 40 Hours for Midterms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
              Description / Action Plan (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key milestones or resources to achieve this goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Measurable Target & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
                Target Amount <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm font-mono font-bold theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
                Unit of Measurement
              </label>
              <input
                type="text"
                placeholder="e.g. hours, tasks, chapters"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Quick Unit Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] theme-text-muted font-medium mr-1">Suggestions:</span>
            {COMMON_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  unit.toLowerCase() === u
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'theme-bg-subtle theme-text-secondary hover:theme-text-primary border theme-border'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Starting Progress & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
                Current Progress
              </label>
              <input
                type="number"
                min="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm font-mono font-bold theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
                Target Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={getTodayString()}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 theme-text-primary font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium theme-text-secondary theme-bg-subtle hover:opacity-80 rounded-xl transition-opacity cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-goal-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Creating Goal...' : 'Set Study Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

