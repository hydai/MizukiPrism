'use client';

import { PlayerProvider } from '../contexts/PlayerContext';
import { PlaylistProvider } from '../contexts/PlaylistContext';
import MiniPlayer from './MiniPlayer';
import NowPlayingModal from './NowPlayingModal';
import YouTubePlayerContainer from './YouTubePlayerContainer';
import QueuePanel from './QueuePanel';
import { ReactNode } from 'react';

export default function PlayerWrapper({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <PlaylistProvider>
        {children}
        <MiniPlayer />
        <NowPlayingModal />
        <YouTubePlayerContainer />
        <QueuePanel />
      </PlaylistProvider>
    </PlayerProvider>
  );
}
