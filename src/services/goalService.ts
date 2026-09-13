import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Goal } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export interface CreateGoalInput {
  title: string;
  description?: string;
  subjectId?: string;
  subjectName?: string;
  targetDate: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
}

export function subscribeGoals(
  userId: string,
  onUpdate: (goals: Goal[]) => void,
  onError?: (error: Error) => void
) {
  const path = `users/${userId}/goals`;
  const goalsCol = collection(db, 'users', userId, 'goals');
  const q = query(goalsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const goals: Goal[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Goal, 'id'>),
      }));
      onUpdate(goals);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<string> {
  const path = `users/${userId}/goals`;
  const goalsCol = collection(db, 'users', userId, 'goals');
  const newDocRef = doc(goalsCol);
  const now = new Date().toISOString();

  const initialCurrent = input.currentValue || 0;
  const isComplete = initialCurrent >= input.targetValue;

  const goalData: Record<string, any> = {
    userId,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    subjectId: input.subjectId || '',
    subjectName: input.subjectName || '',
    targetDate: input.targetDate,
    targetValue: Math.max(1, input.targetValue),
    currentValue: Math.max(0, initialCurrent),
    unit: input.unit.trim() || 'tasks',
    completed: isComplete,
    createdAt: now,
    updatedAt: now,
  };

  if (isComplete) {
    goalData.completedAt = now;
  }

  try {
    await setDoc(newDocRef, goalData);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  newValue: number,
  targetValue: number
): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  const goalDocRef = doc(db, 'users', userId, 'goals', goalId);
  const clampedValue = Math.max(0, newValue);
  const isComplete = clampedValue >= targetValue;
  const now = new Date().toISOString();

  try {
    await updateDoc(goalDocRef, {
      currentValue: clampedValue,
      completed: isComplete,
      completedAt: isComplete ? now : null,
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function toggleGoalComplete(
  userId: string,
  goalId: string,
  currentCompleted: boolean
): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  const goalDocRef = doc(db, 'users', userId, 'goals', goalId);
  const now = new Date().toISOString();

  try {
    await updateDoc(goalDocRef, {
      completed: !currentCompleted,
      completedAt: !currentCompleted ? now : null,
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  try {
    const goalDocRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
