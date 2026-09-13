import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  MoreVertical, 
  Play, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { Task, Subject, TaskFilterType, TaskSortType, TaskPriority } from '../types';
import { formatReadableDate, isDueToday, isDueUpcoming, isTaskOverdue, getOverdueText } from '../utils/date';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleComplete: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
  onStartFocusOnTask: (taskId: string, subjectId?: string) => void;
  initialFilter?: TaskFilterType;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onToggleComplete,
  onDeleteTask,
  onOpenCreateModal,
  onEditTask,
  onStartFocusOnTask,
  initialFilter = 'all',
}) => {
  const [filterType, setFilterType] = useState<TaskFilterType>(initialFilter);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortType, setSortType] = useState<TaskSortType>('dueDateAsc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active action menu state for mobile or dropdown
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // Compute counts for filter tabs
  const counts = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let overdue = 0;
    let completed = 0;

    tasks.forEach(t => {
      if (t.completed) {
        completed++;
      } else {
        if (isTaskOverdue(t.dueDate, t.dueTime, t.completed)) {
          overdue++;
        }
        if (isDueToday(t.dueDate)) {
          today++;
        } else if (isDueUpcoming(t.dueDate)) {
          upcoming++;
        }
      }
    });

    return { all: tasks.length, today, upcoming, overdue, completed };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab Filter
        if (filterType === 'today') {
          if (task.completed || !isDueToday(task.dueDate)) return false;
        } else if (filterType === 'upcoming') {
          if (task.completed || !isDueUpcoming(task.dueDate)) return false;
        } else if (filterType === 'overdue') {
          if (task.completed || !isTaskOverdue(task.dueDate, task.dueTime, task.completed)) return false;
        } else if (filterType === 'completed') {
          if (!task.completed) return false;
        }

        // Subject Filter
        if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) {
          return false;
        }

        // Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchSub = task.subjectName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSub) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Priority weight mapping
        const priorityRank: Record<TaskPriority, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        };

        if (sortType === 'priorityDesc') {
          return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        }
        if (sortType === 'titleAsc') {
          return a.title.localeCompare(b.title);
        }
        if (sortType === 'createdDesc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortType === 'dueDateDesc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        // default: dueDateAsc
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, filterType, subjectFilter, priorityFilter, sortType, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
            Low
          </span>
        );
    }
  };

  return (
    <div id="task-manager-view" className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Add Task */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Study Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize coursework, prioritize assignments, and track study progress.
          </p>
        </div>

        <button
          id="btn-add-task-primary"
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Primary Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {(
          [
            { id: 'all' as const, label: 'All Tasks', count: counts.all, isAlert: false },
            { id: 'today' as const, label: "Today's Tasks", count: counts.today, isAlert: false },
            { id: 'upcoming' as const, label: 'Upcoming', count: counts.upcoming, isAlert: false },
            { id: 'overdue' as const, label: 'Overdue', count: counts.overdue, isAlert: counts.overdue > 0 },
            { id: 'completed' as const, label: 'Completed', count: counts.completed, isAlert: false },
          ]
        ).map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tab.isAlert
                    ? 'bg-rose-500 text-white'
                    : isActive
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Search tasks, descriptions, or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Subject Filter Dropdown */}
        <div className="sm:col-span-3">
          <select
            id="task-filter-subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="sm:col-span-2">
          <select
            id="task-filter-priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-2">
          <select
            id="task-sort-select"
            value={sortType}
            onChange={(e) => setSortType(e.target.value as TaskSortType)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="dueDateAsc">Due Date (Earliest)</option>
            <option value="dueDateDesc">Due Date (Latest)</option>
            <option value="priorityDesc">Priority (Highest)</option>
            <option value="titleAsc">Title (A-Z)</option>
            <option value="createdDesc">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || subjectFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : filterType === 'completed'
                ? 'No completed tasks yet. Finish a task to see it here!'
                : 'Your study checklist is clear. Click below to add a new task.'}
            </p>
            <button
              id="btn-empty-add-task"
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
            const overdueText = isOverdue ? getOverdueText(task.dueDate, task.dueTime) : '';
            const isHighOrUrgent = task.priority === 'urgent' || task.priority === 'high';

            // Distinct visual styling states
            let cardBorder = 'border-slate-200/80 bg-white hover:border-slate-300';
            if (task.completed) {
              cardBorder = 'border-slate-100 bg-slate-50/70 opacity-70';
            } else if (isOverdue) {
              cardBorder = 'border-rose-300 bg-rose-50/20 shadow-2xs hover:border-rose-400';
            } else if (task.priority === 'urgent') {
              cardBorder = 'border-rose-200/90 bg-white shadow-2xs hover:border-rose-300';
            } else if (task.priority === 'high') {
              cardBorder = 'border-amber-200/80 bg-white shadow-2xs hover:border-amber-300';
            }

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBorder}`}
              >
                {/* Left Side: Checkbox & Task Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    id={`task-toggle-${task.id}`}
                    type="button"
                    onClick={() => onToggleComplete(task.id, task.completed)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      {getPriorityBadge(task.priority)}

                      {/* Overdue Badge */}
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                          <AlertCircle className="w-3 h-3" />
                          {overdueText || 'Overdue'}
                        </span>
                      )}

                      {/* Due Today Badge */}
                      {!isOverdue && isDueToday(task.dueDate) && !task.completed && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Due Today
                        </span>
                      )}
                    </div>

                    {/* Description if present */}
                    {task.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags: Subject, Due Date & Time */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      {task.subjectName && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium"
                          style={{
                            backgroundColor: task.subjectColor ? `${task.subjectColor}15` : '#EEF2FF',
                            color: task.subjectColor || '#4F46E5',
                          }}
                        >
                          <BookOpen className="w-3 h-3" />
                          {task.subjectName}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {formatReadableDate(task.dueDate)}
                        </span>
                      )}

                      {task.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Quick Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Focus on this task button */}
                  {!task.completed && (
                    <button
                      id={`btn-focus-task-${task.id}`}
                      type="button"
                      onClick={() => onStartFocusOnTask(task.id, task.subjectId)}
                      title="Start Focus Timer on this task"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Focus</span>
                    </button>
                  )}

                  {/* Edit task button */}
                  <button
                    id={`btn-edit-task-${task.id}`}
                    type="button"
                    onClick={() => onEditTask(task)}
                    title="Edit Task"
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete task button */}
                  <button
                    id={`btn-delete-task-${task.id}`}
                    type="button"
                    onClick={() => setTaskToDelete(task)}
                    title="Delete Task"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deleting Task */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Study Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This task will be removed from your study list.`}
        confirmLabel="Delete Task"
        loading={isDeleting}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
