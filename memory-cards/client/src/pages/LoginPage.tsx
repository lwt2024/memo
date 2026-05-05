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
  const emailInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();
  const { setUser } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('emailHistory');
    if (saved) {
      setEmailHistory(JSON.parse(saved));
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

  const saveEmailToHistory = useCallback((email: string) => {
    setEmailHistory(prev => {
      const filtered = prev.filter(e => e !== email);
      const updated = [email, ...filtered].slice(0, 5);
      localStorage.setItem('emailHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

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
                onChange={(e) => setEmail(e.target.value)}
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
                        style={{ color: 'var(--color-text-secondary)' }}
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
    </div>
  );
}

export default LoginPage;
