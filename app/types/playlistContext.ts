import type { Playlist, PlaylistVersion } from './playlist';

export interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => { success: boolean; error?: string };
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, newName: string) => { success: boolean; error?: string };
  addVersionToPlaylist: (playlistId: string, version: PlaylistVersion) => { success: boolean; error?: string };
  removeVersionFromPlaylist: (playlistId: string, performanceId: string) => void;
  reorderVersionsInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  storageError: string | null;
  clearStorageError: () => void;
  exportAll: () => void;
  exportSingle: (playlistId: string) => void;
  importPlaylists: (file: File) => Promise<{ success: boolean; count?: number; error?: string }>;
}
