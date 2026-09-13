import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { FocusSession, FocusMode, UserProfile } from '../types';
import { getTodayString } from '../utils/date';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { recordSessionInStatistics } from './statsService';

export function subscribeSessions(
  userId: string,
  callback: (sessions: FocusSession[]) => void,
  maxResults = 50
) {
  const path = `users/${userId}/sessions`;
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(maxResults));

  return onSnapshot(
    q, 
    (snapshot) => {
      const sessions: FocusSession[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<FocusSession, 'id'>),
      }));
      callback(sessions);
    }, 
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface RecordSessionInput {
  durationMinutes: number;
  mode: FocusMode;
  taskId?: string;
  taskTitle?: string;
  subjectId?: string;
  subjectName?: string;
  notes?: string;
}

export async function recordFocusSession(
  userId: string, 
  input: RecordSessionInput
): Promise<string> {
  const path = `users/${userId}/sessions`;
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const newDocRef = doc(sessionsRef);
  const now = new Date().toISOString();

  const session: FocusSession = {
    id: newDocRef.id,
    userId,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    taskId: input.taskId || '',
    taskTitle: input.taskTitle || '',
    subjectId: input.subjectId || '',
    subjectName: input.subjectName || '',
    notes: input.notes?.trim() || '',
    completedAt: now,
  };

  try {
    await setDoc(newDocRef, session);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }

  // Update persistent study statistics
  try {
    await recordSessionInStatistics(userId, input.durationMinutes, input.subjectId);
  } catch (err) {
    console.warn('Could not update study statistics record:', err);
  }

  // Update subject stats if assigned (relational link)
  if (input.subjectId) {
    try {
      const subjectDocRef = doc(db, 'users', userId, 'subjects', input.subjectId);
      await updateDoc(subjectDocRef, {
        totalStudyMinutes: increment(input.durationMinutes),
      });
    } catch (e) {
      console.warn('Could not update subject study minutes:', e);
    }
  }

  // Update user profile study stats & streak
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    const today = getTodayString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yYear = yesterdayDate.getFullYear();
    const yMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterday = `${yYear}-${yMonth}-${yDay}`;

    if (userSnap.exists()) {
      const profile = userSnap.data() as UserProfile;
      let newStreak = profile.currentStreak || 1;
      const lastDate = profile.lastStudyDate;

      if (lastDate === today) {
        // Already studied today, streak continues unchanged
      } else if (lastDate === yesterday) {
        // Studied yesterday, consecutive streak
        newStreak += 1;
      } else {
        // Broken streak or first study session
        newStreak = 1;
      }

      await updateDoc(userDocRef, {
        totalStudyMinutes: increment(input.durationMinutes),
        currentStreak: newStreak,
        lastStudyDate: today,
        updatedAt: now,
      });
    }
  } catch (err) {
    console.warn('Could not update user streak in Firestore:', err);
  }

  return newDocRef.id;
}
