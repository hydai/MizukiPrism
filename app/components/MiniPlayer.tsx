'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic, AlertCircle, Shuffle, Repeat, Music, Heart, Volume2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    playerError,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    previous,
    next,
    setShowModal,
    queue,
    setShowQueue,
  } = usePlayer();

  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);

  // Keyboard navigation: Space for play/pause when player is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Space if no input/textarea/button is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (e.code === 'Space' && !isInputFocused && currentTrack) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, togglePlayPause]);

  if (!currentTrack) return null;

  const progress = currentTrack.timestamp
    ? ((currentTime - currentTrack.timestamp) /
       ((currentTrack.endTimestamp || duration) - currentTrack.timestamp)) * 100
    : 0;

  const clampedProgress = Math.min(100, Math.max(0, progress));

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const totalDuration = (currentTrack.endTimestamp || duration) - currentTrack.timestamp;
    const newTime = currentTrack.timestamp + totalDuration * percentage;
    seekTo(newTime);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const trackCurrentTime = Math.max(0, currentTime - currentTrack.timestamp);
  const trackDuration = (currentTrack.endTimestamp || duration) - currentTrack.timestamp;

  return (
    <div
      data-testid="mini-player"
      className="fixed left-0 right-0 z-[60] bottom-16 lg:bottom-0"
    >
      {/* ── MOBILE MINI PLAYER (hidden on lg+) ── */}
      <div
        className="lg:hidden"
        style={{
          background: 'var(--bg-surface-frosted)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-glass)',
          borderLeft: '1px solid var(--border-glass)',
          borderRight: '1px solid var(--border-glass)',
          borderRadius: '16px 16px 0 0',
        }}
      >
        {/* Progress bar at top — 3px height, gradient fill */}
        <div
          style={{
            height: '3px',
            background: '#E2E8F0',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
          }}
          onClick={handleProgressClick}
        >
          <div
            style={{
              height: '100%',
              width: `${clampedProgress}%`,
              background: 'linear-gradient(90deg, var(--accent-pink-light), var(--accent-blue-light))',
              borderRadius: '16px 16px 0 0',
              transition: 'width 0.2s',
            }}
          />
        </div>

        {/* Content row: cover + song info + heart + play/pause */}
        <div
          className="flex items-center"
          style={{ padding: '10px 16px', gap: '12px', cursor: 'pointer' }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            setShowModal(true);
          }}
        >
          {/* Cover thumbnail placeholder — 40×40, cornerRadius 8 */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
            }}
          >
            <Music style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>

          {/* Song info — vertical, gap 2, fill remaining space */}
          <div className="flex flex-col min-w-0 flex-1" style={{ gap: '2px' }}>
            <div
              className="truncate"
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {currentTrack.title}
            </div>
            <div
              className="truncate"
              style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
            >
              {currentTrack.originalArtist}
            </div>
          </div>

          {/* Heart icon — 20px, accent-pink (visual placeholder) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="flex-shrink-0"
            aria-label="Mobile Like"
            style={{ color: 'var(--accent-pink)', padding: '4px' }}
          >
            <Heart
              style={{
                width: '20px',
                height: '20px',
                fill: isLiked ? 'var(--accent-pink)' : 'none',
              }}
            />
          </button>

          {/* Play/Pause icon — 24px, text-primary */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="flex-shrink-0"
            aria-label={isPlaying ? '暫停' : '播放'}
            data-testid="mini-player-play-button-mobile"
            style={{ color: 'var(--text-primary)', padding: '4px' }}
          >
            {isPlaying ? (
              <Pause style={{ width: '24px', height: '24px', fill: 'currentColor' }} />
            ) : (
              <Play style={{ width: '24px', height: '24px', fill: 'currentColor', marginLeft: '2px' }} />
            )}
          </button>
        </div>
      </div>

      {/* ── DESKTOP NOW PLAYING BAR (hidden on mobile) ── */}
      <div
        className="hidden lg:block"
        style={{
          height: '80px',
          background: 'var(--bg-surface-frosted)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-glass)',
        }}
      >
        {/* 3-column layout */}
        <div
          className="flex items-center h-full px-4 gap-4"
          onClick={(e) => {
            // Don't expand if clicking on buttons or interactive elements
            if ((e.target as HTMLElement).closest('button, input')) return;
            setShowModal(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          {/* LEFT COLUMN: 280px — album art, track info, like */}
          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={{ width: '280px' }}
          >
            {/* Album cover thumbnail placeholder */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
              }}
            >
              <Music style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>

            {/* Track info */}
            <div className="min-w-0 flex-1">
              {/* Song title — keep .font-bold.text-slate-800 for test compatibility */}
              <div
                className="font-bold text-slate-800 truncate"
                style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}
              >
                {currentTrack.title}
              </div>
              {playerError ? (
                <div
                  className="flex items-center gap-1 truncate text-red-500"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                  data-testid="player-error-message"
                >
                  <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                  <span>{playerError}</span>
                </div>
              ) : (
                <div
                  className="truncate"
                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}
                >
                  {currentTrack.originalArtist}
                </div>
              )}
            </div>

            {/* Heart/like button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="flex-shrink-0 transition-colors"
              aria-label="Like"
              style={{ color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)' }}
            >
              <Heart
                style={{
                  width: '16px',
                  height: '16px',
                  fill: isLiked ? 'var(--accent-pink)' : 'none',
                }}
              />
            </button>
          </div>

          {/* CENTER COLUMN: fill — transport controls + progress bar */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-1"
            style={{ minWidth: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Transport controls row */}
            <div className="flex items-center gap-4">
              {/* Shuffle */}
              <button
                className="transition-colors"
                aria-label="Shuffle"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <Shuffle style={{ width: '16px', height: '16px' }} />
              </button>

              {/* Previous */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previous();
                }}
                className="transition-colors"
                aria-label="Previous"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <SkipBack style={{ width: '18px', height: '18px' }} />
              </button>

              {/* Play/Pause — 40×40 gradient circle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="flex items-center justify-center flex-shrink-0 transition-all hover:brightness-110"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                data-testid="mini-player-play-button"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-circle)',
                  background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {isPlaying ? (
                  <Pause style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
                ) : (
                  <Play style={{ width: '18px', height: '18px', fill: 'currentColor', marginLeft: '2px' }} />
                )}
              </button>

              {/* Next */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="transition-colors"
                aria-label="Next"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <SkipForward style={{ width: '18px', height: '18px' }} />
              </button>

              {/* Repeat */}
              <button
                className="transition-colors"
                aria-label="Repeat"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <Repeat style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Progress bar row */}
            <div className="flex items-center gap-2 w-full" style={{ maxWidth: '480px' }}>
              {/* Current time */}
              <span
                className="flex-shrink-0 font-mono"
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', minWidth: '32px', textAlign: 'right' }}
              >
                {formatTime(trackCurrentTime)}
              </span>

              {/* Progress bar track — keep .h-1.bg-slate-200 for test compatibility */}
              <div
                className="h-1 bg-slate-200 flex-1 cursor-pointer relative group"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--bg-surface-muted)',
                }}
                onClick={handleProgressClick}
              >
                {/* Filled portion */}
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${clampedProgress}%`,
                    borderRadius: 'var(--radius-pill)',
                    background: 'linear-gradient(90deg, var(--accent-pink-light), var(--accent-blue-light))',
                  }}
                />
                {/* Scrubber circle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    left: `${clampedProgress}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'white',
                    border: '2px solid var(--accent-pink-light)',
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Total time */}
              <span
                className="flex-shrink-0 font-mono"
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', minWidth: '32px' }}
              >
                {formatTime(Math.max(0, trackDuration))}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: 200px — queue, speaker, volume */}
          <div
            className="flex items-center gap-3 flex-shrink-0 justify-end"
            style={{ width: '200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Queue button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQueue(true);
              }}
              className="relative transition-colors"
              aria-label="Open queue"
              data-testid="queue-button"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <ListMusic style={{ width: '18px', height: '18px' }} />
              {queue.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center font-bold"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-circle)',
                    background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                    color: 'white',
                    fontSize: '10px',
                  }}
                >
                  {queue.length}
                </span>
              )}
            </button>

            {/* Speaker/Device icon */}
            <button
              className="transition-colors"
              aria-label="Volume"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <Volume2 style={{ width: '18px', height: '18px' }} />
            </button>

            {/* Volume slider */}
            <div className="flex items-center" style={{ width: '80px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
                aria-label="Volume slider"
                style={{
                  height: '4px',
                  borderRadius: 'var(--radius-pill)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(90deg, var(--accent-pink-light) ${volume}%, var(--bg-surface-muted) ${volume}%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
