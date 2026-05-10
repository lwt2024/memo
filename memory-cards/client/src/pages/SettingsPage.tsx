import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useTheme, themeStyles, ThemeStyle } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { userApi, checkInApi } from '../services/api';

interface CheckInStats {
  totalPoints: number;
  streakDays: number;
  checkedInToday: boolean;
}

interface CheckInDay {
  date: string;
  points: number;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { mode, style, toggleMode, setStyle } = useTheme();
  const { user, updateUser, setUser } = useUser();
  
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [checkInStats, setCheckInStats] = useState<CheckInStats | null>(null);
  const [checkInCalendar, setCheckInCalendar] = useState<CheckInDay[]>([]);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [profileMessage, setProfileMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadProfile();
    loadCheckInStats();
    loadCheckInCalendar();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userApi.getProfile();
      const profile = res.data.user;
      if (profile) {
        setUser(profile);
        setNickname(profile.nickname || '');
        setUsername(profile.username || '');
        setAvatar(profile.avatar || '');
      }
    } catch (error) {
      console.error('加载用户信息失败', error);
    }
  };

  const loadCheckInStats = async () => {
    try {
      const res = await checkInApi.getStats();
      setCheckInStats(res.data);
    } catch (error) {
      console.error('加载签到信息失败', error);
    }
  };

  const loadCheckInCalendar = async () => {
    try {
      const res = await checkInApi.getCalendar(3);
      setCheckInCalendar(res.data);
    } catch (error) {
      console.error('加载签到日历失败', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('nickname', nickname);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const res = await userApi.updateProfile(formData);
      updateUser(res.data.user);
      setProfileMessage('个人信息更新成功！');
      setAvatarFile(null);
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
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    setUser({ nickname: '用户', username: '' });
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsLoading(true);
    
    try {
      await userApi.deleteAccount(deletePassword);
      localStorage.removeItem('token');
      setUser({ nickname: '用户', username: '' });
      navigate('/login');
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || '注销失败');
    } finally {
      setIsLoading(false);
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
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">个人中心</h2>

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
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">头像</label>
                  <label className="w-full px-4 py-3 border border-dashed rounded-xl cursor-pointer text-center hover:bg-[var(--color-background-secondary)] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    {avatarFile ? (
                      <span className="text-[var(--color-primary)]">✓ 已选择图片</span>
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">📷 点击上传头像</span>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">用户名</label>
                <input
                  type="text"
                  value={username}
                  disabled
                  className="w-full px-4 py-3 border rounded-xl bg-[var(--color-border)]"
                  style={{
                    color: 'var(--color-text-secondary)'
                  }}
                  placeholder="用户名（不可修改）"
                />
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
                    setNickname(user.nickname || '');
                    setUsername(user.username || '');
                    setAvatar(user.avatar || '');
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
            <>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    (user.nickname || user.username)?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{user.nickname || user.username || '未设置昵称'}</p>
                  <p className="text-[var(--color-text-secondary)]">@{user.username}</p>
                </div>
              </div>
              {checkInStats && (
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-checkin-streak)' }}>{checkInStats.streakDays}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>连续签到</p>
                      </div>
                      <div className="w-px h-10" style={{ backgroundColor: 'var(--color-border)' }}></div>
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: 'var(--color-checkin-points)' }}>{checkInStats.totalPoints}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>累计积分</p>
                      </div>
                    </div>
                    {checkInStats.checkedInToday && (
                      <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: 'var(--color-checkin-badge)' }}>
                        今日已签到
                      </span>
                    )}
                  </div>
                  {checkInCalendar.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>签到记录（近3个月）</p>
                      <div className="grid grid-cols-7 gap-1">
                        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                          <div key={day} className="text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {day}
                          </div>
                        ))}
                        {checkInCalendar.slice(-35).map((day, index) => {
                          const date = new Date(day.date);
                          const dayOfWeek = date.getDay();
                          const isFirstWeek = index < 7;
                          
                          if (isFirstWeek && index === 0 && dayOfWeek !== 0) {
                            const emptyCells = [];
                            for (let i = 0; i < dayOfWeek; i++) {
                              emptyCells.push(<div key={`empty-${i}`} className="w-4 h-4"></div>);
                            }
                            return [...emptyCells, (
                              <div
                                key={day.date}
                                className="w-4 h-4 rounded-sm text-xs flex items-center justify-center cursor-default"
                                style={{
                                  backgroundColor: day.points > 0 ? 'var(--color-checkin-calendar-bg)' : 'transparent',
                                  border: day.points > 0 ? '1px solid var(--color-checkin-calendar-border)' : '1px solid transparent',
                                  color: 'var(--color-text)',
                                }}
                                title={`${day.date}: ${day.points}积分`}
                              >
                              </div>
                            )];
                          }
                          
                          return (
                            <div
                              key={day.date}
                              className="w-4 h-4 rounded-sm text-xs flex items-center justify-center cursor-default"
                              style={{
                                backgroundColor: day.points > 0 ? 'var(--color-checkin-calendar-bg)' : 'transparent',
                                border: day.points > 0 ? '1px solid var(--color-checkin-calendar-border)' : '1px solid transparent',
                                color: 'var(--color-text)',
                              }}
                              title={`${day.date}: ${day.points}积分`}
                            >
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-checkin-calendar-bg)', border: '1px solid var(--color-checkin-calendar-border)' }}></div>
                          <span>已签到</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ border: '1px solid var(--color-border)' }}></div>
                          <span>未签到</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
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
          <button
            onClick={handleLogout}
            className="w-full py-3 text-red-500 border border-red-300 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            退出登录
          </button>
        </div>

        <div className="p-6 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--color-text)]">危险操作</h3>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors font-medium"
          >
            🗑️ 注销账号
          </button>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-center">
            注销后所有数据将被永久删除，且可使用原用户名重新注册
          </p>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-[var(--color-card)] rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              确认注销账号？
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              此操作将永久删除您的所有数据，包括卡片组、卡片和学习记录。请输入密码以确认操作。
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  密码
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-background)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="输入密码确认注销"
                />
              </div>

              {deleteError && (
                <p className="text-red-500 text-sm">{deleteError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
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
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {isLoading ? '处理中...' : '确认注销'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-[var(--color-card)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--color-text)' }}>
              退出登录
            </h3>
            <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              确定要退出登录吗？
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                取消
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl text-white font-medium"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}