'use client';

import { WifiOff } from 'lucide-react';

interface SongLoadErrorStateProps {
  onRetry: () => void;
}

export default function SongLoadErrorState({ onRetry }: SongLoadErrorStateProps) {
  return (
    <div
      data-testid="song-load-error"
      className="flex flex-col items-center justify-center py-32 gap-6"
      style={{ color: 'var(--text-secondary)' }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full"
        style={{ background: 'var(--bg-accent-pink-muted)' }}
      >
        <WifiOff className="w-8 h-8" style={{ color: 'var(--accent-pink)' }} />
      </div>
      <p
        className="text-center font-medium max-w-sm"
        style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}
      >
        無法載入歌曲資料，請檢查網路連線後重新整理頁面
      </p>
      <button
        data-testid="retry-button"
        onClick={onRetry}
        className="font-semibold transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--font-size-sm)',
          padding: 'var(--space-3) var(--space-6)',
          color: 'var(--text-on-accent)',
        }}
      >
        重新整理
      </button>
    </div>
  );
}
