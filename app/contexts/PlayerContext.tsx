'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface Track {
  id: string;
  songId: string;
  title: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPlayerReady: boolean;
  playerError: string | null;
  apiLoadError: string | null;
  unavailableVideoIds: Set<string>;
  timestampWarning: string | null;
  clearTimestampWarning: () => void;
  currentTime: number;
  duration: number;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [showQueue, setShowQueue] = useState(false);

  const playerRef = useRef<any>(null);
  const playerDivId = 'youtube-player';
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimestampWarning = () => setTimestampWarning(null);

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
        setApiLoadError('播放器載入失敗，請重新整理頁面');
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
      setApiLoadError('播放器載入失敗，請重新整理頁面');
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

  // Initialize YouTube player when ready and track is available
  useEffect(() => {
    if (!isPlayerReady || !currentTrack) return;

    // Clear previous errors when starting new track
    setPlayerError(null);

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Create new player
    playerRef.current = new window.YT.Player(playerDivId, {
      height: '360',
      width: '640',
      videoId: currentTrack.videoId,
      playerVars: {
        start: currentTrack.timestamp,
        autoplay: 1,
        controls: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          const videoDuration = event.target.getDuration();
          setDuration(videoDuration);

          // Check if timestamp exceeds video length
          if (currentTrack.timestamp > 0 && videoDuration > 0 && currentTrack.timestamp >= videoDuration) {
            event.target.seekTo(0, true);
            setTimestampWarning('時間戳可能有誤');
          } else {
            event.target.seekTo(currentTrack.timestamp, true);
          }

          event.target.playVideo();
          setIsPlaying(true);

          // Start time update interval
          if (timeUpdateIntervalRef.current) {
            clearInterval(timeUpdateIntervalRef.current);
          }
          timeUpdateIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
              const current = playerRef.current.getCurrentTime();
              setCurrentTime(current);

              // Check if reached end timestamp
              if (currentTrack.endTimestamp && current >= currentTrack.endTimestamp) {
                // Auto-play next song in queue if available
                if (queue.length > 0) {
                  const nextTrack = queue[0];
                  setQueue(prev => prev.slice(1));
                  setPlayHistory(prev => [...prev, currentTrack]);
                  setCurrentTrack(nextTrack);
                  setCurrentTime(nextTrack.timestamp);
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
        },
        onStateChange: (event: any) => {
          // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
          if (event.data === 1) {
            setIsPlaying(true);
          } else if (event.data === 2) {
            setIsPlaying(false);
          } else if (event.data === 0) {
            // Video ended - auto-play next in queue
            if (queue.length > 0) {
              const nextTrack = queue[0];
              setQueue(prev => prev.slice(1));
              if (currentTrack) {
                setPlayHistory(prev => [...prev, currentTrack]);
              }
              setCurrentTrack(nextTrack);
              setCurrentTime(nextTrack.timestamp);
            } else {
              setIsPlaying(false);
            }
          }
        },
        onError: (event: any) => {
          // YouTube error codes:
          // 2: Invalid parameter
          // 5: HTML5 player error
          // 100: Video not found / removed
          // 101: Video not allowed in embedded players
          // 150: Same as 101 (owner restricted embedding)
          if ([100, 101, 150].includes(event.data)) {
            setPlayerError('此影片已無法播放');
            setUnavailableVideoIds(prev => new Set([...prev, currentTrack.videoId]));
            // Note: we intentionally do NOT set isPlaying=false here to avoid
            // breaking the playback state machine. The error is shown in the UI.
          }
        },
      },
    });
  }, [isPlayerReady, currentTrack]);

  const playTrack = (track: Track) => {
    // Add current track to history before switching
    if (currentTrack && currentTrack.id !== track.id) {
      setPlayHistory((prev) => [...prev, currentTrack]);
    }
    setCurrentTrack(track);
    setCurrentTime(track.timestamp);
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
    if (!currentTrack) return;

    const timePlayed = currentTime - currentTrack.timestamp;

    if (timePlayed > 3) {
      // Restart current song
      seekTo(currentTrack.timestamp);
    } else {
      // Go to previous song in history
      if (playHistory.length > 0) {
        const prevTrack = playHistory[playHistory.length - 1];
        setPlayHistory((prev) => prev.slice(0, -1));
        setCurrentTrack(prevTrack);
        setCurrentTime(prevTrack.timestamp);
      }
    }
  };

  const next = () => {
    // Play next song in queue if available
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      if (currentTrack) {
        setPlayHistory(prev => [...prev, currentTrack]);
      }
      setCurrentTrack(nextTrack);
      setCurrentTime(nextTrack.timestamp);
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
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });
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
        currentTime,
        duration,
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
