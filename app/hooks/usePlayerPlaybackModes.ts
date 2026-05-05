'use client';

import { useCallback, useState } from 'react';
import { getNextRepeatMode } from '../lib/playerControls';
import type { RepeatMode } from '../types/player';

interface UsePlayerPlaybackModesResult {
  repeatMode: RepeatMode;
  shuffleOn: boolean;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

export function usePlayerPlaybackModes(): UsePlayerPlaybackModesResult {
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleOn, setShuffleOn] = useState(false);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(getNextRepeatMode);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleOn(prev => !prev);
  }, []);

  return {
    repeatMode,
    shuffleOn,
    toggleRepeat,
    toggleShuffle,
  };
}
