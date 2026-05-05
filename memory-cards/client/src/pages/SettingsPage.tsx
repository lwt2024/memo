import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useTheme, themeStyles, ThemeStyle } from '../context/ThemeContext';
import { User } from '../types';

const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { mode, style, toggleMode, setStyle } = useTheme();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const themeOptions: { key: ThemeStyle; emoji: string }[] = [
    { key: 'ocean', emoji: '🌊' },
    { key: 'morandi', emoji: '🎨' },
    { key: 'vibrant', emoji: '🔥' },
    { key: 'minimal', emoji: '⬜' },
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">设置</h2>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-lg divide-y divide-[var(--color-border)] overflow-hidden">
        <div className="p-6">
          <h3 className="font-medium mb-4 text-[var(--color-text)]">个人信息</h3>
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              {user.nickname?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-[var(--color-text)]">{user.nickname || '用户'}</p>
              <p className="text-[var(--color-text-secondary)]">{user.email || '未设置邮箱'}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium mb-4 text-[var(--color-text)]">外观设置</h3>
          
          <div className="mb-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">显示模式</p>
            <div className="flex gap-3">
              <button
                onClick={() => mode === 'dark' && toggleMode()}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  mode === 'light' 
                    ? 'shadow-lg' 
                    : 'bg-[var(--color-background-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
                }`}
                style={mode === 'light' ? {
                  background: 'var(--color-active-background)',
                  color: 'var(--color-active-text)'
                } : {}}
              >
                ☀️ 浅色模式
              </button>
              <button
                onClick={() => mode === 'light' && toggleMode()}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  mode === 'dark' 
                    ? 'shadow-lg' 
                    : 'bg-[var(--color-background-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
                }`}
                style={mode === 'dark' ? {
                  background: 'var(--color-active-background)',
                  color: 'var(--color-active-text)'
                } : {}}
              >
                🌙 深色模式
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">主题风格</p>
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((option) => {
                const themeStyle = themeStyles[option.key];
                const isActive = style === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => setStyle(option.key)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      isActive 
                        ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-background-secondary)]' 
                        : 'bg-[var(--color-background-secondary)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-[var(--color-text)]">{themeStyle.name}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{themeStyle.description}</p>
                    {isActive && (
                      <div className="mt-2 text-xs text-[var(--color-primary)]">✓ 当前使用</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium mb-4 text-[var(--color-text)]">通知设置</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded accent-[var(--color-primary)]" 
            />
            <span className="text-[var(--color-text)]">开启浏览器推送提醒</span>
          </label>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">推送通知功能将在 Phase 3 实现</p>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-red-500 border border-red-300 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            退出登录
          </button>
        </div>
      </div>
    </Layout>
  );
}
