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
      backgroundSecondary: '#f4f4f5',
      card: '#ffffff',
      text: '#18181b',
      textSecondary: '#71717a',
      border: '#e4e4e7',
      gradient: 'from-zinc-700 to-zinc-800',
      statDue: 'linear-gradient(135deg, #52525b, #71717a)',
      statLearning: 'linear-gradient(135deg, #3f3f46, #52525b)',
      statMastered: 'linear-gradient(135deg, #27272a, #3f3f46)',
      statNew: 'linear-gradient(135deg, #18181b, #27272a)',
      completion: 'linear-gradient(135deg, #27272a, #3f3f46)',
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
    return (saved as ThemeStyle) || 'ocean';
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
