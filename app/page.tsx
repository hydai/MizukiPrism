'use client';

import { useState, useMemo } from 'react';
import { Search, Play, ExternalLink, Mic2, Youtube, Twitter, Sparkles, Home as HomeIcon, ListMusic, Clock, Heart } from 'lucide-react';
import songsData from '@/data/songs.json';
import streamerData from '@/data/streamer.json';

interface Performance {
  id: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const songs = songsData as Song[];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    songs.forEach(song => song.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [songs]);

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
      return matchesSearch && matchesTag;
    });
  }, [songs, searchTerm, selectedTag]);

  const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500";

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#fff0f5] via-[#f0f8ff] to-[#e6e6fa] text-slate-600 font-sans selection:bg-pink-200 selection:text-pink-900 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col gap-2 p-3 flex-shrink-0 hidden md:flex shadow-sm z-20">
        {/* Logo */}
        <div className="px-4 py-4 mb-2 flex items-center gap-2 text-slate-800">
          <div className="p-2 bg-gradient-to-tr from-pink-400 to-blue-400 rounded-lg text-white shadow-lg shadow-pink-200">
            <Mic2 className="w-6 h-6" />
          </div>
          <span className={`font-bold text-xl tracking-tight ${gradientText}`}>MizukiPrism</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => {setSearchTerm(''); setSelectedTag(null);}}
            className={`w-full flex items-center gap-4 px-4 py-3 font-bold transition-all rounded-xl ${!searchTerm && !selectedTag ? 'text-white bg-gradient-to-r from-pink-400 to-blue-400 shadow-md shadow-blue-200' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
          >
            <HomeIcon className="w-5 h-5" />
            首頁
          </button>

          <div className="relative group mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-pink-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜尋歌曲..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/50 text-slate-700 group-focus-within:bg-white border border-transparent group-focus-within:border-pink-200 group-focus-within:ring-2 group-focus-within:ring-pink-100 font-medium py-3 pl-12 pr-4 rounded-xl outline-none placeholder-slate-400 transition-all shadow-sm"
            />
          </div>
        </nav>

        {/* Tags */}
        <div className="flex-1 flex flex-col min-h-0 mt-4">
          <div className="px-4 py-2 flex items-center justify-between text-slate-400">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              風格分類
            </span>
          </div>

          <div className="mt-2 overflow-y-auto custom-scrollbar flex-1 px-1 space-y-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedTag === null ? 'text-pink-600 bg-pink-50 border border-pink-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}
            >
              全部歌曲
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedTag === tag ? 'text-pink-600 bg-pink-50 border border-pink-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 py-4 rounded-2xl bg-gradient-to-br from-pink-100/50 to-blue-100/50 border border-white/50">
          <p className="text-xs text-slate-500 font-medium text-center">
            Made with <Heart className="w-3 h-3 inline text-pink-400 fill-current" /> for Mizuki
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:m-3 md:rounded-3xl overflow-hidden relative shadow-2xl shadow-indigo-100/50 bg-white/40 backdrop-blur-md border border-white/60 flex flex-col">

        {/* Decorative glows */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">

          {/* Header - Streamer Profile */}
          <header className="relative px-8 py-10 flex flex-col md:flex-row items-end gap-8 border-b border-white/40 bg-gradient-to-b from-white/60 to-transparent">
            {/* Avatar */}
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-pink-500/10 ring-4 ring-white">
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
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/50 shadow-sm">
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

          {/* Song List - Timeline View */}
          <div className="px-6 pb-20 mt-4">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[auto_2fr_2fr_1fr_auto] gap-4 px-4 py-3 border-b border-slate-200/60 text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-[88px] z-10">
              <div className="w-8 text-center">#</div>
              <div>標題</div>
              <div className="hidden md:block">出處直播</div>
              <div className="hidden md:block">發布日期</div>
              <div className="flex justify-end pr-4"><Clock className="w-4 h-4" /></div>
            </div>

            <div className="mt-2 space-y-1">
              {flattenedSongs.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <p className="text-lg">目前尚無歌曲資料</p>
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
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-pink-500 transition-all transform hover:scale-110"
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
                    <div className="flex items-center justify-end gap-4 text-sm text-slate-500 pr-2">
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
          </div>
        </div>
      </main>
    </div>
  );
}
