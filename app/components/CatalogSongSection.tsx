'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogSong, FlattenedSong } from '../lib/catalogData';
import type { CatalogViewMode } from '../hooks/useCatalogViewState';
import GroupedSongList from './GroupedSongList';
import SongLoadErrorState from './SongLoadErrorState';
import TimelineSongList from './TimelineSongList';
import TimelineTableHeader from './TimelineTableHeader';

interface CatalogSongSectionProps {
  loadError: boolean;
  viewMode: CatalogViewMode;
  flattenedSongs: readonly FlattenedSong[];
  groupedSongs: readonly CatalogSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  timelineListRef: RefObject<HTMLDivElement | null>;
  groupedListRef: RefObject<HTMLDivElement | null>;
  timelineVirtualizer: Virtualizer<HTMLDivElement, Element>;
  groupedVirtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  isSongExpanded: (songId: string) => boolean;
  onRetry: () => void;
  onToggleExpand: (songId: string) => void;
  onClearFilters: () => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
}

export default function CatalogSongSection({
  loadError,
  viewMode,
  flattenedSongs,
  groupedSongs,
  allCatalogSongCount,
  hasActiveFilters,
  timelineListRef,
  groupedListRef,
  timelineVirtualizer,
  groupedVirtualizer,
  currentTrackId,
  unavailableVideoIds,
  isSongExpanded,
  onRetry,
  onToggleExpand,
  onClearFilters,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
}: CatalogSongSectionProps) {
  return (
    <div className="px-4 pb-32 mt-2">
      <span data-testid="total-performance-count" className="sr-only">{flattenedSongs.length}</span>
      <span data-testid="total-song-card-count" className="sr-only">{groupedSongs.length}</span>
      {loadError ? (
        <SongLoadErrorState onRetry={onRetry} />
      ) : viewMode === 'timeline' ? (
        <>
          <TimelineTableHeader />

          <TimelineSongList
            songs={flattenedSongs}
            allCatalogSongCount={allCatalogSongCount}
            hasActiveFilters={hasActiveFilters}
            listRef={timelineListRef}
            virtualizer={timelineVirtualizer}
            currentTrackId={currentTrackId}
            unavailableVideoIds={unavailableVideoIds}
            onClearFilters={onClearFilters}
            onPlay={onPlay}
            onAddToQueue={onAddToQueue}
            onAddToPlaylistSuccess={onAddToPlaylistSuccess}
          />
        </>
      ) : (
        <GroupedSongList
          songs={groupedSongs}
          allCatalogSongCount={allCatalogSongCount}
          hasActiveFilters={hasActiveFilters}
          listRef={groupedListRef}
          virtualizer={groupedVirtualizer}
          unavailableVideoIds={unavailableVideoIds}
          isSongExpanded={isSongExpanded}
          onToggleExpand={onToggleExpand}
          onClearFilters={onClearFilters}
          onPlay={onPlay}
          onAddToQueue={onAddToQueue}
          onAddToPlaylistSuccess={onAddToPlaylistSuccess}
        />
      )}
    </div>
  );
}
