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
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  previous: () => void;
  next: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);

  const playerRef = useRef<any>(null);
  const playerDivId = 'youtube-player';
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    window.onYouTubeIframeAPIReady = () => {
      setIsPlayerReady(true);
    };

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Initialize YouTube player when ready and track is available
  useEffect(() => {
    if (!isPlayerReady || !currentTrack) return;

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
          event.target.seekTo(currentTrack.timestamp, true);
          event.target.playVideo();
          setIsPlaying(true);
          setDuration(event.target.getDuration());

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
                playerRef.current.pauseVideo();
                setIsPlaying(false);
                if (timeUpdateIntervalRef.current) {
                  clearInterval(timeUpdateIntervalRef.current);
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
            // Video ended
            setIsPlaying(false);
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
    // For now, just stop playback since we don't have queue yet
    // This will be extended when queue is implemented
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isPlayerReady,
        currentTime,
        duration,
        playTrack,
        togglePlayPause,
        seekTo,
        previous,
        next,
        showModal,
        setShowModal,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
