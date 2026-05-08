'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { isLocalStorageAvailable } from '../lib/browserStorage';
import { addRecentPlayMutation } from '../lib/recentlyPlayed';
import type { RecentPlay, RecentPlayable } from '../types/recentlyPlayed';

export type { RecentPlay } from '../types/recentlyPlayed';

interface RecentlyPlayedContextType {
  recentPlays: RecentPlay[];
  addRecentPlay: (play: RecentPlayable) => void;
  clearHistory: () => void;
  recentCount: number;
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextType | undefined>(undefined);

export const useRecentlyPlayed = () => {
  const context = useContext(RecentlyPlayedContext);
  if (!context) {
    throw new Error('useRecentlyPlayed must be used within a RecentlyPlayedProvider');
  }
  return context;
};

const STORAGE_KEY = 'mizukiprism_recently_played';

export const RecentlyPlayedProvider = ({ children }: { children: ReactNode }) => {
  const [recentPlays, setRecentPlays] = useState<RecentPlay[]>([]);
  const recentPlaysRef = useRef<RecentPlay[]>([]);
  const [localStorageSupported] = useState(() =>
    typeof window !== 'undefined' ? isLocalStorageAvailable() : true
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedRecentPlays = JSON.parse(stored) as RecentPlay[];
        recentPlaysRef.current = storedRecentPlays;
        setRecentPlays(storedRecentPlays);
      }
    } catch (error) {
      console.error('Failed to load recently played from localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = (plays: RecentPlay[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
      return true;
    } catch {
      return false;
    }
  };

  const addRecentPlay = (play: RecentPlayable) => {
    if (!localStorageSupported) return;

    const newPlays = addRecentPlayMutation(recentPlaysRef.current, play);
    const saved = saveToLocalStorage(newPlays);
    if (saved) {
      recentPlaysRef.current = newPlays;
      setRecentPlays(newPlays);
    }
  };

  const clearHistory = () => {
    saveToLocalStorage([]);
    recentPlaysRef.current = [];
    setRecentPlays([]);
  };

  return (
    <RecentlyPlayedContext.Provider
      value={{
        recentPlays,
        addRecentPlay,
        clearHistory,
        recentCount: recentPlays.length,
      }}
    >
      {children}
    </RecentlyPlayedContext.Provider>
  );
};
