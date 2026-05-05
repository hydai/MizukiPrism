'use client';

import { useRef, type MutableRefObject } from 'react';
import { useSyncedRef } from './useSyncedRef';
import type { RepeatMode, Track } from '../types/player';
import type { YouTubePlayerInstance } from '../types/youtubePlayer';

interface UsePlayerRuntimeRefsOptions {
  queue: Track[];
  currentTrack: Track | null;
  repeatMode: RepeatMode;
  shuffleOn: boolean;
  allTracks: Track[];
}

interface UsePlayerRuntimeRefsResult {
  playerRef: MutableRefObject<YouTubePlayerInstance | null>;
  loadedVideoIdRef: MutableRefObject<string | null>;
  queueRef: MutableRefObject<Track[]>;
  currentTrackRef: MutableRefObject<Track | null>;
  repeatModeRef: MutableRefObject<RepeatMode>;
  shuffleOnRef: MutableRefObject<boolean>;
  allTracksRef: MutableRefObject<Track[]>;
}

export function usePlayerRuntimeRefs({
  queue,
  currentTrack,
  repeatMode,
  shuffleOn,
  allTracks,
}: UsePlayerRuntimeRefsOptions): UsePlayerRuntimeRefsResult {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const loadedVideoIdRef = useRef<string | null>(null);
  const queueRef = useRef<Track[]>(queue);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const shuffleOnRef = useRef(shuffleOn);
  const allTracksRef = useRef<Track[]>(allTracks);

  useSyncedRef(queueRef, queue);
  useSyncedRef(currentTrackRef, currentTrack);
  useSyncedRef(repeatModeRef, repeatMode);
  useSyncedRef(shuffleOnRef, shuffleOn);
  useSyncedRef(allTracksRef, allTracks);

  return {
    playerRef,
    loadedVideoIdRef,
    queueRef,
    currentTrackRef,
    repeatModeRef,
    shuffleOnRef,
    allTracksRef,
  };
}
