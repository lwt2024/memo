import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemeStyle = 'ocean' | 'morandi' | 'vibrant' | 'minimal';

interface ThemeContextType {
  mode: ThemeMode;
  style: ThemeStyle;
  toggleMode: () => void;
  setStyle: (style: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeStyles = {
  ocean: {
    name: '海洋蓝',
    description: '清新护眼，适合长时间学习',
    light: {
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      secondary: '#06b6d4',
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      gradient: 'from-sky-500 to-cyan-600',
      statDue: 'linear-gradient(135deg, #ef4444, #f97316)',
      statLearning: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      statMastered: 'linear-gradient(135deg, #22c55e, #10b981)',
      statNew: 'linear-gradient(135deg, #a855f7, #ec4899)',
      completion: 'linear-gradient(135deg, #22c55e, #10b981)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
      buttonText: '#ffffff',
      activeBackground: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
      activeText: '#ffffff',
      ratingFailed: 'linear-gradient(135deg, #ef4444, #dc2626)',
      ratingHard: 'linear-gradient(135deg, #f97316, #ea580c)',
      ratingMedium: 'linear-gradient(135deg, #eab308, #ca8a04)',
      ratingEasy: 'linear-gradient(135deg, #22c55e, #16a34a)',
      ratingVeryEasy: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      tagBackground: 'rgba(14, 165, 233, 0.15)',
      tagBorder: 'rgba(14, 165, 233, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      checkInStreak: '#f59e0b',
      checkInPoints: '#22c55e',
      checkInBadge: '#22c55e',
      checkInCalendarBg: 'rgba(34, 197, 94, 0.15)',
      checkInCalendarBorder: 'rgba(34, 197, 94, 0.3)',
    },
    dark: {
      primary: '#38bdf8',
      primaryHover: '#7dd3fc',
      secondary: '#22d3ee',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      card: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      gradient: 'from-sky-400 to-cyan-500',
      statDue: 'linear-gradient(135deg, #dc2626, #ea580c)',
      statLearning: 'linear-gradient(135deg, #2563eb, #0891b2)',
      statMastered: 'linear-gradient(135deg, #16a34a, #059669)',
      statNew: 'linear-gradient(135deg, #9333ea, #db2777)',
      completion: 'linear-gradient(135deg, #16a34a, #059669)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #38bdf8, #22d3ee)',
      buttonText: '#0f172a',
      activeBackground: 'linear-gradient(135deg, #38bdf8, #22d3ee)',
      activeText: '#0f172a',
      ratingFailed: 'linear-gradient(135deg, #f87171, #ef4444)',
      ratingHard: 'linear-gradient(135deg, #fb923c, #f97316)',
      ratingMedium: 'linear-gradient(135deg, #facc15, #eab308)',
      ratingEasy: 'linear-gradient(135deg, #4ade80, #22c55e)',
      ratingVeryEasy: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      tagBackground: 'rgba(56, 189, 248, 0.15)',
      tagBorder: 'rgba(56, 189, 248, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      checkInStreak: '#fbbf24',
      checkInPoints: '#4ade80',
      checkInBadge: '#4ade80',
      checkInCalendarBg: 'rgba(74, 222, 128, 0.15)',
      checkInCalendarBorder: 'rgba(74, 222, 128, 0.3)',
    },
  },
  morandi: {
    name: '莫兰迪',
    description: '低饱和柔和色调，耐看舒适',
    light: {
      primary: '#9c8c7c',
      primaryHover: '#8b7b6b',
      secondary: '#b5a99a',
      background: '#f5f3f0',
      backgroundSecondary: '#ebe8e4',
      card: '#ffffff',
      text: '#4a4543',
      textSecondary: '#7a7572',
      border: '#d9d5d0',
      gradient: 'from-stone-400 to-stone-500',
      statDue: 'linear-gradient(135deg, #c78d8d, #d4a6a6)',
      statLearning: 'linear-gradient(135deg, #8d9cc7, #a6b5d4)',
      statMastered: 'linear-gradient(135deg, #8dc7a0, #a6d4b7)',
      statNew: 'linear-gradient(135deg, #b58dc7, #d4a6e0)',
      completion: 'linear-gradient(135deg, #8dc7a0, #a6d4b7)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #9c8c7c, #b5a99a)',
      buttonText: '#ffffff',
      activeBackground: 'linear-gradient(135deg, #9c8c7c, #b5a99a)',
      activeText: '#ffffff',
      ratingFailed: 'linear-gradient(135deg, #c78d8d, #a86666)',
      ratingHard: 'linear-gradient(135deg, #d4a690, #b89678)',
      ratingMedium: 'linear-gradient(135deg, #d4c7a6, #b8a788)',
      ratingEasy: 'linear-gradient(135deg, #8dc7a0, #66a87f)',
      ratingVeryEasy: 'linear-gradient(135deg, #8d9cc7, #6677a8)',
      tagBackground: 'rgba(156, 140, 124, 0.15)',
      tagBorder: 'rgba(156, 140, 124, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      checkInStreak: '#c7a066',
      checkInPoints: '#8dc7a0',
      checkInBadge: '#8dc7a0',
      checkInCalendarBg: 'rgba(141, 199, 160, 0.15)',
      checkInCalendarBorder: 'rgba(141, 199, 160, 0.3)',
    },
    dark: {
      primary: '#a89a8c',
      primaryHover: '#b8aa9c',
      secondary: '#9c8c7c',
      background: '#1c1917',
      backgroundSecondary: '#292524',
      card: '#292524',
      text: '#e7e5e4',
      textSecondary: '#a8a29e',
      border: '#44403c',
      gradient: 'from-stone-400 to-stone-500',
      statDue: 'linear-gradient(135deg, #a86666, #b87777)',
      statLearning: 'linear-gradient(135deg, #6677a8, #7788b8)',
      statMastered: 'linear-gradient(135deg, #66a87f, #77b88f)',
      statNew: 'linear-gradient(135deg, #8866a8, #9977b8)',
      completion: 'linear-gradient(135deg, #66a87f, #77b88f)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #a89a8c, #9c8c7c)',
      buttonText: '#1c1917',
      activeBackground: 'linear-gradient(135deg, #a89a8c, #9c8c7c)',
      activeText: '#1c1917',
      ratingFailed: 'linear-gradient(135deg, #b87777, #c88888)',
      ratingHard: 'linear-gradient(135deg, #a88668, #b89678)',
      ratingMedium: 'linear-gradient(135deg, #a89678, #b8a688)',
      ratingEasy: 'linear-gradient(135deg, #77b88f, #88c89f)',
      ratingVeryEasy: 'linear-gradient(135deg, #7788b8, #8899c8)',
      tagBackground: 'rgba(168, 154, 140, 0.15)',
      tagBorder: 'rgba(168, 154, 140, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      checkInStreak: '#d4b896',
      checkInPoints: '#77b88f',
      checkInBadge: '#77b88f',
      checkInCalendarBg: 'rgba(119, 184, 143, 0.15)',
      checkInCalendarBorder: 'rgba(119, 184, 143, 0.3)',
    },
  },
  vibrant: {
    name: '活力橙',
    description: '明亮活泼，激发学习热情',
    light: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      secondary: '#fb923c',
      background: '#fffbeb',
      backgroundSecondary: '#fef3c7',
      card: '#ffffff',
      text: '#1c1917',
      textSecondary: '#78716c',
      border: '#fde68a',
      gradient: 'from-orange-500 to-amber-500',
      statDue: 'linear-gradient(135deg, #dc2626, #f97316)',
      statLearning: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      statMastered: 'linear-gradient(135deg, #16a34a, #22c55e)',
      statNew: 'linear-gradient(135deg, #9333ea, #a855f7)',
      completion: 'linear-gradient(135deg, #16a34a, #22c55e)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #f97316, #fb923c)',
      buttonText: '#ffffff',
      activeBackground: 'linear-gradient(135deg, #f97316, #fb923c)',
      activeText: '#ffffff',
      ratingFailed: 'linear-gradient(135deg, #dc2626, #ef4444)',
      ratingHard: 'linear-gradient(135deg, #f97316, #fb923c)',
      ratingMedium: 'linear-gradient(135deg, #eab308, #facc15)',
      ratingEasy: 'linear-gradient(135deg, #16a34a, #22c55e)',
      ratingVeryEasy: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      tagBackground: 'rgba(249, 115, 22, 0.15)',
      tagBorder: 'rgba(249, 115, 22, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      checkInStreak: '#f97316',
      checkInPoints: '#22c55e',
      checkInBadge: '#22c55e',
      checkInCalendarBg: 'rgba(34, 197, 94, 0.15)',
      checkInCalendarBorder: 'rgba(34, 197, 94, 0.3)',
    },
    dark: {
      primary: '#fb923c',
      primaryHover: '#fdba74',
      secondary: '#fbbf24',
      background: '#1c1917',
      backgroundSecondary: '#292524',
      card: '#292524',
      text: '#fef3c7',
      textSecondary: '#a8a29e',
      border: '#44403c',
      gradient: 'from-orange-400 to-amber-400',
      statDue: 'linear-gradient(135deg, #b91c1c, #ea580c)',
      statLearning: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
      statMastered: 'linear-gradient(135deg, #15803d, #16a34a)',
      statNew: 'linear-gradient(135deg, #7e22ce, #9333ea)',
      completion: 'linear-gradient(135deg, #15803d, #16a34a)',
      statText: '#ffffff',
      statTextSecondary: 'rgba(255,255,255,0.8)',
      buttonBackground: 'linear-gradient(135deg, #fb923c, #fbbf24)',
      buttonText: '#1c1917',
      activeBackground: 'linear-gradient(135deg, #fb923c, #fbbf24)',
      activeText: '#1c1917',
      ratingFailed: 'linear-gradient(135deg, #ef4444, #f87171)',
      ratingHard: 'linear-gradient(135deg, #fb923c, #fdba74)',
      ratingMedium: 'linear-gradient(135deg, #facc15, #fde047)',
      ratingEasy: 'linear-gradient(135deg, #22c55e, #4ade80)',
      ratingVeryEasy: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      tagBackground: 'rgba(251, 146, 60, 0.15)',
      tagBorder: 'rgba(251, 146, 60, 0.3)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      checkInStreak: '#fb923c',
      checkInPoints: '#4ade80',
      checkInBadge: '#4ade80',
      checkInCalendarBg: 'rgba(74, 222, 128, 0.15)',
      checkInCalendarBorder: 'rgba(74, 222, 128, 0.3)',
    },
  },
  minimal: {
    name: '极简白',
    description: '黑白灰配色，专注内容本身',
    light: {
      primary: '#18181b',
      primaryHover: '#27272a',
      secondary: '#3f3f46',
      background: '#ffffff',
      backgroundSecondary: '#fafafa',
      card: '#ffffff',
      text: '#18181b',
      textSecondary: '#71717a',
      border: '#e4e4e7',
      gradient: 'from-zinc-700 to-zinc-800',
      statDue: '#ffffff',
      statLearning: '#ffffff',
      statMastered: '#ffffff',
      statNew: '#ffffff',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      completion: 'linear-gradient(135deg, #22c55e, #16a34a)',
      statText: '#18181b',
      statTextSecondary: '#71717a',
      buttonBackground: 'linear-gradient(135deg, #18181b, #3f3f46)',
      buttonText: '#ffffff',
      activeBackground: 'linear-gradient(135deg, #18181b, #3f3f46)',
      activeText: '#ffffff',
      ratingFailed: 'linear-gradient(135deg, #ef4444, #dc2626)',
      ratingHard: 'linear-gradient(135deg, #f97316, #ea580c)',
      ratingMedium: 'linear-gradient(135deg, #eab308, #ca8a04)',
      ratingEasy: 'linear-gradient(135deg, #22c55e, #16a34a)',
      ratingVeryEasy: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      tagBackground: 'rgba(24, 24, 27, 0.1)',
      tagBorder: 'rgba(24, 24, 27, 0.2)',
      checkInStreak: '#52525b',
      checkInPoints: '#3f3f46',
      checkInBadge: '#3f3f46',
      checkInCalendarBg: 'rgba(63, 63, 70, 0.15)',
      checkInCalendarBorder: 'rgba(63, 63, 70, 0.3)',
    },
    dark: {
      primary: '#fafafa',
      primaryHover: '#e4e4e7',
      secondary: '#d4d4d8',
      background: '#09090b',
      backgroundSecondary: '#18181b',
      card: '#18181b',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      border: '#27272a',
      gradient: 'from-zinc-400 to-zinc-500',
      statDue: 'linear-gradient(135deg, #d4d4d8, #e4e4e7)',
      statLearning: 'linear-gradient(135deg, #a1a1aa, #d4d4d8)',
      statMastered: 'linear-gradient(135deg, #71717a, #a1a1aa)',
      statNew: 'linear-gradient(135deg, #52525b, #71717a)',
      completion: 'linear-gradient(135deg, #71717a, #a1a1aa)',
      statText: '#18181b',
      statTextSecondary: 'rgba(24,24,27,0.7)',
      buttonBackground: 'linear-gradient(135deg, #71717a, #a1a1aa)',
      buttonText: '#09090b',
      activeBackground: 'linear-gradient(135deg, #52525b, #71717a)',
      tagBackground: 'rgba(250, 250, 250, 0.1)',
      tagBorder: 'rgba(250, 250, 250, 0.2)',
      statCardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      activeText: '#09090b',
      ratingFailed: 'linear-gradient(135deg, #f87171, #ef4444)',
      ratingHard: 'linear-gradient(135deg, #fb923c, #f97316)',
      ratingMedium: 'linear-gradient(135deg, #facc15, #eab308)',
      ratingEasy: 'linear-gradient(135deg, #4ade80, #22c55e)',
      ratingVeryEasy: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      checkInStreak: '#a1a1aa',
      checkInPoints: '#71717a',
      checkInBadge: '#71717a',
      checkInCalendarBg: 'rgba(113, 113, 122, 0.15)',
      checkInCalendarBorder: 'rgba(113, 113, 122, 0.3)',
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved) return saved as ThemeMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [style, setStyleState] = useState<ThemeStyle>(() => {
    const saved = localStorage.getItem('themeStyle');
    return (saved as ThemeStyle) || 'morandi';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('themeStyle', style);
    
    const root = document.documentElement;
    const theme = themeStyles[style][mode];
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-background-secondary', theme.backgroundSecondary);
    root.style.setProperty('--color-card', theme.card);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-stat-due', theme.statDue);
    root.style.setProperty('--color-stat-learning', theme.statLearning);
    root.style.setProperty('--color-stat-mastered', theme.statMastered);
    root.style.setProperty('--color-stat-new', theme.statNew);
    root.style.setProperty('--color-completion', theme.completion);
    root.style.setProperty('--color-stat-text', theme.statText);
    root.style.setProperty('--color-stat-text-secondary', theme.statTextSecondary);
    root.style.setProperty('--color-button-background', theme.buttonBackground);
    root.style.setProperty('--color-button-text', theme.buttonText);
    root.style.setProperty('--color-active-background', theme.activeBackground);
    root.style.setProperty('--color-active-text', theme.activeText);
    root.style.setProperty('--color-rating-failed', theme.ratingFailed);
    root.style.setProperty('--color-rating-hard', theme.ratingHard);
    root.style.setProperty('--color-rating-medium', theme.ratingMedium);
    root.style.setProperty('--color-rating-easy', theme.ratingEasy);
    root.style.setProperty('--color-rating-very-easy', theme.ratingVeryEasy);
    root.style.setProperty('--color-tag-background', theme.tagBackground);
    root.style.setProperty('--color-tag-border', theme.tagBorder);
    root.style.setProperty('--color-card-shadow', theme.statCardShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--color-checkin-streak', theme.checkInStreak);
    root.style.setProperty('--color-checkin-points', theme.checkInPoints);
    root.style.setProperty('--color-checkin-badge', theme.checkInBadge);
    root.style.setProperty('--color-checkin-calendar-bg', theme.checkInCalendarBg);
    root.style.setProperty('--color-checkin-calendar-border', theme.checkInCalendarBorder);

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode, style]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setStyle = (newStyle: ThemeStyle) => {
    setStyleState(newStyle);
  };

  return (
    <ThemeContext.Provider value={{ mode, style, toggleMode, setStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export { themeStyles };
export type { ThemeMode, ThemeStyle };