'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogMobileTab } from '../hooks/useCatalogViewState';
import type { CatalogStream, FlattenedSong } from '../lib/catalogData';
import MobileLibraryTab from './MobileLibraryTab';
import MobileSearchTab from './MobileSearchTab';
import MobileStreamsTab from './MobileStreamsTab';

interface CatalogMobileTabsProps {
  activeTab: CatalogMobileTab;
  searchInput: string;
  selectedArtist: string | null;
  allArtists: readonly string[];
  flattenedSongs: readonly FlattenedSong[];
  searchListRef: RefObject<HTMLDivElement | null>;
  searchVirtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  likedCount: number;
  recentCount: number;
  playlistCount: number;
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  filteredStreams: readonly CatalogStream[];
  onSearchInputChange: (value: string) => void;
  onSelectedArtistChange: (artist: string | null) => void;
  onPlay: (track: Track) => void;
  onOpenLikedSongs: () => void;
  onOpenRecentlyPlayed: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenPlaylists: () => void;
  onToggleYear: (year: number) => void;
  onClearYears: () => void;
  onShowAllStreams: () => void;
  onShowStream: (streamId: string) => void;
}

export default function CatalogMobileTabs({
  activeTab,
  searchInput,
  selectedArtist,
  allArtists,
  flattenedSongs,
  searchListRef,
  searchVirtualizer,
  currentTrackId,
  unavailableVideoIds,
  likedCount,
  recentCount,
  playlistCount,
  availableYears,
  selectedYears,
  filteredStreams,
  onSearchInputChange,
  onSelectedArtistChange,
  onPlay,
  onOpenLikedSongs,
  onOpenRecentlyPlayed,
  onOpenCreatePlaylist,
  onOpenPlaylists,
  onToggleYear,
  onClearYears,
  onShowAllStreams,
  onShowStream,
}: CatalogMobileTabsProps) {
  return (
    <>
      {activeTab === 'search' && (
        <MobileSearchTab
          searchInput={searchInput}
          selectedArtist={selectedArtist}
          allArtists={allArtists}
          flattenedSongs={flattenedSongs}
          listRef={searchListRef}
          virtualizer={searchVirtualizer}
          currentTrackId={currentTrackId}
          unavailableVideoIds={unavailableVideoIds}
          onSearchInputChange={onSearchInputChange}
          onSelectedArtistChange={onSelectedArtistChange}
          onPlay={onPlay}
        />
      )}

      {activeTab === 'library' && (
        <MobileLibraryTab
          likedCount={likedCount}
          recentCount={recentCount}
          playlistCount={playlistCount}
          onOpenLikedSongs={onOpenLikedSongs}
          onOpenRecentlyPlayed={onOpenRecentlyPlayed}
          onOpenCreatePlaylist={onOpenCreatePlaylist}
          onOpenPlaylists={onOpenPlaylists}
        />
      )}

      {activeTab === 'streams' && (
        <MobileStreamsTab
          availableYears={availableYears}
          selectedYears={selectedYears}
          filteredStreams={filteredStreams}
          onToggleYear={onToggleYear}
          onClearYears={onClearYears}
          onShowAllStreams={onShowAllStreams}
          onShowStream={onShowStream}
        />
      )}
    </>
  );
}
