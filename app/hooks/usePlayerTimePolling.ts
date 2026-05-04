import { useCallback, useEffect, useRef } from 'react';
import {
  hasReachedTrackEnd,
  resolvePlaybackEndAction,
} from '../lib/playerPlayback';
import type { RepeatMode, Track } from '../types/player';

type CurrentRef<T> = {
  current: T;
};

interface UsePlayerTimePollingOptions {
  playerRef: CurrentRef<any>;
  currentTrackRef: CurrentRef<Track | null>;
  queueRef: CurrentRef<Track[]>;
  repeatModeRef: CurrentRef<RepeatMode>;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  advanceToNextTrack: (queue: Track[], fromTrack: Track | null) => void;
}

export function usePlayerTimePolling({
  playerRef,
  currentTrackRef,
  queueRef,
  repeatModeRef,
  setCurrentTime,
  setIsPlaying,
  advanceToNextTrack,
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

      const freshQueue = queueRef.current;
      const endAction = resolvePlaybackEndAction({
        currentTrack: track,
        queueLength: freshQueue.length,
        repeatMode: repeatModeRef.current,
      });

      if (endAction.type === 'loop') {
        player.seekTo(endAction.track.timestamp, true);
        return;
      }

      if (endAction.type === 'advance') {
        advanceToNextTrack(freshQueue, track);
        return;
      }

      player.pauseVideo();
      setIsPlaying(false);
      stopTimeUpdateInterval();
    }, 500);
  }, [
    advanceToNextTrack,
    currentTrackRef,
    playerRef,
    queueRef,
    repeatModeRef,
    setCurrentTime,
    setIsPlaying,
    stopTimeUpdateInterval,
  ]);

  useEffect(() => stopTimeUpdateInterval, [stopTimeUpdateInterval]);

  return {
    startTimeUpdateInterval,
    stopTimeUpdateInterval,
  };
}
