'use client';

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { Track } from '../types/player';

interface UsePlayerTrackSelectionOptions {
  setCurrentTime: (time: number) => void;
  resetTimestampWarningOnceState: () => void;
  addToAllTracks: (track: Track) => void;
}

interface UsePlayerTrackSelectionResult {
  currentTrack: Track | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  playHistory: Track[];
  setPlayHistory: Dispatch<SetStateAction<Track[]>>;
  playTrack: (track: Track) => void;
}

export function usePlayerTrackSelection({
  setCurrentTime,
  resetTimestampWarningOnceState,
  addToAllTracks,
}: UsePlayerTrackSelectionOptions): UsePlayerTrackSelectionResult {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);

  const playTrack = useCallback((track: Track) => {
    if (currentTrack && currentTrack.id !== track.id) {
      setPlayHistory(prev => [...prev, currentTrack]);
    }
    resetTimestampWarningOnceState();
    setCurrentTrack(track);
    setCurrentTime(track.timestamp);
    addToAllTracks(track);
  }, [addToAllTracks, currentTrack, resetTimestampWarningOnceState, setCurrentTime]);

  return {
    currentTrack,
    setCurrentTrack,
    playHistory,
    setPlayHistory,
    playTrack,
  };
}
