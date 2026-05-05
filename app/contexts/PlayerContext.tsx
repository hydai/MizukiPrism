'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { usePlayerAudioSettings } from '../hooks/usePlayerAudioSettings';
import { usePlayerErrorState } from '../hooks/usePlayerErrorState';
import { usePlayerNavigationControls } from '../hooks/usePlayerNavigationControls';
import { usePlayerNotificationState } from '../hooks/usePlayerNotificationState';
import { usePlayerPlaybackEnd } from '../hooks/usePlayerPlaybackEnd';
import { usePlayerPlaybackModes } from '../hooks/usePlayerPlaybackModes';
import { usePlayerPlaybackState } from '../hooks/usePlayerPlaybackState';
import { usePlayerQueueAdvance } from '../hooks/usePlayerQueueAdvance';
import { usePlayerQueueState } from '../hooks/usePlayerQueueState';
import { usePlayerRuntimeRefs } from '../hooks/usePlayerRuntimeRefs';
import { usePlayerTimePolling } from '../hooks/usePlayerTimePolling';
import { usePlayerTrackSelection } from '../hooks/usePlayerTrackSelection';
import { usePlayerTransportControls } from '../hooks/usePlayerTransportControls';
import { usePlayerYouTubeLifecycle } from '../hooks/usePlayerYouTubeLifecycle';
import { useYouTubeIframeApi } from '../hooks/useYouTubeIframeApi';
import {
  getTrackCurrentTime,
  getTrackDuration,
} from '../lib/playerTime';
import type { RepeatMode, Track } from '../types/player';

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
  const [showModal, setShowModal] = useState(false);
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
  } = usePlayerPlaybackState();
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
  const {
    timestampWarning,
    clearTimestampWarning,
    showTimestampWarningOnce,
    resetTimestampWarningOnceState,
    skipNotification,
    clearSkipNotification,
    showSkipNotification,
  } = usePlayerNotificationState();
  const {
    currentTrack,
    setCurrentTrack,
    playHistory,
    setPlayHistory,
    playTrack,
  } = usePlayerTrackSelection({
    setCurrentTime,
    resetTimestampWarningOnceState,
    addToAllTracks,
  });

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
  const { advanceSkippingDeleted } = usePlayerQueueAdvance({
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
  });
  const { handlePlaybackEnd } = usePlayerPlaybackEnd({
    playerRef,
    queueRef,
    currentTrackRef,
    repeatModeRef,
    advanceSkippingDeleted,
    showTimestampWarningOnce,
    setIsPlaying,
  });

  const { startTimeUpdateInterval, stopTimeUpdateInterval } = usePlayerTimePolling({
    playerRef,
    currentTrackRef,
    setCurrentTime,
    handleTrackEnd: handlePlaybackEnd,
  });

  usePlayerYouTubeLifecycle({
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
  });

  const { previous, next } = usePlayerNavigationControls({
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
  });

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
