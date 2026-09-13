import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, getGoogleProvider, db } from '../firebase/config';
import { UserProfile, AppTheme, NotificationPreferences } from '../types';
import { getUserSettings, saveUserSettings } from '../services/settingsService';
import { getStatistics } from '../services/statsService';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

export interface UserPreferencesUpdate {
  displayName?: string;
  dailyGoalMinutes?: number;
  avatarId?: string;
  photoURL?: string | null;
  theme?: AppTheme;
  notificationPreferences?: NotificationPreferences;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (email: string, pass: string, displayName: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPreferences: (update: UserPreferencesUpdate | string, legacyGoalMinutes?: number) => Promise<void>;
  deleteAccount: (passwordConfirmation?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getFriendlyAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/requires-recent-login':
      return 'For security reasons, please re-authenticate before deleting your account.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few moments before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An authentication error occurred. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync profile document
  const ensureUserProfile = async (user: FirebaseUser, customName?: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const initialProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: customName || user.displayName || user.email?.split('@')[0] || 'Student',
        photoURL: user.photoURL,
        avatarId: 'scholar',
        theme: 'light',
        notificationPreferences: {
          timerSound: true,
          soundType: 'chime',
          browserNotifications: false,
          breakAlerts: true,
          dailyReminder: false,
          dailyReminderTime: '18:00',
        },
        dailyGoalMinutes: 120, // default 2 hours study goal
        currentStreak: 1,
        lastStudyDate: null,
        totalStudyMinutes: 0,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userDocRef, initialProfile);
      setUserProfile(initialProfile);
    } else {
      setUserProfile(snap.data() as UserProfile);
    }

    // Ensure dedicated user settings document and statistics summary exist in Firestore
    try {
      await getUserSettings(user.uid);
      await getStatistics(user.uid);
    } catch (e) {
      console.warn('Could not initialize settings or statistics subcollection:', e);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await ensureUserProfile(user);
          // Set up real-time listener for profile changes (streak, total minutes, goals)
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          });
        } catch (err) {
          console.error('Failed to initialize user profile:', err);
        }
      } else {
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const signUp = async (email: string, pass: string, displayName: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName.trim()) {
        await updateFirebaseProfile(res.user, { displayName: displayName.trim() });
      }
      await ensureUserProfile(res.user, displayName.trim());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, getGoogleProvider());
      await ensureUserProfile(res.user);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const updateUserPreferences = async (
    update: UserPreferencesUpdate | string,
    legacyGoalMinutes?: number
  ) => {
    if (!currentUser) return;
    setError(null);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updates: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (typeof update === 'string') {
        // Legacy call: (name, goalMinutes)
        const name = update.trim() || currentUser.displayName || 'Student';
        updates.displayName = name;
        if (legacyGoalMinutes !== undefined) {
          updates.dailyGoalMinutes = Math.max(15, Math.min(720, legacyGoalMinutes));
        }
      } else {
        // Modern object call
        if (update.displayName !== undefined) {
          updates.displayName = update.displayName.trim() || currentUser.displayName || 'Student';
        }
        if (update.dailyGoalMinutes !== undefined) {
          updates.dailyGoalMinutes = Math.max(15, Math.min(720, update.dailyGoalMinutes));
        }
        if (update.avatarId !== undefined) {
          updates.avatarId = update.avatarId;
        }
        if (update.photoURL !== undefined) {
          updates.photoURL = update.photoURL;
        }
        if (update.theme !== undefined) {
          updates.theme = update.theme;
        }
        if (update.notificationPreferences !== undefined) {
          updates.notificationPreferences = update.notificationPreferences;
        }
      }

      await updateDoc(userDocRef, updates);

      // Persist to user settings document in Firestore (/users/{userId}/settings/preferences)
      try {
        await saveUserSettings(currentUser.uid, {
          ...(updates.theme ? { theme: updates.theme } : {}),
          ...(updates.dailyGoalMinutes ? { dailyGoalMinutes: updates.dailyGoalMinutes } : {}),
          ...(updates.notificationPreferences ? { notificationPreferences: updates.notificationPreferences } : {}),
        });
      } catch (err) {
        console.warn('Could not sync settings subcollection:', err);
      }

      if (auth.currentUser && updates.displayName) {
        await updateFirebaseProfile(auth.currentUser, { displayName: updates.displayName });
      }
    } catch (err: unknown) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update profile settings.');
      throw err;
    }
  };

  const deleteAccount = async (passwordConfirmation?: string) => {
    const user = auth.currentUser;
    if (!user) return;
    setError(null);

    try {
      // If user signed in with password and provided password confirmation for re-auth
      if (passwordConfirmation && user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwordConfirmation);
        await reauthenticateWithCredential(user, credential);
      }

      const uid = user.uid;

      // Clean up all subcollections
      const tasksSnap = await getDocs(collection(db, 'users', uid, 'tasks'));
      for (const t of tasksSnap.docs) {
        await deleteDoc(t.ref);
      }
      const subjectsSnap = await getDocs(collection(db, 'users', uid, 'subjects'));
      for (const s of subjectsSnap.docs) {
        await deleteDoc(s.ref);
      }
      const sessionsSnap = await getDocs(collection(db, 'users', uid, 'sessions'));
      for (const sess of sessionsSnap.docs) {
        await deleteDoc(sess.ref);
      }
      const goalsSnap = await getDocs(collection(db, 'users', uid, 'goals'));
      for (const g of goalsSnap.docs) {
        await deleteDoc(g.ref);
      }
      const settingsSnap = await getDocs(collection(db, 'users', uid, 'settings'));
      for (const setDocSnap of settingsSnap.docs) {
        await deleteDoc(setDocSnap.ref);
      }
      const statsSnap = await getDocs(collection(db, 'users', uid, 'statistics'));
      for (const statDocSnap of statsSnap.docs) {
        await deleteDoc(statDocSnap.ref);
      }

      // Delete main user profile doc
      await deleteDoc(doc(db, 'users', uid));

      // Finally delete user in Firebase Authentication
      await deleteUser(user);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const friendlyMsg = getFriendlyAuthError(firebaseError.code || '');
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        clearError,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
        updateUserPreferences,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
