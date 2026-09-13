import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserSettings, AppTheme, NotificationPreferences, TimerPreferences } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  timerSound: true,
  soundType: 'chime',
  browserNotifications: false,
  breakAlerts: true,
  dailyReminder: false,
  dailyReminderTime: '18:00',
};

export const DEFAULT_TIMER_PREFS: TimerPreferences = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export function getDefaultUserSettings(userId: string): UserSettings {
  return {
    id: 'preferences',
    userId,
    theme: 'light',
    dailyGoalMinutes: 120,
    soundVolume: 0.8,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFS },
    timerPreferences: { ...DEFAULT_TIMER_PREFS },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Real-time subscription to user settings document in Firestore:
 * Path: /users/{userId}/settings/preferences
 */
export function subscribeUserSettings(
  userId: string,
  callback: (settings: UserSettings) => void
) {
  const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');

  return onSnapshot(
    settingsDocRef,
    async (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserSettings);
      } else {
        // Initialize default settings document in Firestore
        const defaults = getDefaultUserSettings(userId);
        try {
          await setDoc(settingsDocRef, defaults);
          callback(defaults);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/settings/preferences`);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/settings/preferences`);
    }
  );
}

/**
 * Fetch user settings once from Firestore
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const path = `users/${userId}/settings/preferences`;
  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(settingsDocRef);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    }
    const defaults = getDefaultUserSettings(userId);
    await setDoc(settingsDocRef, defaults);
    return defaults;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Update user settings in Firestore
 */
export async function saveUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'id' | 'userId'>>
): Promise<void> {
  const path = `users/${userId}/settings/preferences`;
  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(settingsDocRef);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const initial = {
        ...getDefaultUserSettings(userId),
        ...updates,
        updatedAt: now,
      };
      await setDoc(settingsDocRef, initial);
    } else {
      await updateDoc(settingsDocRef, {
        ...updates,
        updatedAt: now,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
