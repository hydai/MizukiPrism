'use client';

import { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic, AlertCircle } from 'lucide-react';
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const totalDuration = (currentTrack.endTimestamp || duration) - currentTrack.timestamp;
    const newTime = currentTrack.timestamp + totalDuration * percentage;
    seekTo(newTime);
  };

  return (
    <div
      data-testid="mini-player"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-white/50 shadow-2xl"
    >
      {/* Progress bar */}
      <div
        className="h-1 bg-slate-200 cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-blue-500 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Player controls */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer"
        onClick={(e) => {
          // Don't expand if clicking on buttons
          if ((e.target as HTMLElement).closest('button')) return;
          setShowModal(true);
        }}
      >
        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-800 truncate">{currentTrack.title}</div>
          {playerError ? (
            <div className="flex items-center gap-1.5 text-sm text-red-500 truncate" data-testid="player-error-message">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{playerError}</span>
            </div>
          ) : (
            <div className="text-sm text-slate-500 truncate">{currentTrack.originalArtist}</div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              previous();
            }}
            className="text-slate-600 hover:text-slate-800 transition-colors transform hover:scale-110"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 text-white flex items-center justify-center shadow-lg hover:brightness-110 transform hover:scale-105 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            data-testid="mini-player-play-button"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="text-slate-600 hover:text-slate-800 transition-colors transform hover:scale-110"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQueue(true);
            }}
            className="relative text-slate-600 hover:text-slate-800 transition-colors transform hover:scale-110 ml-2"
            aria-label="Open queue"
            data-testid="queue-button"
          >
            <ListMusic className="w-5 h-5" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Spacer for balance */}
        <div className="flex-1 hidden md:block" />
      </div>
    </div>
  );
}
