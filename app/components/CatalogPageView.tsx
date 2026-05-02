'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogMobileTab, CatalogViewMode } from '../hooks/useCatalogViewState';
import type { CatalogSong, CatalogStream, FlattenedSong } from '../lib/catalogData';
import type { StreamerSocialLinks } from './CatalogHomeContent';
import CatalogMainContent from './CatalogMainContent';
import CatalogPanels from './CatalogPanels';
import CatalogSidebar from './CatalogSidebar';
import CatalogShell from './CatalogShell';
import Toast from './Toast';

export interface CatalogPageViewProps {
  showToast: boolean;
  toastMessage: string;
  apiLoadError: string | null;
  streamerName: string;
  streamerDescription: string;
  streamerAvatarUrl: string;
  streamerSocialLinks: StreamerSocialLinks;
  mobileTab: CatalogMobileTab;
  searchInput: string;
  selectedArtist: string | null;
  selectedStreamId: string | null;
  selectedYears: ReadonlySet<number>;
  viewMode: CatalogViewMode;
  allArtists: readonly string[];
  availableYears: readonly number[];
  filteredStreams: readonly CatalogStream[];
  catalogSongs: CatalogSong[];
  flattenedSongs: readonly FlattenedSong[];
  groupedSongs: readonly CatalogSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  loadError: boolean;
  shuffleOn: boolean;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  playlistCount: number;
  likedCount: number;
  recentCount: number;
  showPlaylistPanel: boolean;
  showLikedSongsPanel: boolean;
  showRecentlyPlayedPanel: boolean;
  showCreateDialog: boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  timelineListRef: RefObject<HTMLDivElement | null>;
  groupedListRef: RefObject<HTMLDivElement | null>;
  mobileSearchListRef: RefObject<HTMLDivElement | null>;
  timelineVirtualizer: Virtualizer<HTMLDivElement, Element>;
  groupedVirtualizer: Virtualizer<HTMLDivElement, Element>;
  mobileSearchVirtualizer: Virtualizer<HTMLDivElement, Element>;
  isSongExpanded: (songId: string) => boolean;
  onHideToast: () => void;
  onMobileTabChange: (tab: CatalogMobileTab) => void;
  onSearchInputChange: (value: string) => void;
  onSelectedArtistChange: (artist: string | null) => void;
  onClearAllFilters: () => void;
  onToggleYear: (year: number) => void;
  onClearYears: () => void;
  onClearStreamFilter: () => void;
  onToggleStreamFilter: (streamId: string) => void;
  onCreatePlaylist: () => void;
  onViewPlaylists: () => void;
  onViewLikedSongs: () => void;
  onViewRecentlyPlayed: () => void;
  onPlayAll: () => void;
  onToggleShuffle: () => void;
  onViewModeChange: (mode: CatalogViewMode) => void;
  onRetry: () => void;
  onToggleExpand: (songId: string) => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
  onShowAllStreams: () => void;
  onShowStream: (streamId: string) => void;
  onClosePlaylistPanel: () => void;
  onCloseLikedSongsPanel: () => void;
  onCloseRecentlyPlayedPanel: () => void;
  onCloseCreateDialog: () => void;
  onToast: (message: string) => void;
}

export default function CatalogPageView({
  showToast,
  toastMessage,
  apiLoadError,
  streamerName,
  streamerDescription,
  streamerAvatarUrl,
  streamerSocialLinks,
  mobileTab,
  searchInput,
  selectedArtist,
  selectedStreamId,
  selectedYears,
  viewMode,
  allArtists,
  availableYears,
  filteredStreams,
  catalogSongs,
  flattenedSongs,
  groupedSongs,
  allCatalogSongCount,
  hasActiveFilters,
  loadError,
  shuffleOn,
  currentTrackId,
  unavailableVideoIds,
  playlistCount,
  likedCount,
  recentCount,
  showPlaylistPanel,
  showLikedSongsPanel,
  showRecentlyPlayedPanel,
  showCreateDialog,
  scrollContainerRef,
  timelineListRef,
  groupedListRef,
  mobileSearchListRef,
  timelineVirtualizer,
  groupedVirtualizer,
  mobileSearchVirtualizer,
  isSongExpanded,
  onHideToast,
  onMobileTabChange,
  onSearchInputChange,
  onSelectedArtistChange,
  onClearAllFilters,
  onToggleYear,
  onClearYears,
  onClearStreamFilter,
  onToggleStreamFilter,
  onCreatePlaylist,
  onViewPlaylists,
  onViewLikedSongs,
  onViewRecentlyPlayed,
  onPlayAll,
  onToggleShuffle,
  onViewModeChange,
  onRetry,
  onToggleExpand,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
  onShowAllStreams,
  onShowStream,
  onClosePlaylistPanel,
  onCloseLikedSongsPanel,
  onCloseRecentlyPlayedPanel,
  onCloseCreateDialog,
  onToast,
}: CatalogPageViewProps) {
  return (
    <>
      <Toast message={toastMessage} show={showToast} onHide={onHideToast} />
      <CatalogShell
        apiLoadError={apiLoadError}
        streamerName={streamerName}
        activeMobileTab={mobileTab}
        scrollContainerRef={scrollContainerRef}
        sidebar={
          <CatalogSidebar
            searchInput={searchInput}
            selectedArtist={selectedArtist}
            selectedStreamId={selectedStreamId}
            selectedYears={selectedYears}
            allArtists={allArtists}
            availableYears={availableYears}
            filteredStreams={filteredStreams}
            hasActiveFilters={hasActiveFilters}
            playlistCount={playlistCount}
            likedSongsCount={likedCount}
            recentlyPlayedCount={recentCount}
            onSearchInputChange={onSearchInputChange}
            onSelectedArtistChange={onSelectedArtistChange}
            onClearAllFilters={onClearAllFilters}
            onToggleYear={onToggleYear}
            onClearStreamFilter={onClearStreamFilter}
            onToggleStreamFilter={onToggleStreamFilter}
            onCreatePlaylist={onCreatePlaylist}
            onViewPlaylists={onViewPlaylists}
            onViewLikedSongs={onViewLikedSongs}
            onViewRecentlyPlayed={onViewRecentlyPlayed}
          />
        }
        onMobileTabChange={onMobileTabChange}
      >
        <CatalogMainContent
          mobileTab={mobileTab}
          streamerName={streamerName}
          streamerDescription={streamerDescription}
          streamerAvatarUrl={streamerAvatarUrl}
          streamerSocialLinks={streamerSocialLinks}
          loadError={loadError}
          shuffleOn={shuffleOn}
          viewMode={viewMode}
          searchInput={searchInput}
          selectedArtist={selectedArtist}
          allArtists={allArtists}
          availableYears={availableYears}
          selectedYears={selectedYears}
          filteredStreams={filteredStreams}
          flattenedSongs={flattenedSongs}
          groupedSongs={groupedSongs}
          allCatalogSongCount={allCatalogSongCount}
          hasActiveFilters={hasActiveFilters}
          timelineListRef={timelineListRef}
          groupedListRef={groupedListRef}
          mobileSearchListRef={mobileSearchListRef}
          timelineVirtualizer={timelineVirtualizer}
          groupedVirtualizer={groupedVirtualizer}
          mobileSearchVirtualizer={mobileSearchVirtualizer}
          currentTrackId={currentTrackId}
          unavailableVideoIds={unavailableVideoIds}
          likedCount={likedCount}
          recentCount={recentCount}
          playlistCount={playlistCount}
          isSongExpanded={isSongExpanded}
          onPlayAll={onPlayAll}
          onToggleShuffle={onToggleShuffle}
          onViewModeChange={onViewModeChange}
          onSearchInputChange={onSearchInputChange}
          onSelectedArtistChange={onSelectedArtistChange}
          onClearYears={onClearYears}
          onToggleYear={onToggleYear}
          onRetry={onRetry}
          onToggleExpand={onToggleExpand}
          onClearFilters={onClearAllFilters}
          onPlay={onPlay}
          onAddToQueue={onAddToQueue}
          onAddToPlaylistSuccess={onAddToPlaylistSuccess}
          onOpenLikedSongs={onViewLikedSongs}
          onOpenRecentlyPlayed={onViewRecentlyPlayed}
          onOpenCreatePlaylist={onCreatePlaylist}
          onOpenPlaylists={onViewPlaylists}
          onShowAllStreams={onShowAllStreams}
          onShowStream={onShowStream}
        />
      </CatalogShell>

      <CatalogPanels
        songs={catalogSongs}
        showPlaylistPanel={showPlaylistPanel}
        showLikedSongsPanel={showLikedSongsPanel}
        showRecentlyPlayedPanel={showRecentlyPlayedPanel}
        showCreateDialog={showCreateDialog}
        onClosePlaylistPanel={onClosePlaylistPanel}
        onCloseLikedSongsPanel={onCloseLikedSongsPanel}
        onCloseRecentlyPlayedPanel={onCloseRecentlyPlayedPanel}
        onCloseCreateDialog={onCloseCreateDialog}
        onToast={onToast}
      />
    </>
  );
}
