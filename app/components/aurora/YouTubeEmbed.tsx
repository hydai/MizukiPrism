'use client';

// YouTube IFrame embed for Aurora — ported from admin/ui/src/components/YouTubePlayer.tsx
// Checks window.YT?.Player before loading script to avoid conflicts with the main app's player.

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { loadYouTubeIframeApi } from '../../lib/youtubeIframeApi';

// Window.YT global type is declared in the shared YouTube API loader.

export interface YouTubeEmbedHandle {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
  loadVideo: (videoId: string) => void;
  togglePlay: () => void;
}

interface Props {
  videoId?: string;
  onReady?: () => void;
  onStateChange?: (isPlaying: boolean) => void;
}

export const YouTubeEmbed = forwardRef<YouTubeEmbedHandle, Props>(
  function YouTubeEmbed({ videoId, onReady, onStateChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const readyRef = useRef(false);
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;
    const onStateChangeRef = useRef(onStateChange);
    onStateChangeRef.current = onStateChange;

    const initPlayer = useCallback((vid: string) => {
      if (!containerRef.current) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        readyRef.current = false;
      }
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      const el = document.createElement('div');
      containerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        height: '100%',
        width: '100%',
        videoId: vid,
        playerVars: { autoplay: 0, rel: 0 },
        events: {
          onReady: () => {
            readyRef.current = true;
            onReadyRef.current?.();
          },
          onStateChange: (event: any) => {
            onStateChangeRef.current?.(event.data === 1);
          },
        },
      });
    }, []);

    useEffect(() => {
      if (!videoId) return;
      let isActive = true;

      void loadYouTubeIframeApi().then(() => {
        if (!isActive) return;
        if (playerRef.current && readyRef.current) {
          playerRef.current.loadVideoById(videoId);
        } else {
          initPlayer(videoId);
        }
      }).catch(() => undefined);

      return () => {
        isActive = false;
      };
    }, [videoId, initPlayer]);

    useEffect(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => {
        if (playerRef.current && readyRef.current) {
          return playerRef.current.getCurrentTime();
        }
        return 0;
      },
      seekTo: (seconds: number) => {
        if (playerRef.current && readyRef.current) {
          playerRef.current.seekTo(seconds, true);
        }
      },
      loadVideo: (vid: string) => {
        if (playerRef.current && readyRef.current) {
          playerRef.current.loadVideoById(vid);
        } else {
          void loadYouTubeIframeApi().then(() => initPlayer(vid)).catch(() => undefined);
        }
      },
      togglePlay: () => {
        if (!playerRef.current || !readyRef.current) return;
        const state = playerRef.current.getPlayerState();
        if (state === 1) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      },
    }));

    return (
      <div
        ref={containerRef}
        className="aspect-video w-full overflow-hidden rounded-lg bg-black"
      />
    );
  },
);
