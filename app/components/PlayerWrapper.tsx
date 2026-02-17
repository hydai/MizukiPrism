'use client';

import { PlayerProvider } from '../contexts/PlayerContext';
import { PlaylistProvider, usePlaylist } from '../contexts/PlaylistContext';
import { FanAuthProvider, useFanAuth } from '../contexts/FanAuthContext';
import MiniPlayer from './MiniPlayer';
import NowPlayingModal from './NowPlayingModal';
import YouTubePlayerContainer from './YouTubePlayerContainer';
import QueuePanel from './QueuePanel';
import MergePlaylistDialog from './MergePlaylistDialog';
import { ReactNode } from 'react';

// Inner wrapper that consumes FanAuthContext to pass isLoggedIn to PlaylistProvider
function PlaylistProviderWithAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useFanAuth();

  return (
    <PlaylistProvider isLoggedIn={isLoggedIn}>
      <PlaylistAndMergeLayer>
        {children}
      </PlaylistAndMergeLayer>
    </PlaylistProvider>
  );
}

// Layer that renders merge dialog
function PlaylistAndMergeLayer({ children }: { children: ReactNode }) {
  const { showMergeDialog, mergeLocalCount, mergeCloudCount, handleMergeChoice } = usePlaylist();

  return (
    <>
      {children}
      <MergePlaylistDialog
        show={showMergeDialog}
        localCount={mergeLocalCount}
        cloudCount={mergeCloudCount}
        onChoose={handleMergeChoice}
      />
    </>
  );
}

export default function PlayerWrapper({ children }: { children: ReactNode }) {
  return (
    <FanAuthProvider>
      <PlayerProvider>
        <PlaylistProviderWithAuth>
          {children}
          <MiniPlayer />
          <NowPlayingModal />
          <YouTubePlayerContainer />
          <QueuePanel />
        </PlaylistProviderWithAuth>
      </PlayerProvider>
    </FanAuthProvider>
  );
}
