'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePlayerAudioSettings } from '../hooks/usePlayerAudioSettings';
import { usePlayerErrorState } from '../hooks/usePlayerErrorState';
import { usePlayerModalState } from '../hooks/usePlayerModalState';
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
import { usePlayerTrackTime } from '../hooks/usePlayerTrackTime';
import { usePlayerTransportControls } from '../hooks/usePlayerTransportControls';
import { usePlayerYouTubeLifecycle } from '../hooks/usePlayerYouTubeLifecycle';
import { useYouTubeIframeApi } from '../hooks/useYouTubeIframeApi';
import type { PlayerContextType } from '../types/playerContext';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { showModal, setShowModal } = usePlayerModalState();
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

  const { trackCurrentTime, trackDuration } = usePlayerTrackTime({
    currentTrack,
    currentTime,
  });

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
