import React, { useState } from 'react';
import { BookOpen, Plus, Clock, CheckSquare, Trash2, Play, AlertCircle, Sparkles, X, Loader2 } from 'lucide-react';
import { Subject, Task } from '../types';
import { formatMinutes } from '../utils/date';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { parseAppError } from '../utils/errorParser';
import { validateTextField } from '../utils/security';

interface SubjectsViewProps {
  subjects: Subject[];
  tasks: Task[];
  onCreateSubject: (name: string, color: string) => Promise<string>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onStartFocusForSubject: (subjectId: string) => void;
}

const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  tasks,
  onCreateSubject,
  onDeleteSubject,
  onStartFocusForSubject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Deletion modal
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTextField(name, 'Subject Name', {
      required: true,
      minLength: 1,
      maxLength: 50
    });

    if (!validation.isValid) {
      setNameError(validation.error || 'Invalid subject name');
      return;
    }
    setNameError(null);

    setIsSubmitting(true);
    setErrorBanner(null);
    try {
      await onCreateSubject(validation.sanitizedValue || name.trim(), color);
      setName('');
      setColor(COLOR_PALETTE[0]);
      setIsModalOpen(false);
    } catch (err) {
      const parsed = parseAppError(err, 'subject creation');
      setErrorBanner(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteSubject(subjectToDelete.id);
      setSubjectToDelete(null);
    } catch (err) {
      const parsed = parseAppError(err, 'subject deletion');
      setErrorBanner(parsed.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="subjects-view-main" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b theme-border">
        <div>
          <h1 className="text-2xl font-black theme-text-primary tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 theme-accent-text" />
            <span>Study Subjects</span>
          </h1>
          <p className="text-xs sm:text-sm theme-text-muted mt-0.5">
            Organize coursework into subjects to balance time and focus effectively.
          </p>
        </div>

        <button
          id="btn-add-subject-primary"
          type="button"
          onClick={() => {
            setErrorBanner(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorBanner && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Empty State when no subjects exist */}
      {subjects.length === 0 ? (
        <div className="p-10 text-center theme-bg-card rounded-2xl border theme-border shadow-xs space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-2xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text-primary">No Study Subjects Created Yet</h3>
            <p className="text-xs theme-text-muted mt-1 leading-relaxed">
              Create subjects like Mathematics, Biology, or History to organize your task checklist and track time by course.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorBanner(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Subject</span>
          </button>
        </div>
      ) : (
        /* Grid of Subjects */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const subjectTasks = tasks.filter(t => t.subjectId === sub.id);
            const pendingTasks = subjectTasks.filter(t => !t.completed);
            const completedTasks = subjectTasks.filter(t => t.completed);

            return (
              <div
                key={sub.id}
                className="p-5 theme-bg-card rounded-2xl border theme-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                        style={{ backgroundColor: sub.color }}
                      />
                      <h3 className="font-bold theme-text-primary text-sm truncate">{sub.name}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSubjectToDelete(sub)}
                      title="Delete Subject"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
                      <span className="text-[10px] theme-text-muted uppercase font-semibold block">Total Time</span>
                      <span className="text-sm font-bold theme-text-primary font-mono">
                        {formatMinutes(sub.totalStudyMinutes || 0)}
                      </span>
                    </div>
                    <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
                      <span className="text-[10px] theme-text-muted uppercase font-semibold block">Active Tasks</span>
                      <span className="text-sm font-bold theme-accent-text font-mono">
                        {pendingTasks.length} <span className="text-xs theme-text-muted font-normal">({completedTasks.length} done)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t theme-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onStartFocusForSubject(sub.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold theme-accent-text theme-accent-subtle hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Subject Timer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md theme-bg-card rounded-3xl border theme-border shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl theme-accent-subtle theme-accent-text flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold theme-text-primary">Create Study Subject</h3>
                  <p className="text-xs theme-text-muted">Categorize tasks and track subject hours.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl theme-text-muted hover:theme-text-primary hover:theme-bg-subtle transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorBanner && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. Organic Chemistry, Linear Algebra"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className={`w-full px-3.5 py-2.5 theme-bg-subtle border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 ${
                    nameError ? 'border-rose-500' : 'theme-border'
                  }`}
                  autoFocus
                />
                {nameError && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                  Subject Color
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-xl transition-all cursor-pointer ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110 shadow-sm' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium theme-text-secondary theme-bg-subtle hover:opacity-80 rounded-xl transition-opacity cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Adding...' : 'Create Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation */}
      <DeleteConfirmModal
        isOpen={!!subjectToDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? Any tasks categorized under this subject will remain in your workspace.`}
        confirmLabel="Delete Subject"
        loading={isDeleting}
        onCancel={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

