'use client';

import { useCallback, useRef } from 'react';
import { TIMESTAMP_WARNING_MESSAGE } from '../lib/playerTime';
import { clearTrackWarningState, markTrackWarningShown } from '../lib/playerWarnings';
import type { Track } from '../types/player';

interface UsePlayerTimestampWarningResult {
  showTimestampWarningOnce: (track: Track) => void;
  resetTimestampWarningOnceState: () => void;
}

export function usePlayerTimestampWarning(
  setTimestampWarning: (message: string | null) => void,
): UsePlayerTimestampWarningResult {
  const timestampWarningTrackIdsRef = useRef<Set<string>>(new Set());

  const showTimestampWarningOnce = useCallback((track: Track) => {
    if (!markTrackWarningShown(timestampWarningTrackIdsRef.current, track.id)) return;
    setTimestampWarning(TIMESTAMP_WARNING_MESSAGE);
  }, [setTimestampWarning]);

  const resetTimestampWarningOnceState = useCallback(() => {
    clearTrackWarningState(timestampWarningTrackIdsRef.current);
  }, []);

  return {
    showTimestampWarningOnce,
    resetTimestampWarningOnceState,
  };
}
