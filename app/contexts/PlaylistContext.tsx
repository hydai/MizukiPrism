'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLocalStorageAvailable } from '../lib/browserStorage';
import {
  buildPlaylistCollectionExportFilename,
  buildPlaylistExportEnvelope,
  buildSinglePlaylistExportFilename,
  downloadPlaylistJson,
  readPlaylistImportFile,
} from '../lib/playlistImportExport';
import { mergeImportedPlaylists } from '../lib/playlistImportMerge';
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
  type PlaylistStorageSaveResult,
  readStoredPlaylists,
  saveStoredPlaylists,
} from '../lib/playlistStorage';
import type { PlaylistContextType } from '../types/playlistContext';
import type { Playlist, PlaylistVersion } from '../types/playlist';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

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
    const result = saveStoredPlaylists(newPlaylists);
    if (result.success) {
      setStorageError(null);
      return result;
    }

    console.error('Failed to save playlists to localStorage:', result.cause);
    setStorageError(result.error);
    return result;
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
      buildPlaylistCollectionExportFilename(),
    );
  };

  const exportSingle = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    downloadPlaylistJson(
      buildPlaylistExportEnvelope([playlist]),
      buildSinglePlaylistExportFilename(playlist.name),
    );
  };

  const importPlaylists = async (file: File): Promise<{ success: boolean; count?: number; error?: string }> => {
    const result = await readPlaylistImportFile(file);
    if (!result.success) {
      return result;
    }

    const incoming = result.playlists;
    const merged = mergeImportedPlaylists(playlists, incoming);

    const saveResult = saveToLocalStorage(merged);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    setPlaylists(merged);
    return { success: true, count: incoming.length };
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
