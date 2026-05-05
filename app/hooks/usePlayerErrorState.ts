'use client';

import { useCallback, useState } from 'react';
import {
  addUnavailableVideoId,
  resolvePlayerError,
} from '../lib/playerErrors';

interface UsePlayerErrorStateResult {
  playerError: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  clearPlayerError: () => void;
  handlePlayerError: (errorCode: unknown, videoId: string | null) => void;
}

export function usePlayerErrorState(): UsePlayerErrorStateResult {
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [unavailableVideoIds, setUnavailableVideoIds] = useState<Set<string>>(() => new Set());

  const clearPlayerError = useCallback(() => {
    setPlayerError(null);
  }, []);

  const handlePlayerError = useCallback((errorCode: unknown, videoId: string | null) => {
    const resolvedError = resolvePlayerError(errorCode, videoId);
    if (!resolvedError) return;

    setPlayerError(resolvedError.message);
    setUnavailableVideoIds(prev => addUnavailableVideoId(prev, resolvedError.unavailableVideoId));
  }, []);

  return {
    playerError,
    unavailableVideoIds,
    clearPlayerError,
    handlePlayerError,
  };
}
