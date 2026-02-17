'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic2, Sparkles, Music, Star } from 'lucide-react';
import { useFanAuth } from '../contexts/FanAuthContext';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login } = useFanAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // First register the account
        const res = await fetch('/api/auth/fan/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || '註冊失敗');
          setLoading(false);
          return;
        }
      }

      // Login (or just login for login mode)
      const result = await login(username, password);
      if (result.success) {
        router.push(redirectTo);
      } else {
        setError(result.error || '登入失敗');
      }
    } catch {
      setError(mode === 'login' ? '登入失敗，請稍後再試' : '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0f5] via-[#f0f8ff] to-[#e6e6fa] p-4">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Floating icons */}
        <div className="absolute -top-8 -left-8 text-pink-300/60 animate-pulse">
          <Music className="w-8 h-8" />
        </div>
        <div className="absolute -top-4 -right-4 text-blue-300/60 animate-pulse delay-300">
          <Star className="w-6 h-6 fill-current" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-100/50 border border-white/60 p-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-2xl text-white shadow-lg shadow-pink-200">
              <Mic2 className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                MizukiPrism
              </h1>
              <p className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                跨裝置同步您的播放清單
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-slate-100/80 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              data-testid="login-tab"
            >
              登入
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              data-testid="register-tab"
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1.5">
                用戶名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="輸入用戶名"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white text-slate-700 placeholder-slate-400"
                data-testid="fan-username-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                密碼
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={mode === 'register' ? '至少 6 個字元' : '輸入密碼'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white text-slate-700 placeholder-slate-400"
                data-testid="fan-password-input"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                data-testid="auth-error"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="auth-submit-button"
            >
              {loading
                ? (mode === 'login' ? '登入中...' : '註冊中...')
                : (mode === 'login' ? '登入' : '建立帳號')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              {mode === 'login'
                ? '還沒有帳號？點擊上方「註冊」建立新帳號'
                : '已有帳號？點擊上方「登入」進行登入'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0f5] via-[#f0f8ff] to-[#e6e6fa]" />}>
      <AuthPageContent />
    </Suspense>
  );
}
