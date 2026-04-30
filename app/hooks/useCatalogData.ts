'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildAlbumArtMap,
  mergeAlbumArtIntoSongs,
  sortStreamsByDateDesc,
  type CatalogMetadataResponse,
  type CatalogSong,
  type CatalogStream,
} from '../lib/catalogData';

export type {
  CatalogPerformance,
  CatalogSong,
  CatalogStream,
  FlattenedSong,
} from '../lib/catalogData';

const EMPTY_METADATA_RESPONSE: CatalogMetadataResponse = { songMetadata: [] };

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useCatalogData() {
  const [streams, setStreams] = useState<CatalogStream[]>([]);
  const [songs, setSongs] = useState<CatalogSong[]>([]);
  const [loadError, setLoadError] = useState(false);
  const albumArtMapRef = useRef<Map<string, string>>(new Map());
  const mountedRef = useRef(true);

  const canCommit = useCallback((signal?: AbortSignal) => {
    return mountedRef.current && !signal?.aborted;
  }, []);

  const fetchSongs = useCallback((signal?: AbortSignal) => {
    fetch('/api/songs', { signal })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data: CatalogSong[]) => {
        if (!canCommit(signal)) return;
        setSongs(mergeAlbumArtIntoSongs(data, albumArtMapRef.current));
        setLoadError(false);
      })
      .catch((error: unknown) => {
        if (!canCommit(signal) || isAbortError(error)) return;
        setLoadError(true);
      });
  }, [canCommit]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch('/api/metadata', { signal })
      .then((res) => (res.ok ? res.json() : EMPTY_METADATA_RESPONSE))
      .then((data: CatalogMetadataResponse) => {
        if (!canCommit(signal)) return;
        albumArtMapRef.current = buildAlbumArtMap(data.songMetadata);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        // metadata fetch failed - continue without art
      })
      .finally(() => {
        if (!signal.aborted) {
          fetchSongs(signal);
        }
      });

    fetch('/api/streams', { signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CatalogStream[]) => {
        if (!canCommit(signal)) return;
        setStreams(sortStreamsByDateDesc(data));
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        // streams fetch failed - continue without stream list
      });

    return () => {
      controller.abort();
    };
  }, [canCommit, fetchSongs]);

  return {
    streams,
    songs,
    loadError,
    fetchSongs,
  };
}
