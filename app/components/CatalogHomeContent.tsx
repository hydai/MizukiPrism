'use client';

import type { RefObject } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { Track } from '../contexts/PlayerContext';
import type { CatalogSong, FlattenedSong } from '../lib/catalogData';
import type { CatalogViewMode } from '../hooks/useCatalogViewState';
import CatalogSongSection from './CatalogSongSection';
import DesktopActionBar from './DesktopActionBar';
import DesktopHero from './DesktopHero';
import MobileActionBar from './MobileActionBar';
import MobileHero from './MobileHero';
import MobileYearFilterScroll from './MobileYearFilterScroll';

interface StreamerSocialLinks {
  youtube: string;
  twitter: string;
  facebook: string;
  instagram: string;
  twitch: string;
}

interface CatalogHomeContentProps {
  isMobileHomeActive: boolean;
  streamerName: string;
  streamerDescription: string;
  streamerAvatarUrl: string;
  streamerSocialLinks: StreamerSocialLinks;
  loadError: boolean;
  shuffleOn: boolean;
  viewMode: CatalogViewMode;
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  flattenedSongs: readonly FlattenedSong[];
  groupedSongs: readonly CatalogSong[];
  allCatalogSongCount: number;
  hasActiveFilters: boolean;
  timelineListRef: RefObject<HTMLDivElement | null>;
  groupedListRef: RefObject<HTMLDivElement | null>;
  timelineVirtualizer: Virtualizer<HTMLDivElement, Element>;
  groupedVirtualizer: Virtualizer<HTMLDivElement, Element>;
  currentTrackId: string | null;
  unavailableVideoIds: ReadonlySet<string>;
  isSongExpanded: (songId: string) => boolean;
  onPlayAll: () => void;
  onToggleShuffle: () => void;
  onViewModeChange: (mode: CatalogViewMode) => void;
  onClearYears: () => void;
  onToggleYear: (year: number) => void;
  onRetry: () => void;
  onToggleExpand: (songId: string) => void;
  onClearFilters: () => void;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylistSuccess: () => void;
}

export default function CatalogHomeContent({
  isMobileHomeActive,
  streamerName,
  streamerDescription,
  streamerAvatarUrl,
  streamerSocialLinks,
  loadError,
  shuffleOn,
  viewMode,
  availableYears,
  selectedYears,
  flattenedSongs,
  groupedSongs,
  allCatalogSongCount,
  hasActiveFilters,
  timelineListRef,
  groupedListRef,
  timelineVirtualizer,
  groupedVirtualizer,
  currentTrackId,
  unavailableVideoIds,
  isSongExpanded,
  onPlayAll,
  onToggleShuffle,
  onViewModeChange,
  onClearYears,
  onToggleYear,
  onRetry,
  onToggleExpand,
  onClearFilters,
  onPlay,
  onAddToQueue,
  onAddToPlaylistSuccess,
}: CatalogHomeContentProps) {
  return (
    <div className={isMobileHomeActive ? '' : 'hidden lg:block'}>
      <MobileHero
        name={streamerName}
        description={streamerDescription}
        avatarUrl={streamerAvatarUrl}
        songCount={flattenedSongs.length}
      />

      <DesktopHero
        name={streamerName}
        description={streamerDescription}
        avatarUrl={streamerAvatarUrl}
        songCount={flattenedSongs.length}
        socialLinks={streamerSocialLinks}
      />

      <MobileActionBar
        youtubeUrl={streamerSocialLinks.youtube}
        shuffleOn={shuffleOn}
        onPlayAll={onPlayAll}
        onToggleShuffle={onToggleShuffle}
      />

      <MobileYearFilterScroll
        availableYears={availableYears}
        selectedYears={selectedYears}
        onClearYears={onClearYears}
        onToggleYear={onToggleYear}
      />

      <DesktopActionBar
        youtubeUrl={streamerSocialLinks.youtube}
        viewMode={viewMode}
        availableYears={availableYears}
        selectedYears={selectedYears}
        onPlayAll={onPlayAll}
        onViewModeChange={onViewModeChange}
        onClearYears={onClearYears}
        onToggleYear={onToggleYear}
      />

      <CatalogSongSection
        loadError={loadError}
        viewMode={viewMode}
        flattenedSongs={flattenedSongs}
        groupedSongs={groupedSongs}
        allCatalogSongCount={allCatalogSongCount}
        hasActiveFilters={hasActiveFilters}
        timelineListRef={timelineListRef}
        groupedListRef={groupedListRef}
        timelineVirtualizer={timelineVirtualizer}
        groupedVirtualizer={groupedVirtualizer}
        currentTrackId={currentTrackId}
        unavailableVideoIds={unavailableVideoIds}
        isSongExpanded={isSongExpanded}
        onRetry={onRetry}
        onToggleExpand={onToggleExpand}
        onClearFilters={onClearFilters}
        onPlay={onPlay}
        onAddToQueue={onAddToQueue}
        onAddToPlaylistSuccess={onAddToPlaylistSuccess}
      />
    </div>
  );
}
