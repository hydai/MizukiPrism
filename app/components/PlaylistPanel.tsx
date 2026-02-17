'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ListMusic, GripVertical, Trash2, Play, Edit2 } from 'lucide-react';
import { usePlaylist, type Playlist } from '../contexts/PlaylistContext';
import { usePlayer, type Track } from '../contexts/PlayerContext';

interface PlaylistPanelProps {
  show: boolean;
  onClose: () => void;
  songsData: any[];
}

export default function PlaylistPanel({ show, onClose, songsData }: PlaylistPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [renameError, setRenameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { playlists, deletePlaylist, renamePlaylist, removeVersionFromPlaylist, reorderVersionsInPlaylist } = usePlaylist();
  const { playTrack, addToQueue } = usePlayer();

  // Derive selectedPlaylist from context to keep in sync with updates
  const selectedPlaylist = useMemo(
    () => playlists.find(p => p.id === selectedPlaylistId) ?? null,
    [playlists, selectedPlaylistId]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation: Escape to close playlist panel
  // Only close if the active element is not inside the panel (e.g., not while renaming)
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        const panelEl = document.querySelector('[data-testid="playlist-panel"]');
        // Only close if focus is outside the panel or on the panel itself
        const isFocusInsidePanel = panelEl && panelEl.contains(activeElement);
        if (!isFocusInsidePanel) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!mounted || !show) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && selectedPlaylist) {
      reorderVersionsInPlaylist(selectedPlaylist.id, draggedIndex, index);
    }
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.versions.length === 0) return;

    const tracks: Track[] = playlist.versions.map(v => ({
      id: v.performanceId,
      songId: v.performanceId,
      title: v.songTitle,
      originalArtist: v.originalArtist,
      videoId: v.videoId,
      timestamp: v.timestamp,
      endTimestamp: v.endTimestamp,
      deleted: !checkVersionExists(v.performanceId),
    }));

    // Find the first non-deleted track to play
    const firstPlayable = tracks.find(t => !t.deleted);
    if (!firstPlayable) {
      // All tracks are deleted — nothing to play
      return;
    }

    // Play first playable track
    playTrack(firstPlayable);

    // Add all tracks after the first playable one to queue (including deleted ones so skip logic can handle them)
    const firstPlayableIndex = tracks.indexOf(firstPlayable);
    tracks.slice(firstPlayableIndex + 1).forEach(track => addToQueue(track));
  };

  const handleRename = (playlistId: string) => {
    const result = renamePlaylist(playlistId, editName);
    if (result.success) {
      setEditingPlaylistId(null);
      setEditName('');
      setRenameError('');
    } else {
      setRenameError(result.error || '命名失敗');
    }
  };

  const handleDelete = (playlistId: string) => {
    deletePlaylist(playlistId);
    setShowDeleteConfirm(null);
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
    }
  };

  const checkVersionExists = (performanceId: string): boolean => {
    return songsData.some(song =>
      song.performances.some((p: any) => p.id === performanceId)
    );
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        data-testid="playlist-panel-backdrop"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white/10 backdrop-blur-md border-l border-white/20 shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="playlist-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-white" />
            <h2 className="text-white font-medium">
              {selectedPlaylist ? selectedPlaylist.name : '我的播放清單'}
            </h2>
            {selectedPlaylist && (
              <button
                onClick={() => setSelectedPlaylistId(null)}
                className="text-white/60 hover:text-white text-sm"
                data-testid="back-to-list"
              >
                返回
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="關閉播放清單"
            data-testid="close-playlist-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedPlaylist ? (
            // Playlist list view
            <>
              {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                  <ListMusic className="w-16 h-16 mb-4" />
                  <p className="text-center">尚無播放清單</p>
                  <p className="text-sm text-center mt-2">點擊下方按鈕建立新的播放清單</p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="playlist-list">
                  {playlists.map(playlist => (
                    <div
                      key={playlist.id}
                      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
                      data-testid={`playlist-card-${playlist.id}`}
                    >
                      {editingPlaylistId === playlist.id ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value);
                                setRenameError('');
                              }}
                              className="flex-1 bg-white/10 text-white px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-pink-400"
                              autoFocus
                              data-testid="rename-input"
                            />
                            <button
                              onClick={() => handleRename(playlist.id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                              data-testid="confirm-rename"
                            >
                              確定
                            </button>
                            <button
                              onClick={() => {
                                setEditingPlaylistId(null);
                                setEditName('');
                                setRenameError('');
                              }}
                              className="text-white/60 hover:text-white text-sm"
                            >
                              取消
                            </button>
                          </div>
                          {renameError && (
                            <p className="text-red-400 text-xs mt-1" data-testid="rename-error">
                              {renameError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <h3
                              className="text-white font-medium cursor-pointer"
                              onClick={() => setSelectedPlaylistId(playlist.id)}
                            >
                              {playlist.name}
                            </h3>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlaylistId(playlist.id);
                                  setEditName(playlist.name);
                                }}
                                className="text-white/60 hover:text-white"
                                title="重新命名"
                                data-testid="rename-button"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPlaylist(playlist);
                                }}
                                className="text-pink-400 hover:text-pink-300"
                                title="播放"
                                data-testid="play-playlist-button"
                                disabled={playlist.versions.length === 0}
                              >
                                <Play className="w-4 h-4 fill-current" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(playlist.id);
                                }}
                                className="text-red-400 hover:text-red-300"
                                title="刪除"
                                data-testid="delete-button"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-white/60 text-sm">
                              {playlist.versions.length} 首歌曲
                            </p>
                            <button
                              onClick={() => setSelectedPlaylistId(playlist.id)}
                              className="text-pink-400 hover:text-pink-300 text-sm"
                            >
                              查看 →
                            </button>
                          </div>
                        </>
                      )}

                      {/* Delete confirmation */}
                      {showDeleteConfirm === playlist.id && (
                        <div className="mt-3 p-3 bg-red-500/20 rounded border border-red-500/30">
                          <p className="text-white text-sm mb-2">確定要刪除此播放清單嗎?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(playlist.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                              data-testid="confirm-delete"
                            >
                              確定刪除
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Playlist detail view
            <>
              {selectedPlaylist.versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                  <ListMusic className="w-16 h-16 mb-4" />
                  <p className="text-center">此播放清單尚無歌曲</p>
                  <p className="text-sm text-center mt-2">從歌曲目錄中加入您喜歡的版本</p>
                </div>
              ) : (
                <div className="space-y-2" data-testid="playlist-versions">
                  {selectedPlaylist.versions.map((version, index) => {
                    const exists = checkVersionExists(version.performanceId);
                    const isDragging = draggedIndex === index;
                    const isDraggedOver = draggedOverIndex === index;

                    return (
                      <div
                        key={`${version.performanceId}-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`
                          bg-white/5 rounded-lg p-3 flex items-center gap-3 group transition-all
                          ${isDragging ? 'opacity-50' : ''}
                          ${isDraggedOver ? 'border-2 border-pink-400' : 'border-2 border-transparent'}
                          hover:bg-white/10
                        `}
                        data-testid="playlist-version-item"
                      >
                        <div className="cursor-move text-white/40 group-hover:text-white/60">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {version.songTitle}
                          </div>
                          <div className="text-white/60 text-sm truncate">
                            {version.originalArtist}
                          </div>
                          {!exists && (
                            <div className="text-red-400 text-xs mt-1" data-testid="deleted-version-marker">
                              此版本已無法播放
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeVersionFromPlaylist(selectedPlaylist.id, version.performanceId)}
                          className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                          title="移除"
                          data-testid="remove-version-button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Play all button */}
              {selectedPlaylist.versions.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => handlePlayPlaylist(selectedPlaylist)}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                    data-testid="play-all-button"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    播放全部
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
