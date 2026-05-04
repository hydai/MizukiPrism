'use client';

import { useEffect, useRef, useState } from 'react';
import { PLAYER_API_LOAD_ERROR_MESSAGE } from '../lib/playerErrors';
import {
  isYouTubeIframeApiReady,
  loadYouTubeIframeApi,
  YOUTUBE_IFRAME_API_LOAD_TIMEOUT_MS,
} from '../lib/youtubeIframeApi';

export function useYouTubeIframeApi() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);
  const apiLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isActive = true;
    const clearApiLoadTimeout = (): void => {
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
        apiLoadTimeoutRef.current = null;
      }
    };

    apiLoadTimeoutRef.current = setTimeout(() => {
      if (isActive && !isYouTubeIframeApiReady()) {
        setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
      }
    }, YOUTUBE_IFRAME_API_LOAD_TIMEOUT_MS);

    loadYouTubeIframeApi()
      .then(() => {
        if (!isActive) return;
        clearApiLoadTimeout();
        setApiLoadError(null);
        setIsPlayerReady(true);
      })
      .catch(() => {
        if (!isActive) return;
        clearApiLoadTimeout();
        setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
      });

    return () => {
      isActive = false;
      clearApiLoadTimeout();
    };
  }, []);

  return {
    isPlayerReady,
    apiLoadError,
  };
}
