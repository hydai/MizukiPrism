'use client';

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { resolvePreviousPlayback } from '../lib/playerControls';
import type { RepeatMode, Track } from '../types/player';
import type { YouTubePlayerInstance } from '../types/youtubePlayer';

interface UsePlayerNavigationControlsOptions {
  currentTrack: Track | null;
  currentTime: number;
  playHistory: Track[];
  setPlayHistory: Dispatch<SetStateAction<Track[]>>;
  resetTimestampWarningOnceState: () => void;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  seekTo: (seconds: number) => void;
  queue: Track[];
  repeatMode: RepeatMode;
  advanceSkippingDeleted: (currentQ: Track[], fromTrack: Track | null) => boolean;
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

interface UsePlayerNavigationControlsResult {
  previous: () => void;
  next: () => void;
}

export function usePlayerNavigationControls({
  currentTrack,
  currentTime,
  playHistory,
  setPlayHistory,
  resetTimestampWarningOnceState,
  setCurrentTrack,
  setCurrentTime,
  seekTo,
  queue,
  repeatMode,
  advanceSkippingDeleted,
  playerRef,
  setIsPlaying,
}: UsePlayerNavigationControlsOptions): UsePlayerNavigationControlsResult {
  const previous = useCallback(() => {
    const action = resolvePreviousPlayback({
      currentTrack,
      currentTime,
      playHistory,
    });

    if (action.type === 'restart') {
      seekTo(action.track.timestamp);
    } else if (action.type === 'history') {
      setPlayHistory(prev => prev.slice(0, -1));
      resetTimestampWarningOnceState();
      setCurrentTrack(action.track);
      setCurrentTime(action.track.timestamp);
    }
  }, [
    currentTime,
    currentTrack,
    playHistory,
    resetTimestampWarningOnceState,
    seekTo,
    setCurrentTime,
    setCurrentTrack,
    setPlayHistory,
  ]);

  const next = useCallback(() => {
    // User pressed next - always advance (ignore repeat-one).
    if (queue.length > 0 || repeatMode === 'all') {
      advanceSkippingDeleted(queue, currentTrack);
      return;
    }

    // No queue, stop playback.
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [
    advanceSkippingDeleted,
    currentTrack,
    playerRef,
    queue,
    repeatMode,
    setIsPlaying,
  ]);

  return {
    previous,
    next,
  };
}
