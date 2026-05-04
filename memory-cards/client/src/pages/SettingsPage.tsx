import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { User } from '../types';

const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">设置</h2>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-4">
          <h3 className="font-medium mb-2">个人信息</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user.nickname}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium mb-2">通知设置</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" />
            <span>开启浏览器推送提醒</span>
          </label>
          <p className="text-sm text-gray-500 mt-1">推送通知功能将在 Phase 3 实现</p>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
          >
            退出登录
          </button>
        </div>
      </div>
    </Layout>
  );
}
