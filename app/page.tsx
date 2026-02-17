'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Play, ExternalLink, Mic2, Youtube, Twitter, Sparkles, Home as HomeIcon, ListMusic, Clock, Heart, LayoutList, Disc3, ChevronDown, ChevronRight, Plus, ListPlus, X, SlidersHorizontal, LogIn, LogOut, User, WifiOff } from 'lucide-react';
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
  const [songs, setSongs] = useState<Song[]>([]);

  // Fetch songs from API
  useEffect(() => {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(() => setSongs([]));
  }, []);

  const { playTrack, addToQueue, apiLoadError, unavailableVideoIds, timestampWarning, clearTimestampWarning } = usePlayer();
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
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col flex-shrink-0 hidden md:flex shadow-sm z-20 overflow-hidden" style={{ background: 'var(--bg-surface-frosted)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRight: '1px solid var(--border-glass)' }}>

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
            MizukiPrism
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

      {/* Main Content */}
      <main className="flex-1 md:m-3 md:rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-100/50 bg-white/40 backdrop-blur-md border border-white/60 flex flex-col" style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-3xl)' }}>

        {/* Decorative glows */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">

          {/* Header - Streamer Profile */}
          <header className="relative px-8 py-10 flex flex-col md:flex-row items-end gap-8 border-b border-white/40 bg-gradient-to-b from-white/60 to-transparent">
            {/* Avatar */}
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-pink-500/10 ring-4 ring-white" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
                <Mic2 className="w-20 h-20 text-white drop-shadow-lg" />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-pink-500 flex items-center gap-1 bg-pink-50 w-fit px-2 py-1 rounded-md border border-pink-100">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Artist
              </span>
              <h1 className="text-4xl md:text-7xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                {streamerData.name}
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
                {streamerData.description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-bold">
                <span>{flattenedSongs.length} 首歌曲</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <div className="flex gap-3">
                  <a href={streamerData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors bg-white p-1.5 rounded-full shadow-sm hover:shadow-md">
                    <Youtube className="w-4 h-4"/>
                  </a>
                  <a href={streamerData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors bg-white p-1.5 rounded-full shadow-sm hover:shadow-md">
                    <Twitter className="w-4 h-4"/>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Action Bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/50 shadow-sm" style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
            <div className="flex items-center gap-4">
              {/* Play All Button */}
              <button className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 transform hover:scale-105 transition-all hover:brightness-110">
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
              <a
                href={streamerData.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-800 border-2 border-slate-200 hover:border-slate-800 rounded-full px-6 py-2 text-sm font-bold transition-all uppercase tracking-wide"
              >
                追蹤
              </a>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 ml-4 bg-white/60 rounded-full p-1 border border-slate-200/60">
                <button
                  data-testid="view-toggle-timeline"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  時間序列
                </button>
                <button
                  data-testid="view-toggle-grouped"
                  onClick={() => setViewMode('grouped')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Disc3 className="w-4 h-4" />
                  歌曲分組
                </button>
              </div>
            </div>

            {/* Mobile search */}
            <div className="md:hidden relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-full py-2 pl-9 pr-4 text-sm text-slate-700 w-36 focus:w-52 transition-all outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Song List - Conditional Rendering based on View Mode */}
          <div className="px-6 pb-32 mt-4">
            {viewMode === 'timeline' ? (
              /* Timeline View */
              <>
                <div className="grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-4 py-3 border-b border-slate-200/60 text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-[88px] z-10">
                  <div className="w-8 text-center">#</div>
                  <div>標題</div>
                  <div className="hidden md:block">出處直播</div>
                  <div className="hidden md:block">發布日期</div>
                  <div className="flex justify-end pr-4"><Clock className="w-4 h-4" /></div>
                </div>

                <div className="mt-2 space-y-1">
                  {flattenedSongs.length === 0 ? (
                    <div className="py-20 text-center text-slate-400" data-testid="empty-state">
                      <p className="text-lg font-medium text-slate-500">找不到符合條件的歌曲</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-3 text-sm text-pink-500 hover:text-pink-700 font-medium underline underline-offset-2 transition-colors"
                          data-testid="clear-filters-empty"
                        >
                          清除所有篩選條件
                        </button>
                      )}
                    </div>
                  ) : (
                    flattenedSongs.map((song, index) => (
                      <div
                        key={`${song.id}-${song.performanceId}`}
                        data-testid="performance-row"
                        className="group grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-4 py-3 rounded-xl hover:bg-white/60 items-center transition-all cursor-default border border-transparent hover:border-white/50 hover:shadow-sm"
                      >
                        {/* Index / Play button */}
                        <div className="w-8 flex justify-center text-slate-400 font-mono text-sm relative">
                          <span className="group-hover:opacity-0 transition-opacity text-slate-400">{index + 1}</span>
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
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-pink-500 transform hover:scale-110'
                            }`}
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        {/* Title & Artist */}
                        <div className="min-w-0 pr-4">
                          <div className="font-bold truncate text-base text-slate-800">
                            {song.title}
                          </div>
                          <div className="text-sm text-slate-500 truncate hover:underline hover:text-slate-800 cursor-pointer flex items-center gap-2 mt-0.5">
                            {song.originalArtist}
                            {song.note && (
                              <span className="text-[10px] border border-blue-200 text-blue-500 px-1.5 py-0.5 rounded-full bg-blue-50 font-medium">
                                {song.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stream title (desktop) */}
                        <div className="hidden md:flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors min-w-0">
                          <span className="truncate">{song.streamTitle}</span>
                        </div>

                        {/* Date (desktop) */}
                        <div className="hidden md:flex text-sm text-slate-500 min-w-0 font-mono">
                          {song.date}
                        </div>

                        {/* Time / Actions */}
                        <div className="flex items-center justify-end gap-2 text-sm text-slate-500 pr-2">
                          <button
                            onClick={() => handleAddToQueue({
                              id: song.performanceId,
                              songId: song.id,
                              title: song.title,
                              originalArtist: song.originalArtist,
                              videoId: song.videoId,
                              timestamp: song.timestamp,
                            })}
                            className="opacity-0 group-hover:opacity-100 hover:text-pink-500 transition-all transform hover:scale-110 bg-white p-1.5 rounded-full shadow-sm"
                            title="加入佇列"
                            data-testid="add-to-queue"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <div className="opacity-0 group-hover:opacity-100 transition-all bg-white p-1.5 rounded-full shadow-sm">
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
                            className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all transform hover:scale-110 bg-white p-1.5 rounded-full shadow-sm"
                            title="在 YouTube 開啟"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <span className="font-mono min-w-[40px] text-right">{formatTime(song.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Grouped View */
              <div className="mt-2 space-y-3">
                {groupedSongs.length === 0 ? (
                  <div className="py-20 text-center text-slate-400" data-testid="empty-state">
                    <p className="text-lg font-medium text-slate-500">找不到符合條件的歌曲</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 text-sm text-pink-500 hover:text-pink-700 font-medium underline underline-offset-2 transition-colors"
                        data-testid="clear-filters-empty"
                      >
                        清除所有篩選條件
                      </button>
                    )}
                  </div>
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
                        className="bg-white/60 border border-white/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        {/* Song Header - Clickable */}
                        <button
                          onClick={() => toggleSongExpansion(song.id)}
                          className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/40 transition-all group"
                        >
                          <div className="flex items-start gap-4 flex-1 text-left">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                              <Disc3 className="w-8 h-8 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xl text-slate-800 truncate">
                                {song.title}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1 truncate">
                                {song.originalArtist}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">
                                  {song.performances.length} 個版本
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                            {isExpanded ? (
                              <ChevronDown className="w-6 h-6" />
                            ) : (
                              <ChevronRight className="w-6 h-6" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Versions List */}
                        {isExpanded && (
                          <div
                            data-testid="versions-list"
                            className="border-t border-slate-200/60 bg-white/20 px-6 py-4 space-y-2"
                          >
                            {sortedPerformances.map((perf) => (
                              <div
                                key={perf.id}
                                data-testid="version-row"
                                className="group/version flex items-center justify-between p-4 rounded-xl hover:bg-white/60 transition-all border border-transparent hover:border-white/50"
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
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
                                    className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md opacity-0 group-hover/version:opacity-100 transition-all flex-shrink-0 ${
                                      unavailableVideoIds.has(perf.videoId)
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-pink-400 to-blue-400 hover:scale-110'
                                    }`}
                                  >
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-sm text-slate-500">
                                        {perf.date}
                                      </span>
                                      {perf.note && (
                                        <span className="text-[10px] border border-blue-200 text-blue-500 px-1.5 py-0.5 rounded-full bg-blue-50 font-medium">
                                          {perf.note}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600 truncate mt-1">
                                      {perf.streamTitle}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleAddToQueue({
                                      id: perf.id,
                                      songId: song.id,
                                      title: song.title,
                                      originalArtist: song.originalArtist,
                                      videoId: perf.videoId,
                                      timestamp: perf.timestamp,
                                    })}
                                    className="opacity-0 group-hover/version:opacity-100 hover:text-pink-500 transition-all transform hover:scale-110 bg-white p-2 rounded-full shadow-sm text-slate-500"
                                    title="加入佇列"
                                    data-testid="add-to-queue"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <div className="opacity-0 group-hover/version:opacity-100 transition-all bg-white p-2 rounded-full shadow-sm text-slate-500">
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
                                    className="opacity-0 group-hover/version:opacity-100 hover:text-red-500 transition-all transform hover:scale-110 bg-white p-2 rounded-full shadow-sm text-slate-500"
                                    title="在 YouTube 開啟"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                  <span className="font-mono text-sm text-slate-500 min-w-[40px] text-right">
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
