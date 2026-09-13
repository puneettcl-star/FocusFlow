import { AppTheme } from '../types';

export interface ThemeColors {
  id: AppTheme;
  name: string;
  tagline: string;
  isDark: boolean;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
  variables: {
    '--bg-app': string;
    '--bg-card': string;
    '--bg-subtle': string;
    '--border-theme': string;
    '--border-hover': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--accent-primary': string;
    '--accent-hover': string;
    '--accent-subtle': string;
    '--accent-text': string;
    '--timer-track': string;
    '--timer-ring': string;
    '--chart-bar': string;
    '--chart-grid': string;
    '--nav-bg': string;
  };
}

export const THEMES: Record<AppTheme, ThemeColors> = {
  light: {
    id: 'light',
    name: 'Light',
    tagline: 'Clean, crisp and focused minimalism',
    isDark: false,
    preview: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#4F46E5',
      text: '#0F172A',
    },
    variables: {
      '--bg-app': '#F8FAFC',
      '--bg-card': '#FFFFFF',
      '--bg-subtle': '#F1F5F9',
      '--border-theme': '#E2E8F0',
      '--border-hover': '#CBD5E1',
      '--text-primary': '#0F172A',
      '--text-secondary': '#475569',
      '--text-muted': '#94A3B8',
      '--accent-primary': '#4F46E5',
      '--accent-hover': '#4338CA',
      '--accent-subtle': '#EEF2FF',
      '--accent-text': '#4338CA',
      '--timer-track': '#E2E8F0',
      '--timer-ring': '#4F46E5',
      '--chart-bar': '#6366F1',
      '--chart-grid': '#F1F5F9',
      '--nav-bg': 'rgba(255, 255, 255, 0.9)',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    tagline: 'Deep obsidian night with indigo glow',
    isDark: true,
    preview: {
      bg: '#0B0F19',
      card: '#111827',
      accent: '#818CF8',
      text: '#F9FAFB',
    },
    variables: {
      '--bg-app': '#0B0F19',
      '--bg-card': '#111827',
      '--bg-subtle': '#1F2937',
      '--border-theme': '#374151',
      '--border-hover': '#4B5563',
      '--text-primary': '#F9FAFB',
      '--text-secondary': '#D1D5DB',
      '--text-muted': '#9CA3AF',
      '--accent-primary': '#6366F1',
      '--accent-hover': '#4F46E5',
      '--accent-subtle': '#1E1B4B',
      '--accent-text': '#A5B4FC',
      '--timer-track': '#1F2937',
      '--timer-ring': '#818CF8',
      '--chart-bar': '#818CF8',
      '--chart-grid': '#1F2937',
      '--nav-bg': 'rgba(17, 24, 39, 0.9)',
    },
  },
  calm: {
    id: 'calm',
    name: 'Calm',
    tagline: 'Mindful matcha & soothing sage herbs',
    isDark: false,
    preview: {
      bg: '#F4F6F0',
      card: '#FFFFFF',
      accent: '#2E7D5B',
      text: '#1C2920',
    },
    variables: {
      '--bg-app': '#F4F6F0',
      '--bg-card': '#FFFFFF',
      '--bg-subtle': '#EAEFE6',
      '--border-theme': '#D2DDD0',
      '--border-hover': '#B5C6B1',
      '--text-primary': '#1C2920',
      '--text-secondary': '#425446',
      '--text-muted': '#7E9082',
      '--accent-primary': '#2E7D5B',
      '--accent-hover': '#236348',
      '--accent-subtle': '#E7F3EC',
      '--accent-text': '#1B5E41',
      '--timer-track': '#DCE8DE',
      '--timer-ring': '#2E7D5B',
      '--chart-bar': '#349D73',
      '--chart-grid': '#EAEFE6',
      '--nav-bg': 'rgba(255, 255, 255, 0.9)',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    tagline: 'Deep abyssal navy and vibrant azure tides',
    isDark: true,
    preview: {
      bg: '#0A192F',
      card: '#0F243E',
      accent: '#0EA5E9',
      text: '#F0F8FF',
    },
    variables: {
      '--bg-app': '#0A192F',
      '--bg-card': '#0F243E',
      '--bg-subtle': '#173454',
      '--border-theme': '#1F436B',
      '--border-hover': '#2E5F94',
      '--text-primary': '#F0F8FF',
      '--text-secondary': '#B4D4F0',
      '--text-muted': '#6E93B8',
      '--accent-primary': '#0EA5E9',
      '--accent-hover': '#0284C7',
      '--accent-subtle': '#082F49',
      '--accent-text': '#7DD3FC',
      '--timer-track': '#173454',
      '--timer-ring': '#38BDF8',
      '--chart-bar': '#0EA5E9',
      '--chart-grid': '#162E4A',
      '--nav-bg': 'rgba(15, 36, 62, 0.92)',
    },
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    tagline: 'Delicate blossom petals & warm rose tea',
    isDark: false,
    preview: {
      bg: '#FFF7F8',
      card: '#FFFFFF',
      accent: '#E11D48',
      text: '#37121F',
    },
    variables: {
      '--bg-app': '#FFF7F8',
      '--bg-card': '#FFFFFF',
      '--bg-subtle': '#FFE4E8',
      '--border-theme': '#FBCFE8',
      '--border-hover': '#F472B6',
      '--text-primary': '#37121F',
      '--text-secondary': '#702D45',
      '--text-muted': '#A86A80',
      '--accent-primary': '#E11D48',
      '--accent-hover': '#BE123C',
      '--accent-subtle': '#FFE4E6',
      '--accent-text': '#BE123C',
      '--timer-track': '#FCE7F3',
      '--timer-ring': '#F43F5E',
      '--chart-bar': '#FB7185',
      '--chart-grid': '#FFF1F2',
      '--nav-bg': 'rgba(255, 255, 255, 0.92)',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    tagline: 'High-octane carbon black & neon cyan',
    isDark: true,
    preview: {
      bg: '#07080D',
      card: '#0E111A',
      accent: '#00F0FF',
      text: '#E2F8FF',
    },
    variables: {
      '--bg-app': '#07080D',
      '--bg-card': '#0E111A',
      '--bg-subtle': '#151B27',
      '--border-theme': '#00F0FF33',
      '--border-hover': '#00F0FF66',
      '--text-primary': '#E2F8FF',
      '--text-secondary': '#8AE0F5',
      '--text-muted': '#46677A',
      '--accent-primary': '#00F0FF',
      '--accent-hover': '#00C2CF',
      '--accent-subtle': '#002B33',
      '--accent-text': '#00F0FF',
      '--timer-track': '#121E2C',
      '--timer-ring': '#00F0FF',
      '--chart-bar': '#00F0FF',
      '--chart-grid': '#111C2B',
      '--nav-bg': 'rgba(14, 17, 26, 0.92)',
    },
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    tagline: 'Academic parchment, Oxford navy & gold',
    isDark: false,
    preview: {
      bg: '#F9F6F0',
      card: '#FFFFFF',
      accent: '#1E3A8A',
      text: '#1A202C',
    },
    variables: {
      '--bg-app': '#F9F6F0',
      '--bg-card': '#FFFFFF',
      '--bg-subtle': '#F0EAE0',
      '--border-theme': '#DDD4C5',
      '--border-hover': '#C6B9A3',
      '--text-primary': '#1A202C',
      '--text-secondary': '#4A453A',
      '--text-muted': '#8B8272',
      '--accent-primary': '#1E3A8A',
      '--accent-hover': '#172554',
      '--accent-subtle': '#EFF3FA',
      '--accent-text': '#1E3A8A',
      '--timer-track': '#E8E0D2',
      '--timer-ring': '#B45309',
      '--chart-bar': '#1E3A8A',
      '--chart-grid': '#EFE8DE',
      '--nav-bg': 'rgba(255, 255, 255, 0.92)',
    },
  },
};

export const THEME_LIST: AppTheme[] = ['light', 'dark', 'calm', 'ocean', 'sakura', 'cyber', 'classic'];

export function applyThemeToDOM(theme: AppTheme) {
  const config = THEMES[theme] || THEMES.light;
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', theme);

  // Toggle dark class
  if (config.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set CSS variables
  Object.entries(config.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}
