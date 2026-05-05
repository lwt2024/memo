import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface SidebarProps {
  onToggleTheme: () => void;
  currentMode: 'light' | 'dark';
}

export default function Sidebar({ onToggleTheme, currentMode }: SidebarProps) {
  const { user } = useUser();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/decks', label: '我的卡片组', icon: '📚' },
    { path: '/community', label: '社区广场', icon: '🌐' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <aside 
      className="hidden lg:block fixed left-0 top-0 h-full w-64 shadow-xl z-40 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      <div 
        className="p-6 border-b transition-colors"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              记忆卡片
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>艾宾浩斯记忆法</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive
                  ? 'shadow-lg'
                  : 'hover:bg-[var(--color-background-secondary)]'
              }`}
              style={isActive ? { 
                background: 'var(--color-active-background)',
                color: 'var(--color-active-text)'
              } : { color: 'var(--color-text)' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div 
        className="absolute bottom-0 left-0 right-0 p-4 border-t transition-colors"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              user.nickname?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{user.nickname}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-background-secondary)' }}
          >
            {currentMode === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </aside>
  );
}
