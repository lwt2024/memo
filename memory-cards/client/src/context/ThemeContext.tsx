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
