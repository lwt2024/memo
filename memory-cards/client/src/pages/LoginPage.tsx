import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [usernameHistory, setUsernameHistory] = useState<string[]>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();
  const { setUser } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('usernameHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUsernameHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to parse username history:', e);
      }
    } else {
      const demoUsernames = ['demo', 'test', 'user'];
      localStorage.setItem('usernameHistory', JSON.stringify(demoUsernames));
      setUsernameHistory(demoUsernames);
    }

    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        if (parsed.username) {
          setUsername(parsed.username);
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
          usernameInputRef.current && !usernameInputRef.current.contains(event.target as Node)) {
        setShowUsernameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveUsernameToHistory = useCallback((username: string) => {
    setUsernameHistory(prev => {
      const filtered = prev.filter(u => u !== username);
      const updated = [username, ...filtered].slice(0, 5);
      localStorage.setItem('usernameHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        setUser(res.data.user);
      }
      saveUsernameToHistory(username);
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
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

  const selectUsername = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setShowUsernameDropdown(false);
    usernameInputRef.current?.focus();
  };

  const removeUsername = (e: React.MouseEvent, usernameToRemove: string) => {
    e.stopPropagation();
    setUsernameHistory(prev => {
      const filtered = prev.filter(u => u !== usernameToRemove);
      localStorage.setItem('usernameHistory', JSON.stringify(filtered));
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
              用户名
            </label>
            <div className="relative">
              <input
                ref={usernameInputRef}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onFocus={() => setShowUsernameDropdown(true)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                placeholder="输入你的用户名"
                required
              />
              
              {showUsernameDropdown && usernameHistory.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] border rounded-xl shadow-lg overflow-hidden z-10"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs px-2" style={{ color: 'var(--color-text-secondary)' }}>
                      历史登录用户名
                    </span>
                  </div>
                  {usernameHistory.map((savedUsername) => (
                    <div
                      key={savedUsername}
                      className="flex items-center justify-between px-4 py-2 hover:bg-[var(--color-background-secondary)] cursor-pointer transition-colors"
                      onClick={() => selectUsername(savedUsername)}
                    >
                      <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {savedUsername}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => removeUsername(e, savedUsername)}
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12"
                style={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                placeholder="输入你的密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-opacity-80 transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
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
