import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { StudyStatistics, FocusSession, Task } from '../types';
import { getTodayString, getStartOfWeek, getStartOfMonth } from '../utils/date';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export function getDefaultStudyStatistics(userId: string): StudyStatistics {
  return {
    id: 'summary',
    userId,
    totalStudyMinutes: 0,
    totalSessions: 0,
    totalTasksCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    weeklyStudyMinutes: 0,
    monthlyStudyMinutes: 0,
    subjectMinutes: {},
    dailyMinutes: {},
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Real-time subscription to study statistics in Firestore:
 * Path: /users/{userId}/statistics/summary
 */
export function subscribeStatistics(
  userId: string,
  callback: (stats: StudyStatistics) => void
) {
  const statDocRef = doc(db, 'users', userId, 'statistics', 'summary');

  return onSnapshot(
    statDocRef,
    async (snap) => {
      if (snap.exists()) {
        callback(snap.data() as StudyStatistics);
      } else {
        const defaults = getDefaultStudyStatistics(userId);
        try {
          await setDoc(statDocRef, defaults);
          callback(defaults);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/statistics/summary`);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/statistics/summary`);
    }
  );
}

/**
 * Fetch study statistics once from Firestore
 */
export async function getStatistics(userId: string): Promise<StudyStatistics> {
  const path = `users/${userId}/statistics/summary`;
  try {
    const statDocRef = doc(db, 'users', userId, 'statistics', 'summary');
    const snap = await getDoc(statDocRef);
    if (snap.exists()) {
      return snap.data() as StudyStatistics;
    }
    const defaults = getDefaultStudyStatistics(userId);
    await setDoc(statDocRef, defaults);
    return defaults;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Update persistent study statistics when a focus session completes
 */
export async function recordSessionInStatistics(
  userId: string,
  durationMinutes: number,
  subjectId?: string
): Promise<void> {
  const path = `users/${userId}/statistics/summary`;
  try {
    const statDocRef = doc(db, 'users', userId, 'statistics', 'summary');
    const snap = await getDoc(statDocRef);
    const now = new Date().toISOString();
    const today = getTodayString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yYear = yesterdayDate.getFullYear();
    const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterday = `${yYear}-${yMonth}-${yDay}`;

    if (!snap.exists()) {
      const stats = getDefaultStudyStatistics(userId);
      stats.totalStudyMinutes = durationMinutes;
      stats.totalSessions = 1;
      stats.currentStreak = 1;
      stats.bestStreak = 1;
      stats.lastStudyDate = today;
      stats.weeklyStudyMinutes = durationMinutes;
      stats.monthlyStudyMinutes = durationMinutes;
      stats.dailyMinutes[today] = durationMinutes;
      if (subjectId) {
        stats.subjectMinutes[subjectId] = durationMinutes;
      }
      stats.updatedAt = now;
      await setDoc(statDocRef, stats);
    } else {
      const current = snap.data() as StudyStatistics;
      let newStreak = current.currentStreak || 1;
      if (current.lastStudyDate === today) {
        // Studied already today
      } else if (current.lastStudyDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      const bestStreak = Math.max(current.bestStreak || 0, newStreak);

      const dailyMinutes = { ...(current.dailyMinutes || {}) };
      dailyMinutes[today] = (dailyMinutes[today] || 0) + durationMinutes;

      const subjectMinutes = { ...(current.subjectMinutes || {}) };
      if (subjectId) {
        subjectMinutes[subjectId] = (subjectMinutes[subjectId] || 0) + durationMinutes;
      }

      await updateDoc(statDocRef, {
        totalStudyMinutes: increment(durationMinutes),
        totalSessions: increment(1),
        currentStreak: newStreak,
        bestStreak,
        lastStudyDate: today,
        dailyMinutes,
        subjectMinutes,
        updatedAt: now,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Update persistent study statistics when a task is marked complete or uncompleted
 */
export async function recordTaskCompletedInStatistics(
  userId: string,
  delta: number
): Promise<void> {
  const path = `users/${userId}/statistics/summary`;
  try {
    const statDocRef = doc(db, 'users', userId, 'statistics', 'summary');
    const snap = await getDoc(statDocRef);
    if (snap.exists()) {
      const current = snap.data() as StudyStatistics;
      const newCount = Math.max(0, (current.totalTasksCompleted || 0) + delta);
      await updateDoc(statDocRef, {
        totalTasksCompleted: newCount,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Compute and synchronize comprehensive study statistics across sessions and tasks
 */
export async function syncStatisticsFromData(
  userId: string,
  sessions: FocusSession[],
  tasks: Task[]
): Promise<StudyStatistics> {
  const path = `users/${userId}/statistics/summary`;
  try {
    const statDocRef = doc(db, 'users', userId, 'statistics', 'summary');
    const now = new Date().toISOString();
    const monday = getStartOfWeek();
    const startOfMonth = getStartOfMonth();

    const totalStudyMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalSessions = sessions.length;
    const totalTasksCompleted = tasks.filter(t => t.completed).length;

    const weeklyStudyMinutes = sessions
      .filter(s => s.completedAt && new Date(s.completedAt) >= monday)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const monthlyStudyMinutes = sessions
      .filter(s => s.completedAt && new Date(s.completedAt) >= startOfMonth)
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    const subjectMinutes: Record<string, number> = {};
    const dailyMinutes: Record<string, number> = {};

    sessions.forEach(s => {
      if (s.subjectId) {
        subjectMinutes[s.subjectId] = (subjectMinutes[s.subjectId] || 0) + (s.durationMinutes || 0);
      }
      if (s.completedAt) {
        const dateKey = s.completedAt.split('T')[0];
        dailyMinutes[dateKey] = (dailyMinutes[dateKey] || 0) + (s.durationMinutes || 0);
      }
    });

    // Unique study dates sorted ascending
    const studyDates = Object.keys(dailyMinutes).sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    studyDates.forEach(dateStr => {
      const d = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = d;
      bestStreak = Math.max(bestStreak, tempStreak);
    });

    const todayStr = getTodayString();
    const lastStudyDate = studyDates.length > 0 ? studyDates[studyDates.length - 1] : null;
    currentStreak = tempStreak;

    const compiled: StudyStatistics = {
      id: 'summary',
      userId,
      totalStudyMinutes,
      totalSessions,
      totalTasksCompleted,
      currentStreak: currentStreak || (lastStudyDate === todayStr ? 1 : 0),
      bestStreak: Math.max(bestStreak, currentStreak),
      lastStudyDate,
      weeklyStudyMinutes,
      monthlyStudyMinutes,
      subjectMinutes,
      dailyMinutes,
      updatedAt: now,
    };

    await setDoc(statDocRef, compiled, { merge: true });
    return compiled;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
