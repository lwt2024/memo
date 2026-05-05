import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { mode, toggleMode } = useTheme();

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Sidebar onToggleTheme={toggleMode} currentMode={mode} />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
