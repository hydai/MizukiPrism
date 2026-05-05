'use client';

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { advancePlayerQueue } from '../lib/playerQueue';
import type { RepeatMode, Track } from '../types/player';
import type { YouTubePlayerInstance } from '../types/youtubePlayer';

interface UsePlayerQueueAdvanceOptions {
  repeatModeRef: MutableRefObject<RepeatMode>;
  shuffleOnRef: MutableRefObject<boolean>;
  allTracksRef: MutableRefObject<Track[]>;
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  resetTimestampWarningOnceState: () => void;
  setQueue: Dispatch<SetStateAction<Track[]>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setPlayHistory: Dispatch<SetStateAction<Track[]>>;
  showSkipNotification: (message: string) => void;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
}

interface UsePlayerQueueAdvanceResult {
  advanceSkippingDeleted: (currentQ: Track[], fromTrack: Track | null) => boolean;
}

export function usePlayerQueueAdvance({
  repeatModeRef,
  shuffleOnRef,
  allTracksRef,
  playerRef,
  resetTimestampWarningOnceState,
  setQueue,
  setIsPlaying,
  setPlayHistory,
  showSkipNotification,
  setCurrentTrack,
  setCurrentTime,
}: UsePlayerQueueAdvanceOptions): UsePlayerQueueAdvanceResult {
  // Advance to the next playable track, refilling from all tracks in repeat-all mode when needed.
  // Returns true when a track is selected and set as current; false when no playable track remains.
  const advanceSkippingDeleted = useCallback((currentQ: Track[], fromTrack: Track | null): boolean => {
    const result = advancePlayerQueue({
      queue: currentQ,
      fromTrack,
      repeatMode: repeatModeRef.current,
      shuffleOn: shuffleOnRef.current,
      allTracks: allTracksRef.current,
    });

    if (!result.nextTrack) {
      if (result.skippedDeleted) {
        showSkipNotification('播放完畢');
      }
      setQueue([]);
      setIsPlaying(false);
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
      return false;
    }

    resetTimestampWarningOnceState();
    setQueue(result.queue);

    if (fromTrack) {
      setPlayHistory(prev => [...prev, fromTrack]);
    }
    if (result.skippedDeleted) {
      showSkipNotification('已跳過無法播放的版本');
    }
    setCurrentTrack(result.nextTrack);
    setCurrentTime(result.nextTrack.timestamp);
    return true;
  }, [
    allTracksRef,
    playerRef,
    repeatModeRef,
    resetTimestampWarningOnceState,
    setCurrentTime,
    setCurrentTrack,
    setIsPlaying,
    setPlayHistory,
    setQueue,
    showSkipNotification,
    shuffleOnRef,
  ]);

  return {
    advanceSkippingDeleted,
  };
}
