import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [emailHistory, setEmailHistory] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();
  const { setUser } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('emailHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEmailHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to parse email history:', e);
      }
    } else {
      const demoEmails = ['demo@example.com', 'test@memory.com', 'user@study.com'];
      localStorage.setItem('emailHistory', JSON.stringify(demoEmails));
      setEmailHistory(demoEmails);
    }

    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        if (parsed.email) {
          setEmail(parsed.email);
          setRememberMe(true);
          if (parsed.password) {
            setPassword(parsed.password);
          }
        }
      } catch (e) {
        console.error('Failed to parse remembered user:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          emailInputRef.current && !emailInputRef.current.contains(event.target as Node)) {
        setShowEmailDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const saveEmailToHistory = useCallback((email: string) => {
    setEmailHistory(prev => {
      const filtered = prev.filter(e => e !== email);
      const updated = [email, ...filtered].slice(0, 5);
      localStorage.setItem('emailHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.includes('@')) {
      setShowEmailDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        setUser(res.data.user);
      }
      saveEmailToHistory(email);
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || '登录失败，请稍后重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectEmail = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setShowEmailDropdown(false);
    emailInputRef.current?.focus();
  };

  const removeEmail = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    setEmailHistory(prev => {
      const filtered = prev.filter(e => e !== emailToRemove);
      localStorage.setItem('emailHistory', JSON.stringify(filtered));
      return filtered;
    });
  };

  const handleSendForgotCode = async () => {
    if (!forgotEmail) {
      setForgotError('请输入邮箱');
      return;
    }
    setIsForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, type: 'reset' }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setForgotStep(2);
        setCountdown(300);
      } else {
        setForgotError(data.error || '发送失败');
      }
    } catch (err: any) {
      setForgotError('发送失败');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotCode) {
      setForgotError('请输入验证码');
      return;
    }
    if (!forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('请填写密码');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('两次密码不一致');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('密码至少8位');
      return;
    }
    if (!/[a-zA-Z]/.test(forgotNewPassword) || !/[0-9]/.test(forgotNewPassword)) {
      setForgotError('密码必须包含字母和数字');
      return;
    }
    setIsForgotLoading(true);
    setForgotError('');
    try {
      await authApi.resetPassword(forgotEmail, forgotCode, forgotNewPassword);
      setForgotStep(3);
      setForgotMessage('密码重置成功！');
    } catch (err: any) {
      setForgotError(err.response?.data?.error || '重置失败');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotMessage('');
    setForgotError('');
    setCountdown(0);
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>欢迎回来</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>继续你的记忆之旅</p>
        </div>

        {error && (
          <div 
            className="border-2 p-4 rounded-xl mb-6"
            style={{ 
              backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
              borderColor: mode === 'dark' ? '#ef4444' : '#dc2626',
              color: mode === 'dark' ? '#fca5a5' : '#dc2626'
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold mb-1">登录失败</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              邮箱
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onFocus={() => setShowEmailDropdown(true)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                placeholder="输入你的邮箱"
                required
              />
              
              {showEmailDropdown && emailHistory.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] border rounded-xl shadow-lg overflow-hidden z-10"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs px-2" style={{ color: 'var(--color-text-secondary)' }}>
                      历史登录邮箱
                    </span>
                  </div>
                  {emailHistory.map((savedEmail) => (
                    <div
                      key={savedEmail}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[var(--color-background-secondary)] cursor-pointer transition-colors"
                      onClick={() => selectEmail(savedEmail)}
                    >
                      <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {savedEmail}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => removeEmail(e, savedEmail)}
                        className="p-1 text-xs hover:text-red-500 transition-colors"
                        style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              placeholder="输入你的密码"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>记住密码</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm"
              style={{ color: 'var(--color-primary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              忘记密码？
            </button>
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
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            还没有账号？{' '}
            <a
              href="/register"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              立即注册
            </a>
          </p>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-[var(--color-card)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {forgotStep === 1 ? '忘记密码' : forgotStep === 2 ? '验证邮箱' : '重置成功'}
              </h3>
              <button
                onClick={closeForgotModal}
                className="text-lg"
                style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ✕
              </button>
            </div>

            {forgotMessage && (
              <div 
                className="p-3 rounded-lg mb-4 text-center"
                style={{ 
                  backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                  color: mode === 'dark' ? '#86efac' : '#166534'
                }}
              >
                ✅ {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div 
                className="p-3 rounded-lg mb-4 text-center"
                style={{ 
                  backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                  color: mode === 'dark' ? '#fca5a5' : '#dc2626'
                }}
              >
                ⚠️ {forgotError}
              </div>
            )}

            {forgotStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  请输入注册时使用的邮箱，我们将发送验证码到您的邮箱。
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="输入您的邮箱"
                  />
                </div>
                <button
                  onClick={handleSendForgotCode}
                  disabled={isForgotLoading}
                  className="w-full py-3 text-white font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  {isForgotLoading ? '发送中...' : '发送验证码'}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    验证码
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-xl"
                      style={{ 
                        backgroundColor: 'var(--color-background)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                      placeholder="输入验证码"
                      maxLength={6}
                    />
                    <button
                      onClick={handleSendForgotCode}
                      disabled={isForgotLoading || countdown > 0}
                      className="px-4 py-3 rounded-xl font-medium"
                      style={{ 
                        backgroundColor: countdown > 0 ? 'var(--color-border)' : 'var(--color-primary)',
                        color: 'white'
                      }}
                    >
                      {isForgotLoading ? '发送中' : (countdown > 0 ? `${countdown}s` : '重新发送')}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    新密码
                  </label>
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="设置新密码（至少8位）"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl"
                    style={{ 
                      backgroundColor: 'var(--color-background)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="再次输入密码"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={isForgotLoading}
                  className="w-full py-3 text-white font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  {isForgotLoading ? '重置中...' : '确认重置'}
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                  密码重置成功！
                </p>
                <button
                  onClick={closeForgotModal}
                  className="w-full py-3 text-white font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  返回登录
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;