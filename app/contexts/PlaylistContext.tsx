'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PlaylistVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}

export interface Playlist {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => { success: boolean; error?: string };
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, newName: string) => { success: boolean; error?: string };
  addVersionToPlaylist: (playlistId: string, version: PlaylistVersion) => { success: boolean; error?: string };
  removeVersionFromPlaylist: (playlistId: string, performanceId: string) => void;
  reorderVersionsInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  storageError: string | null;
  clearStorageError: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

const STORAGE_KEY = 'mizukiprism_playlists';
const STORAGE_QUOTA_ERROR = '本機儲存空間不足,請登入帳號以使用雲端儲存';

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPlaylists(parsed);
      }
    } catch (error) {
      console.error('Failed to load playlists from localStorage:', error);
    }
  }, []);

  // Save playlists to localStorage whenever they change
  const saveToLocalStorage = (newPlaylists: Playlist[]) => {
    try {
      const serialized = JSON.stringify(newPlaylists);
      localStorage.setItem(STORAGE_KEY, serialized);
      setStorageError(null);
      return true;
    } catch (error: any) {
      // Check if it's a quota exceeded error
      const isQuotaError = (
        error?.name === 'QuotaExceededError' ||
        error?.code === 22 // DOMException code for QuotaExceededError
      );
      if (isQuotaError) {
        setStorageError(STORAGE_QUOTA_ERROR);
      } else {
        console.error('Failed to save playlists to localStorage:', error);
        // Show generic storage error for any storage failure
        setStorageError(STORAGE_QUOTA_ERROR);
      }
      return false;
    }
  };

  const createPlaylist = (name: string): { success: boolean; error?: string } => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: '播放清單名稱不可為空' };
    }

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      versions: [],
      createdAt: Date.now(),
    };

    const newPlaylists = [...playlists, newPlaylist];
    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      return { success: true };
    } else {
      return { success: false, error: STORAGE_QUOTA_ERROR };
    }
  };

  const deletePlaylist = (id: string) => {
    const newPlaylists = playlists.filter(p => p.id !== id);
    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
  };

  const renamePlaylist = (id: string, newName: string): { success: boolean; error?: string } => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      return { success: false, error: '播放清單名稱不可為空' };
    }

    const newPlaylists = playlists.map(p =>
      p.id === id ? { ...p, name: trimmedName } : p
    );

    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      return { success: true };
    } else {
      return { success: false, error: STORAGE_QUOTA_ERROR };
    }
  };

  const addVersionToPlaylist = (playlistId: string, version: PlaylistVersion): { success: boolean; error?: string } => {
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist) {
      return { success: false, error: '播放清單不存在' };
    }

    // Check if version already exists
    const exists = playlist.versions.some(v => v.performanceId === version.performanceId);
    if (exists) {
      return { success: false, error: '此版本已在播放清單中' };
    }

    const newPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, versions: [...p.versions, version] }
        : p
    );

    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      return { success: true };
    } else {
      return { success: false, error: STORAGE_QUOTA_ERROR };
    }
  };

  const removeVersionFromPlaylist = (playlistId: string, performanceId: string) => {
    const newPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, versions: p.versions.filter(v => v.performanceId !== performanceId) }
        : p
    );

    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
  };

  const reorderVersionsInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        const newVersions = [...p.versions];
        const [removed] = newVersions.splice(fromIndex, 1);
        newVersions.splice(toIndex, 0, removed);
        return { ...p, versions: newVersions };
      }
      return p;
    });

    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
  };

  const clearStorageError = () => {
    setStorageError(null);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addVersionToPlaylist,
        removeVersionFromPlaylist,
        reorderVersionsInPlaylist,
        storageError,
        clearStorageError,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};
