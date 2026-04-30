'use client';

import { Clock, Heart, ListMusic, Plus } from 'lucide-react';

interface MobileLibraryTabProps {
  likedCount: number;
  recentCount: number;
  playlistCount: number;
  onOpenLikedSongs: () => void;
  onOpenRecentlyPlayed: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenPlaylists: () => void;
}

export default function MobileLibraryTab({
  likedCount,
  recentCount,
  playlistCount,
  onOpenLikedSongs,
  onOpenRecentlyPlayed,
  onOpenCreatePlaylist,
  onOpenPlaylists,
}: MobileLibraryTabProps) {
  return (
    <div
      className="lg:hidden flex-1 px-4 pt-4 pb-32"
      data-testid="mobile-library-tab"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>你的音樂庫</h2>

        <button
          onClick={onOpenLikedSongs}
          className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg font-medium text-sm transition-all mb-2"
          style={{
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}
          data-testid="mobile-liked-songs-button"
        >
          <span className="flex items-center gap-3">
            <Heart className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-pink)' }} />
            喜愛的歌曲
          </span>
          {likedCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--bg-accent-pink-muted)', color: 'var(--accent-pink)' }}
            >
              {likedCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenRecentlyPlayed}
          className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg font-medium text-sm transition-all mb-2"
          style={{
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}
          data-testid="mobile-recently-played-button"
        >
          <span className="flex items-center gap-3">
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-pink)' }} />
            最近播放
          </span>
          {recentCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--bg-accent-pink-muted)', color: 'var(--accent-pink)' }}
            >
              {recentCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenCreatePlaylist}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg font-medium text-sm transition-all"
          style={{
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}
          data-testid="mobile-create-playlist-button"
        >
          <Plus className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-pink)' }} />
          建立新播放清單
        </button>
      </div>

      {playlistCount > 0 ? (
        <div>
          <button
            onClick={onOpenPlaylists}
            className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg font-medium text-sm transition-all mb-2"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-lg)',
            }}
            data-testid="mobile-view-playlists-button"
          >
            <span className="flex items-center gap-3">
              <ListMusic className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-pink)' }} />
              查看播放清單
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--bg-accent-pink-muted)', color: 'var(--accent-pink)' }}
            >
              {playlistCount}
            </span>
          </button>
        </div>
      ) : (
        <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>尚無播放清單，立即建立一個吧！</p>
        </div>
      )}
    </div>
  );
}
