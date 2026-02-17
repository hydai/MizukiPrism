'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Play, ExternalLink, Mic2, Youtube, Twitter, Sparkles, Home as HomeIcon, ListMusic, Clock, Heart, LayoutList, Disc3, ChevronDown, ChevronRight, Plus, ListPlus, X, SlidersHorizontal, LogIn, LogOut, User, WifiOff, Menu } from 'lucide-react';
import streamerData from '@/data/streamer.json';
import { usePlayer } from './contexts/PlayerContext';
import { usePlaylist } from './contexts/PlaylistContext';
import { useFanAuth } from './contexts/FanAuthContext';
import Toast from './components/Toast';
import PlaylistPanel from './components/PlaylistPanel';
import CreatePlaylistDialog from './components/CreatePlaylistDialog';
import AddToPlaylistDropdown from './components/AddToPlaylistDropdown';

interface Performance {
  id: string;
  streamId?: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number | null;
  note: string;
}

interface Song {
  id: string;
  title: string;
  originalArtist: string;
  tags: string[];
  performances: Performance[];
}

interface FlattenedSong extends Song {
  performanceId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  note: string;
  searchString: string;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

type ViewMode = 'timeline' | 'grouped';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadError, setLoadError] = useState(false);

  // Fetch songs from API — extracted so the retry button can call it again
  const fetchSongs = () => {
    fetch('/api/songs')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setSongs(data);
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
      });
  };

  useEffect(() => {
    fetchSongs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { currentTrack, playTrack, addToQueue, apiLoadError, unavailableVideoIds, timestampWarning, clearTimestampWarning, skipNotification, clearSkipNotification } = usePlayer();
  const { playlists, storageError, clearStorageError, isOnline, conflictNotification, clearConflictNotification } = usePlaylist();
  const { user, isLoggedIn, logout } = useFanAuth();

  const handleAddToQueue = (track: { id: string; songId: string; title: string; originalArtist: string; videoId: string; timestamp: number }) => {
    addToQueue(track);
    setToastMessage('已加入播放佇列');
    setShowToast(true);
  };

  const handleAddToPlaylistSuccess = () => {
    setToastMessage('已加入播放清單');
    setShowToast(true);
  };

  // Show storage error toast
  useEffect(() => {
    if (storageError) {
      setToastMessage(storageError);
      setShowToast(true);
      clearStorageError();
    }
  }, [storageError, clearStorageError]);

  // Show conflict notification toast
  useEffect(() => {
    if (conflictNotification) {
      setToastMessage(conflictNotification);
      setShowToast(true);
      clearConflictNotification();
    }
  }, [conflictNotification, clearConflictNotification]);

  // Show timestamp warning toast
  useEffect(() => {
    if (timestampWarning) {
      setToastMessage(timestampWarning);
      setShowToast(true);
      clearTimestampWarning();
    }
  }, [timestampWarning, clearTimestampWarning]);

  // Show skip notification toast (deleted version skipped or playlist ended)
  useEffect(() => {
    if (skipNotification) {
      setToastMessage(skipNotification);
      setShowToast(true);
      clearSkipNotification();
    }
  }, [skipNotification, clearSkipNotification]);

  // Load view preference from sessionStorage
  useEffect(() => {
    const savedView = sessionStorage.getItem('mizukiprism-view-mode');
    if (savedView === 'timeline' || savedView === 'grouped') {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('mizukiprism-view-mode', viewMode);
  }, [viewMode]);

  const toggleSongExpansion = (songId: string) => {
    setExpandedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    songs.forEach(song => song.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [songs]);

  const allArtists = useMemo(() => {
    const artists = new Set<string>();
    songs.forEach(song => artists.add(song.originalArtist));
    return Array.from(artists).sort((a, b) => a.localeCompare(b, 'zh-TW'));
  }, [songs]);

  const hasActiveFilters = searchTerm !== '' || selectedTag !== null || selectedArtist !== null || dateFrom !== '' || dateTo !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
    setSelectedArtist(null);
    setDateFrom('');
    setDateTo('');
  };

  const flattenedSongs: FlattenedSong[] = useMemo(() => {
    let result: FlattenedSong[] = [];
    songs.forEach(song => {
      song.performances.forEach(perf => {
        result.push({
          ...song,
          performanceId: perf.id,
          date: perf.date,
          streamTitle: perf.streamTitle,
          videoId: perf.videoId,
          timestamp: perf.timestamp,
          note: perf.note,
          searchString: `${song.title} ${song.originalArtist} ${perf.streamTitle}`.toLowerCase()
        });
      });
    });
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result.filter(song => {
      const lowerTerm = searchTerm.toLowerCase();
      const matchesSearch = song.searchString.includes(lowerTerm);
      const matchesTag = selectedTag ? song.tags.includes(selectedTag) : true;
      const matchesArtist = selectedArtist ? song.originalArtist === selectedArtist : true;
      const matchesDateFrom = dateFrom ? song.date >= dateFrom : true;
      const matchesDateTo = dateTo ? song.date <= dateTo : true;
      return matchesSearch && matchesTag && matchesArtist && matchesDateFrom && matchesDateTo;
    });
  }, [songs, searchTerm, selectedTag, selectedArtist, dateFrom, dateTo]);

  // Grouped songs for song-grouped view
  const groupedSongs: Song[] = useMemo(() => {
    return songs
      .filter(song => {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesSearch = `${song.title} ${song.originalArtist}`.toLowerCase().includes(lowerTerm);
        const matchesTag = selectedTag ? song.tags.includes(selectedTag) : true;
        const matchesArtist = selectedArtist ? song.originalArtist === selectedArtist : true;
        // For grouped view, filter by date range: show song if any performance is within range
        const matchesDate = (dateFrom || dateTo) ? song.performances.some(perf => {
          const matchesDateFrom = dateFrom ? perf.date >= dateFrom : true;
          const matchesDateTo = dateTo ? perf.date <= dateTo : true;
          return matchesDateFrom && matchesDateTo;
        }) : true;
        return matchesSearch && matchesTag && matchesArtist && matchesDate;
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-TW'));
  }, [songs, searchTerm, selectedTag, selectedArtist, dateFrom, dateTo]);

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500";

  return (
    <>
      <Toast message={toastMessage} show={showToast} onHide={() => setShowToast(false)} />
      {/* API Load Error Banner */}
      {apiLoadError && (
        <div
          data-testid="api-load-error"
          className="fixed top-0 left-0 right-0 z-[300] bg-red-500 text-white px-6 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="font-bold text-sm">{apiLoadError}</span>
        </div>
      )}
      <div className="flex h-screen bg-gradient-to-br from-[#fff0f5] via-[#f0f8ff] to-[#e6e6fa] text-slate-600 font-sans selection:bg-pink-200 selection:text-pink-900 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-page-start) 0%, var(--bg-page-mid) 50%, var(--bg-page-end) 100%)' }}>

      {/* Sidebar */}
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col flex-shrink-0 hidden lg:flex shadow-sm z-20 overflow-hidden" style={{ background: 'var(--bg-surface-frosted)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRight: '1px solid var(--border-glass)' }}>

        {/* ── 1. Logo Area ── */}
        <div className="px-5 py-5 flex items-center gap-3 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-radius-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))' }}
          >
            <Disc3 className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-bold text-xl tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-pink), var(--accent-blue))' }}
          >
            MizukiPlay
          </span>
        </div>

        {/* ── 2. Search Box ── */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className="w-4 h-4 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              />
            </div>
            <input
              type="text"
              placeholder="搜尋歌曲..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full font-medium py-2.5 pl-9 pr-4 outline-none transition-all text-sm"
              style={{
                background: 'var(--bg-surface-glass)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-3 space-y-1 pb-3">

          {/* ── 3. DISCOVER Section ── */}
          <div className="pt-2 pb-1">
            {/* Section Header */}
            <div
              className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
            >
              DISCOVER
            </div>

            {/* Home – NavItem/Active or NavItem/Default */}
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all"
              style={
                !hasActiveFilters
                  ? {
                      background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                      color: 'var(--text-on-accent)',
                    }
                  : {
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              <HomeIcon className="w-4 h-4 flex-shrink-0" />
              首頁
            </button>

            {/* Browse – NavItem/Default */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
              style={{ background: 'transparent', color: 'var(--text-secondary)' }}
            >
              <LayoutList className="w-4 h-4 flex-shrink-0" />
              瀏覽
            </button>

            {/* Trending – NavItem/Default */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
              style={{ background: 'transparent', color: 'var(--text-secondary)' }}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              熱門
            </button>
          </div>

          {/* ── 4. YOUR LIBRARY Section ── */}
          <div className="pt-2 pb-1">
            {/* Section Header */}
            <div
              className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
            >
              YOUR LIBRARY
            </div>

            {/* Liked Songs */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
              style={{ background: 'transparent', color: 'var(--text-secondary)' }}
            >
              <Heart className="w-4 h-4 flex-shrink-0" />
              喜愛的歌曲
            </button>

            {/* Recently Played */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
              style={{ background: 'transparent', color: 'var(--text-secondary)' }}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              最近播放
            </button>

            {/* Create Playlist */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
              style={{ background: 'transparent', color: 'var(--text-secondary)' }}
              data-testid="create-playlist-button"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              建立新播放清單
            </button>

            {/* View Playlists */}
            {playlists.length > 0 && (
              <button
                onClick={() => setShowPlaylistPanel(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40"
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                data-testid="view-playlists-button"
              >
                <span className="flex items-center gap-3">
                  <ListMusic className="w-4 h-4 flex-shrink-0" />
                  查看播放清單
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--bg-accent-pink-muted)', color: 'var(--accent-pink)' }}
                >
                  {playlists.length}
                </span>
              </button>
            )}

          </div>

          {/* ── Filters Section (collapsible visual, always functional) ── */}
          <div className="pt-2 pb-1">
            <div
              className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
            >
              <SlidersHorizontal className="w-3 h-3" />
              篩選條件
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs font-medium transition-colors"
                  style={{ color: 'var(--accent-pink)', fontSize: 'var(--font-size-xs)' }}
                  data-testid="clear-all-filters"
                >
                  清除全部
                </button>
              )}
            </div>

            {/* Artist dropdown */}
            <div className="relative px-1 mb-2">
              <select
                value={selectedArtist ?? ''}
                onChange={(e) => setSelectedArtist(e.target.value || null)}
                className="w-full font-medium py-2 px-3 outline-none appearance-none text-sm cursor-pointer transition-all"
                style={{
                  background: 'var(--bg-surface-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                }}
                data-testid="artist-filter"
              >
                <option value="">全部歌手</option>
                {allArtists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-1.5 px-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full font-medium py-2 px-3 outline-none text-sm transition-all"
                style={{
                  background: 'var(--bg-surface-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                }}
                data-testid="date-from"
                placeholder="開始日期"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full font-medium py-2 px-3 outline-none text-sm transition-all"
                style={{
                  background: 'var(--bg-surface-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                }}
                data-testid="date-to"
                placeholder="結束日期"
              />
            </div>
          </div>

          {/* ── Tags Section ── */}
          <div className="pt-2 pb-2">
            <div
              className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}
            >
              風格分類
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all"
              style={
                selectedTag === null
                  ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' }
                  : { color: 'var(--text-secondary)', background: 'transparent' }
              }
            >
              全部歌曲
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all hover:bg-white/40"
                style={
                  selectedTag === tag
                    ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' }
                    : { color: 'var(--text-secondary)', background: 'transparent' }
                }
              >
                #{tag}
              </button>
            ))}
          </div>

        </div>
        {/* ── End scrollable body ── */}

        {/* ── 5. User Footer ── */}
        <div
          className="flex-shrink-0 px-3 py-3 border-t"
          style={{ borderTop: '1px solid var(--border-glass)' }}
        >
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              {/* Avatar with gradient border */}
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center p-0.5"
                style={{ background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))' }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-surface-frosted)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--accent-pink)' }} />
                </div>
              </div>
              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                  data-testid="logged-in-username"
                >
                  {user.username}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isOnline ? (
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 'var(--font-size-xs)' }}
                    >
                      Online
                    </span>
                  ) : (
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: '#FEF9C3', color: '#CA8A04', fontSize: 'var(--font-size-xs)' }}
                    >
                      <WifiOff className="w-2.5 h-2.5" />
                      離線
                    </span>
                  )}
                </div>
              </div>
              {/* Logout button */}
              <button
                onClick={async () => {
                  await logout();
                  setToastMessage('已登出');
                  setShowToast(true);
                }}
                className="p-1.5 rounded-radius-sm transition-all hover:bg-white/50"
                style={{ color: 'var(--text-tertiary)' }}
                data-testid="logout-button"
                title="登出"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/auth"
              className="flex items-center gap-3 px-3 py-2.5 rounded-radius-lg text-sm font-medium transition-all hover:bg-white/40 w-full"
              style={{ color: 'var(--text-secondary)' }}
              data-testid="login-button"
            >
              {/* Guest avatar placeholder */}
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center p-0.5"
                style={{ background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))' }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-surface-frosted)' }}
                >
                  <LogIn className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>登入</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>訪客模式</div>
              </div>
            </a>
          )}
          {/* Attribution */}
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
            Made with <Heart className="w-3 h-3 inline text-pink-400 fill-current" /> for Mizuki
          </p>
        </div>

      </aside>

      {/* Mobile Sidebar Overlay — slide-over panel on mobile (hidden lg) */}
      {showMobileSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
            onClick={() => setShowMobileSidebar(false)}
          />
          {/* Slide-over sidebar */}
          <aside
            className="lg:hidden fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden"
            style={{
              width: '280px',
              background: 'var(--bg-surface-frosted)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRight: '1px solid var(--border-glass)',
            }}
            data-testid="mobile-sidebar"
          >
            {/* Close button */}
            <div className="px-4 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-radius-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))' }}
                >
                  <Disc3 className="w-5 h-5 text-white" />
                </div>
                <span
                  className="font-bold text-xl tracking-tight bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-pink), var(--accent-blue))' }}
                >
                  MizukiPlay
                </span>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-3 space-y-1 pb-3">
              {/* Search */}
              <div className="relative group pb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <input
                  type="text"
                  placeholder="搜尋歌曲..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full font-medium py-2.5 pl-9 pr-4 outline-none transition-all text-sm"
                  style={{
                    background: 'var(--bg-surface-glass)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* DISCOVER Section */}
              <div className="pt-2 pb-1">
                <div className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>DISCOVER</div>
                <button onClick={() => { clearAllFilters(); setShowMobileSidebar(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all" style={!hasActiveFilters ? { background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))', color: 'var(--text-on-accent)' } : { background: 'transparent', color: 'var(--text-secondary)' }}>
                  <HomeIcon className="w-4 h-4 flex-shrink-0" />首頁
                </button>
              </div>

              {/* YOUR LIBRARY Section */}
              <div className="pt-2 pb-1">
                <div className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>YOUR LIBRARY</div>
                <button onClick={() => { setShowCreateDialog(true); setShowMobileSidebar(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40" style={{ background: 'transparent', color: 'var(--text-secondary)' }} data-testid="mobile-create-playlist-button">
                  <Plus className="w-4 h-4 flex-shrink-0" />建立新播放清單
                </button>
                {playlists.length > 0 && (
                  <button onClick={() => { setShowPlaylistPanel(true); setShowMobileSidebar(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-radius-lg font-medium text-sm transition-all hover:bg-white/40" style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-3"><ListMusic className="w-4 h-4 flex-shrink-0" />查看播放清單</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-accent-pink-muted)', color: 'var(--accent-pink)' }}>{playlists.length}</span>
                  </button>
                )}
              </div>

              {/* Tag filters */}
              <div className="pt-2 pb-2">
                <div className="px-3 py-1.5 mb-1 font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>風格分類</div>
                <button onClick={() => { setSelectedTag(null); setShowMobileSidebar(false); }} className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all" style={selectedTag === null ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' } : { color: 'var(--text-secondary)', background: 'transparent' }}>全部歌曲</button>
                {allTags.map(tag => (
                  <button key={tag} onClick={() => { setSelectedTag(tag === selectedTag ? null : tag); setShowMobileSidebar(false); }} className="w-full text-left px-3 py-2 rounded-radius-lg text-sm font-medium transition-all hover:bg-white/40" style={selectedTag === tag ? { color: 'var(--accent-pink)', background: 'var(--bg-accent-pink)' } : { color: 'var(--text-secondary)', background: 'transparent' }}>#{tag}</button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-3 py-3 border-t" style={{ borderTop: '1px solid var(--border-glass)' }}>
              {isLoggedIn && user ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center p-0.5" style={{ background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))' }}>
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--bg-surface-frosted)' }}>
                      <User className="w-4 h-4" style={{ color: 'var(--accent-pink)' }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.username}</div>
                  </div>
                  <button onClick={async () => { await logout(); setShowMobileSidebar(false); setToastMessage('已登出'); setShowToast(true); }} className="p-1.5 rounded-radius-sm" style={{ color: 'var(--text-tertiary)' }} data-testid="mobile-logout-button">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <a href="/auth" className="flex items-center gap-3 px-3 py-2.5 rounded-radius-lg text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <LogIn className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />登入
                </a>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:m-3 lg:rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-100/50 bg-white/40 backdrop-blur-md border border-white/60 flex flex-col" style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-3xl)' }}>

        {/* Decorative glows */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">

          {/* Hero Section - Streamer Profile (~280px height) */}
          <header
            className="relative flex items-center gap-8 overflow-hidden flex-shrink-0"
            style={{
              minHeight: '280px',
              padding: '40px 40px 0 40px',
              borderBottom: '1px solid var(--border-glass)',
            }}
          >
            {/* Left: Avatar */}
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                alignSelf: 'flex-end',
                marginBottom: '40px',
              }}
            >
              <img
                src={streamerData.avatarUrl}
                alt={streamerData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                  }
                }}
              />
            </div>

            {/* Right: Info Stack */}
            <div
              className="flex flex-col justify-end flex-1 min-w-0"
              style={{
                paddingBottom: '40px',
                gap: '8px',
              }}
            >
              {/* VerifiedBadge Component */}
              <div
                className="flex items-center gap-1.5 w-fit"
                style={{
                  background: 'var(--bg-accent-blue-muted)',
                  color: 'var(--accent-blue)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 12px 4px 8px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 0L7.545 4.455L12 6L7.545 7.545L6 12L4.455 7.545L0 6L4.455 4.455L6 0Z" fill="currentColor" />
                </svg>
                認證藝人
              </div>

              {/* Streamer Name */}
              <h1
                className="tracking-tight leading-none"
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}
              >
                {streamerData.name}
              </h1>

              {/* Description / Stats Text */}
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-base)',
                  maxWidth: '480px',
                  lineHeight: 1.5,
                  margin: '2px 0',
                }}
              >
                {streamerData.description}
                {' '}
                <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                {' '}
                <span style={{ fontWeight: 600 }}>{flattenedSongs.length} 首歌曲</span>
              </p>

              {/* Statistics Row: Followers + Rank */}
              <div
                className="flex items-center gap-6"
                style={{ fontSize: 'var(--font-size-base)', marginTop: '4px' }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-xl)' }}
                  >
                    50萬+
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    追蹤者
                  </span>
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '16px',
                    background: 'var(--border-default)',
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <span
                    style={{ fontWeight: 700, color: 'var(--accent-pink)', fontSize: 'var(--font-size-xl)' }}
                  >
                    #12
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    排名
                  </span>
                </div>
              </div>

              {/* Social Links Row */}
              <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                {/* YouTube SocialButton */}
                <a
                  href={streamerData.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-all hover:opacity-80"
                  style={{
                    background: 'var(--bg-surface-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 14px 6px 10px',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <Youtube className="w-4 h-4" style={{ color: '#FF0000' }} />
                  YouTube
                </a>
                {/* Twitter SocialButton */}
                <a
                  href={streamerData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-all hover:opacity-80"
                  style={{
                    background: 'var(--bg-surface-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 14px 6px 10px',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <Twitter className="w-4 h-4" style={{ color: '#1DA1F2' }} />
                  Twitter
                </a>
              </div>
            </div>

            {/* Bottom gradient overlay: white fading to transparent from bottom up */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '60px',
                background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, transparent 100%)',
              }}
            />
          </header>

          {/* Action Bar */}
          <div
            className="sticky top-0 z-20 px-6 flex items-center gap-3 flex-wrap"
            style={{
              background: 'var(--bg-overlay)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTop: '1px solid var(--border-glass)',
              borderBottom: '1px solid var(--border-glass)',
              minHeight: '64px',
              paddingTop: '10px',
              paddingBottom: '10px',
            }}
          >
            {/* Left side: Play Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Hamburger menu — mobile only (hidden lg) */}
              <button
                className="lg:hidden flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-secondary)',
                }}
                onClick={() => setShowMobileSidebar(true)}
                aria-label="Open menu"
                data-testid="mobile-menu-button"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* PlayButton — 48×48 circular gradient play button */}
              <button
                className="bg-gradient-to-r from-pink-400 to-blue-400 text-white flex items-center justify-center transition-all hover:scale-105 hover:brightness-110 flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-circle)',
                  background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                  boxShadow: '0 4px 16px rgba(244, 114, 182, 0.35)',
                }}
                title="播放全部"
                onClick={() => {
                  const firstSong = viewMode === 'timeline' ? flattenedSongs[0] : (() => {
                    const first = groupedSongs[0];
                    if (!first || !first.performances.length) return null;
                    const sorted = [...first.performances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return { ...first, performanceId: sorted[0].id, videoId: sorted[0].videoId, timestamp: sorted[0].timestamp };
                  })();
                  if (firstSong && !unavailableVideoIds.has(firstSong.videoId)) {
                    playTrack({
                      id: firstSong.performanceId,
                      songId: firstSong.id,
                      title: firstSong.title,
                      originalArtist: firstSong.originalArtist,
                      videoId: firstSong.videoId,
                      timestamp: firstSong.timestamp,
                    });
                  }
                }}
              >
                <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />
              </button>

              {/* GradientButton — "播放全部" pill */}
              <button
                className="font-semibold text-white flex items-center gap-1.5 transition-all hover:opacity-90 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--font-size-sm)',
                  padding: 'var(--space-3) var(--space-5)',
                  color: 'var(--text-on-accent)',
                }}
                onClick={() => {
                  const firstSong = viewMode === 'timeline' ? flattenedSongs[0] : (() => {
                    const first = groupedSongs[0];
                    if (!first || !first.performances.length) return null;
                    const sorted = [...first.performances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return { ...first, performanceId: sorted[0].id, videoId: sorted[0].videoId, timestamp: sorted[0].timestamp };
                  })();
                  if (firstSong && !unavailableVideoIds.has(firstSong.videoId)) {
                    playTrack({
                      id: firstSong.performanceId,
                      songId: firstSong.id,
                      title: firstSong.title,
                      originalArtist: firstSong.originalArtist,
                      videoId: firstSong.videoId,
                      timestamp: firstSong.timestamp,
                    });
                  }
                }}
              >
                播放全部
              </button>

              {/* OutlineButton — "追蹤" follow link (secondary action) */}
              <a
                href={streamerData.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold flex items-center gap-1.5 transition-all hover:opacity-80 flex-shrink-0"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--font-size-sm)',
                  padding: 'var(--space-3) var(--space-5)',
                  color: 'var(--text-secondary)',
                }}
              >
                追蹤
              </a>

              {/* View Mode Toggle — restyled to match design language */}
              <div
                className="hidden lg:flex items-center gap-1 flex-shrink-0"
                style={{
                  background: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <button
                  data-testid="view-toggle-timeline"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 font-semibold transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-md'
                      : ''
                  }`}
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--font-size-sm)',
                    padding: 'var(--space-2) var(--space-4)',
                    color: viewMode === 'timeline' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  時間序列
                </button>
                <button
                  data-testid="view-toggle-grouped"
                  onClick={() => setViewMode('grouped')}
                  className={`flex items-center gap-1.5 font-semibold transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-md'
                      : ''
                  }`}
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--font-size-sm)',
                    padding: 'var(--space-2) var(--space-4)',
                    color: viewMode === 'grouped' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Disc3 className="w-3.5 h-3.5" />
                  歌曲分組
                </button>
              </div>
            </div>

            {/* Flexible spacer */}
            <div className="flex-1 hidden lg:block" />

            {/* Right side: Tag Filter Chips */}
            <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
              {/* "全部" chip */}
              <button
                onClick={() => setSelectedTag(null)}
                className="font-medium transition-all"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--font-size-sm)',
                  padding: 'var(--space-2) var(--space-4)',
                  ...(selectedTag === null
                    ? {
                        background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                        color: 'var(--text-on-accent)',
                      }
                    : {
                        background: 'var(--bg-surface-muted)',
                        color: 'var(--text-secondary)',
                      }),
                }}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="font-medium transition-all"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--font-size-sm)',
                    padding: 'var(--space-2) var(--space-4)',
                    ...(selectedTag === tag
                      ? {
                          background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                          color: 'var(--text-on-accent)',
                        }
                      : {
                          background: 'var(--bg-surface-muted)',
                          color: 'var(--text-secondary)',
                        }),
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Mobile search — must stay lg:hidden with placeholder="搜尋..." */}
            <div className="lg:hidden relative ml-auto">
              <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pl-9 pr-4 text-sm outline-none transition-all w-36 focus:w-48"
                style={{
                  background: 'var(--bg-surface-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>
          </div>

          {/* Song List - Conditional Rendering based on View Mode */}
          <div className="px-4 pb-32 mt-2">
            {loadError ? (
              /* Song API Load Error State */
              <div
                data-testid="song-load-error"
                className="flex flex-col items-center justify-center py-32 gap-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full"
                  style={{ background: 'var(--bg-accent-pink-muted)' }}
                >
                  <WifiOff className="w-8 h-8" style={{ color: 'var(--accent-pink)' }} />
                </div>
                <p
                  className="text-center font-medium max-w-sm"
                  style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}
                >
                  無法載入歌曲資料，請檢查網路連線後重新整理頁面
                </p>
                <button
                  data-testid="retry-button"
                  onClick={fetchSongs}
                  className="font-semibold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--font-size-sm)',
                    padding: 'var(--space-3) var(--space-6)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  重新整理
                </button>
              </div>
            ) : viewMode === 'timeline' ? (
              /* Timeline View */
              <>
                {/* SongTableHeader */}
                <div
                  className="grid grid-cols-[1fr_60px] lg:grid-cols-[32px_2fr_2fr_100px_60px] gap-0 px-3 py-2 sticky top-[88px] z-10"
                  style={{
                    borderBottom: '1px solid var(--border-table)',
                  }}
                >
                  <div
                    className="hidden lg:flex items-center justify-center text-center font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    #
                  </div>
                  <div
                    className="flex items-center font-bold uppercase tracking-wider lg:pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    標題
                  </div>
                  <div
                    className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    出處直播
                  </div>
                  <div
                    className="hidden lg:flex items-center font-bold uppercase tracking-wider pl-3"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                  >
                    發布日期
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Clock style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                  </div>
                </div>

                <div className="mt-1 space-y-0.5">
                  {flattenedSongs.length === 0 ? (
                    songs.length === 0 && !hasActiveFilters ? (
                      <div className="py-20 text-center" data-testid="empty-catalog" style={{ color: 'var(--text-tertiary)' }}>
                        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>目前尚無歌曲資料</p>
                      </div>
                    ) : (
                      <div className="py-20 text-center" data-testid="empty-state" style={{ color: 'var(--text-tertiary)' }}>
                        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>找不到符合條件的歌曲</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearAllFilters}
                            className="mt-3 text-sm font-medium underline underline-offset-2 transition-colors"
                            style={{ color: 'var(--accent-pink)' }}
                            data-testid="clear-filters-empty"
                          >
                            清除所有篩選條件
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    flattenedSongs.map((song, index) => {
                      const isCurrentlyPlaying = currentTrack?.id === song.performanceId;
                      return (
                        <div
                          key={`${song.id}-${song.performanceId}`}
                          data-testid="performance-row"
                          className="group grid grid-cols-[1fr_60px] lg:grid-cols-[32px_2fr_2fr_100px_60px] gap-0 items-center transition-all cursor-default"
                          style={{
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3) var(--space-4)',
                            background: isCurrentlyPlaying
                              ? 'var(--bg-accent-pink-muted)'
                              : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrentlyPlaying) {
                              (e.currentTarget as HTMLElement).style.background = 'var(--bg-accent-pink)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrentlyPlaying) {
                              (e.currentTarget as HTMLElement).style.background = '';
                            }
                          }}
                        >
                          {/* # column: row number / play button — hidden on mobile */}
                          <div
                            className="hidden lg:flex items-center justify-center relative"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <span
                              className="group-hover:opacity-0 transition-opacity font-mono text-sm select-none"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              {index + 1}
                            </span>
                            <button
                              onClick={() => {
                                if (!unavailableVideoIds.has(song.videoId)) {
                                  playTrack({
                                    id: song.performanceId,
                                    songId: song.id,
                                    title: song.title,
                                    originalArtist: song.originalArtist,
                                    videoId: song.videoId,
                                    timestamp: song.timestamp,
                                  });
                                }
                              }}
                              disabled={unavailableVideoIds.has(song.videoId)}
                              data-testid="play-button"
                              className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                                unavailableVideoIds.has(song.videoId)
                                  ? 'cursor-not-allowed'
                                  : 'transform hover:scale-110'
                              }`}
                              style={{
                                color: unavailableVideoIds.has(song.videoId)
                                  ? 'var(--text-muted)'
                                  : 'var(--accent-pink)',
                              }}
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          </div>

                          {/* Title column: song title + artist + NoteBadge */}
                          <div className="min-w-0 pl-1 lg:pl-3 flex items-center gap-2 lg:block">
                            {/* Mobile play button — visible only on mobile (hidden lg) */}
                            <button
                              onClick={() => {
                                if (!unavailableVideoIds.has(song.videoId)) {
                                  playTrack({
                                    id: song.performanceId,
                                    songId: song.id,
                                    title: song.title,
                                    originalArtist: song.originalArtist,
                                    videoId: song.videoId,
                                    timestamp: song.timestamp,
                                  });
                                }
                              }}
                              disabled={unavailableVideoIds.has(song.videoId)}
                              data-testid="mobile-play-button"
                              className={`lg:hidden flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full ${
                                unavailableVideoIds.has(song.videoId) ? 'cursor-not-allowed opacity-40' : ''
                              }`}
                              style={{
                                background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                                color: 'white',
                              }}
                            >
                              <Play className="w-4 h-4 fill-current" style={{ marginLeft: '2px' }} />
                            </button>
                            <div className="min-w-0 flex-1 lg:flex-none">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="font-bold truncate"
                                style={{
                                  color: 'var(--text-primary)',
                                  fontSize: 'var(--font-size-md)',
                                }}
                              >
                                {song.title}
                              </div>
                              {song.note && (
                                <span
                                  className="inline-flex items-center border border-blue-200 text-blue-500 bg-blue-50 font-medium flex-shrink-0"
                                  style={{
                                    background: 'var(--bg-accent-blue-muted)',
                                    color: 'var(--accent-blue)',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: 'var(--font-size-xs)',
                                    padding: 'var(--space-1) var(--space-3)',
                                  }}
                                >
                                  {song.note}
                                </span>
                              )}
                            </div>
                            <div
                              className="truncate mt-0.5"
                              style={{
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--font-size-sm)',
                              }}
                            >
                              {song.originalArtist}
                            </div>
                            </div>
                          </div>

                          {/* Stream title column (desktop only) */}
                          <div
                            className="hidden lg:flex items-center min-w-0 pl-3"
                            style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}
                          >
                            <span className="truncate">{song.streamTitle}</span>
                          </div>

                          {/* Date column (desktop only) */}
                          <div
                            className="hidden lg:flex items-center pl-3 font-mono"
                            style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}
                          >
                            {song.date}
                          </div>

                          {/* Duration / Actions column */}
                          <div
                            className="flex items-center justify-end gap-1.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <button
                              onClick={() => handleAddToQueue({
                                id: song.performanceId,
                                songId: song.id,
                                title: song.title,
                                originalArtist: song.originalArtist,
                                videoId: song.videoId,
                                timestamp: song.timestamp,
                              })}
                              className="opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                              style={{
                                background: 'var(--bg-surface)',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-circle)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                color: 'var(--text-secondary)',
                              }}
                              title="加入佇列"
                              data-testid="add-to-queue"
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-pink)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-all"
                              style={{
                                background: 'var(--bg-surface)',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-circle)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              <AddToPlaylistDropdown
                                version={{
                                  performanceId: song.performanceId,
                                  songTitle: song.title,
                                  originalArtist: song.originalArtist,
                                  videoId: song.videoId,
                                  timestamp: song.timestamp,
                                }}
                                onSuccess={handleAddToPlaylistSuccess}
                              />
                            </div>
                            <a
                              href={`https://www.youtube.com/watch?v=${song.videoId}&t=${song.timestamp}s`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                              style={{
                                background: 'var(--bg-surface)',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-circle)',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="在 YouTube 開啟"
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FF0000'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <span
                              className="font-mono text-right"
                              style={{
                                minWidth: '40px',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {formatTime(song.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* Grouped View */
              <div className="mt-2 space-y-3">
                {groupedSongs.length === 0 ? (
                  songs.length === 0 && !hasActiveFilters ? (
                    <div className="py-20 text-center" data-testid="empty-catalog" style={{ color: 'var(--text-tertiary)' }}>
                      <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>目前尚無歌曲資料</p>
                    </div>
                  ) : (
                    <div className="py-20 text-center" data-testid="empty-state" style={{ color: 'var(--text-tertiary)' }}>
                      <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>找不到符合條件的歌曲</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-3 text-sm font-medium underline underline-offset-2 transition-colors"
                          style={{ color: 'var(--accent-pink)' }}
                          data-testid="clear-filters-empty"
                        >
                          清除所有篩選條件
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  groupedSongs.map((song) => {
                    const isExpanded = expandedSongs.has(song.id);
                    const sortedPerformances = [...song.performances].sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    return (
                      <div
                        key={song.id}
                        data-testid="song-card"
                        className="overflow-hidden transition-all"
                        style={{
                          background: 'var(--bg-surface-glass)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-xl)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                      >
                        {/* Song Header - Clickable */}
                        <button
                          onClick={() => toggleSongExpansion(song.id)}
                          className="w-full flex items-center justify-between transition-all group"
                          style={{
                            padding: 'var(--space-5) var(--space-6)',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--bg-accent-pink)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '';
                          }}
                        >
                          <div className="flex items-start gap-4 flex-1 text-left">
                            <div
                              className="flex items-center justify-center flex-shrink-0"
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--bg-accent-pink-muted), var(--bg-accent-blue-muted))',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              }}
                            >
                              <Disc3 className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-bold truncate"
                                style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)', lineHeight: 1.3 }}
                              >
                                {song.title}
                              </h3>
                              <p
                                className="truncate mt-1"
                                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}
                              >
                                {song.originalArtist}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className="font-bold"
                                  style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--accent-pink)',
                                    background: 'var(--bg-accent-pink-muted)',
                                    padding: 'var(--space-1) var(--space-3)',
                                    borderRadius: 'var(--radius-pill)',
                                    border: '1px solid var(--border-accent-pink)',
                                  }}
                                >
                                  {song.performances.length} 個版本
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className="ml-4 transition-colors"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Versions List */}
                        {isExpanded && (
                          <div
                            data-testid="versions-list"
                            className="space-y-0.5 px-3 pb-3"
                            style={{
                              borderTop: '1px solid var(--border-table)',
                              paddingTop: 'var(--space-3)',
                            }}
                          >
                            {sortedPerformances.map((perf) => (
                              <div
                                key={perf.id}
                                data-testid="version-row"
                                className="group/version grid grid-cols-[1fr_60px] lg:grid-cols-[32px_1fr_140px_60px] gap-0 items-center transition-all"
                                style={{
                                  borderRadius: 'var(--radius-lg)',
                                  padding: 'var(--space-3) var(--space-4)',
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-accent-pink)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = '';
                                }}
                              >
                                {/* Play button column — desktop only */}
                                <div
                                  className="hidden lg:flex items-center justify-center"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <button
                                    onClick={() => {
                                      if (!unavailableVideoIds.has(perf.videoId)) {
                                        playTrack({
                                          id: perf.id,
                                          songId: song.id,
                                          title: song.title,
                                          originalArtist: song.originalArtist,
                                          videoId: perf.videoId,
                                          timestamp: perf.timestamp,
                                        });
                                      }
                                    }}
                                    disabled={unavailableVideoIds.has(perf.videoId)}
                                    data-testid="play-button"
                                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center opacity-0 group-hover/version:opacity-100 transition-all flex-shrink-0 ${
                                      unavailableVideoIds.has(perf.videoId)
                                        ? 'cursor-not-allowed'
                                        : 'hover:scale-110'
                                    }`}
                                    style={{
                                      background: unavailableVideoIds.has(perf.videoId)
                                        ? 'var(--text-muted)'
                                        : 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                                      boxShadow: '0 2px 8px rgba(244, 114, 182, 0.3)',
                                    }}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" style={{ marginLeft: '1px' }} />
                                  </button>
                                </div>

                                {/* Date + Note + Stream title */}
                                <div className="min-w-0 pl-1 lg:pl-3 flex items-center gap-2 lg:block">
                                  {/* Mobile play button */}
                                  <button
                                    onClick={() => {
                                      if (!unavailableVideoIds.has(perf.videoId)) {
                                        playTrack({
                                          id: perf.id,
                                          songId: song.id,
                                          title: song.title,
                                          originalArtist: song.originalArtist,
                                          videoId: perf.videoId,
                                          timestamp: perf.timestamp,
                                        });
                                      }
                                    }}
                                    disabled={unavailableVideoIds.has(perf.videoId)}
                                    data-testid="mobile-play-button"
                                    className={`lg:hidden flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full ${
                                      unavailableVideoIds.has(perf.videoId) ? 'cursor-not-allowed opacity-40' : ''
                                    }`}
                                    style={{
                                      background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
                                      color: 'white',
                                    }}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" style={{ marginLeft: '1px' }} />
                                  </button>
                                  <div className="min-w-0 flex-1 lg:flex-none">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className="font-mono text-sm"
                                      style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}
                                    >
                                      {perf.date}
                                    </span>
                                    {perf.note && (
                                      <span
                                        className="inline-flex items-center border border-blue-200 text-blue-500 bg-blue-50 font-medium"
                                        style={{
                                          background: 'var(--bg-accent-blue-muted)',
                                          color: 'var(--accent-blue)',
                                          borderRadius: 'var(--radius-pill)',
                                          fontSize: 'var(--font-size-xs)',
                                          padding: 'var(--space-1) var(--space-3)',
                                        }}
                                      >
                                        {perf.note}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="truncate mt-0.5"
                                    style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}
                                  >
                                    {perf.streamTitle}
                                  </p>
                                  </div>
                                </div>

                                {/* Date column desktop (extra info hidden on mobile) */}
                                <div
                                  className="hidden lg:flex items-center min-w-0 pl-3"
                                  style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}
                                >
                                </div>

                                {/* Actions + Duration */}
                                <div
                                  className="flex items-center justify-end gap-1.5"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  <button
                                    onClick={() => handleAddToQueue({
                                      id: perf.id,
                                      songId: song.id,
                                      title: song.title,
                                      originalArtist: song.originalArtist,
                                      videoId: perf.videoId,
                                      timestamp: perf.timestamp,
                                    })}
                                    className="opacity-0 group-hover/version:opacity-100 transition-all transform hover:scale-110"
                                    style={{
                                      background: 'var(--bg-surface)',
                                      padding: 'var(--space-2)',
                                      borderRadius: 'var(--radius-circle)',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                      color: 'var(--text-secondary)',
                                    }}
                                    title="加入佇列"
                                    data-testid="add-to-queue"
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-pink)'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <div
                                    className="opacity-0 group-hover/version:opacity-100 transition-all"
                                    style={{
                                      background: 'var(--bg-surface)',
                                      padding: 'var(--space-2)',
                                      borderRadius: 'var(--radius-circle)',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    <AddToPlaylistDropdown
                                      version={{
                                        performanceId: perf.id,
                                        songTitle: song.title,
                                        originalArtist: song.originalArtist,
                                        videoId: perf.videoId,
                                        timestamp: perf.timestamp,
                                      }}
                                      onSuccess={handleAddToPlaylistSuccess}
                                    />
                                  </div>
                                  <a
                                    href={`https://www.youtube.com/watch?v=${perf.videoId}&t=${perf.timestamp}s`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-0 group-hover/version:opacity-100 transition-all transform hover:scale-110"
                                    style={{
                                      background: 'var(--bg-surface)',
                                      padding: 'var(--space-2)',
                                      borderRadius: 'var(--radius-circle)',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                      color: 'var(--text-secondary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                    title="在 YouTube 開啟"
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FF0000'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  <span
                                    className="font-mono text-right"
                                    style={{
                                      minWidth: '40px',
                                      fontSize: 'var(--font-size-sm)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    {formatTime(perf.timestamp)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Playlist UI */}
      <PlaylistPanel
        show={showPlaylistPanel}
        onClose={() => setShowPlaylistPanel(false)}
        songsData={songs}
      />
      <CreatePlaylistDialog
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setToastMessage('播放清單已建立');
          setShowToast(true);
        }}
      />
    </>
  );
}
