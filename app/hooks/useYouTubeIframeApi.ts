'use client';

import { useEffect, useRef, useState } from 'react';
import { PLAYER_API_LOAD_ERROR_MESSAGE } from '../lib/playerErrors';

const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';
const PLAYER_API_LOAD_TIMEOUT_MS = 10000;

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubeIframeApi() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);
  const apiLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isActive = true;
    const clearApiLoadTimeout = () => {
      if (apiLoadTimeoutRef.current) {
        clearTimeout(apiLoadTimeoutRef.current);
        apiLoadTimeoutRef.current = null;
      }
    };

    if (window.YT && window.YT.Player) {
      setIsPlayerReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = YOUTUBE_IFRAME_API_SRC;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    apiLoadTimeoutRef.current = setTimeout(() => {
      if (isActive && (!window.YT || !window.YT.Player)) {
        setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
      }
    }, PLAYER_API_LOAD_TIMEOUT_MS);

    window.onYouTubeIframeAPIReady = () => {
      if (!isActive) return;
      clearApiLoadTimeout();
      setIsPlayerReady(true);
    };

    tag.onerror = () => {
      if (!isActive) return;
      clearApiLoadTimeout();
      setApiLoadError(PLAYER_API_LOAD_ERROR_MESSAGE);
    };

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
