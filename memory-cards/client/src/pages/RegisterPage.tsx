import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [codeMessage, setCodeMessage] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    letter: false
  });
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      letter: /[a-zA-Z]/.test(password)
    });
  }, [password]);

  const handleSendCode = async () => {
    if (!email) {
      setError('请先输入邮箱');
      return;
    }
    setIsCodeLoading(true);
    try {
      const res = await authApi.sendCode(email);
      setCodeMessage(res.data.message);
      setCodeSent(true);
      setCountdown(300);
    } catch (err: any) {
      setError(err.response?.data?.error || '发送失败');
    } finally {
      setIsCodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!passwordStrength.length) {
      setError('密码长度不能少于8位');
      return;
    }
    if (!passwordStrength.number || !passwordStrength.letter) {
      setError('密码必须包含数字和字母');
      return;
    }
    if (password !== confirmPassword) {
      setError('密码不一致');
      return;
    }
    if (!codeSent || !code) {
      setError('请先获取并填写邮箱验证码');
      return;
    }
    
    try {
      await authApi.verifyCode(email, code);
      const res = await authApi.register(email, password, nickname);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
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

        {codeMessage && (
          <div 
            className="border p-4 rounded-xl mb-6 text-center"
            style={{ 
              backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
              borderColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.5)' : '#86efac',
              color: mode === 'dark' ? '#86efac' : '#166534'
            }}
          >
            ✅ {codeMessage}
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
              邮箱验证码
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                placeholder="输入验证码"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isCodeLoading || countdown > 0}
                className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: countdown > 0 ? 'var(--color-border)' : 'var(--color-primary)',
                  color: 'white'
                }}
              >
                {isCodeLoading ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码')}
              </button>
            </div>
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
