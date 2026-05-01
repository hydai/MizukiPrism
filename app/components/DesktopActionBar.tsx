'use client';

import { Clock, Disc3, Play } from 'lucide-react';
import type { CatalogViewMode } from '../hooks/useCatalogViewState';

interface DesktopActionBarProps {
  youtubeUrl: string;
  viewMode: CatalogViewMode;
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  onPlayAll: () => void;
  onViewModeChange: (mode: CatalogViewMode) => void;
  onClearYears: () => void;
  onToggleYear: (year: number) => void;
}

export default function DesktopActionBar({
  youtubeUrl,
  viewMode,
  availableYears,
  selectedYears,
  onPlayAll,
  onViewModeChange,
  onClearYears,
  onToggleYear,
}: DesktopActionBarProps) {
  return (
    <div
      className="hidden lg:flex sticky top-0 z-20 px-6 items-center gap-3 flex-wrap"
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

        {/* PlayButton - 48x48 circular gradient play button */}
        <button
          data-testid="desktop-play-all-button"
          className="bg-gradient-to-r from-pink-400 to-blue-400 text-white flex items-center justify-center transition-all hover:scale-105 hover:brightness-110 flex-shrink-0"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-circle)',
            background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
            boxShadow: '0 4px 16px rgba(244, 114, 182, 0.35)',
          }}
          title="播放全部"
          aria-label="播放全部"
          onClick={onPlayAll}
        >
          <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />
        </button>

        {/* GradientButton - "播放全部" pill */}
        <button
          className="font-semibold text-white flex items-center gap-1.5 transition-all hover:opacity-90 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--space-3) var(--space-5)',
            color: 'var(--text-on-accent)',
          }}
          onClick={onPlayAll}
        >
          播放全部
        </button>

        {/* OutlineButton - "追蹤" follow link */}
        <a
          href={youtubeUrl}
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

        {/* View Mode Toggle */}
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
            onClick={() => onViewModeChange('timeline')}
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
            onClick={() => onViewModeChange('grouped')}
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

      {/* Right side: Year Filter Chips */}
      <div className="hidden lg:flex items-center gap-1.5 flex-wrap" data-testid="year-filter-bar">
        {/* "全部" chip */}
        <button
          onClick={onClearYears}
          className="font-medium transition-all"
          style={{
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--space-2) var(--space-4)',
            ...(selectedYears.size === 0
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
        {availableYears.map(year => (
          <button
            key={year}
            data-testid="year-filter-chip"
            onClick={() => onToggleYear(year)}
            className="font-medium transition-all"
            style={{
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--space-2) var(--space-4)',
              ...(selectedYears.has(year)
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
            {year}
          </button>
        ))}
      </div>

    </div>
  );
}
