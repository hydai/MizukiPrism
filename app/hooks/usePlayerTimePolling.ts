'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  createPlayerTimePoller,
  type CurrentRef,
  type PlayerTimePoller,
  type TrackEndHandler,
} from '../lib/playerTimePolling';
import type { Track } from '../types/player';

interface UsePlayerTimePollingOptions {
  playerRef: CurrentRef<any>;
  currentTrackRef: CurrentRef<Track | null>;
  setCurrentTime: (time: number) => void;
  handleTrackEnd: TrackEndHandler;
}

export function usePlayerTimePolling({
  playerRef,
  currentTrackRef,
  setCurrentTime,
  handleTrackEnd,
}: UsePlayerTimePollingOptions) {
  const pollerSnapshot = {
    playerRef,
    currentTrackRef,
    setCurrentTime,
    handleTrackEnd,
  };
  const pollerRef = useRef<PlayerTimePoller | null>(null);

  if (!pollerRef.current) {
    pollerRef.current = createPlayerTimePoller(pollerSnapshot);
  }

  useEffect(() => {
    pollerRef.current?.update({
      playerRef,
      currentTrackRef,
      setCurrentTime,
      handleTrackEnd,
    });
  }, [currentTrackRef, handleTrackEnd, playerRef, setCurrentTime]);

  const stopTimeUpdateInterval = useCallback(() => {
    pollerRef.current?.stop();
  }, []);

  const startTimeUpdateInterval = useCallback(() => {
    pollerRef.current?.start();
  }, []);

  useEffect(() => stopTimeUpdateInterval, [stopTimeUpdateInterval]);

  return {
    startTimeUpdateInterval,
    stopTimeUpdateInterval,
  };
}
