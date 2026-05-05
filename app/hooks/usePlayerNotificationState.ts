'use client';

import { useCallback, useState } from 'react';
import { usePlayerTimestampWarning } from './usePlayerTimestampWarning';
import type { Track } from '../types/player';

interface UsePlayerNotificationStateResult {
  timestampWarning: string | null;
  clearTimestampWarning: () => void;
  showTimestampWarningOnce: (track: Track) => void;
  resetTimestampWarningOnceState: () => void;
  skipNotification: string | null;
  clearSkipNotification: () => void;
  showSkipNotification: (message: string) => void;
}

export function usePlayerNotificationState(): UsePlayerNotificationStateResult {
  const [timestampWarning, setTimestampWarning] = useState<string | null>(null);
  const [skipNotification, setSkipNotification] = useState<string | null>(null);
  const {
    showTimestampWarningOnce,
    resetTimestampWarningOnceState,
  } = usePlayerTimestampWarning(setTimestampWarning);

  const clearTimestampWarning = useCallback(() => {
    setTimestampWarning(null);
  }, []);

  const clearSkipNotification = useCallback(() => {
    setSkipNotification(null);
  }, []);

  const showSkipNotification = useCallback((message: string) => {
    setSkipNotification(message);
  }, []);

  return {
    timestampWarning,
    clearTimestampWarning,
    showTimestampWarningOnce,
    resetTimestampWarningOnceState,
    skipNotification,
    clearSkipNotification,
    showSkipNotification,
  };
}
