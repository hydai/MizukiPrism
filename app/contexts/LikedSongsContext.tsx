'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLocalStorageAvailable } from '../lib/browserStorage';
import { isLikedSong, toggleLikedSongMutation } from '../lib/likedSongs';
import type { LikeableVersion, LikedVersion } from '../types/likedSongs';

export type { LikedVersion } from '../types/likedSongs';

interface LikedSongsContextType {
  likedSongs: LikedVersion[];
  isLiked: (performanceId: string) => boolean;
  toggleLike: (version: LikeableVersion) => void;
  likedCount: number;
}

const LikedSongsContext = createContext<LikedSongsContextType | undefined>(undefined);

export const useLikedSongs = () => {
  const context = useContext(LikedSongsContext);
  if (!context) {
    throw new Error('useLikedSongs must be used within a LikedSongsProvider');
  }
  return context;
};

const STORAGE_KEY = 'mizukiprism_liked_songs';

export const LikedSongsProvider = ({ children }: { children: ReactNode }) => {
  const [likedSongs, setLikedSongs] = useState<LikedVersion[]>([]);
  const [localStorageSupported] = useState(() =>
    typeof window !== 'undefined' ? isLocalStorageAvailable() : true
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLikedSongs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load liked songs from localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = (songs: LikedVersion[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
      return true;
    } catch {
      return false;
    }
  };

  const isLiked = (performanceId: string): boolean => {
    return isLikedSong(likedSongs, performanceId);
  };

  const toggleLike = (version: LikeableVersion) => {
    if (!localStorageSupported) return;

    const newSongs = toggleLikedSongMutation(likedSongs, version);
    const saved = saveToLocalStorage(newSongs);
    if (saved) {
      setLikedSongs(newSongs);
    }
  };

  return (
    <LikedSongsContext.Provider
      value={{
        likedSongs,
        isLiked,
        toggleLike,
        likedCount: likedSongs.length,
      }}
    >
      {children}
    </LikedSongsContext.Provider>
  );
};
