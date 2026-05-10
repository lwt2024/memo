import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    letter: false
  });
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();
  const { setUser } = useUser();

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      letter: /[a-zA-Z]/.test(password)
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!username.trim()) {
      setError('请输入用户名');
      setIsLoading(false);
      return;
    }
    
    if (!passwordStrength.length) {
      setError('密码长度不能少于8位');
      setIsLoading(false);
      return;
    }
    if (!passwordStrength.number || !passwordStrength.letter) {
      setError('密码必须包含数字和字母');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('密码不一致');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await authApi.register(username, password, nickname);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        setUser(res.data.user);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setIsLoading(false);
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
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="设置用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              昵称（可选）
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
              placeholder="给自己起个昵称（不填则使用用户名）"
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
              placeholder="设置密码（至少8位，包含数字和字母）"
              required
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className={passwordStrength.length ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.length ? '✓' : '✗'}
                </span>
                <span className={passwordStrength.length ? '' : 'opacity-50'}> 至少8位字符</span>
              </div>
              <div className="flex items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className={passwordStrength.number ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.number ? '✓' : '✗'}
                </span>
                <span className={passwordStrength.number ? '' : 'opacity-50'}> 包含数字</span>
              </div>
              <div className="flex items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className={passwordStrength.letter ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.letter ? '✓' : '✗'}
                </span>
                <span className={passwordStrength.letter ? '' : 'opacity-50'}> 包含字母</span>
              </div>
            </div>
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
            disabled={isLoading}
            className="w-full py-3 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                注册中...
              </span>
            ) : (
              '注册'
            )}
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
