'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, MoreHorizontal, Music2, Share2 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useLikedSongs } from '../contexts/LikedSongsContext';
import { useRecentlyPlayed } from '../contexts/RecentlyPlayedContext';
import AlbumArt from '../components/AlbumArt';
import NowPlayingControls from '../components/NowPlayingControls';
import UpNextSection from '../components/UpNextSection';
import SidebarNav from '../components/SidebarNav';
import SyncedLyrics from '../components/SyncedLyrics';
import LikedSongsPanel from '../components/LikedSongsPanel';
import RecentlyPlayedPanel from '../components/RecentlyPlayedPanel';
import Toast from '../components/Toast';
import Link from 'next/link';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function NowPlayingPage() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    trackCurrentTime,
    trackDuration,
    seekTo,
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showLikedSongsPanel, setShowLikedSongsPanel] = useState(false);
  const [showRecentlyPlayedPanel, setShowRecentlyPlayedPanel] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { likedCount } = useLikedSongs();
  const { recentCount } = useRecentlyPlayed();

  const hasKnownDuration = trackDuration != null && trackDuration > 0;
  const progress = hasKnownDuration
    ? (trackCurrentTime / trackDuration) * 100
    : 0;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasKnownDuration || !currentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = currentTrack.timestamp + trackDuration * percentage;
    seekTo(newTime);
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    const url = `https://www.youtube.com/watch?v=${currentTrack.videoId}&t=${Math.floor(currentTrack.timestamp)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${currentTrack.title} - ${currentTrack.originalArtist}`, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // Keyboard: Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Empty state
  if (!currentTrack) {
    return (
      <div
        data-testid="now-playing-page"
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--bg-page-start), #F0F8FF, var(--bg-page-end))',
        }}
      >
        <div className="text-center" style={{ padding: '32px' }}>
          <div
            className="mx-auto mb-6 flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
            }}
          >
            <Music2 style={{ width: '48px', height: '48px', color: 'white' }} />
          </div>
          <p
            data-testid="now-playing-empty"
            style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '16px' }}
          >
            目前沒有播放中的歌曲
          </p>
          <Link
            href="/"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--accent-pink)',
              textDecoration: 'none',
            }}
          >
            Browse the catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="now-playing-page"
      className="flex min-h-screen"
      style={{
        background: 'linear-gradient(180deg, var(--bg-page-start), #F0F8FF, var(--bg-page-end))',
      }}
    >
      {/* Desktop sidebar */}
      <SidebarNav
        activePage="now-playing"
        onViewLikedSongs={() => setShowLikedSongsPanel(true)}
        likedSongsCount={likedCount}
        onViewRecentlyPlayed={() => setShowRecentlyPlayedPanel(true)}
        recentlyPlayedCount={recentCount}
      />

      {/* ─── MOBILE LAYOUT (<lg) ─── */}
      <div className="flex flex-col flex-1 lg:hidden" style={{ minHeight: '100vh' }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '16px 20px' }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Back"
            data-testid="np-back-button"
            style={{ color: 'var(--text-primary)', padding: '4px' }}
          >
            <ChevronDown style={{ width: '28px', height: '28px' }} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Now Playing
          </span>
          <button
            aria-label="More options"
            style={{ color: 'var(--text-secondary)', padding: '4px' }}
          >
            <MoreHorizontal style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px', gap: '24px' }}>
          {/* Album art */}
          <AlbumArt
            src={currentTrack.albumArtUrl}
            alt={`${currentTrack.title} - ${currentTrack.originalArtist}`}
            size={320}
            borderRadius={32}
          />

          {/* Song info */}
          <div className="text-center w-full" style={{ marginTop: '8px' }}>
            <h1
              className="truncate"
              style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              {currentTrack.title}
            </h1>
            <div className="flex items-center justify-center" style={{ gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '16px', color: '#64748B' }}>
                {currentTrack.originalArtist}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full" style={{ marginTop: '8px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '36px', textAlign: 'right' }}>
                {formatTime(trackCurrentTime)}
              </span>
              <div
                className="flex-1 cursor-pointer relative group"
                style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-surface-muted)' }}
                onClick={handleProgressClick}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${clampedProgress}%`,
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, var(--accent-pink-light), var(--accent-blue-light))',
                    transition: 'width 0.2s',
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    left: `${clampedProgress}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'white',
                    border: '2px solid var(--accent-pink-light)',
                  }}
                />
              </div>
              <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '36px' }}>
                {hasKnownDuration ? formatTime(trackDuration) : '--:--'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <NowPlayingControls size="mobile" />

          {/* Bottom actions: Lyrics + Share */}
          <div className="flex items-center justify-between w-full" style={{ marginTop: '16px', padding: '0 16px' }}>
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="flex items-center transition-colors"
              style={{
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: showLyrics ? 'var(--accent-pink)' : 'var(--text-secondary)',
                padding: '8px 12px',
                borderRadius: '8px',
                background: showLyrics ? 'var(--bg-accent-pink)' : 'transparent',
              }}
              aria-label="Toggle lyrics"
            >
              <Music2 style={{ width: '18px', height: '18px' }} />
              Lyrics
            </button>
            <button
              onClick={handleShare}
              className="flex items-center transition-colors"
              style={{
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
              aria-label="Share"
            >
              Share
              <Share2 style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Lyrics overlay (mobile) */}
        {showLyrics && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '60px 16px 16px',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Lyrics</h3>
              <button
                onClick={() => setShowLyrics(false)}
                style={{ fontSize: '14px', color: 'white', padding: '8px' }}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SyncedLyrics songId={currentTrack.songId} currentTime={trackCurrentTime} />
            </div>
          </div>
        )}
      </div>

      {/* ─── DESKTOP LAYOUT (lg+) ─── */}
      <main
        className="hidden lg:flex flex-1 flex-col items-center justify-center"
        style={{ padding: '40px', gap: '28px', overflowY: 'auto' }}
      >
        {/* Album art */}
        <AlbumArt
          src={currentTrack.albumArtUrl}
          alt={`${currentTrack.title} - ${currentTrack.originalArtist}`}
          size={400}
          borderRadius={24}
        />

        {/* Song info */}
        <div className="text-center">
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentTrack.title}
          </h1>
          <div className="flex items-center justify-center" style={{ gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '16px', color: '#64748B' }}>
              {currentTrack.originalArtist}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '400px' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '36px', textAlign: 'right' }}>
              {formatTime(trackCurrentTime)}
            </span>
            <div
              className="flex-1 cursor-pointer relative group"
              style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-surface-muted)' }}
              onClick={handleProgressClick}
            >
              <div
                style={{
                  height: '100%',
                  width: `${clampedProgress}%`,
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, var(--accent-pink-light), var(--accent-blue-light))',
                  transition: 'width 0.2s',
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${clampedProgress}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'white',
                  border: '2px solid var(--accent-pink-light)',
                }}
              />
            </div>
            <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-tertiary)', minWidth: '36px' }}>
              {hasKnownDuration ? formatTime(trackDuration) : '--:--'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <NowPlayingControls size="desktop" />

        {/* Up Next section */}
        <UpNextSection />
      </main>

      <Toast message={toastMessage} show={showToast} onHide={() => setShowToast(false)} />
      <LikedSongsPanel
        show={showLikedSongsPanel}
        onClose={() => setShowLikedSongsPanel(false)}
        onToast={(msg) => { setToastMessage(msg); setShowToast(true); }}
      />
      <RecentlyPlayedPanel
        show={showRecentlyPlayedPanel}
        onClose={() => setShowRecentlyPlayedPanel(false)}
        onToast={(msg) => { setToastMessage(msg); setShowToast(true); }}
      />
    </div>
  );
}
