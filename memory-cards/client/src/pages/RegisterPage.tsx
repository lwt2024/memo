import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('密码不一致');
      return;
    }
    try {
      const res = await authApi.register(email, password, nickname);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <button
        onClick={toggleMode}
        className="fixed top-4 right-4 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        style={{ backgroundColor: 'var(--color-card)' }}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>创建账号</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>开始你的记忆之旅</p>
        </div>

        {error && (
          <div 
            className="border p-4 rounded-xl mb-6 text-center"
            style={{ 
              backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
              borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : '#fecaca',
              color: mode === 'dark' ? '#fca5a5' : '#dc2626'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="给自己起个昵称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="输入你的邮箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="设置密码"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="再次输入密码"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            注册
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            已有账号？{' '}
            <a
              href="/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              立即登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
