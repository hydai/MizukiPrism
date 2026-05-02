'use client';

import streamerData from '@/data/streamer.json';
import { useCatalogData } from './hooks/useCatalogData';
import { useCatalogDerivedData } from './hooks/useCatalogDerivedData';
import { useCatalogPanelState } from './hooks/useCatalogPanelState';
import { useCatalogPlaybackActions } from './hooks/useCatalogPlaybackActions';
import { useCatalogSongExpansion } from './hooks/useCatalogSongExpansion';
import { useCatalogToastState } from './hooks/useCatalogToastState';
import { useCatalogVirtualizers } from './hooks/useCatalogVirtualizers';
import { useCatalogViewState } from './hooks/useCatalogViewState';
import { usePlayer } from './contexts/PlayerContext';
import { usePlaylist } from './contexts/PlaylistContext';
import { useLikedSongs } from './contexts/LikedSongsContext';
import { useRecentlyPlayed } from './contexts/RecentlyPlayedContext';
import CatalogPageView from './components/CatalogPageView';

export default function Home() {
  const {
    showPlaylistPanel,
    showLikedSongsPanel,
    showRecentlyPlayedPanel,
    showCreateDialog,
    openPlaylistPanel,
    closePlaylistPanel,
    openLikedSongsPanel,
    closeLikedSongsPanel,
    openRecentlyPlayedPanel,
    closeRecentlyPlayedPanel,
    openCreateDialog,
    closeCreateDialog,
  } = useCatalogPanelState();
  const {
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedStreamId,
    selectedArtist,
    setSelectedArtist,
    selectedYears,
    viewMode,
    setViewMode,
    mobileTab,
    setMobileTab,
    toggleYear,
    clearYears,
    clearAllFilters,
    toggleStreamFilter,
    clearStreamFilter,
    showAllStreamsOnHome,
    showStreamOnHome,
    hasActiveFilters,
  } = useCatalogViewState();
  const { streams, songs, loadError, fetchSongs } = useCatalogData();

  const { currentTrack, playTrack, addToQueue, apiLoadError, unavailableVideoIds, timestampWarning, clearTimestampWarning, skipNotification, clearSkipNotification, shuffleOn, toggleShuffle } = usePlayer();
  const currentTrackId = currentTrack?.id ?? null;
  const { playlists, storageError, clearStorageError } = usePlaylist();
  const { likedCount } = useLikedSongs();
  const { recentCount } = useRecentlyPlayed();
  const {
    showToast,
    toastMessage,
    showToastMessage,
    hideToast,
  } = useCatalogToastState({
    storageError,
    clearStorageError,
    timestampWarning,
    clearTimestampWarning,
    skipNotification,
    clearSkipNotification,
  });

  const {
    isSongExpanded,
    toggleSongExpansion,
  } = useCatalogSongExpansion();

  const {
    allArtists,
    availableYears,
    filteredStreams,
    flattenedSongs,
    groupedSongs,
  } = useCatalogDerivedData({
    streams,
    songs,
    searchTerm: debouncedSearch,
    selectedStreamId,
    selectedArtist,
    selectedYears,
  });
  const {
    handleAddToQueue,
    handlePlayAll,
    handleAddToPlaylistSuccess,
  } = useCatalogPlaybackActions({
    viewMode,
    flattenedSongs,
    groupedSongs,
    unavailableVideoIds,
    playTrack,
    addToQueue,
    showToastMessage,
  });

  const {
    scrollContainerRef,
    timelineListRef,
    groupedListRef,
    mobileSearchListRef,
    timelineVirtualizer,
    groupedVirtualizer,
    mobileSearchVirtualizer,
  } = useCatalogVirtualizers({
    viewMode,
    mobileTab,
    flattenedSongCount: flattenedSongs.length,
    groupedSongCount: groupedSongs.length,
  });

  return (
    <CatalogPageView
      showToast={showToast}
      toastMessage={toastMessage}
      apiLoadError={apiLoadError}
      streamerName={streamerData.name}
      streamerDescription={streamerData.description}
      streamerAvatarUrl={streamerData.avatarUrl}
      streamerSocialLinks={streamerData.socialLinks}
      mobileTab={mobileTab}
      searchInput={searchInput}
      selectedArtist={selectedArtist}
      selectedStreamId={selectedStreamId}
      selectedYears={selectedYears}
      viewMode={viewMode}
      allArtists={allArtists}
      availableYears={availableYears}
      filteredStreams={filteredStreams}
      catalogSongs={songs}
      flattenedSongs={flattenedSongs}
      groupedSongs={groupedSongs}
      allCatalogSongCount={songs.length}
      hasActiveFilters={hasActiveFilters}
      loadError={loadError}
      shuffleOn={shuffleOn}
      currentTrackId={currentTrackId}
      unavailableVideoIds={unavailableVideoIds}
      playlistCount={playlists.length}
      likedCount={likedCount}
      recentCount={recentCount}
      showPlaylistPanel={showPlaylistPanel}
      showLikedSongsPanel={showLikedSongsPanel}
      showRecentlyPlayedPanel={showRecentlyPlayedPanel}
      showCreateDialog={showCreateDialog}
      scrollContainerRef={scrollContainerRef}
      timelineListRef={timelineListRef}
      groupedListRef={groupedListRef}
      mobileSearchListRef={mobileSearchListRef}
      timelineVirtualizer={timelineVirtualizer}
      groupedVirtualizer={groupedVirtualizer}
      mobileSearchVirtualizer={mobileSearchVirtualizer}
      isSongExpanded={isSongExpanded}
      onHideToast={hideToast}
      onMobileTabChange={setMobileTab}
      onSearchInputChange={setSearchInput}
      onSelectedArtistChange={setSelectedArtist}
      onClearAllFilters={clearAllFilters}
      onToggleYear={toggleYear}
      onClearYears={clearYears}
      onClearStreamFilter={clearStreamFilter}
      onToggleStreamFilter={toggleStreamFilter}
      onCreatePlaylist={openCreateDialog}
      onViewPlaylists={openPlaylistPanel}
      onViewLikedSongs={openLikedSongsPanel}
      onViewRecentlyPlayed={openRecentlyPlayedPanel}
      onPlayAll={handlePlayAll}
      onToggleShuffle={toggleShuffle}
      onViewModeChange={setViewMode}
      onRetry={fetchSongs}
      onToggleExpand={toggleSongExpansion}
      onPlay={playTrack}
      onAddToQueue={handleAddToQueue}
      onAddToPlaylistSuccess={handleAddToPlaylistSuccess}
      onShowAllStreams={showAllStreamsOnHome}
      onShowStream={showStreamOnHome}
      onClosePlaylistPanel={closePlaylistPanel}
      onCloseLikedSongsPanel={closeLikedSongsPanel}
      onCloseRecentlyPlayedPanel={closeRecentlyPlayedPanel}
      onCloseCreateDialog={closeCreateDialog}
      onToast={showToastMessage}
    />
  );
}
