'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic2, Sparkles, Music, Star } from 'lucide-react';
import { useFanAuth } from '../contexts/FanAuthContext';

const OTP_DURATION_SECONDS = 10 * 60; // 10 minutes

function formatCountdown(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';
  const { requestOtp, verifyOtp, isLoggedIn, isLoading } = useFanAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, isLoading, router]);

  // Countdown timer
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step, countdown]);

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(OTP_DURATION_SECONDS);
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('請輸入有效的 Email 地址');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestOtp(email.trim());
      if (result.success) {
        setStep(2);
        setOtpCode('');
        startCountdown();
      } else {
        setError(result.error || '驗證碼發送失敗，請稍後再試');
      }
    } catch {
      setError('驗證碼發送失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (countdown === 0) {
      setError('驗證碼已過期，請重新取得');
      return;
    }

    if (otpCode.length !== 6) {
      setError('請輸入 6 位數驗證碼');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOtp(email.trim(), otpCode);
      if (result.success) {
        router.push(redirectTo);
      } else {
        // Check if we need to go back to step 1
        if (
          result.error === '驗證碼已失效，請重新取得' ||
          result.error?.includes('已失效')
        ) {
          setError(result.error || '驗證碼已失效，請重新取得');
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCountdown(0);
          setStep(1);
        } else {
          setError(result.error || '驗證失敗，請稍後再試');
        }
      }
    } catch {
      setError('驗證失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpCode('');
    setIsSubmitting(true);
    try {
      const result = await requestOtp(email.trim());
      if (result.success) {
        startCountdown();
      } else {
        setError(result.error || '驗證碼發送失敗，請稍後再試');
      }
    } catch {
      setError('驗證碼發送失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToStep1 = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setStep(1);
    setOtpCode('');
    setError('');
    setCountdown(0);
  };

  const isExpired = step === 2 && countdown === 0;

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

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="輸入您的 Email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white text-slate-700 placeholder-slate-400"
                  data-testid="fan-email-input"
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
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="request-otp-button"
              >
                {isSubmitting ? '發送中...' : '取得驗證碼'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-600">
                    驗證碼
                  </label>
                  <span
                    className={`text-sm font-mono font-medium ${
                      isExpired ? 'text-red-500' : 'text-slate-500'
                    }`}
                    data-testid="otp-countdown"
                  >
                    {isExpired ? '已過期' : formatCountdown(countdown)}
                  </span>
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  placeholder="輸入 6 位數驗證碼"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white text-slate-700 placeholder-slate-400 tracking-widest text-center text-lg"
                  data-testid="otp-input"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  驗證碼已發送至 {email}
                </p>
              </div>

              {isExpired && !error && (
                <div
                  className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
                  data-testid="otp-expired-message"
                >
                  驗證碼已過期，請重新取得
                </div>
              )}

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
                disabled={isSubmitting || isExpired}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                data-testid="verify-otp-button"
              >
                {isSubmitting ? '驗證中...' : '驗證'}
              </button>

              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-sm text-pink-500 hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-2"
                  data-testid="resend-otp-button"
                >
                  重新取得驗證碼
                </button>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  data-testid="change-email-button"
                >
                  使用其他 Email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              輸入 Email 後，我們將發送驗證碼至您的信箱
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
