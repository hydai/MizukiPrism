'use client';

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  addUniqueTrackById,
  moveTrack,
  removeTrackAtIndex,
} from '../lib/playerControls';
import type { Track } from '../types/player';

interface UsePlayerQueueStateResult {
  queue: Track[];
  setQueue: Dispatch<SetStateAction<Track[]>>;
  showQueue: boolean;
  setShowQueue: Dispatch<SetStateAction<boolean>>;
  allTracks: Track[];
  addToAllTracks: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

export function usePlayerQueueState(): UsePlayerQueueStateResult {
  const [queue, setQueue] = useState<Track[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  const addToAllTracks = useCallback((track: Track) => {
    setAllTracks(prev => addUniqueTrackById(prev, track));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
    addToAllTracks(track);
  }, [addToAllTracks]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => removeTrackAtIndex(prev, index));
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => moveTrack(prev, fromIndex, toIndex));
  }, []);

  return {
    queue,
    setQueue,
    showQueue,
    setShowQueue,
    allTracks,
    addToAllTracks,
    addToQueue,
    removeFromQueue,
    reorderQueue,
  };
}
