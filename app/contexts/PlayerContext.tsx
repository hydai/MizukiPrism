'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePlayerProviderValue } from '../hooks/usePlayerProviderValue';
import type { PlayerContextType } from '../types/playerContext';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const value = usePlayerProviderValue();

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
