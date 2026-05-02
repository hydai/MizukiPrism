'use client';

import type { RefObject } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../types/player';
import type { FlattenedSong } from '../lib/catalogData';
import MobileSearchRow from './MobileSearchRow';

interface MobileSearchTabProps {
  searchInput: string;
  selectedArtist: string | null;
  allArtists: readonly string[];
  flattenedSongs: readonly FlattenedSong[];
  listRef: RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  onSearchInputChange: (value: string) => void;
  onSelectedArtistChange: (artist: string | null) => void;
  onPlay: (track: Track) => void;
}

export default function MobileSearchTab({
  searchInput,
  selectedArtist,
  allArtists,
  flattenedSongs,
  listRef,
  virtualizer,
  currentTrackId,
  unavailableVideoIds,
  onSearchInputChange,
  onSelectedArtistChange,
  onPlay,
}: MobileSearchTabProps) {
  return (
    <div
      className="lg:hidden flex-1 px-4 pt-4 pb-32"
      data-testid="mobile-search-tab"
    >
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--text-tertiary)' }}
        />
        <input
          type="text"
          placeholder="搜尋..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="w-full py-3 pl-10 pr-4 text-base outline-none"
          style={{
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(8px)',
          }}
          data-testid="mobile-search-input"
          autoFocus
        />
      </div>

      <div className="relative mb-3">
        <select
          value={selectedArtist ?? ''}
          onChange={(e) => onSelectedArtistChange(e.target.value || null)}
          className="w-full font-medium py-2 px-3 outline-none appearance-none text-sm cursor-pointer"
          style={{
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
          }}
          data-testid="mobile-artist-filter"
        >
          <option value="">全部歌手</option>
          {allArtists.map(artist => (
            <option key={artist} value={artist}>{artist}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>

      <div>
        {flattenedSongs.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
            <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>找不到符合條件的歌曲</p>
          </div>
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
              const song = flattenedSongs[virtualItem.index];
              return (
                <div
                  key={`search-${song.id}-${song.performanceId}`}
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
                  <MobileSearchRow
                    song={song}
                    isCurrentlyPlaying={currentTrackId === song.performanceId}
                    isUnavailable={unavailableVideoIds.has(song.videoId)}
                    onPlay={onPlay}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
