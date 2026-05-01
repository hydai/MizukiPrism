'use client';

import { Search, Clock, ChevronDown, SlidersHorizontal } from 'lucide-react';
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
import PlaylistPanel from './components/PlaylistPanel';
import LikedSongsPanel from './components/LikedSongsPanel';
import RecentlyPlayedPanel from './components/RecentlyPlayedPanel';
import CreatePlaylistDialog from './components/CreatePlaylistDialog';
import AlbumArt from './components/AlbumArt';
import SidebarNav from './components/SidebarNav';
import TimelineRow from './components/TimelineRow';
import SongCard from './components/SongCard';
import DesktopActionBar from './components/DesktopActionBar';
import DesktopHero from './components/DesktopHero';
import MobileActionBar from './components/MobileActionBar';
import MobileBottomNav from './components/MobileBottomNav';
import MobileHero from './components/MobileHero';
import MobileLibraryTab from './components/MobileLibraryTab';
import MobileSearchTab from './components/MobileSearchTab';
import MobileStreamsTab from './components/MobileStreamsTab';
import MobileYearFilterScroll from './components/MobileYearFilterScroll';
import SongEmptyState from './components/SongEmptyState';
import SongLoadErrorState from './components/SongLoadErrorState';
import ThemeToggle from './components/ThemeToggle';

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

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500";

  return (
    <>
      <Toast message={toastMessage} show={showToast} onHide={hideToast} />
      {/* API Load Error Banner */}
      {apiLoadError && (
        <div
          data-testid="api-load-error"
          className="fixed top-0 left-0 right-0 z-[300] bg-red-500 text-white px-6 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="font-bold text-sm">{apiLoadError}</span>
        </div>
      )}
      <div className="flex h-screen font-sans selection:bg-pink-200 selection:text-pink-900 dark:selection:bg-pink-800 dark:selection:text-pink-100 overflow-hidden" style={{ color: 'var(--text-secondary)', background: 'linear-gradient(135deg, var(--bg-page-start) 0%, var(--bg-page-mid) 50%, var(--bg-page-end) 100%)' }}>

      {/* Sidebar */}
      <SidebarNav
        activePage="home"
        isHomeActive={!hasActiveFilters}
        onHomeClick={clearAllFilters}
        onCreatePlaylist={openCreateDialog}
        onViewPlaylists={openPlaylistPanel}
        playlistCount={playlists.length}
        onViewLikedSongs={openLikedSongsPanel}
        likedSongsCount={likedCount}
        onViewRecentlyPlayed={openRecentlyPlayedPanel}
        recentlyPlayedCount={recentCount}
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
                onChange={(e) => setSearchInput(e.target.value)}
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
        {/* ── Filters Section ── */}
        <div className="pt-2 pb-1">
          <div
            className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
          >
            <SlidersHorizontal className="w-3 h-3" />
            篩選條件
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-xs font-medium transition-colors"
                style={{ color: 'var(--accent-pink)', fontSize: 'var(--font-size-xs)' }}
                data-testid="clear-all-filters"
              >
                清除全部
              </button>
            )}
          </div>

          {/* Artist dropdown */}
          <div className="relative px-1 mb-2">
            <select
              value={selectedArtist ?? ''}
              onChange={(e) => setSelectedArtist(e.target.value || null)}
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

          {/* Year filter chips */}
          <div className="flex flex-wrap gap-1.5 px-1" data-testid="year-filter-sidebar">
            {availableYears.map(year => (
              <button
                key={year}
                data-testid="year-filter-chip"
                onClick={() => toggleYear(year)}
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

        {/* ── Stream Playlists Section ── */}
        <div className="pt-2 pb-2">
          <div
            className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
          >
            歌枠回放{selectedYears.size > 0 && ` (${Array.from(selectedYears).sort().join(', ')})`}
          </div>
          <button
            onClick={clearStreamFilter}
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
              onClick={() => toggleStreamFilter(stream.id)}
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

      {/* Mobile TopBar — 56px + safe area, fixed top, mobile only */}
      <div
        data-testid="mobile-topbar"
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          height: '56px',
          padding: 'var(--safe-area-top) 20px 0 20px',
          background: 'var(--bg-surface-frosted)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        <div style={{ width: 32 }} />
        <a
          href="https://prism.oshi.tw"
          style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
        >
          {streamerData.name}
        </a>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:m-3 lg:rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-100/50 dark:shadow-indigo-900/20 flex flex-col" style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-3xl)' }}>

        {/* Decorative glows */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Scrollable area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-14 lg:pt-0">

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

          {/* Song List - Conditional Rendering based on View Mode */}
          <div className="px-4 pb-32 mt-2">
            {/* Always-visible logical counts for E2E tests (virtual scrolling caps DOM nodes) */}
            <span data-testid="total-performance-count" className="sr-only">{flattenedSongs.length}</span>
            <span data-testid="total-song-card-count" className="sr-only">{groupedSongs.length}</span>
            {loadError ? (
              <SongLoadErrorState onRetry={fetchSongs} />
            ) : viewMode === 'timeline' ? (
              /* Timeline View */
              <>
                {/* SongTableHeader */}
                <div
                  className="grid grid-cols-[32px_40px_1fr_60px] lg:grid-cols-[32px_40px_2fr_2fr_100px_60px] gap-0 px-3 py-2 sticky top-[60px] lg:top-[88px] z-10"
                  style={{
                    borderBottom: '1px solid var(--border-table)',
                    background: 'var(--bg-surface-frosted)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="flex items-center justify-center text-center font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    #
                  </div>
                  {/* Album art header spacer */}
                  <div />
                  <div
                    className="flex items-center font-bold uppercase tracking-wider lg:pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    標題
                  </div>
                  <div
                    className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    出處直播
                  </div>
                  <div
                    className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    發布日期
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Clock style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                  </div>
                </div>

                <div className="mt-1">
                  {flattenedSongs.length === 0 ? (
                    <SongEmptyState
                      isCatalogEmpty={songs.length === 0 && !hasActiveFilters}
                      hasActiveFilters={hasActiveFilters}
                      onClearFilters={clearAllFilters}
                    />
                  ) : (
                    <div
                      ref={timelineListRef}
                      style={{
                        height: `${timelineVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {timelineVirtualizer.getVirtualItems().map(virtualItem => {
                        const song = flattenedSongs[virtualItem.index];
                        return (
                          <div
                            key={`${song.id}-${song.performanceId}`}
                            data-index={virtualItem.index}
                            ref={timelineVirtualizer.measureElement}
                            className="hover:z-10 focus-within:z-10"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              transform: `translateY(${virtualItem.start - (timelineVirtualizer.options.scrollMargin ?? 0)}px)`,
                            }}
                          >
                            <TimelineRow
                              song={song}
                              index={virtualItem.index}
                              isCurrentlyPlaying={currentTrackId === song.performanceId}
                              isUnavailable={unavailableVideoIds.has(song.videoId)}
                              onPlay={playTrack}
                              onAddToQueue={handleAddToQueue}
                              onAddToPlaylistSuccess={handleAddToPlaylistSuccess}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Grouped View */
              <div className="mt-2">
                {groupedSongs.length === 0 ? (
                  <SongEmptyState
                    isCatalogEmpty={songs.length === 0 && !hasActiveFilters}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearAllFilters}
                  />
                ) : (
                  <div
                    ref={groupedListRef}
                    style={{
                      height: `${groupedVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {groupedVirtualizer.getVirtualItems().map(virtualItem => {
                      const song = groupedSongs[virtualItem.index];
                      return (
                        <div
                          key={song.id}
                          data-index={virtualItem.index}
                          ref={groupedVirtualizer.measureElement}
                          className="hover:z-10 focus-within:z-10"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualItem.start - (groupedVirtualizer.options.scrollMargin ?? 0)}px)`,
                            paddingBottom: '12px',
                          }}
                        >
                          <SongCard
                            song={song}
                            isExpanded={isSongExpanded(song.id)}
                            onToggleExpand={toggleSongExpansion}
                            onPlay={playTrack}
                            onAddToQueue={handleAddToQueue}
                            onAddToPlaylistSuccess={handleAddToPlaylistSuccess}
                            unavailableVideoIds={unavailableVideoIds}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
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

        </div>
      </main>
      </div>

      <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Playlist UI */}
      <PlaylistPanel
        show={showPlaylistPanel}
        onClose={closePlaylistPanel}
        songsData={songs}
        onToast={showToastMessage}
      />
      <LikedSongsPanel
        show={showLikedSongsPanel}
        onClose={closeLikedSongsPanel}
        onToast={showToastMessage}
      />
      <RecentlyPlayedPanel
        show={showRecentlyPlayedPanel}
        onClose={closeRecentlyPlayedPanel}
        onToast={showToastMessage}
      />
      <CreatePlaylistDialog
        show={showCreateDialog}
        onClose={closeCreateDialog}
        onSuccess={() => {
          showToastMessage('播放清單已建立');
        }}
      />
    </>
  );
}
