'use client';

import { usePlayerAudioSettings } from './usePlayerAudioSettings';
import { usePlayerErrorState } from './usePlayerErrorState';
import { usePlayerModalState } from './usePlayerModalState';
import { usePlayerNavigationControls } from './usePlayerNavigationControls';
import { usePlayerNotificationState } from './usePlayerNotificationState';
import { usePlayerPlaybackEnd } from './usePlayerPlaybackEnd';
import { usePlayerPlaybackModes } from './usePlayerPlaybackModes';
import { usePlayerPlaybackState } from './usePlayerPlaybackState';
import { usePlayerQueueAdvance } from './usePlayerQueueAdvance';
import { usePlayerQueueState } from './usePlayerQueueState';
import { usePlayerRuntimeRefs } from './usePlayerRuntimeRefs';
import { usePlayerTimePolling } from './usePlayerTimePolling';
import { usePlayerTrackSelection } from './usePlayerTrackSelection';
import { usePlayerTrackTime } from './usePlayerTrackTime';
import { usePlayerTransportControls } from './usePlayerTransportControls';
import { usePlayerYouTubeLifecycle } from './usePlayerYouTubeLifecycle';
import { useYouTubeIframeApi } from './useYouTubeIframeApi';
import type { PlayerContextType } from '../types/playerContext';

export function usePlayerProviderValue(): PlayerContextType {
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

  return {
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
  };
}
