'use client';

import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { CatalogStream } from '../lib/catalogData';
import SidebarNav from './SidebarNav';

interface CatalogSidebarProps {
  searchInput: string;
  selectedArtist: string | null;
  selectedStreamId: string | null;
  selectedYears: ReadonlySet<number>;
  allArtists: readonly string[];
  availableYears: readonly number[];
  filteredStreams: readonly CatalogStream[];
  hasActiveFilters: boolean;
  playlistCount: number;
  likedSongsCount: number;
  recentlyPlayedCount: number;
  onSearchInputChange: (value: string) => void;
  onSelectedArtistChange: (artist: string | null) => void;
  onClearAllFilters: () => void;
  onToggleYear: (year: number) => void;
  onClearStreamFilter: () => void;
  onToggleStreamFilter: (streamId: string) => void;
  onCreatePlaylist: () => void;
  onViewPlaylists: () => void;
  onViewLikedSongs: () => void;
  onViewRecentlyPlayed: () => void;
}

export default function CatalogSidebar({
  searchInput,
  selectedArtist,
  selectedStreamId,
  selectedYears,
  allArtists,
  availableYears,
  filteredStreams,
  hasActiveFilters,
  playlistCount,
  likedSongsCount,
  recentlyPlayedCount,
  onSearchInputChange,
  onSelectedArtistChange,
  onClearAllFilters,
  onToggleYear,
  onClearStreamFilter,
  onToggleStreamFilter,
  onCreatePlaylist,
  onViewPlaylists,
  onViewLikedSongs,
  onViewRecentlyPlayed,
}: CatalogSidebarProps) {
  return (
    <SidebarNav
      activePage="home"
      isHomeActive={!hasActiveFilters}
      onHomeClick={onClearAllFilters}
      onCreatePlaylist={onCreatePlaylist}
      onViewPlaylists={onViewPlaylists}
      playlistCount={playlistCount}
      onViewLikedSongs={onViewLikedSongs}
      likedSongsCount={likedSongsCount}
      onViewRecentlyPlayed={onViewRecentlyPlayed}
      recentlyPlayedCount={recentlyPlayedCount}
      searchSlot={
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className="w-4 h-4 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              />
            </div>
            <input
              type="text"
              placeholder="搜尋歌曲..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className="w-full font-medium py-2.5 pl-9 pr-4 outline-none transition-all text-base"
              style={{
                background: 'var(--bg-surface-glass)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      }
    >
      <div className="pt-2 pb-1">
        <div
          className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest flex items-center gap-2"
          style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          篩選條件
          {hasActiveFilters && (
            <button
              onClick={onClearAllFilters}
              className="ml-auto text-xs font-medium transition-colors"
              style={{ color: 'var(--accent-pink)', fontSize: 'var(--font-size-xs)' }}
              data-testid="clear-all-filters"
            >
              清除全部
            </button>
          )}
        </div>

        <div className="relative px-1 mb-2">
          <select
            value={selectedArtist ?? ''}
            onChange={(e) => onSelectedArtistChange(e.target.value || null)}
            className="w-full font-medium py-2 px-3 outline-none appearance-none text-sm cursor-pointer transition-all"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-secondary)',
            }}
            data-testid="artist-filter"
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

        <div className="flex flex-wrap gap-1.5 px-1" data-testid="year-filter-sidebar">
          {availableYears.map(year => (
            <button
              key={year}
              data-testid="year-filter-chip"
              onClick={() => onToggleYear(year)}
              className="font-medium text-sm transition-all"
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '4px 12px',
                ...(selectedYears.has(year)
                  ? { background: 'var(--bg-accent-pink)', color: 'var(--accent-pink)' }
                  : { background: 'var(--bg-surface-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }),
              }}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 pb-2">
        <div
          className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
        >
          歌枠回放{selectedYears.size > 0 && ` (${Array.from(selectedYears).sort().join(', ')})`}
        </div>
        <button
          onClick={onClearStreamFilter}
          className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all"
          style={
            selectedStreamId === null
              ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' }
              : { color: 'var(--text-secondary)', background: 'transparent' }
          }
        >
          全部歌曲
        </button>
        {filteredStreams.map(stream => (
          <button
            key={stream.id}
            data-testid="stream-filter-button"
            onClick={() => onToggleStreamFilter(stream.id)}
            className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all hover:bg-white/40"
            style={
              selectedStreamId === stream.id
                ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' }
                : { color: 'var(--text-secondary)', background: 'transparent' }
            }
          >
            <div className="truncate">{stream.title}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stream.date}</div>
          </button>
        ))}
      </div>
    </SidebarNav>
  );
}
