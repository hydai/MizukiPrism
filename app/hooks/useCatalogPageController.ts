'use client';

import streamerData from '@/data/streamer.json';
import type { CatalogPageViewProps } from '../components/CatalogPageView';
import { useLikedSongs } from '../contexts/LikedSongsContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useRecentlyPlayed } from '../contexts/RecentlyPlayedContext';
import { useCatalogData } from './useCatalogData';
import { useCatalogDerivedData } from './useCatalogDerivedData';
import { useCatalogPanelState } from './useCatalogPanelState';
import { useCatalogPlaybackActions } from './useCatalogPlaybackActions';
import { useCatalogSongExpansion } from './useCatalogSongExpansion';
import { useCatalogToastState } from './useCatalogToastState';
import { useCatalogViewState } from './useCatalogViewState';
import { useCatalogVirtualizers } from './useCatalogVirtualizers';

export function useCatalogPageController(): CatalogPageViewProps {
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

  return {
    showToast,
    toastMessage,
    apiLoadError,
    streamerName: streamerData.name,
    streamerDescription: streamerData.description,
    streamerAvatarUrl: streamerData.avatarUrl,
    streamerSocialLinks: streamerData.socialLinks,
    mobileTab,
    searchInput,
    selectedArtist,
    selectedStreamId,
    selectedYears,
    viewMode,
    allArtists,
    availableYears,
    filteredStreams,
    catalogSongs: songs,
    flattenedSongs,
    groupedSongs,
    allCatalogSongCount: songs.length,
    hasActiveFilters,
    loadError,
    shuffleOn,
    currentTrackId,
    unavailableVideoIds,
    playlistCount: playlists.length,
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
    onHideToast: hideToast,
    onMobileTabChange: setMobileTab,
    onSearchInputChange: setSearchInput,
    onSelectedArtistChange: setSelectedArtist,
    onClearAllFilters: clearAllFilters,
    onToggleYear: toggleYear,
    onClearYears: clearYears,
    onClearStreamFilter: clearStreamFilter,
    onToggleStreamFilter: toggleStreamFilter,
    onCreatePlaylist: openCreateDialog,
    onViewPlaylists: openPlaylistPanel,
    onViewLikedSongs: openLikedSongsPanel,
    onViewRecentlyPlayed: openRecentlyPlayedPanel,
    onPlayAll: handlePlayAll,
    onToggleShuffle: toggleShuffle,
    onViewModeChange: setViewMode,
    onRetry: fetchSongs,
    onToggleExpand: toggleSongExpansion,
    onPlay: playTrack,
    onAddToQueue: handleAddToQueue,
    onAddToPlaylistSuccess: handleAddToPlaylistSuccess,
    onShowAllStreams: showAllStreamsOnHome,
    onShowStream: showStreamOnHome,
    onClosePlaylistPanel: closePlaylistPanel,
    onCloseLikedSongsPanel: closeLikedSongsPanel,
    onCloseRecentlyPlayedPanel: closeRecentlyPlayedPanel,
    onCloseCreateDialog: closeCreateDialog,
    onToast: showToastMessage,
  };
}
