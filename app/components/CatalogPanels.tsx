'use client';

import type { CatalogSong } from '../lib/catalogData';
import CreatePlaylistDialog from './CreatePlaylistDialog';
import LikedSongsPanel from './LikedSongsPanel';
import PlaylistPanel from './PlaylistPanel';
import RecentlyPlayedPanel from './RecentlyPlayedPanel';

interface CatalogPanelsProps {
  songs: CatalogSong[];
  showPlaylistPanel: boolean;
  showLikedSongsPanel: boolean;
  showRecentlyPlayedPanel: boolean;
  showCreateDialog: boolean;
  onClosePlaylistPanel: () => void;
  onCloseLikedSongsPanel: () => void;
  onCloseRecentlyPlayedPanel: () => void;
  onCloseCreateDialog: () => void;
  onToast: (message: string) => void;
}

export default function CatalogPanels({
  songs,
  showPlaylistPanel,
  showLikedSongsPanel,
  showRecentlyPlayedPanel,
  showCreateDialog,
  onClosePlaylistPanel,
  onCloseLikedSongsPanel,
  onCloseRecentlyPlayedPanel,
  onCloseCreateDialog,
  onToast,
}: CatalogPanelsProps) {
  return (
    <>
      <PlaylistPanel
        show={showPlaylistPanel}
        onClose={onClosePlaylistPanel}
        songsData={songs}
        onToast={onToast}
      />
      <LikedSongsPanel
        show={showLikedSongsPanel}
        onClose={onCloseLikedSongsPanel}
        onToast={onToast}
      />
      <RecentlyPlayedPanel
        show={showRecentlyPlayedPanel}
        onClose={onCloseRecentlyPlayedPanel}
        onToast={onToast}
      />
      <CreatePlaylistDialog
        show={showCreateDialog}
        onClose={onCloseCreateDialog}
        onSuccess={() => {
          onToast('播放清單已建立');
        }}
      />
    </>
  );
}
