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

export function useCatalogData() {
  const [streams, setStreams] = useState<CatalogStream[]>([]);
  const [songs, setSongs] = useState<CatalogSong[]>([]);
  const [loadError, setLoadError] = useState(false);
  const albumArtMapRef = useRef<Map<string, string>>(new Map());

  const fetchSongs = useCallback(() => {
    fetch('/api/songs')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data: CatalogSong[]) => {
        setSongs(mergeAlbumArtIntoSongs(data, albumArtMapRef.current));
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    fetch('/api/metadata')
      .then((res) => (res.ok ? res.json() : EMPTY_METADATA_RESPONSE))
      .then((data: CatalogMetadataResponse) => {
        albumArtMapRef.current = buildAlbumArtMap(data.songMetadata);
      })
      .catch(() => {
        // metadata fetch failed - continue without art
      })
      .finally(() => {
        fetchSongs();
      });

    fetch('/api/streams')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CatalogStream[]) => {
        setStreams(sortStreamsByDateDesc(data));
      })
      .catch(() => {
        // streams fetch failed - continue without stream list
      });
  }, [fetchSongs]);

  return {
    streams,
    songs,
    loadError,
    fetchSongs,
  };
}
