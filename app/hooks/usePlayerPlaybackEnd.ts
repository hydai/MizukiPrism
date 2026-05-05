'use client';

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { resolvePlaybackEndAction } from '../lib/playerPlayback';
import { resolveTrackStartPosition } from '../lib/playerTime';
import type { RepeatMode, Track } from '../types/player';
import type { YouTubePlayerInstance } from '../types/youtubePlayer';

type PlaybackEndResult = 'continue' | 'stop';

interface UsePlayerPlaybackEndOptions {
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  queueRef: MutableRefObject<Track[]>;
  currentTrackRef: MutableRefObject<Track | null>;
  repeatModeRef: MutableRefObject<RepeatMode>;
  advanceSkippingDeleted: (currentQ: Track[], fromTrack: Track | null) => boolean;
  showTimestampWarningOnce: (track: Track) => void;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

interface PlaybackEndOptions {
  resumeLoopPlayback?: boolean;
}

interface UsePlayerPlaybackEndResult {
  handlePlaybackEnd: (options?: PlaybackEndOptions) => PlaybackEndResult;
}

export function usePlayerPlaybackEnd({
  playerRef,
  queueRef,
  currentTrackRef,
  repeatModeRef,
  advanceSkippingDeleted,
  showTimestampWarningOnce,
  setIsPlaying,
}: UsePlayerPlaybackEndOptions): UsePlayerPlaybackEndResult {
  const handlePlaybackEnd = useCallback((options: PlaybackEndOptions = {}): PlaybackEndResult => {
    const player = playerRef.current;
    const freshQueue = queueRef.current;
    const endAction = resolvePlaybackEndAction({
      currentTrack: currentTrackRef.current,
      queueLength: freshQueue.length,
      repeatMode: repeatModeRef.current,
    });

    if (endAction.type === 'loop') {
      const videoDuration = player?.getDuration?.() || 0;
      const startPosition = resolveTrackStartPosition(endAction.track, videoDuration);
      player?.seekTo(startPosition.startSeconds, true);
      if (startPosition.timestampOutOfBounds) {
        showTimestampWarningOnce(endAction.track);
      }
      if (options.resumeLoopPlayback) {
        player?.playVideo();
      }
      return 'continue';
    }

    if (endAction.type === 'advance') {
      return advanceSkippingDeleted(freshQueue, currentTrackRef.current) ? 'continue' : 'stop';
    }

    player?.pauseVideo();
    setIsPlaying(false);
    return 'stop';
  }, [
    advanceSkippingDeleted,
    currentTrackRef,
    playerRef,
    queueRef,
    repeatModeRef,
    setIsPlaying,
    showTimestampWarningOnce,
  ]);

  return {
    handlePlaybackEnd,
  };
}
