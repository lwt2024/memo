import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/decks', label: '卡片组' },
    { path: '/community', label: '社区' },
    { path: '/settings', label: '设置' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
