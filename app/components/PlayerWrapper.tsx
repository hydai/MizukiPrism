'use client';

import { PlayerProvider } from '../contexts/PlayerContext';
import MiniPlayer from './MiniPlayer';
import NowPlayingModal from './NowPlayingModal';
import YouTubePlayerContainer from './YouTubePlayerContainer';
import QueuePanel from './QueuePanel';
import { ReactNode } from 'react';

export default function PlayerWrapper({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      {children}
      <MiniPlayer />
      <NowPlayingModal />
      <YouTubePlayerContainer />
      <QueuePanel />
    </PlayerProvider>
  );
}
