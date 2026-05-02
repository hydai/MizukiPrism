'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogSong } from '../lib/catalogData';
import SongCard from './SongCard';
import SongEmptyState from './SongEmptyState';

interface GroupedSongListProps {
  songs: readonly CatalogSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  unavailableVideoIds: ReadonlySet<string>;
  isSongExpanded: (songId: string) => boolean;
  onToggleExpand: (songId: string) => void;
  onClearFilters: () => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
}

export default function GroupedSongList({
  songs,
  allCatalogSongCount,
  hasActiveFilters,
  listRef,
  virtualizer,
  unavailableVideoIds,
  isSongExpanded,
  onToggleExpand,
  onClearFilters,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
}: GroupedSongListProps) {
  return (
    <div className="mt-2">
      {songs.length === 0 ? (
        <SongEmptyState
          isCatalogEmpty={allCatalogSongCount === 0 && !hasActiveFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      ) : (
        <div
          ref={listRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualItem => {
            const song = songs[virtualItem.index];
            return (
              <div
                key={song.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="hover:z-10 focus-within:z-10"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start - (virtualizer.options.scrollMargin ?? 0)}px)`,
                  paddingBottom: '12px',
                }}
              >
                <SongCard
                  song={song}
                  isExpanded={isSongExpanded(song.id)}
                  onToggleExpand={onToggleExpand}
                  onPlay={onPlay}
                  onAddToQueue={onAddToQueue}
                  onAddToPlaylistSuccess={onAddToPlaylistSuccess}
                  unavailableVideoIds={unavailableVideoIds}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
