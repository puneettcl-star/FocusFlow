export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AppTheme = 'light' | 'dark' | 'calm' | 'ocean' | 'sakura' | 'cyber' | 'classic';

export interface NotificationPreferences {
  timerSound: boolean;
  soundType: 'chime' | 'bell' | 'digital' | 'wood';
  browserNotifications: boolean;
  breakAlerts: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:mm
}

export interface TimerPreferences {
  pomodoroDuration: number; // in minutes (default 25)
  shortBreakDuration: number; // in minutes (default 5)
  longBreakDuration: number; // in minutes (default 15)
  longBreakInterval: number; // pomodoros count (default 4)
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface UserSettings {
  id: string; // 'preferences'
  userId: string;
  theme: AppTheme;
  dailyGoalMinutes: number;
  soundVolume: number;
  notificationPreferences: NotificationPreferences;
  timerPreferences: TimerPreferences;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  avatarId?: string;
  theme?: AppTheme;
  notificationPreferences?: NotificationPreferences;
  dailyGoalMinutes: number;
  currentStreak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  totalStudyMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  targetHoursPerWeek?: number;
  totalStudyMinutes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId?: string; // Relational foreign key -> Subject.id
  subjectName?: string;
  subjectColor?: string;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  scheduledDate?: string; // YYYY-MM-DD for Study Planner
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FocusMode = 'pomodoro' | 'short_break' | 'long_break' | 'deep_work' | 'custom' | 'stopwatch';
export type PlannerViewMode = 'daily' | 'weekly';

export interface FocusSession {
  id: string;
  userId: string;
  durationMinutes: number;
  taskId?: string; // Relational foreign key -> Task.id
  taskTitle?: string;
  subjectId?: string; // Relational foreign key -> Subject.id
  subjectName?: string;
  mode: FocusMode;
  notes?: string;
  completedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId?: string; // Relational foreign key -> Subject.id (optional)
  subjectName?: string;
  targetDate: string; // YYYY-MM-DD
  targetValue: number; // e.g. 20
  currentValue: number; // e.g. 5
  unit: string; // e.g. "hours", "tasks", "sessions", "chapters"
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyStatistics {
  id: string; // 'summary'
  userId: string;
  totalStudyMinutes: number;
  totalSessions: number;
  totalTasksCompleted: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  subjectMinutes: Record<string, number>; // subjectId -> minutes
  dailyMinutes: Record<string, number>; // YYYY-MM-DD -> minutes
  updatedAt: string;
}

export type TaskFilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
export type TaskSortType = 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'titleAsc' | 'createdDesc';
export type NavigationTab = 'dashboard' | 'tasks' | 'planner' | 'goals' | 'progress' | 'timer' | 'subjects' | 'account';
