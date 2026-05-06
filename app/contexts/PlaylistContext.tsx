'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLocalStorageAvailable } from '../lib/browserStorage';
import {
  buildPlaylistExportEnvelope,
  downloadPlaylistJson,
  formatPlaylistExportDate,
  validatePlaylistImport,
} from '../lib/playlistImportExport';
import {
  addVersionToPlaylistMutation,
  createPlaylistMutation,
  deletePlaylistMutation,
  removeVersionFromPlaylistMutation,
  renamePlaylistMutation,
  reorderPlaylistVersionsMutation,
} from '../lib/playlistMutations';
import {
  PLAYLIST_STORAGE_UNSUPPORTED_ERROR,
  getPlaylistStorageWriteErrorMessage,
  readStoredPlaylists,
  writeStoredPlaylists,
} from '../lib/playlistStorage';
import type { PlaylistContextType } from '../types/playlistContext';
import type { Playlist, PlaylistVersion } from '../types/playlist';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

type PlaylistStorageSaveResult =
  | { success: true }
  | { success: false; error: string };

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [localStorageSupported] = useState(() =>
    typeof window !== 'undefined' ? isLocalStorageAvailable() : true
  );

  // Load playlists from localStorage on mount
  useEffect(() => {
    try {
      const storedPlaylists = readStoredPlaylists();
      if (storedPlaylists) {
        setPlaylists(storedPlaylists);
      }
    } catch (error) {
      console.error('Failed to load playlists from localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = (newPlaylists: Playlist[]): PlaylistStorageSaveResult => {
    try {
      writeStoredPlaylists(newPlaylists);
      setStorageError(null);
      return { success: true };
    } catch (error) {
      console.error('Failed to save playlists to localStorage:', error);
      const message = getPlaylistStorageWriteErrorMessage(error);
      setStorageError(message);
      return { success: false, error: message };
    }
  };

  const createPlaylist = (name: string): { success: boolean; error?: string } => {
    if (!localStorageSupported) {
      setStorageError(PLAYLIST_STORAGE_UNSUPPORTED_ERROR);
      return { success: false, error: PLAYLIST_STORAGE_UNSUPPORTED_ERROR };
    }

    const mutationResult = createPlaylistMutation(playlists, name);
    if (!mutationResult.success) {
      return mutationResult;
    }

    const saveResult = saveToLocalStorage(mutationResult.playlists);

    if (saveResult.success) {
      setPlaylists(mutationResult.playlists);
      return { success: true };
    }
    return { success: false, error: saveResult.error };
  };

  const deletePlaylist = (id: string) => {
    const newPlaylists = deletePlaylistMutation(playlists, id);
    if (newPlaylists === playlists) {
      return;
    }

    const saveResult = saveToLocalStorage(newPlaylists);
    if (saveResult.success) {
      setPlaylists(newPlaylists);
    }
  };

  const renamePlaylist = (id: string, newName: string): { success: boolean; error?: string } => {
    const mutationResult = renamePlaylistMutation(playlists, id, newName);
    if (!mutationResult.success) {
      return mutationResult;
    }

    const saveResult = saveToLocalStorage(mutationResult.playlists);
    if (saveResult.success) {
      setPlaylists(mutationResult.playlists);
      return { success: true };
    }
    return { success: false, error: saveResult.error };
  };

  const addVersionToPlaylist = (playlistId: string, version: PlaylistVersion): { success: boolean; error?: string } => {
    if (!localStorageSupported) {
      setStorageError(PLAYLIST_STORAGE_UNSUPPORTED_ERROR);
      return { success: false, error: PLAYLIST_STORAGE_UNSUPPORTED_ERROR };
    }

    const mutationResult = addVersionToPlaylistMutation(playlists, playlistId, version);
    if (!mutationResult.success) {
      return mutationResult;
    }

    const saveResult = saveToLocalStorage(mutationResult.playlists);
    if (saveResult.success) {
      setPlaylists(mutationResult.playlists);
      return { success: true };
    }
    return { success: false, error: saveResult.error };
  };

  const removeVersionFromPlaylist = (playlistId: string, performanceId: string) => {
    const newPlaylists = removeVersionFromPlaylistMutation(playlists, playlistId, performanceId);
    if (newPlaylists === playlists) {
      return;
    }

    const saveResult = saveToLocalStorage(newPlaylists);
    if (saveResult.success) {
      setPlaylists(newPlaylists);
    }
  };

  const reorderVersionsInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    const newPlaylists = reorderPlaylistVersionsMutation(playlists, playlistId, fromIndex, toIndex);
    if (newPlaylists === playlists) {
      return;
    }

    const saveResult = saveToLocalStorage(newPlaylists);
    if (saveResult.success) {
      setPlaylists(newPlaylists);
    }
  };

  const clearStorageError = () => setStorageError(null);

  const exportAll = () => {
    if (playlists.length === 0) return;
    downloadPlaylistJson(
      buildPlaylistExportEnvelope(playlists),
      `mizukiprism-playlists-${formatPlaylistExportDate()}.json`,
    );
  };

  const exportSingle = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    downloadPlaylistJson(
      buildPlaylistExportEnvelope([playlist]),
      `mizukiprism-${playlist.name}-${formatPlaylistExportDate()}.json`,
    );
  };

  const importPlaylists = async (file: File): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      const text = await file.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: '無法匯入：檔案格式無效' };
      }

      const result = validatePlaylistImport(data);
      if (!result.valid) {
        return { success: false, error: `無法匯入：${result.error}` };
      }

      const incoming = result.playlists;
      const localMap = new Map(playlists.map(p => [p.id, p]));
      const merged: Playlist[] = [...playlists];

      for (const imported of incoming) {
        const existing = localMap.get(imported.id);
        if (!existing) {
          // No conflict — add directly
          merged.push(imported);
        } else if (imported.updatedAt > existing.updatedAt) {
          // Imported is newer — replace existing, keep old as renamed copy
          const idx = merged.findIndex(p => p.id === existing.id);
          merged[idx] = imported;
          merged.push({
            ...existing,
            id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${existing.name}（匯入）`,
          });
        } else {
          // Existing is newer or same — keep existing, add imported as renamed copy
          merged.push({
            ...imported,
            id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${imported.name}（匯入）`,
          });
        }
      }

      const saveResult = saveToLocalStorage(merged);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      setPlaylists(merged);
      return { success: true, count: incoming.length };
    } catch {
      return { success: false, error: '無法匯入：檔案格式無效' };
    }
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
        exportAll,
        exportSingle,
        importPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};
