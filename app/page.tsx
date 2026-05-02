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
import Toast from './components/Toast';
import CatalogPanels from './components/CatalogPanels';
import CatalogSidebar from './components/CatalogSidebar';
import CatalogShell from './components/CatalogShell';
import CatalogSongSection from './components/CatalogSongSection';
import DesktopActionBar from './components/DesktopActionBar';
import DesktopHero from './components/DesktopHero';
import MobileActionBar from './components/MobileActionBar';
import MobileHero from './components/MobileHero';
import MobileLibraryTab from './components/MobileLibraryTab';
import MobileSearchTab from './components/MobileSearchTab';
import MobileStreamsTab from './components/MobileStreamsTab';
import MobileYearFilterScroll from './components/MobileYearFilterScroll';

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
    <>
      <Toast message={toastMessage} show={showToast} onHide={hideToast} />
      <CatalogShell
        apiLoadError={apiLoadError}
        streamerName={streamerData.name}
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
            playlistCount={playlists.length}
            likedSongsCount={likedCount}
            recentlyPlayedCount={recentCount}
            onSearchInputChange={setSearchInput}
            onSelectedArtistChange={setSelectedArtist}
            onClearAllFilters={clearAllFilters}
            onToggleYear={toggleYear}
            onClearStreamFilter={clearStreamFilter}
            onToggleStreamFilter={toggleStreamFilter}
            onCreatePlaylist={openCreateDialog}
            onViewPlaylists={openPlaylistPanel}
            onViewLikedSongs={openLikedSongsPanel}
            onViewRecentlyPlayed={openRecentlyPlayedPanel}
          />
        }
        onMobileTabChange={setMobileTab}
      >

          {/* Home tab content wrapper: always visible on desktop, only on home tab on mobile */}
          <div className={mobileTab !== 'home' ? 'hidden lg:block' : ''}>

          <MobileHero
            name={streamerData.name}
            description={streamerData.description}
            avatarUrl={streamerData.avatarUrl}
            songCount={flattenedSongs.length}
          />

          <DesktopHero
            name={streamerData.name}
            description={streamerData.description}
            avatarUrl={streamerData.avatarUrl}
            songCount={flattenedSongs.length}
            socialLinks={streamerData.socialLinks}
          />

          <MobileActionBar
            youtubeUrl={streamerData.socialLinks.youtube}
            shuffleOn={shuffleOn}
            onPlayAll={handlePlayAll}
            onToggleShuffle={toggleShuffle}
          />

          <MobileYearFilterScroll
            availableYears={availableYears}
            selectedYears={selectedYears}
            onClearYears={clearYears}
            onToggleYear={toggleYear}
          />

          <DesktopActionBar
            youtubeUrl={streamerData.socialLinks.youtube}
            viewMode={viewMode}
            availableYears={availableYears}
            selectedYears={selectedYears}
            onPlayAll={handlePlayAll}
            onViewModeChange={setViewMode}
            onClearYears={clearYears}
            onToggleYear={toggleYear}
          />

          <CatalogSongSection
            loadError={loadError}
            viewMode={viewMode}
            flattenedSongs={flattenedSongs}
            groupedSongs={groupedSongs}
            allCatalogSongCount={songs.length}
            hasActiveFilters={hasActiveFilters}
            timelineListRef={timelineListRef}
            groupedListRef={groupedListRef}
            timelineVirtualizer={timelineVirtualizer}
            groupedVirtualizer={groupedVirtualizer}
            currentTrackId={currentTrackId}
            unavailableVideoIds={unavailableVideoIds}
            isSongExpanded={isSongExpanded}
            onRetry={fetchSongs}
            onToggleExpand={toggleSongExpansion}
            onClearFilters={clearAllFilters}
            onPlay={playTrack}
            onAddToQueue={handleAddToQueue}
            onAddToPlaylistSuccess={handleAddToPlaylistSuccess}
          />
          {/* End home tab content wrapper */}
          </div>

          {mobileTab === 'search' && (
            <MobileSearchTab
              searchInput={searchInput}
              selectedArtist={selectedArtist}
              allArtists={allArtists}
              flattenedSongs={flattenedSongs}
              listRef={mobileSearchListRef}
              virtualizer={mobileSearchVirtualizer}
              currentTrackId={currentTrackId}
              unavailableVideoIds={unavailableVideoIds}
              onSearchInputChange={setSearchInput}
              onSelectedArtistChange={setSelectedArtist}
              onPlay={playTrack}
            />
          )}

          {mobileTab === 'library' && (
            <MobileLibraryTab
              likedCount={likedCount}
              recentCount={recentCount}
              playlistCount={playlists.length}
              onOpenLikedSongs={openLikedSongsPanel}
              onOpenRecentlyPlayed={openRecentlyPlayedPanel}
              onOpenCreatePlaylist={openCreateDialog}
              onOpenPlaylists={openPlaylistPanel}
            />
          )}

          {mobileTab === 'streams' && (
            <MobileStreamsTab
              availableYears={availableYears}
              selectedYears={selectedYears}
              filteredStreams={filteredStreams}
              onToggleYear={toggleYear}
              onClearYears={clearYears}
              onShowAllStreams={showAllStreamsOnHome}
              onShowStream={showStreamOnHome}
            />
          )}

      </CatalogShell>

      <CatalogPanels
        songs={songs}
        showPlaylistPanel={showPlaylistPanel}
        showLikedSongsPanel={showLikedSongsPanel}
        showRecentlyPlayedPanel={showRecentlyPlayedPanel}
        showCreateDialog={showCreateDialog}
        onClosePlaylistPanel={closePlaylistPanel}
        onCloseLikedSongsPanel={closeLikedSongsPanel}
        onCloseRecentlyPlayedPanel={closeRecentlyPlayedPanel}
        onCloseCreateDialog={closeCreateDialog}
        onToast={showToastMessage}
      />
    </>
  );
}
