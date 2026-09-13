import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AppTheme } from '../types';
import { THEMES, ThemeColors, applyThemeToDOM } from '../utils/theme';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (newTheme: AppTheme) => Promise<void>;
  themeConfig: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'focusflow_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  // Initial theme from localStorage or 'light'
  const [theme, setCurrentThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as AppTheme | null;
      if (stored && THEMES[stored]) {
        return stored;
      }
    }
    return 'light';
  });

  // Sync with userProfile theme when logged in
  useEffect(() => {
    if (userProfile?.theme && THEMES[userProfile.theme]) {
      if (userProfile.theme !== theme) {
        setCurrentThemeState(userProfile.theme);
        applyThemeToDOM(userProfile.theme);
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, userProfile.theme);
      }
    }
  }, [userProfile?.theme]);

  // Apply theme to DOM on mount or change
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = async (newTheme: AppTheme) => {
    if (!THEMES[newTheme]) return;
    
    // Immediate UI update
    setCurrentThemeState(newTheme);
    applyThemeToDOM(newTheme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);

    // Persist to user account in Firestore
    if (currentUser?.uid) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          theme: newTheme,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to persist theme to Firestore:', err);
      }
    }
  };

  const themeConfig = useMemo(() => THEMES[theme] || THEMES.light, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig,
        isDark: themeConfig.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
