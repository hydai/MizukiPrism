'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { loadPlayerPreferences, savePlayerMuted, savePlayerVolume } from '../lib/playerPreferences';
import {
  applyPlayerMutedState,
  applyPlayerVolume,
  clampPlayerVolume,
  getNextMutedState,
  shouldAutoUnmute,
  type PlayerAudioControls,
} from '../lib/playerVolume';

interface UsePlayerAudioSettingsResult {
  volume: number;
  isMuted: boolean;
  volumeRef: MutableRefObject<number>;
  isMutedRef: MutableRefObject<boolean>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export function usePlayerAudioSettings(
  playerRef: MutableRefObject<PlayerAudioControls | null>,
): UsePlayerAudioSettingsResult {
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const volumeRef = useRef(75);
  const isMutedRef = useRef(false);

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

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = clampPlayerVolume(nextVolume);
    setVolumeState(clamped);
    volumeRef.current = clamped;
    applyPlayerVolume(playerRef.current, clamped);

    if (shouldAutoUnmute(clamped, isMutedRef.current)) {
      setIsMuted(false);
      isMutedRef.current = false;
      applyPlayerMutedState(playerRef.current, false);
      savePlayerMuted(false);
    }

    savePlayerVolume(clamped);
  }, [playerRef]);

  const toggleMute = useCallback(() => {
    const nextMuted = getNextMutedState(isMutedRef.current);
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    applyPlayerMutedState(playerRef.current, nextMuted);
    savePlayerMuted(nextMuted);
  }, [playerRef]);

  return {
    volume,
    isMuted,
    volumeRef,
    isMutedRef,
    setVolume,
    toggleMute,
  };
}
