'use client';

import { useCallback, useState } from 'react';

export function useCatalogPanelState() {
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [showLikedSongsPanel, setShowLikedSongsPanel] = useState(false);
  const [showRecentlyPlayedPanel, setShowRecentlyPlayedPanel] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const openPlaylistPanel = useCallback(() => setShowPlaylistPanel(true), []);
  const closePlaylistPanel = useCallback(() => setShowPlaylistPanel(false), []);
  const openLikedSongsPanel = useCallback(() => setShowLikedSongsPanel(true), []);
  const closeLikedSongsPanel = useCallback(() => setShowLikedSongsPanel(false), []);
  const openRecentlyPlayedPanel = useCallback(() => setShowRecentlyPlayedPanel(true), []);
  const closeRecentlyPlayedPanel = useCallback(() => setShowRecentlyPlayedPanel(false), []);
  const openCreateDialog = useCallback(() => setShowCreateDialog(true), []);
  const closeCreateDialog = useCallback(() => setShowCreateDialog(false), []);

  return {
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
  };
}
