'use client';

import { useCallback, useEffect, useRef } from 'react';
import { hasReachedTrackEnd } from '../lib/playerPlayback';
import type { Track } from '../types/player';

type CurrentRef<T> = {
  current: T;
};

interface UsePlayerTimePollingOptions {
  playerRef: CurrentRef<any>;
  currentTrackRef: CurrentRef<Track | null>;
  setCurrentTime: (time: number) => void;
  handleTrackEnd: () => 'continue' | 'stop';
}

export function usePlayerTimePolling({
  playerRef,
  currentTrackRef,
  setCurrentTime,
  handleTrackEnd,
}: UsePlayerTimePollingOptions) {
  const timeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimeUpdateInterval = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  const startTimeUpdateInterval = useCallback(() => {
    stopTimeUpdateInterval();

    timeUpdateIntervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;

      const current = player.getCurrentTime();
      setCurrentTime(current);

      const track = currentTrackRef.current;
      if (!hasReachedTrackEnd(track, current)) return;

      if (handleTrackEnd() === 'stop') {
        stopTimeUpdateInterval();
      }
    }, 500);
  }, [
    currentTrackRef,
    handleTrackEnd,
    playerRef,
    setCurrentTime,
    stopTimeUpdateInterval,
  ]);

  useEffect(() => stopTimeUpdateInterval, [stopTimeUpdateInterval]);

  return {
    startTimeUpdateInterval,
    stopTimeUpdateInterval,
  };
}
