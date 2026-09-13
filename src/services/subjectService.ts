import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Subject } from '../types';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export const DEFAULT_SUBJECTS = [
  { name: 'Mathematics', color: '#3B82F6', icon: 'calculator' },
  { name: 'Computer Science', color: '#10B981', icon: 'code' },
  { name: 'Physics & Science', color: '#8B5CF6', icon: 'atom' },
  { name: 'Literature & History', color: '#F59E0B', icon: 'book' },
  { name: 'Language & Writing', color: '#EC4899', icon: 'feather' },
];

export function subscribeSubjects(
  userId: string, 
  callback: (subjects: Subject[]) => void
) {
  const path = `users/${userId}/subjects`;
  const subjectsRef = collection(db, 'users', userId, 'subjects');
  const q = query(subjectsRef, orderBy('name', 'asc'));

  return onSnapshot(
    q, 
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default subjects if user has none yet
        const seeded: Subject[] = [];
        for (const item of DEFAULT_SUBJECTS) {
          const newDocRef = doc(subjectsRef);
          const sub: Subject = {
            id: newDocRef.id,
            userId,
            name: item.name,
            color: item.color,
            icon: item.icon,
            targetHoursPerWeek: 5,
            totalStudyMinutes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(newDocRef, sub);
          } catch (e) {
            console.warn('Could not seed default subject:', e);
          }
          seeded.push(sub);
        }
        callback(seeded);
      } else {
        const subjects: Subject[] = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Subject, 'id'>)
        }));
        callback(subjects);
      }
    }, 
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createSubject(
  userId: string, 
  name: string, 
  color: string,
  icon?: string,
  targetHoursPerWeek = 5
): Promise<string> {
  const path = `users/${userId}/subjects`;
  const subjectsRef = collection(db, 'users', userId, 'subjects');
  const newDocRef = doc(subjectsRef);
  const now = new Date().toISOString();
  const subject: Subject = {
    id: newDocRef.id,
    userId,
    name: name.trim(),
    color: color || '#6366F1',
    icon: icon || 'book',
    targetHoursPerWeek,
    totalStudyMinutes: 0,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(newDocRef, subject);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateSubject(
  userId: string,
  subjectId: string,
  updates: Partial<Omit<Subject, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `users/${userId}/subjects/${subjectId}`;
  try {
    const subjectDocRef = doc(db, 'users', userId, 'subjects', subjectId);
    await updateDoc(subjectDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteSubject(userId: string, subjectId: string): Promise<void> {
  const path = `users/${userId}/subjects/${subjectId}`;
  try {
    const subjectDocRef = doc(db, 'users', userId, 'subjects', subjectId);
    await deleteDoc(subjectDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
