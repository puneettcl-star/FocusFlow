import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { FocusTimer } from './components/FocusTimer';
import { SubjectsView } from './components/SubjectsView';
import { StudyPlanner } from './components/StudyPlanner';
import { ProgressView } from './components/ProgressView';
import { GoalsView } from './components/GoalsView';
import { GoalModal } from './components/GoalModal';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { StudyTimerPage } from './components/public/StudyTimerPage';
import { PomodoroTimerPage } from './components/public/PomodoroTimerPage';
import { StudyPlannerPage } from './components/public/StudyPlannerPage';
import { FocusTimerPage } from './components/public/FocusTimerPage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/legal/TermsOfServicePage';
import { ContactSupportPage } from './components/legal/ContactSupportPage';
import { AccountView } from './components/AccountView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Task, Subject, FocusSession, FocusMode, TaskPriority, Goal, StudyStatistics, NavigationTab } from './types';
import { 
  subscribeTasks, 
  createTask, 
  updateTask, 
  toggleTaskComplete, 
  deleteTask,
  assignTaskToDate 
} from './services/taskService';
import { 
  subscribeSubjects, 
  createSubject, 
  deleteSubject 
} from './services/subjectService';
import { 
  subscribeSessions, 
  recordFocusSession 
} from './services/sessionService';
import {
  subscribeGoals,
  createGoal,
  updateGoalProgress,
  toggleGoalComplete,
  deleteGoal
} from './services/goalService';
import {
  subscribeStatistics,
  syncStatisticsFromData
} from './services/statsService';
import { isDueToday, isTaskOverdue, getTodayString } from './utils/date';
import { Sparkles, Loader2 } from 'lucide-react';

function Workspace({ 
  onOpenLandingPage,
  onNavigate 
}: { 
  onOpenLandingPage: () => void;
  onNavigate: (path: string) => void;
}) {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Firestore collections state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [statistics, setStatistics] = useState<StudyStatistics | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialTaskDueDate, setInitialTaskDueDate] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'themes-sounds' | 'account'>('profile');

  const handleOpenSettings = (tab: 'profile' | 'themes-sounds' | 'account' = 'profile') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  // Focus Timer active selection and running tracker
  const [focusTargetTaskId, setFocusTargetTaskId] = useState<string | undefined>();
  const [focusTargetSubjectId, setFocusTargetSubjectId] = useState<string | undefined>();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);

  // Real-time Firestore subscriptions for isolated user
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeTasks = subscribeTasks(currentUser.uid, (data) => {
      setTasks(data);
    });

    const unsubscribeSubjects = subscribeSubjects(currentUser.uid, (data) => {
      setSubjects(data);
    });

    const unsubscribeSessions = subscribeSessions(currentUser.uid, (data) => {
      setSessions(data);
    });

    const unsubscribeGoals = subscribeGoals(currentUser.uid, (data) => {
      setGoals(data);
    });

    const unsubscribeStats = subscribeStatistics(currentUser.uid, (data) => {
      setStatistics(data);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSubjects();
      unsubscribeSessions();
      unsubscribeGoals();
      unsubscribeStats();
    };
  }, [currentUser]);

  // Compute stats
  const { pendingTasksCount, overdueTasksCount, todayStudyMinutes } = useMemo(() => {
    let pending = 0;
    let overdue = 0;

    tasks.forEach(t => {
      if (!t.completed) {
        pending++;
        if (isTaskOverdue(t.dueDate, t.dueTime, false)) {
          overdue++;
        }
      }
    });

    const todayStr = getTodayString();
    const todayMins = sessions
      .filter(s => s.completedAt.startsWith(todayStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      pendingTasksCount: pending,
      overdueTasksCount: overdue,
      todayStudyMinutes: todayMins,
    };
  }, [tasks, sessions]);

  // Task Actions
  const handleSaveTask = async (taskData: {
    title: string;
    description?: string;
    subjectId?: string;
    subjectName?: string;
    subjectColor?: string;
    priority: TaskPriority;
    dueDate?: string;
    dueTime?: string;
  }) => {
    if (!currentUser) return;

    try {
      if (taskToEdit) {
        await updateTask(currentUser.uid, taskToEdit.id, taskData);
        showSuccess('Task updated', `"${taskData.title}" has been saved.`);
      } else {
        await createTask(currentUser.uid, taskData);
        showSuccess('Task created', `"${taskData.title}" added to your checklist.`);
      }
    } catch (err) {
      showError('Unable to save task', err);
      throw err;
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    try {
      await toggleTaskComplete(currentUser.uid, taskId, currentCompleted);
      if (!currentCompleted) {
        showSuccess('Task completed! 🎉', task ? `Great job finishing "${task.title}".` : 'Keep up the momentum!');
      } else {
        showInfo('Task reopened', task ? `"${task.title}" marked active.` : 'Task marked active.');
      }
    } catch (err) {
      showError('Could not update task status', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    try {
      await deleteTask(currentUser.uid, taskId);
      showInfo('Task removed', task ? `"${task.title}" was deleted.` : 'Task removed.');
    } catch (err) {
      showError('Failed to delete task', err);
    }
  };

  // Subject Actions
  const handleCreateSubject = async (name: string, color: string) => {
    if (!currentUser) return '';
    try {
      const id = await createSubject(currentUser.uid, name, color);
      showSuccess('Subject created', `"${name}" is ready for study assignments.`);
      return id;
    } catch (err) {
      showError('Failed to create subject', err);
      throw err;
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!currentUser) return;
    const subject = subjects.find(s => s.id === subjectId);
    try {
      await deleteSubject(currentUser.uid, subjectId);
      showInfo('Subject removed', subject ? `"${subject.name}" was removed.` : 'Subject deleted.');
    } catch (err) {
      showError('Failed to delete subject', err);
    }
  };

  // Session Action
  const handleSessionCompleted = async (sessionData: {
    durationMinutes: number;
    mode: FocusMode;
    taskId?: string;
    taskTitle?: string;
    subjectId?: string;
    subjectName?: string;
    notes?: string;
  }) => {
    if (!currentUser) return;
    try {
      await recordFocusSession(currentUser.uid, sessionData);
      showSuccess('Focus session logged! ⏱️', `+${sessionData.durationMinutes}m focus time recorded.`);
    } catch (err) {
      showError('Could not save focus session', err);
    }
  };

  // Quick navigation triggers
  const handleStartFocusWithTask = (taskId: string, subjectId?: string) => {
    setFocusTargetTaskId(taskId);
    setFocusTargetSubjectId(subjectId);
    setCurrentTab('timer');
  };

  const handleStartFocusWithSubject = (subjectId: string) => {
    setFocusTargetTaskId(undefined);
    setFocusTargetSubjectId(subjectId);
    setCurrentTab('timer');
  };

  // Study Planner actions
  const handleAssignTaskDate = async (taskId: string, dateStr: string) => {
    if (!currentUser) return;
    try {
      await assignTaskToDate(currentUser.uid, taskId, dateStr);
      showSuccess('Schedule updated', 'Task scheduled for study planner.');
    } catch (err) {
      showError('Failed to schedule task', err);
    }
  };

  const handleOpenCreateTaskWithDate = (dateStr: string) => {
    setTaskToEdit(null);
    setInitialTaskDueDate(dateStr);
    setIsTaskModalOpen(true);
  };

  // Goal actions
  const handleCreateGoal = async (data: {
    title: string;
    description?: string;
    targetDate: string;
    targetValue: number;
    currentValue?: number;
    unit: string;
  }) => {
    if (!currentUser) return;
    try {
      await createGoal(currentUser.uid, data);
      showSuccess('Goal created', `"${data.title}" target set!`);
    } catch (err) {
      showError('Failed to set goal', err);
      throw err;
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newValue: number, targetValue: number) => {
    if (!currentUser) return;
    try {
      await updateGoalProgress(currentUser.uid, goalId, newValue, targetValue);
      if (newValue >= targetValue) {
        showSuccess('Goal accomplished! 🏆', 'Congratulations on reaching your target!');
      } else {
        showSuccess('Progress updated', 'Your study milestone has been saved.');
      }
    } catch (err) {
      showError('Failed to update goal progress', err);
    }
  };

  const handleToggleGoalComplete = async (goalId: string, currentCompleted: boolean) => {
    if (!currentUser) return;
    try {
      await toggleGoalComplete(currentUser.uid, goalId, currentCompleted);
      if (!currentCompleted) {
        showSuccess('Goal completed! 🎯', 'Milestone checked off!');
      } else {
        showInfo('Goal reopened', 'Goal restored to active targets.');
      }
    } catch (err) {
      showError('Failed to toggle goal status', err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    try {
      await deleteGoal(currentUser.uid, goalId);
      showInfo('Goal deleted', 'Goal removed from your study targets.');
    } catch (err) {
      showError('Failed to delete goal', err);
    }
  };

  return (
    <div className="min-h-screen theme-bg-app flex flex-col selection:bg-[var(--accent-subtle)] selection:text-[var(--accent-text)] theme-text-primary transition-colors">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingTasksCount={pendingTasksCount}
        overdueTasksCount={overdueTasksCount}
        todayStudyMinutes={todayStudyMinutes}
        isTimerRunning={isTimerRunning}
        timerSecondsRemaining={timerSecondsRemaining}
        onOpenSettings={handleOpenSettings}
        onOpenLandingPage={onOpenLandingPage}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 pb-24 md:pb-16 outline-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            tasks={tasks}
            subjects={subjects}
            sessions={sessions}
            todayStudyMinutes={todayStudyMinutes}
            onQuickStartFocus={() => setCurrentTab('timer')}
            onQuickAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onViewAllTasks={() => setCurrentTab('tasks')}
            onToggleComplete={handleToggleTask}
            onOpenFocusWithTask={handleStartFocusWithTask}
            onNavigateToGoals={() => setCurrentTab('goals')}
            onNavigateToProgress={() => setCurrentTab('progress')}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            subjects={subjects}
            onToggleComplete={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onStartFocusOnTask={handleStartFocusWithTask}
          />
        )}

        {currentTab === 'planner' && (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            onToggleComplete={handleToggleTask}
            onAssignTaskDate={handleAssignTaskDate}
            onOpenCreateTaskWithDate={handleOpenCreateTaskWithDate}
            onStartFocusOnTask={handleStartFocusWithTask}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            onOpenCreateModal={() => setIsGoalModalOpen(true)}
            onUpdateProgress={handleUpdateGoalProgress}
            onToggleComplete={handleToggleGoalComplete}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            sessions={sessions}
            tasks={tasks}
            subjects={subjects}
            userProfile={userProfile}
            statistics={statistics}
            onNavigateToTimer={() => setCurrentTab('timer')}
            onNavigateToTasks={() => setCurrentTab('tasks')}
          />
        )}

        {/* Timer view is kept mounted or unmounted cleanly */}
        <div className={currentTab === 'timer' ? 'block' : 'hidden'}>
          <FocusTimer
            subjects={subjects}
            tasks={tasks}
            initialTaskId={focusTargetTaskId}
            initialSubjectId={focusTargetSubjectId}
            onSessionCompleted={handleSessionCompleted}
            onRunningChange={(running, seconds) => {
              setIsTimerRunning(running);
              setTimerSecondsRemaining(seconds);
            }}
          />
        </div>

        {currentTab === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            tasks={tasks}
            onCreateSubject={handleCreateSubject}
            onDeleteSubject={handleDeleteSubject}
            onStartFocusForSubject={handleStartFocusWithSubject}
          />
        )}

        {currentTab === 'account' && (
          <AccountView
            userProfile={userProfile}
            statistics={statistics}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onOpenSettingsTab={(tab) => handleOpenSettings(tab)}
          />
        )}
      </main>

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setInitialTaskDueDate(undefined);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialDueDate={initialTaskDueDate}
        subjects={subjects}
        onQuickCreateSubject={handleCreateSubject}
      />

      {/* Goal Creation Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleCreateGoal}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  
  // Track URL pathname for client-side routing & deep linking
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', path);
      } catch (_) {}
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-app flex flex-col items-center justify-center p-6 theme-text-primary">
        <div className="w-12 h-12 rounded-2xl theme-accent-subtle theme-accent-text flex items-center justify-center mb-4 shadow-sm">
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <h2 className="text-lg font-bold theme-text-primary tracking-tight">Focus Flow</h2>
        <p className="text-xs theme-text-muted mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin theme-accent-text" />
          <span>Synchronizing student workspace...</span>
        </p>
      </div>
    );
  }

  // 1. Dedicated Public Legal & Compliance Pages
  if (currentPath === '/privacy') {
    return (
      <>
        <PrivacyPolicyPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  if (currentPath === '/terms') {
    return (
      <>
        <TermsOfServicePage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  if (currentPath === '/support' || currentPath === '/contact') {
    return (
      <>
        <ContactSupportPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  // 2. Dedicated Public Indexable SEO Landing Pages
  if (currentPath === '/study-timer') {
    return (
      <>
        <StudyTimerPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  if (currentPath === '/pomodoro-timer') {
    return (
      <>
        <PomodoroTimerPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  if (currentPath === '/study-planner') {
    return (
      <>
        <StudyPlannerPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  if (currentPath === '/focus-timer') {
    return (
      <>
        <FocusTimerPage
          onNavigate={handleNavigate}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          isAuthenticated={!!currentUser}
          onEnterWorkspace={() => handleNavigate('/workspace')}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  // 3. Unauthenticated Root Page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          isAuthenticated={false}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onEnterWorkspace={() => setAuthModalMode('login')}
          onNavigate={handleNavigate}
        />
        {authModalMode && (
          <AuthModal
            onClose={() => setAuthModalMode(null)}
            initialMode={authModalMode}
          />
        )}
      </>
    );
  }

  // 4. Authenticated User Navigating to Public Landing Page
  if (currentPath === '/' || currentPath === '/home') {
    return (
      <LandingPage
        isAuthenticated={true}
        onOpenAuth={() => {}}
        onEnterWorkspace={() => handleNavigate('/workspace')}
        onNavigate={handleNavigate}
      />
    );
  }

  // 5. Authenticated Primary Student Workspace
  return (
    <Workspace 
      onOpenLandingPage={() => handleNavigate('/')} 
      onNavigate={handleNavigate}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
