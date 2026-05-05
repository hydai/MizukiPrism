'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePlayerAudioSettings } from '../hooks/usePlayerAudioSettings';
import { usePlayerErrorState } from '../hooks/usePlayerErrorState';
import { usePlayerNotificationState } from '../hooks/usePlayerNotificationState';
import { usePlayerPlaybackModes } from '../hooks/usePlayerPlaybackModes';
import { usePlayerQueueState } from '../hooks/usePlayerQueueState';
import { usePlayerRuntimeRefs } from '../hooks/usePlayerRuntimeRefs';
import { usePlayerTimePolling } from '../hooks/usePlayerTimePolling';
import { usePlayerTransportControls } from '../hooks/usePlayerTransportControls';
import { useYouTubeIframeApi } from '../hooks/useYouTubeIframeApi';
import { resolvePreviousPlayback } from '../lib/playerControls';
import {
  resolvePlaybackEndAction,
  resolveYouTubePlayerLoadAction,
  resolveYouTubePlaybackState,
} from '../lib/playerPlayback';
import { advancePlayerQueue } from '../lib/playerQueue';
import {
  getTrackCurrentTime,
  getTrackDuration,
  resolveTrackStartPosition,
} from '../lib/playerTime';
import { applyPlayerAudioSettings } from '../lib/playerVolume';
import type { RepeatMode, Track } from '../types/player';
import type {
  YouTubePlayerErrorEvent,
  YouTubePlayerInstance,
  YouTubePlayerReadyEvent,
  YouTubePlayerStateChangeEvent,
} from '../types/youtubePlayer';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPlayerReady: boolean;
  playerError: string | null;
  apiLoadError: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  timestampWarning: string | null;
  clearTimestampWarning: () => void;
  skipNotification: string | null;
  clearSkipNotification: () => void;
  currentTime: number;
  duration: number;
  trackCurrentTime: number;
  trackDuration: number | null;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  previous: () => void;
  next: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  showQueue: boolean;
  setShowQueue: (show: boolean) => void;
  repeatMode: RepeatMode;
  shuffleOn: boolean;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  volume: number;
  isMuted: boolean;
  setVolume: (n: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const {
    repeatMode,
    shuffleOn,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerPlaybackModes();
  const {
    playerError,
    unavailableVideoIds,
    clearPlayerError,
    handlePlayerError,
  } = usePlayerErrorState();
  const {
    queue,
    setQueue,
    showQueue,
    setShowQueue,
    allTracks,
    addToAllTracks,
    addToQueue,
    removeFromQueue,
    reorderQueue,
  } = usePlayerQueueState();
  const { isPlayerReady, apiLoadError } = useYouTubeIframeApi();

  // Derived track-relative time values (never fall back to full VOD duration)
  const trackCurrentTime = getTrackCurrentTime(currentTrack, currentTime);
  const trackDuration = getTrackDuration(currentTrack);

  const playerDivId = 'youtube-player';
  const {
    playerRef,
    loadedVideoIdRef,
    queueRef,
    currentTrackRef,
    repeatModeRef,
    shuffleOnRef,
    allTracksRef,
  } = usePlayerRuntimeRefs({
    queue,
    currentTrack,
    repeatMode,
    shuffleOn,
    allTracks,
  });
  const {
    volume,
    isMuted,
    volumeRef,
    isMutedRef,
    setVolume,
    toggleMute,
  } = usePlayerAudioSettings(playerRef);
  const { togglePlayPause, seekTo } = usePlayerTransportControls({
    playerRef,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
  });
  const {
    timestampWarning,
    clearTimestampWarning,
    showTimestampWarningOnce,
    resetTimestampWarningOnceState,
    skipNotification,
    clearSkipNotification,
    showSkipNotification,
  } = usePlayerNotificationState();

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
    setQueue,
    showSkipNotification,
    shuffleOnRef,
  ]);

  const handlePlaybackEnd = useCallback((options: { resumeLoopPlayback?: boolean } = {}): 'continue' | 'stop' => {
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
    showTimestampWarningOnce,
  ]);

  const { startTimeUpdateInterval, stopTimeUpdateInterval } = usePlayerTimePolling({
    playerRef,
    currentTrackRef,
    setCurrentTime,
    handleTrackEnd: handlePlaybackEnd,
  });

  // Initialize YouTube player when ready and track is available.
  // Reuses the existing player instance to preserve autoplay permission.
  useEffect(() => {
    if (!isPlayerReady || !currentTrack) return;

    // Clear previous errors when starting new track
    clearPlayerError();

    const player = playerRef.current;
    const loadAction = resolveYouTubePlayerLoadAction({
      hasPlayer: Boolean(player),
      loadedVideoId: loadedVideoIdRef.current,
      nextVideoId: currentTrack.videoId,
    });

    // --- Reuse existing player ---
    if (player && loadAction.type === 'seek-existing') {
      // Same VOD — just seek to the new timestamp
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

    if (player && loadAction.type === 'load-existing') {
      // Different VOD — load new video without destroying the iframe
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

    // --- First-time creation ---
    // Destroy any leftover player (shouldn't happen, but safety)
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

          // Check if timestamp exceeds video length
          const startPosition = resolveTrackStartPosition(readyTrack, videoDuration);
          event.target.seekTo(startPosition.startSeconds, true);
          if (startPosition.timestampOutOfBounds) {
            showTimestampWarningOnce(readyTrack);
          }

          // Apply saved volume/mute settings to newly created player
          applyPlayerAudioSettings(event.target, volumeRef.current, isMutedRef.current);

          event.target.playVideo();
          setIsPlaying(true);
          startTimeUpdateInterval();
        },
        onStateChange: (event: YouTubePlayerStateChangeEvent) => {
          const playbackState = resolveYouTubePlaybackState(event.data);
          if (playbackState === 'playing') {
            setIsPlaying(true);
            // Update duration (needed after loadVideoById since onReady doesn't re-fire)
            const d = event.target.getDuration?.();
            if (d > 0) setDuration(d);
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
  ]);

  const playTrack = (track: Track) => {
    // Add current track to history before switching
    if (currentTrack && currentTrack.id !== track.id) {
      setPlayHistory((prev) => [...prev, currentTrack]);
    }
    resetTimestampWarningOnceState();
    setCurrentTrack(track);
    setCurrentTime(track.timestamp);
    addToAllTracks(track);
  };

  const previous = () => {
    const action = resolvePreviousPlayback({
      currentTrack,
      currentTime,
      playHistory,
    });

    if (action.type === 'restart') {
      seekTo(action.track.timestamp);
    } else if (action.type === 'history') {
      setPlayHistory((prev) => prev.slice(0, -1));
      resetTimestampWarningOnceState();
      setCurrentTrack(action.track);
      setCurrentTime(action.track.timestamp);
    }
  };

  const next = () => {
    // User pressed next — always advance (ignore repeat-one)
    if (queue.length > 0 || repeatMode === 'all') {
      advanceSkippingDeleted(queue, currentTrack);
    } else {
      // No queue, stop playback
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isPlayerReady,
        playerError,
        apiLoadError,
        unavailableVideoIds,
        timestampWarning,
        clearTimestampWarning,
        skipNotification,
        clearSkipNotification,
        currentTime,
        duration,
        trackCurrentTime,
        trackDuration,
        playTrack,
        togglePlayPause,
        seekTo,
        previous,
        next,
        showModal,
        setShowModal,
        queue,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        showQueue,
        setShowQueue,
        repeatMode,
        shuffleOn,
        toggleRepeat,
        toggleShuffle,
        volume,
        isMuted,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
