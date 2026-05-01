'use client';

import { Play, Shuffle } from 'lucide-react';

interface MobileActionBarProps {
  youtubeUrl: string;
  shuffleOn: boolean;
  onPlayAll: () => void;
  onToggleShuffle: () => void;
}

export default function MobileActionBar({
  youtubeUrl,
  shuffleOn,
  onPlayAll,
  onToggleShuffle,
}: MobileActionBarProps) {
  return (
    <div
      data-testid="mobile-action-bar"
      className="lg:hidden flex items-center flex-shrink-0"
      style={{
        padding: '0 20px',
        gap: '12px',
        minHeight: '64px',
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      {/* Play button: 48x48 circle, gradient fill (pink to blue) */}
      <button
        data-testid="mobile-play-all-button"
        className="flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
          color: 'white',
          boxShadow: '0 4px 16px rgba(244, 114, 182, 0.35)',
        }}
        title="播放全部"
        onClick={onPlayAll}
      >
        <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />
      </button>

      {/* Shuffle button: gradient fill when active, outline when off */}
      <button
        data-testid="mobile-shuffle-button"
        onClick={onToggleShuffle}
        className="flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90"
        style={{
          background: shuffleOn
            ? 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))'
            : 'transparent',
          border: shuffleOn ? 'none' : '2px solid var(--accent-pink-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 28px',
          color: shuffleOn ? 'white' : 'var(--accent-pink)',
        }}
        title="隨機播放"
      >
        <Shuffle className="w-4 h-4" />
      </button>

      {/* Flexible spacer */}
      <div style={{ flex: 1 }} />

      {/* Follow button: outline style */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="mobile-follow-button"
        className="flex items-center justify-center flex-shrink-0 font-semibold transition-all hover:opacity-80"
        style={{
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '8px 24px',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
          background: 'transparent',
        }}
      >
        追蹤
      </a>
    </div>
  );
}
