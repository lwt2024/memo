import { Link, useLocation } from 'react-router-dom';

interface User {
  nickname: string;
  email: string;
}

const user = JSON.parse(localStorage.getItem('user') || '{"nickname":"用户","email":""}') as User;

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/decks', label: '我的卡片组', icon: '📚' },
    { path: '/community', label: '社区广场', icon: '🌐' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">记忆卡片</h1>
      </div>
      <nav className="p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {user.nickname?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.nickname}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
