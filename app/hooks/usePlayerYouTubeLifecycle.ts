'use client';

import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import {
  resolveYouTubePlayerLoadAction,
  resolveYouTubePlaybackState,
} from '../lib/playerPlayback';
import { resolveTrackStartPosition } from '../lib/playerTime';
import { applyPlayerAudioSettings } from '../lib/playerVolume';
import type { Track } from '../types/player';
import type {
  YouTubePlayerErrorEvent,
  YouTubePlayerInstance,
  YouTubePlayerReadyEvent,
  YouTubePlayerStateChangeEvent,
} from '../types/youtubePlayer';

type PlaybackEndHandler = (options?: { resumeLoopPlayback?: boolean }) => 'continue' | 'stop';

interface UsePlayerYouTubeLifecycleOptions {
  isPlayerReady: boolean;
  currentTrack: Track | null;
  playerDivId: string;
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  loadedVideoIdRef: MutableRefObject<string | null>;
  currentTrackRef: MutableRefObject<Track | null>;
  volumeRef: MutableRefObject<number>;
  isMutedRef: MutableRefObject<boolean>;
  startTimeUpdateInterval: () => void;
  stopTimeUpdateInterval: () => void;
  handlePlaybackEnd: PlaybackEndHandler;
  showTimestampWarningOnce: (track: Track) => void;
  clearPlayerError: () => void;
  handlePlayerError: (errorCode: unknown, videoId: string | null) => void;
  setDuration: Dispatch<SetStateAction<number>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

export function usePlayerYouTubeLifecycle({
  isPlayerReady,
  currentTrack,
  playerDivId,
  playerRef,
  loadedVideoIdRef,
  currentTrackRef,
  volumeRef,
  isMutedRef,
  startTimeUpdateInterval,
  stopTimeUpdateInterval,
  handlePlaybackEnd,
  showTimestampWarningOnce,
  clearPlayerError,
  handlePlayerError,
  setDuration,
  setIsPlaying,
}: UsePlayerYouTubeLifecycleOptions): void {
  useEffect(() => () => {
    stopTimeUpdateInterval();
    playerRef.current?.destroy();
    playerRef.current = null;
    loadedVideoIdRef.current = null;
  }, [loadedVideoIdRef, playerRef, stopTimeUpdateInterval]);

  // Initialize YouTube player when ready and track is available.
  // Reuses the existing player instance to preserve autoplay permission.
  useEffect(() => {
    if (!isPlayerReady || !currentTrack) return;

    // Clear previous errors when starting new track.
    clearPlayerError();

    const player = playerRef.current;
    const loadAction = resolveYouTubePlayerLoadAction({
      hasPlayer: Boolean(player),
      loadedVideoId: loadedVideoIdRef.current,
      nextVideoId: currentTrack.videoId,
    });

    // Reuse existing player for the same VOD.
    if (player && loadAction.type === 'seek-existing') {
      const videoDuration = player.getDuration?.() || 0;
      const startPosition = resolveTrackStartPosition(currentTrack, videoDuration);
      player.seekTo(startPosition.startSeconds, true);
      if (startPosition.timestampOutOfBounds) {
        showTimestampWarningOnce(currentTrack);
      }
      applyPlayerAudioSettings(player, volumeRef.current, isMutedRef.current);
      player.playVideo();
      setIsPlaying(true);
      startTimeUpdateInterval();
      return;
    }

    // Reuse existing iframe when switching VODs.
    if (player && loadAction.type === 'load-existing') {
      loadedVideoIdRef.current = currentTrack.videoId;
      player.loadVideoById({
        videoId: currentTrack.videoId,
        startSeconds: currentTrack.timestamp,
      });
      applyPlayerAudioSettings(player, volumeRef.current, isMutedRef.current);
      setIsPlaying(true);
      startTimeUpdateInterval();
      return;
    }

    if (player) {
      player.destroy();
      playerRef.current = null;
    }

    loadedVideoIdRef.current = currentTrack.videoId;
    playerRef.current = new window.YT.Player(playerDivId, {
      height: '360',
      width: '640',
      videoId: currentTrack.videoId,
      playerVars: {
        start: currentTrack.timestamp,
        autoplay: 1,
        controls: 1,
        rel: 0,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
      events: {
        onReady: (event: YouTubePlayerReadyEvent) => {
          const readyTrack = currentTrackRef.current;
          if (!readyTrack || readyTrack.videoId !== loadedVideoIdRef.current) return;

          const videoDuration = event.target.getDuration();
          setDuration(videoDuration);

          const startPosition = resolveTrackStartPosition(readyTrack, videoDuration);
          event.target.seekTo(startPosition.startSeconds, true);
          if (startPosition.timestampOutOfBounds) {
            showTimestampWarningOnce(readyTrack);
          }

          applyPlayerAudioSettings(event.target, volumeRef.current, isMutedRef.current);

          event.target.playVideo();
          setIsPlaying(true);
          startTimeUpdateInterval();
        },
        onStateChange: (event: YouTubePlayerStateChangeEvent) => {
          const playbackState = resolveYouTubePlaybackState(event.data);
          if (playbackState === 'playing') {
            setIsPlaying(true);
            const nextDuration = event.target.getDuration?.();
            if (nextDuration > 0) setDuration(nextDuration);
          } else if (playbackState === 'paused') {
            setIsPlaying(false);
          } else if (playbackState === 'ended') {
            if (handlePlaybackEnd({ resumeLoopPlayback: true }) === 'stop') {
              stopTimeUpdateInterval();
            }
          }
        },
        onError: (event: YouTubePlayerErrorEvent) => {
          handlePlayerError(event.data, loadedVideoIdRef.current);
        },
      },
    }) as YouTubePlayerInstance;
  }, [
    isPlayerReady,
    currentTrack,
    playerDivId,
    startTimeUpdateInterval,
    stopTimeUpdateInterval,
    handlePlaybackEnd,
    showTimestampWarningOnce,
    clearPlayerError,
    currentTrackRef,
    handlePlayerError,
    loadedVideoIdRef,
    playerRef,
    volumeRef,
    isMutedRef,
    setDuration,
    setIsPlaying,
  ]);
}
