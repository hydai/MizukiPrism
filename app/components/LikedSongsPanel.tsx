'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Play, ListPlus } from 'lucide-react';
import { useLikedSongs } from '../contexts/LikedSongsContext';
import { usePlayer, type Track } from '../contexts/PlayerContext';
import AlbumArt from './AlbumArt';

interface LikedSongsPanelProps {
  show: boolean;
  onClose: () => void;
  onToast?: (message: string) => void;
}

export default function LikedSongsPanel({ show, onClose, onToast }: LikedSongsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const { likedSongs, toggleLike } = useLikedSongs();
  const { playTrack, addToQueue } = usePlayer();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!mounted || !show) return null;

  const handlePlayAll = () => {
    if (likedSongs.length === 0) return;
    const tracks: Track[] = likedSongs.map(v => ({
      id: v.performanceId,
      songId: v.performanceId,
      title: v.songTitle,
      originalArtist: v.originalArtist,
      videoId: v.videoId,
      timestamp: v.timestamp,
      endTimestamp: v.endTimestamp,
      albumArtUrl: v.albumArtUrl,
    }));
    playTrack(tracks[0]);
    tracks.slice(1).forEach(t => addToQueue(t));
  };

  const handlePlay = (v: typeof likedSongs[0]) => {
    playTrack({
      id: v.performanceId,
      songId: v.performanceId,
      title: v.songTitle,
      originalArtist: v.originalArtist,
      videoId: v.videoId,
      timestamp: v.timestamp,
      endTimestamp: v.endTimestamp,
      albumArtUrl: v.albumArtUrl,
    });
  };

  const handleAddToQueue = (v: typeof likedSongs[0]) => {
    addToQueue({
      id: v.performanceId,
      songId: v.performanceId,
      title: v.songTitle,
      originalArtist: v.originalArtist,
      videoId: v.videoId,
      timestamp: v.timestamp,
      endTimestamp: v.endTimestamp,
      albumArtUrl: v.albumArtUrl,
    });
    onToast?.('已加入待播清單');
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        data-testid="liked-songs-panel-backdrop"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white/10 backdrop-blur-md border-l border-white/20 shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="liked-songs-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-current" />
            <h2 className="text-white font-medium">喜愛的歌曲</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="關閉喜愛的歌曲"
            data-testid="close-liked-songs-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {likedSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/60">
              <Heart className="w-16 h-16 mb-4" />
              <p className="text-center">尚無喜愛的歌曲</p>
              <p className="text-sm text-center mt-2">點擊愛心圖示來收藏喜歡的歌曲</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="liked-songs-list">
              {likedSongs.map((version) => (
                <div
                  key={version.performanceId}
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 group hover:bg-white/10 transition-colors"
                  data-testid="liked-song-item"
                >
                  <AlbumArt
                    src={version.albumArtUrl}
                    alt={`${version.songTitle} - ${version.originalArtist}`}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {version.songTitle}
                    </div>
                    <div className="text-white/60 text-sm truncate">
                      {version.originalArtist}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlay(version)}
                      className="text-pink-400 hover:text-pink-300 p-1.5"
                      title="播放"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAddToQueue(version)}
                      className="text-white/60 hover:text-white p-1.5"
                      title="加入待播清單"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleLike(version)}
                    className="text-pink-400 hover:text-pink-300 flex-shrink-0 p-1"
                    title="取消喜愛"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Play all button */}
          {likedSongs.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handlePlayAll}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                data-testid="play-all-liked-button"
              >
                <Play className="w-5 h-5 fill-current" />
                播放全部
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
