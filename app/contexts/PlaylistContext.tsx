'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

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
  updatedAt: number;
}

export type MergeOption = 'merge' | 'cloud' | 'local';

interface PendingSync {
  type: 'create' | 'update' | 'delete';
  playlistId: string;
  data?: Partial<Playlist>;
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
  // Auth-aware sync
  showMergeDialog: boolean;
  mergeLocalCount: number;
  mergeCloudCount: number;
  handleMergeChoice: (option: MergeOption) => void;
  pendingCloudSync: boolean;
  isOnline: boolean;
  conflictNotification: string | null;
  clearConflictNotification: () => void;
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
const PENDING_SYNC_KEY = 'mizukiprism_pending_sync';
const STORAGE_QUOTA_ERROR = '本機儲存空間不足,請登入帳號以使用雲端儲存';

export const PlaylistProvider = ({ children, isLoggedIn }: { children: ReactNode; isLoggedIn: boolean }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [pendingMergeCloud, setPendingMergeCloud] = useState<Playlist[]>([]);
  const [pendingCloudSync, setPendingCloudSync] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [conflictNotification, setConflictNotification] = useState<string | null>(null);
  const prevLoggedInRef = useRef(isLoggedIn);
  const syncInProgress = useRef(false);
  const isLoggedInRef = useRef(isLoggedIn);

  // Keep ref in sync with prop
  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      // Flush pending sync when back online using the ref-based version
      if (!isLoggedInRef.current) return;
      try {
        const pendingRaw = localStorage.getItem(PENDING_SYNC_KEY);
        if (!pendingRaw) return;
        const pending = JSON.parse(pendingRaw);
        if (pending.length === 0) return;

        const localPlaylistsRaw = localStorage.getItem(STORAGE_KEY);
        if (!localPlaylistsRaw) return;
        const localPlaylists = JSON.parse(localPlaylistsRaw);

        await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlists: localPlaylists }),
        });
        localStorage.removeItem(PENDING_SYNC_KEY);
        setPendingCloudSync(false);
      } catch {
        // Will retry on next online event
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load playlists from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all playlists have updatedAt
        const normalized = parsed.map((p: any) => ({
          ...p,
          updatedAt: p.updatedAt || p.createdAt || Date.now(),
        }));
        setPlaylists(normalized);
      }
    } catch (error) {
      console.error('Failed to load playlists from localStorage:', error);
    }
  }, []);

  // When login state changes (login event)
  useEffect(() => {
    const wasLoggedIn = prevLoggedInRef.current;
    prevLoggedInRef.current = isLoggedIn;

    if (isLoggedIn && !wasLoggedIn) {
      // Just logged in - fetch cloud playlists and handle merge
      handleLoginSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleLoginSync = async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    try {
      const res = await fetch('/api/playlists');
      if (!res.ok) {
        syncInProgress.current = false;
        return;
      }
      const data = await res.json();
      const cloudPlaylists: Playlist[] = (data.playlists || []).map((p: any) => ({
        ...p,
        updatedAt: p.updatedAt || p.createdAt || Date.now(),
      }));

      const localPlaylistsRaw = localStorage.getItem(STORAGE_KEY);
      const localPlaylists: Playlist[] = localPlaylistsRaw
        ? JSON.parse(localPlaylistsRaw).map((p: any) => ({
            ...p,
            updatedAt: p.updatedAt || p.createdAt || Date.now(),
          }))
        : [];

      if (localPlaylists.length === 0 && cloudPlaylists.length === 0) {
        // Nothing to do
        syncInProgress.current = false;
        return;
      }

      if (localPlaylists.length === 0) {
        // Use cloud playlists
        saveToLocalStorage(cloudPlaylists);
        setPlaylists(cloudPlaylists);
        syncInProgress.current = false;
        return;
      }

      if (cloudPlaylists.length === 0) {
        // Push local to cloud
        await syncAllToCloud(localPlaylists);
        syncInProgress.current = false;
        return;
      }

      // Both have playlists - show merge dialog
      setPendingMergeCloud(cloudPlaylists);
      setShowMergeDialog(true);
      syncInProgress.current = false;
    } catch {
      syncInProgress.current = false;
    }
  };

  const handleMergeChoice = useCallback(async (option: MergeOption) => {
    setShowMergeDialog(false);

    const localPlaylistsRaw = localStorage.getItem(STORAGE_KEY);
    const localPlaylists: Playlist[] = localPlaylistsRaw
      ? JSON.parse(localPlaylistsRaw).map((p: any) => ({
          ...p,
          updatedAt: p.updatedAt || p.createdAt || Date.now(),
        }))
      : [];

    let finalPlaylists: Playlist[];

    if (option === 'merge') {
      // Merge: combine by ID, use newer updatedAt for conflicts
      const mergedMap = new Map<string, Playlist>();
      localPlaylists.forEach(p => mergedMap.set(p.id, p));
      pendingMergeCloud.forEach(cloudP => {
        const existing = mergedMap.get(cloudP.id);
        if (!existing || cloudP.updatedAt > existing.updatedAt) {
          mergedMap.set(cloudP.id, cloudP);
        }
      });
      finalPlaylists = Array.from(mergedMap.values()).sort((a, b) => a.createdAt - b.createdAt);
    } else if (option === 'cloud') {
      finalPlaylists = pendingMergeCloud;
    } else {
      // local
      finalPlaylists = localPlaylists;
    }

    saveToLocalStorage(finalPlaylists);
    setPlaylists(finalPlaylists);
    setPendingMergeCloud([]);

    // Sync final result to cloud
    await syncAllToCloud(finalPlaylists);
  }, [pendingMergeCloud]);

  const syncAllToCloud = async (playlistsToSync: Playlist[]) => {
    try {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: playlistsToSync }),
      });
    } catch {
      // Silently fail - will be retried
    }
  };

  const flushPendingSync = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const pendingRaw = localStorage.getItem(PENDING_SYNC_KEY);
      if (!pendingRaw) return;
      const pending: PendingSync[] = JSON.parse(pendingRaw);
      if (pending.length === 0) return;

      // Get current local state and push to cloud
      const localPlaylistsRaw = localStorage.getItem(STORAGE_KEY);
      if (!localPlaylistsRaw) return;
      const localPlaylists: Playlist[] = JSON.parse(localPlaylistsRaw);

      await syncAllToCloud(localPlaylists);
      localStorage.removeItem(PENDING_SYNC_KEY);
      setPendingCloudSync(false);
    } catch {
      // Will retry on next online event
    }
  }, [isLoggedIn]);

  // Save to localStorage
  const saveToLocalStorage = (newPlaylists: Playlist[]): boolean => {
    try {
      const serialized = JSON.stringify(newPlaylists);
      localStorage.setItem(STORAGE_KEY, serialized);
      setStorageError(null);
      return true;
    } catch (error: any) {
      const isQuotaError = (
        error?.name === 'QuotaExceededError' ||
        error?.code === 22
      );
      if (isQuotaError) {
        setStorageError(STORAGE_QUOTA_ERROR);
      } else {
        console.error('Failed to save playlists to localStorage:', error);
        setStorageError(STORAGE_QUOTA_ERROR);
      }
      return false;
    }
  };

  // Queue a sync operation for when back online
  const queuePendingSync = (op: PendingSync) => {
    try {
      const pendingRaw = localStorage.getItem(PENDING_SYNC_KEY);
      const pending: PendingSync[] = pendingRaw ? JSON.parse(pendingRaw) : [];
      pending.push(op);
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
      setPendingCloudSync(true);
    } catch {
      // Ignore
    }
  };

  // Sync a single playlist update to cloud
  const syncToCloud = async (type: 'create' | 'update' | 'delete', playlist?: Playlist, playlistId?: string) => {
    if (!isLoggedIn) return;

    if (!navigator.onLine) {
      // Queue for later
      if (type === 'delete' && playlistId) {
        queuePendingSync({ type: 'delete', playlistId });
      } else if (playlist) {
        queuePendingSync({ type, playlistId: playlist.id, data: playlist });
      }
      return;
    }

    try {
      if (type === 'delete' && playlistId) {
        const res = await fetch('/api/playlists', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: playlistId }),
        });
        if (!res.ok) throw new Error('Delete failed');
      } else if (playlist) {
        const method = type === 'create' ? 'PUT' : 'PUT';
        const res = await fetch('/api/playlists', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playlist),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.conflict) {
            setConflictNotification(
              `衝突已解決：保留${data.keptVersion === 'cloud' ? '雲端' : '本機'}版本的「${playlist.name}」`
            );
          }
        }
      }
    } catch {
      // Queue for retry
      if (type === 'delete' && playlistId) {
        queuePendingSync({ type: 'delete', playlistId });
      } else if (playlist) {
        queuePendingSync({ type, playlistId: playlist.id, data: playlist });
      }
    }
  };

  const createPlaylist = (name: string): { success: boolean; error?: string } => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: '播放清單名稱不可為空' };
    }

    const now = Date.now();
    const newPlaylist: Playlist = {
      id: `playlist-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      versions: [],
      createdAt: now,
      updatedAt: now,
    };

    const newPlaylists = [...playlists, newPlaylist];
    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      syncToCloud('create', newPlaylist);
      return { success: true };
    } else {
      return { success: false, error: STORAGE_QUOTA_ERROR };
    }
  };

  const deletePlaylist = (id: string) => {
    const newPlaylists = playlists.filter(p => p.id !== id);
    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
    syncToCloud('delete', undefined, id);
  };

  const renamePlaylist = (id: string, newName: string): { success: boolean; error?: string } => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      return { success: false, error: '播放清單名稱不可為空' };
    }

    const now = Date.now();
    const newPlaylists = playlists.map(p =>
      p.id === id ? { ...p, name: trimmedName, updatedAt: now } : p
    );

    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      const updated = newPlaylists.find(p => p.id === id);
      if (updated) syncToCloud('update', updated);
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

    const exists = playlist.versions.some(v => v.performanceId === version.performanceId);
    if (exists) {
      return { success: false, error: '此版本已在播放清單中' };
    }

    const now = Date.now();
    const newPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, versions: [...p.versions, version], updatedAt: now }
        : p
    );

    const saved = saveToLocalStorage(newPlaylists);

    if (saved) {
      setPlaylists(newPlaylists);
      const updated = newPlaylists.find(p => p.id === playlistId);
      if (updated) syncToCloud('update', updated);
      return { success: true };
    } else {
      return { success: false, error: STORAGE_QUOTA_ERROR };
    }
  };

  const removeVersionFromPlaylist = (playlistId: string, performanceId: string) => {
    const now = Date.now();
    const newPlaylists = playlists.map(p =>
      p.id === playlistId
        ? { ...p, versions: p.versions.filter(v => v.performanceId !== performanceId), updatedAt: now }
        : p
    );

    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
    const updated = newPlaylists.find(p => p.id === playlistId);
    if (updated) syncToCloud('update', updated);
  };

  const reorderVersionsInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    const now = Date.now();
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        const newVersions = [...p.versions];
        const [removed] = newVersions.splice(fromIndex, 1);
        newVersions.splice(toIndex, 0, removed);
        return { ...p, versions: newVersions, updatedAt: now };
      }
      return p;
    });

    saveToLocalStorage(newPlaylists);
    setPlaylists(newPlaylists);
    const updated = newPlaylists.find(p => p.id === playlistId);
    if (updated) syncToCloud('update', updated);
  };

  const clearStorageError = () => {
    setStorageError(null);
  };

  const clearConflictNotification = () => {
    setConflictNotification(null);
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
        showMergeDialog,
        mergeLocalCount: playlists.length,
        mergeCloudCount: pendingMergeCloud.length,
        handleMergeChoice,
        pendingCloudSync,
        isOnline,
        conflictNotification,
        clearConflictNotification,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};
