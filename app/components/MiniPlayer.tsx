'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    previous,
    next,
    setShowModal,
  } = usePlayer();

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
          <div className="text-sm text-slate-500 truncate">{currentTrack.originalArtist}</div>
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
        </div>

        {/* Spacer for balance */}
        <div className="flex-1 hidden md:block" />
      </div>
    </div>
  );
}
