'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../types/player';
import type { CatalogMobileTab, CatalogViewMode } from '../hooks/useCatalogViewState';
import type { CatalogSong, CatalogStream, FlattenedSong } from '../lib/catalogData';
import CatalogHomeContent, { type StreamerSocialLinks } from './CatalogHomeContent';
import CatalogMobileTabs from './CatalogMobileTabs';

interface CatalogMainContentProps {
  mobileTab: CatalogMobileTab;
  streamerName: string;
  streamerDescription: string;
  streamerAvatarUrl: string;
  streamerSocialLinks: StreamerSocialLinks;
  loadError: boolean;
  shuffleOn: boolean;
  viewMode: CatalogViewMode;
  searchInput: string;
  selectedArtist: string | null;
  allArtists: readonly string[];
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  filteredStreams: readonly CatalogStream[];
  flattenedSongs: readonly FlattenedSong[];
  groupedSongs: readonly CatalogSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  timelineListRef: RefObject<HTMLDivElement | null>;
  groupedListRef: RefObject<HTMLDivElement | null>;
  mobileSearchListRef: RefObject<HTMLDivElement | null>;
  timelineVirtualizer: Virtualizer<HTMLDivElement, Element>;
  groupedVirtualizer: Virtualizer<HTMLDivElement, Element>;
  mobileSearchVirtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  likedCount: number;
  recentCount: number;
  playlistCount: number;
  isSongExpanded: (songId: string) => boolean;
  onPlayAll: () => void;
  onToggleShuffle: () => void;
  onViewModeChange: (mode: CatalogViewMode) => void;
  onSearchInputChange: (value: string) => void;
  onSelectedArtistChange: (artist: string | null) => void;
  onClearYears: () => void;
  onToggleYear: (year: number) => void;
  onRetry: () => void;
  onToggleExpand: (songId: string) => void;
  onClearFilters: () => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
  onOpenLikedSongs: () => void;
  onOpenRecentlyPlayed: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenPlaylists: () => void;
  onShowAllStreams: () => void;
  onShowStream: (streamId: string) => void;
}

export default function CatalogMainContent({
  mobileTab,
  streamerName,
  streamerDescription,
  streamerAvatarUrl,
  streamerSocialLinks,
  loadError,
  shuffleOn,
  viewMode,
  searchInput,
  selectedArtist,
  allArtists,
  availableYears,
  selectedYears,
  filteredStreams,
  flattenedSongs,
  groupedSongs,
  allCatalogSongCount,
  hasActiveFilters,
  timelineListRef,
  groupedListRef,
  mobileSearchListRef,
  timelineVirtualizer,
  groupedVirtualizer,
  mobileSearchVirtualizer,
  currentTrackId,
  unavailableVideoIds,
  likedCount,
  recentCount,
  playlistCount,
  isSongExpanded,
  onPlayAll,
  onToggleShuffle,
  onViewModeChange,
  onSearchInputChange,
  onSelectedArtistChange,
  onClearYears,
  onToggleYear,
  onRetry,
  onToggleExpand,
  onClearFilters,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
  onOpenLikedSongs,
  onOpenRecentlyPlayed,
  onOpenCreatePlaylist,
  onOpenPlaylists,
  onShowAllStreams,
  onShowStream,
}: CatalogMainContentProps) {
  return (
    <>
      <CatalogHomeContent
        isMobileHomeActive={mobileTab === 'home'}
        streamerName={streamerName}
        streamerDescription={streamerDescription}
        streamerAvatarUrl={streamerAvatarUrl}
        streamerSocialLinks={streamerSocialLinks}
        loadError={loadError}
        shuffleOn={shuffleOn}
        viewMode={viewMode}
        availableYears={availableYears}
        selectedYears={selectedYears}
        flattenedSongs={flattenedSongs}
        groupedSongs={groupedSongs}
        allCatalogSongCount={allCatalogSongCount}
        hasActiveFilters={hasActiveFilters}
        timelineListRef={timelineListRef}
        groupedListRef={groupedListRef}
        timelineVirtualizer={timelineVirtualizer}
        groupedVirtualizer={groupedVirtualizer}
        currentTrackId={currentTrackId}
        unavailableVideoIds={unavailableVideoIds}
        isSongExpanded={isSongExpanded}
        onPlayAll={onPlayAll}
        onToggleShuffle={onToggleShuffle}
        onViewModeChange={onViewModeChange}
        onClearYears={onClearYears}
        onToggleYear={onToggleYear}
        onRetry={onRetry}
        onToggleExpand={onToggleExpand}
        onClearFilters={onClearFilters}
        onPlay={onPlay}
        onAddToQueue={onAddToQueue}
        onAddToPlaylistSuccess={onAddToPlaylistSuccess}
      />

      {mobileTab !== 'home' && (
        <CatalogMobileTabs
          activeTab={mobileTab}
          searchInput={searchInput}
          selectedArtist={selectedArtist}
          allArtists={allArtists}
          flattenedSongs={flattenedSongs}
          searchListRef={mobileSearchListRef}
          searchVirtualizer={mobileSearchVirtualizer}
          currentTrackId={currentTrackId}
          unavailableVideoIds={unavailableVideoIds}
          likedCount={likedCount}
          recentCount={recentCount}
          playlistCount={playlistCount}
          availableYears={availableYears}
          selectedYears={selectedYears}
          filteredStreams={filteredStreams}
          onSearchInputChange={onSearchInputChange}
          onSelectedArtistChange={onSelectedArtistChange}
          onPlay={onPlay}
          onOpenLikedSongs={onOpenLikedSongs}
          onOpenRecentlyPlayed={onOpenRecentlyPlayed}
          onOpenCreatePlaylist={onOpenCreatePlaylist}
          onOpenPlaylists={onOpenPlaylists}
          onToggleYear={onToggleYear}
          onClearYears={onClearYears}
          onShowAllStreams={onShowAllStreams}
          onShowStream={onShowStream}
        />
      )}
    </>
  );
}
