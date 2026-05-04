'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  addUniqueTrackById,
  getNextRepeatMode,
  moveTrack,
  removeTrackAtIndex,
  resolvePreviousPlayback,
} from '../lib/playerControls';
import {
  addUnavailableVideoId,
  PLAYER_API_LOAD_ERROR_MESSAGE,
  resolvePlayerError,
} from '../lib/playerErrors';
import { loadPlayerPreferences, savePlayerMuted, savePlayerVolume } from '../lib/playerPreferences';
import { advancePlayerQueue } from '../lib/playerQueue';
import {
  getTrackCurrentTime,
  getTrackDuration,
  resolveTrackStartPosition,
  TIMESTAMP_WARNING_MESSAGE,
} from '../lib/playerTime';
import { clampPlayerVolume, getNextMutedState, shouldAutoUnmute } from '../lib/playerVolume';
import type { RepeatMode, Track } from '../types/player';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPlayerReady: boolean;
  playerError: string | null;
  apiLoadError: string | null;
  unavailableVideoIds: Set<string>;
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

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);
  const [unavailableVideoIds, setUnavailableVideoIds] = useState<Set<string>>(new Set());
  const [timestampWarning, setTimestampWarning] = useState<string | null>(null);
  const [skipNotification, setSkipNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleOn, setShuffleOn] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  // Derived track-relative time values (never fall back to full VOD duration)
  const trackCurrentTime = getTrackCurrentTime(currentTrack, currentTime);
  const trackDuration = getTrackDuration(currentTrack);

  const playerRef = useRef<any>(null);
  const playerDivId = 'youtube-player';
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadedVideoIdRef = useRef<string | null>(null);
  const apiLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Refs to always have fresh values in async callbacks
  const queueRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const repeatModeRef = useRef<RepeatMode>('off');
  const shuffleOnRef = useRef(false);
  const allTracksRef = useRef<Track[]>([]);
  const volumeRef = useRef(75);
  const isMutedRef = useRef(false);

  const clearTimestampWarning = () => setTimestampWarning(null);
  const clearSkipNotification = () => setSkipNotification(null);

  // Keep refs in sync with state
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { shuffleOnRef.current = shuffleOn; }, [shuffleOn]);
  useEffect(() => { allTracksRef.current = allTracks; }, [allTracks]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Load volume/mute from localStorage on mount (SSR-safe)
  useEffect(() => {
    const preferences = loadPlayerPreferences();
    if (preferences.volume != null) {
      setVolumeState(preferences.volume);
      volumeRef.current = preferences.volume;
    }
    if (preferences.isMuted != null) {
      setIsMuted(preferences.isMuted);
      isMutedRef.current = preferences.isMuted;
    }
  }, []);

  const setVolume = (n: number) => {
    const clamped = clampPlayerVolume(n);
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(clamped);
    }
    // Auto-unmute when dragging above 0 while muted
    if (shouldAutoUnmute(clamped, isMutedRef.current)) {
      setIsMuted(false);
      isMutedRef.current = false;
      if (playerRef.current && playerRef.current.unMute) {
        playerRef.current.unMute();
      }
      savePlayerMuted(false);
    }
    savePlayerVolume(clamped);
  };

  const toggleMute = () => {
    const newMuted = getNextMutedState(isMutedRef.current);
    setIsMuted(newMuted);
    isMutedRef.current = newMuted;
    if (playerRef.current) {
      if (newMuted) {
        playerRef.current.mute?.();
      } else {
        playerRef.current.unMute?.();
      }
    }
    savePlayerMuted(newMuted);
  };

  // Advance to the next playable track, refilling from all tracks in repeat-all mode when needed.
  // Returns true when a track is selected and set as current; false when no playable track remains.
  const advanceSkippingDeleted = (currentQ: Track[], fromTrack: Track | null): boolean => {
    const result = advancePlayerQueue({
      queue: currentQ,
      fromTrack,
      repeatMode: repeatModeRef.current,
      shuffleOn: shuffleOnRef.current,
      allTracks: allTracksRef.current,
    });

    if (!result.nextTrack) {
      if (result.skippedDeleted) {
        setSkipNotification('播放完畢');
      }
      setQueue([]);
      setIsPlaying(false);
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
      return false;
    }

    setQueue(result.queue);

    if (fromTrack) {
      setPlayHistory(prev => [...prev, fromTrack]);
    }
    if (result.skippedDeleted) {
      setSkipNotification('已跳過無法播放的版本');
    }
    setCurrentTrack(result.nextTrack);
    setCurrentTime(result.nextTrack.timestamp);
    return true;
  };

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setIsPlayerReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set timeout for API load failure (10 seconds)
    apiLoadTimeoutRef.current = setTimeout(() => {
      if (!window.YT || !window.YT.Player) {
        setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
      }
    }, 10000);

    window.onYouTubeIframeAPIReady = () => {
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
        apiLoadTimeoutRef.current = null;
      }
      setIsPlayerReady(true);
    };

    // Handle script load error
    tag.onerror = () => {
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
        apiLoadTimeoutRef.current = null;
      }
      setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
    };

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
      }
    };
  }, []);

  // Start (or restart) the time-update polling interval.
  // Uses refs so the callback always sees fresh track/queue state.
  const startTimeUpdateInterval = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    timeUpdateIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);

        const track = currentTrackRef.current;
        // Check if reached end timestamp
        if (track?.endTimestamp && current >= track.endTimestamp) {
          // Repeat-one: loop back to start of current track
          if (repeatModeRef.current === 'one') {
            playerRef.current.seekTo(track.timestamp, true);
            return;
          }
          // Auto-play next song in queue if available, skipping deleted versions
          const freshQueue = queueRef.current;
          if (freshQueue.length > 0 || repeatModeRef.current === 'all') {
            advanceSkippingDeleted(freshQueue, currentTrackRef.current);
          } else {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            if (timeUpdateIntervalRef.current) {
              clearInterval(timeUpdateIntervalRef.current);
            }
          }
        }
      }
    }, 500);
  };

  // Initialize YouTube player when ready and track is available.
  // Reuses the existing player instance to preserve autoplay permission.
  useEffect(() => {
    if (!isPlayerReady || !currentTrack) return;

    // Clear previous errors when starting new track
    setPlayerError(null);

    const player = playerRef.current;

    // --- Reuse existing player ---
    if (player && loadedVideoIdRef.current) {
      if (currentTrack.videoId === loadedVideoIdRef.current) {
        // Same VOD — just seek to the new timestamp
        const videoDuration = player.getDuration?.() || 0;
        const startPosition = resolveTrackStartPosition(currentTrack, videoDuration);
        player.seekTo(startPosition.startSeconds, true);
        if (startPosition.timestampOutOfBounds) {
          setTimestampWarning(TIMESTAMP_WARNING_MESSAGE);
        }
        player.setVolume(volumeRef.current);
        if (isMutedRef.current) { player.mute(); } else { player.unMute(); }
        player.playVideo();
        setIsPlaying(true);
        startTimeUpdateInterval();
        return;
      } else {
        // Different VOD — load new video without destroying the iframe
        loadedVideoIdRef.current = currentTrack.videoId;
        player.loadVideoById({
          videoId: currentTrack.videoId,
          startSeconds: currentTrack.timestamp,
        });
        player.setVolume(volumeRef.current);
        if (isMutedRef.current) { player.mute(); } else { player.unMute(); }
        setIsPlaying(true);
        startTimeUpdateInterval();
        return;
      }
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
        onReady: (event: any) => {
          const videoDuration = event.target.getDuration();
          setDuration(videoDuration);

          // Check if timestamp exceeds video length
          const startPosition = resolveTrackStartPosition(currentTrack, videoDuration);
          event.target.seekTo(startPosition.startSeconds, true);
          if (startPosition.timestampOutOfBounds) {
            setTimestampWarning(TIMESTAMP_WARNING_MESSAGE);
          }

          // Apply saved volume/mute settings to newly created player
          event.target.setVolume(volumeRef.current);
          if (isMutedRef.current) {
            event.target.mute();
          } else {
            event.target.unMute();
          }

          event.target.playVideo();
          setIsPlaying(true);
          startTimeUpdateInterval();
        },
        onStateChange: (event: any) => {
          // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
          if (event.data === 1) {
            setIsPlaying(true);
            // Update duration (needed after loadVideoById since onReady doesn't re-fire)
            const d = event.target.getDuration?.();
            if (d > 0) setDuration(d);
          } else if (event.data === 2) {
            setIsPlaying(false);
          } else if (event.data === 0) {
            // Video ended — repeat-one: seek back and replay
            if (repeatModeRef.current === 'one' && currentTrackRef.current) {
              playerRef.current.seekTo(currentTrackRef.current.timestamp, true);
              playerRef.current.playVideo();
              return;
            }
            // Auto-play next in queue, skipping deleted versions
            const freshQueue = queueRef.current;
            if (freshQueue.length > 0 || repeatModeRef.current === 'all') {
              advanceSkippingDeleted(freshQueue, currentTrackRef.current);
            } else {
              setIsPlaying(false);
            }
          }
        },
        onError: (event: any) => {
          const resolvedError = resolvePlayerError(event.data, loadedVideoIdRef.current);
          if (resolvedError) {
            setPlayerError(resolvedError.message);
            setUnavailableVideoIds(prev => addUnavailableVideoId(prev, resolvedError.unavailableVideoId));
          }
        },
      },
    });
  }, [isPlayerReady, currentTrack]);

  const toggleRepeat = () => {
    setRepeatMode(getNextRepeatMode);
  };

  const toggleShuffle = () => {
    setShuffleOn(prev => !prev);
  };

  const addToAllTracks = (track: Track) => {
    setAllTracks(prev => addUniqueTrackById(prev, track));
  };

  const playTrack = (track: Track) => {
    // Add current track to history before switching
    if (currentTrack && currentTrack.id !== track.id) {
      setPlayHistory((prev) => [...prev, currentTrack]);
    }
    setCurrentTrack(track);
    setCurrentTime(track.timestamp);
    addToAllTracks(track);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(seconds, true);
    setCurrentTime(seconds);
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

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    addToAllTracks(track);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => removeTrackAtIndex(prev, index));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => moveTrack(prev, fromIndex, toIndex));
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
