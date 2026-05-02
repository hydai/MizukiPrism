'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../types/player';
import type { FlattenedSong } from '../lib/catalogData';
import SongEmptyState from './SongEmptyState';
import TimelineRow from './TimelineRow';

interface TimelineSongListProps {
  songs: readonly FlattenedSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  onClearFilters: () => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
}

export default function TimelineSongList({
  songs,
  allCatalogSongCount,
  hasActiveFilters,
  listRef,
  virtualizer,
  currentTrackId,
  unavailableVideoIds,
  onClearFilters,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
}: TimelineSongListProps) {
  return (
    <div className="mt-1">
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
                key={`${song.id}-${song.performanceId}`}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="hover:z-10 focus-within:z-10"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start - (virtualizer.options.scrollMargin ?? 0)}px)`,
                }}
              >
                <TimelineRow
                  song={song}
                  index={virtualItem.index}
                  isCurrentlyPlaying={currentTrackId === song.performanceId}
                  isUnavailable={unavailableVideoIds.has(song.videoId)}
                  onPlay={onPlay}
                  onAddToQueue={onAddToQueue}
                  onAddToPlaylistSuccess={onAddToPlaylistSuccess}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
