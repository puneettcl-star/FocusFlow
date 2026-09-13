import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { Task, TaskPriority, Subject } from '../types';
import { getTodayString } from '../utils/date';
import { parseAppError } from '../utils/errorParser';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    subjectId?: string;
    subjectName?: string;
    subjectColor?: string;
    priority: TaskPriority;
    dueDate?: string;
    dueTime?: string;
    scheduledDate?: string;
  }) => Promise<void>;
  taskToEdit?: Task | null;
  initialDueDate?: string;
  subjects: Subject[];
  onQuickCreateSubject?: (name: string, color: string) => Promise<string>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  initialDueDate,
  subjects,
  onQuickCreateSubject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick create new subject state inside task modal
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#6366F1');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setSubjectId(taskToEdit.subjectId || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects.length > 0 ? subjects[0].id : '');
      setPriority('medium');
      setDueDate(initialDueDate || getTodayString());
      setDueTime('');
    }
    setError('');
    setIsCreatingSubject(false);
  }, [taskToEdit, isOpen, subjects, initialDueDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    const selectedSubject = subjects.find(s => s.id === subjectId);

    setIsSubmitting(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        subjectId: selectedSubject?.id || '',
        subjectName: selectedSubject?.name || '',
        subjectColor: selectedSubject?.color || '',
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const parsed = parseAppError(err, 'task saving');
      setError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubjectInline = async () => {
    if (!newSubName.trim() || !onQuickCreateSubject) return;
    try {
      const createdId = await onQuickCreateSubject(newSubName.trim(), newSubColor);
      setSubjectId(createdId);
      setIsCreatingSubject(false);
      setNewSubName('');
    } catch (err) {
      const parsed = parseAppError(err, 'subject creation');
      setError(parsed.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="task-form-modal"
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            id="btn-close-task-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g., Complete Calculus Problem Set #4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors text-sm"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              placeholder="Add key notes, textbook chapters, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors text-sm resize-none"
            />
          </div>

          {/* Subject Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-subject-select" className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                Subject
              </label>
              {onQuickCreateSubject && !isCreatingSubject && (
                <button
                  id="btn-toggle-inline-subject"
                  type="button"
                  onClick={() => setIsCreatingSubject(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Subject
                </button>
              )}
            </div>

            {isCreatingSubject ? (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="new-inline-subject-name"
                    type="text"
                    placeholder="New Subject Name (e.g. Organic Chemistry)"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    id="new-inline-subject-color"
                    type="color"
                    value={newSubColor}
                    onChange={(e) => setNewSubColor(e.target.value)}
                    className="w-8 h-8 p-0.5 border border-slate-200 rounded-lg cursor-pointer"
                    title="Choose color"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSubject(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-inline-subject"
                    type="button"
                    onClick={handleAddSubjectInline}
                    disabled={!newSubName.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Add & Select
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="task-subject-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              >
                <option value="">None / General Study</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                const colors: Record<TaskPriority, { active: string; border: string }> = {
                  low: { active: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold', border: 'border-slate-200 text-slate-600' },
                  medium: { active: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold', border: 'border-slate-200 text-slate-600' },
                  high: { active: 'bg-amber-50 text-amber-700 border-amber-300 font-semibold', border: 'border-slate-200 text-slate-600' },
                  urgent: { active: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold ring-1 ring-rose-300', border: 'border-slate-200 text-slate-600' },
                };

                return (
                  <button
                    key={p}
                    type="button"
                    id={`priority-btn-${p}`}
                    onClick={() => setPriority(p)}
                    className={`py-2 px-1 text-xs text-center capitalize rounded-xl border transition-all ${
                      isSelected ? colors[p].active : `bg-white hover:bg-slate-50 ${colors[p].border}`
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due-date" className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="task-due-time" className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Due Time (Optional)
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="btn-cancel-task"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-task"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
