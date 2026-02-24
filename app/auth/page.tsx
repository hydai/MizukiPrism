'use client';

import { Mic2, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0f5] via-[#f0f8ff] to-[#e6e6fa] p-4">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
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
            </div>
          </div>

          {/* Coming soon card */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-lg font-semibold text-slate-600">即將推出</span>
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400 mb-6">
              帳號登入功能正在開發中，敬請期待
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:brightness-105 transition-all"
              data-testid="back-to-home"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              目前可使用播放清單的匯出/匯入功能進行跨裝置轉移
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
