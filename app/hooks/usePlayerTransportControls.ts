'use client';

import { useCallback, type MutableRefObject } from 'react';
import type { YouTubePlayerInstance } from '../types/youtubePlayer';

interface UsePlayerTransportControlsOptions {
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
}

interface UsePlayerTransportControlsResult {
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
}

export function usePlayerTransportControls({
  playerRef,
  isPlaying,
  setIsPlaying,
  setCurrentTime,
}: UsePlayerTransportControlsOptions): UsePlayerTransportControlsResult {
  const togglePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying, playerRef, setIsPlaying]);

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;

    player.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, [playerRef, setCurrentTime]);

  return {
    togglePlayPause,
    seekTo,
  };
}
