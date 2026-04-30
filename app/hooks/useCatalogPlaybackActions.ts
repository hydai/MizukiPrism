'use client';

import { useCallback } from 'react';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogSong, FlattenedSong } from '../lib/catalogData';
import {
  buildGroupedPlaybackTracks,
  buildTimelinePlaybackTracks,
  filterPlayableTracks,
} from '../lib/catalogPlayback';
import type { CatalogViewMode } from './useCatalogViewState';

interface UseCatalogPlaybackActionsOptions {
  viewMode: CatalogViewMode;
  flattenedSongs: readonly FlattenedSong[];
  groupedSongs: readonly CatalogSong[];
  unavailableVideoIds: ReadonlySet<string>;
  playTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  showToastMessage: (message: string) => void;
}

export function useCatalogPlaybackActions({
  viewMode,
  flattenedSongs,
  groupedSongs,
  unavailableVideoIds,
  playTrack,
  addToQueue,
  showToastMessage,
}: UseCatalogPlaybackActionsOptions) {
  const handleAddToQueue = useCallback((track: Track) => {
    addToQueue(track);
    showToastMessage('已加入播放佇列');
  }, [addToQueue, showToastMessage]);

  const handlePlayAll = useCallback(() => {
    const tracks = viewMode === 'timeline'
      ? buildTimelinePlaybackTracks(flattenedSongs)
      : buildGroupedPlaybackTracks(groupedSongs);
    const available = filterPlayableTracks(tracks, unavailableVideoIds);
    const firstTrack = available[0];
    if (!firstTrack) return;
    playTrack(firstTrack);
    available.slice(1).forEach((track) => addToQueue(track));
  }, [addToQueue, flattenedSongs, groupedSongs, playTrack, unavailableVideoIds, viewMode]);

  const handleAddToPlaylistSuccess = useCallback(() => {
    showToastMessage('已加入播放清單');
  }, [showToastMessage]);

  return {
    handleAddToQueue,
    handlePlayAll,
    handleAddToPlaylistSuccess,
  };
}
