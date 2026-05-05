import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useTheme, themeStyles, ThemeStyle } from '../context/ThemeContext';
import { User } from '../types';
import { userApi } from '../services/api';

const defaultUser = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { mode, style, toggleMode, setStyle } = useTheme();
  
  const [profile, setProfile] = useState<User>(defaultUser);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState(defaultUser.nickname || '');
  const [email, setEmail] = useState(defaultUser.email || '');
  const [avatar, setAvatar] = useState(defaultUser.avatar || '');
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [profileMessage, setProfileMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userApi.getProfile();
      setProfile(res.data.user);
      setNickname(res.data.user.nickname || '');
      setEmail(res.data.user.email || '');
      setAvatar(res.data.user.avatar || '');
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      console.error('加载用户信息失败', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    setIsLoading(true);
    
    try {
      const res = await userApi.updateProfile({ nickname, email, avatar });
      setProfile(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setProfileMessage('个人信息更新成功！');
      setEditMode(false);
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error: any) {
      setProfileMessage(error.response?.data?.error || '更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('新密码长度不能少于6位');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await userApi.changePassword(oldPassword, newPassword);
      setPasswordSuccess('密码修改成功！');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || '密码修改失败');
    } finally {
      setIsLoading(false);
    }
  };

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

      {profileMessage && (
        <div className="mb-6 p-4 rounded-xl border-2 text-center" style={{
          backgroundColor: profileMessage.includes('成功') 
            ? (mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4')
            : (mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'),
          borderColor: profileMessage.includes('成功') 
            ? (mode === 'dark' ? '#22c55e' : '#86efac')
            : (mode === 'dark' ? '#ef4444' : '#fca5a5'),
          color: profileMessage.includes('成功') 
            ? (mode === 'dark' ? '#86efac' : '#166534')
            : (mode === 'dark' ? '#fca5a5' : '#dc2626')
        }}>
          {profileMessage.includes('成功') ? '✅ ' : '⚠️ '}{profileMessage}
        </div>
      )}

      <div className="bg-[var(--color-card)] rounded-2xl shadow-lg divide-y divide-[var(--color-border)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--color-text)]">个人信息</h3>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                编辑资料
              </button>
            )}
          </div>
          
          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden"
                    style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      nickname?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">头像 URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="输入头像图片URL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="输入昵称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="输入邮箱"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {isLoading ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setNickname(profile.nickname || '');
                    setEmail(profile.email || '');
                    setAvatar(profile.avatar || '');
                  }}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  profile.nickname?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">{profile.nickname || '未设置昵称'}</p>
                <p className="text-[var(--color-text-secondary)]">{profile.email || '未设置邮箱'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--color-text)]">修改密码</h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                修改密码
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg text-sm" style={{
                  backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                  color: mode === 'dark' ? '#fca5a5' : '#dc2626'
                }}>
                  ⚠️ {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="p-3 rounded-lg text-sm" style={{
                  backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                  color: mode === 'dark' ? '#86efac' : '#166534'
                }}>
                  ✅ {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">原密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="输入原密码"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="输入新密码（至少6位）"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="再次输入新密码"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {isLoading ? '修改中...' : '确认修改'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          )}
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
