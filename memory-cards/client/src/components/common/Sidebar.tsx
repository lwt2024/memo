import { Link, useLocation } from 'react-router-dom';

interface User {
  nickname: string;
  email: string;
}

interface SidebarProps {
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const user = JSON.parse(localStorage.getItem('user') || '{"nickname":"用户","email":""}') as User;

export default function Sidebar({ onToggleTheme, currentTheme }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/decks', label: '我的卡片组', icon: '📚', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/community', label: '社区广场', icon: '🌐', gradient: 'from-blue-500 to-cyan-500' },
    { path: '/settings', label: '设置', icon: '⚙️', gradient: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-40 transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              记忆卡片
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">艾宾浩斯记忆法</p>
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
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow">
            {user.nickname?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{user.nickname}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            {currentTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </aside>
  );
}
