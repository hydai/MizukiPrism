'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Play, ListPlus, Trash2 } from 'lucide-react';
import { useRecentlyPlayed } from '../contexts/RecentlyPlayedContext';
import { usePlayer, type Track } from '../contexts/PlayerContext';
import AlbumArt from './AlbumArt';

interface RecentlyPlayedPanelProps {
  show: boolean;
  onClose: () => void;
  onToast?: (message: string) => void;
}

function formatRelativeTime(playedAt: number): string {
  const diff = Date.now() - playedAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return `${Math.floor(days / 7)} 週前`;
}

export default function RecentlyPlayedPanel({ show, onClose, onToast }: RecentlyPlayedPanelProps) {
  const [mounted, setMounted] = useState(false);
  const { recentPlays, clearHistory } = useRecentlyPlayed();
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
    if (recentPlays.length === 0) return;
    const tracks: Track[] = recentPlays.map(r => ({
      id: r.performanceId,
      songId: r.performanceId,
      title: r.songTitle,
      originalArtist: r.originalArtist,
      videoId: r.videoId,
      timestamp: r.timestamp,
      endTimestamp: r.endTimestamp,
      albumArtUrl: r.albumArtUrl,
    }));
    playTrack(tracks[0]);
    tracks.slice(1).forEach(t => addToQueue(t));
  };

  const handlePlay = (r: typeof recentPlays[0]) => {
    playTrack({
      id: r.performanceId,
      songId: r.performanceId,
      title: r.songTitle,
      originalArtist: r.originalArtist,
      videoId: r.videoId,
      timestamp: r.timestamp,
      endTimestamp: r.endTimestamp,
      albumArtUrl: r.albumArtUrl,
    });
  };

  const handleAddToQueue = (r: typeof recentPlays[0]) => {
    addToQueue({
      id: r.performanceId,
      songId: r.performanceId,
      title: r.songTitle,
      originalArtist: r.originalArtist,
      videoId: r.videoId,
      timestamp: r.timestamp,
      endTimestamp: r.endTimestamp,
      albumArtUrl: r.albumArtUrl,
    });
    onToast?.('已加入待播清單');
  };

  const handleClearAll = () => {
    clearHistory();
    onToast?.('播放紀錄已清除');
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        data-testid="recently-played-panel-backdrop"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white/10 backdrop-blur-md border-l border-white/20 shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="recently-played-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <h2 className="text-white font-medium">最近播放</h2>
          </div>
          <div className="flex items-center gap-2">
            {recentPlays.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-white/60 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
                data-testid="clear-history-button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清除全部
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="關閉最近播放"
              data-testid="close-recently-played-panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {recentPlays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/60">
              <Clock className="w-16 h-16 mb-4" />
              <p className="text-center">尚無播放紀錄</p>
              <p className="text-sm text-center mt-2">播放歌曲後會自動記錄在此</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="recently-played-list">
              {recentPlays.map((entry) => (
                <div
                  key={`${entry.performanceId}-${entry.playedAt}`}
                  className="bg-white/5 rounded-lg p-3 flex items-center gap-3 group hover:bg-white/10 transition-colors"
                  data-testid="recently-played-item"
                >
                  <AlbumArt
                    src={entry.albumArtUrl}
                    alt={`${entry.songTitle} - ${entry.originalArtist}`}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {entry.songTitle}
                    </div>
                    <div className="text-white/60 text-sm truncate">
                      {entry.originalArtist}
                    </div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {formatRelativeTime(entry.playedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlay(entry)}
                      className="text-pink-400 hover:text-pink-300 p-1.5"
                      title="播放"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => handleAddToQueue(entry)}
                      className="text-white/60 hover:text-white p-1.5"
                      title="加入待播清單"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Play all button */}
          {recentPlays.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handlePlayAll}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                data-testid="play-all-recent-button"
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
