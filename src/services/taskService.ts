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
import { Task, TaskPriority } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { recordTaskCompletedInStatistics } from './statsService';

export function subscribeTasks(
  userId: string, 
  callback: (tasks: Task[]) => void
) {
  const path = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q, 
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Task, 'id'>),
      }));
      callback(tasks);
    }, 
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  scheduledDate?: string;
  estimatedPomodoros?: number;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<string> {
  const path = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const newDocRef = doc(tasksRef);
  const now = new Date().toISOString();

  const newTask: Task = {
    id: newDocRef.id,
    userId,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    subjectId: input.subjectId || '',
    subjectName: input.subjectName || '',
    subjectColor: input.subjectColor || '',
    priority: input.priority,
    dueDate: input.dueDate || '',
    dueTime: input.dueTime || '',
    scheduledDate: input.scheduledDate || input.dueDate || '',
    estimatedPomodoros: input.estimatedPomodoros || 1,
    completedPomodoros: 0,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newTask);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function assignTaskToDate(
  userId: string, 
  taskId: string, 
  scheduledDate: string
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      scheduledDate,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateTask(
  userId: string, 
  taskId: string, 
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function toggleTaskComplete(
  userId: string, 
  taskId: string, 
  currentCompleted: boolean
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
  const now = new Date().toISOString();
  const willBeCompleted = !currentCompleted;

  try {
    await updateDoc(taskDocRef, {
      completed: willBeCompleted,
      completedAt: willBeCompleted ? now : null,
      updatedAt: now,
    });
    // Update persistent study statistics
    await recordTaskCompletedInStatistics(userId, willBeCompleted ? 1 : -1);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
