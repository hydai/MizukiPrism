'use client';

import type { CatalogStream } from '../lib/catalogData';

interface MobileStreamsTabProps {
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  filteredStreams: readonly CatalogStream[];
  onToggleYear: (year: number) => void;
  onClearYears: () => void;
  onShowAllStreams: () => void;
  onShowStream: (streamId: string) => void;
}

export default function MobileStreamsTab({
  availableYears,
  selectedYears,
  filteredStreams,
  onToggleYear,
  onClearYears,
  onShowAllStreams,
  onShowStream,
}: MobileStreamsTabProps) {
  return (
    <div
      className="lg:hidden flex-1 px-4 pt-4 pb-32"
      data-testid="mobile-streams-tab"
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>歌枠回放</h2>

      <div className="flex gap-1.5 mb-4 overflow-x-auto" data-testid="mobile-streams-year-filter">
        {availableYears.map(year => (
          <button
            key={year}
            data-testid="mobile-streams-year-chip"
            onClick={() => onToggleYear(year)}
            className="font-medium text-sm transition-all flex-shrink-0"
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '4px 12px',
              ...(selectedYears.has(year)
                ? { background: 'var(--bg-accent-pink)', color: 'var(--accent-pink)' }
                : { background: 'var(--bg-surface-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }),
            }}
          >
            {year}
          </button>
        ))}
        {selectedYears.size > 0 && (
          <button
            onClick={onClearYears}
            className="font-medium text-xs transition-all flex-shrink-0"
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              color: 'var(--text-tertiary)',
            }}
          >
            清除
          </button>
        )}
      </div>

      <button
        onClick={onShowAllStreams}
        className="w-full text-left px-4 py-3 rounded-radius-lg text-sm font-medium transition-all mb-2"
        style={{
          background: 'var(--bg-surface-glass)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-secondary)',
          borderRadius: 'var(--radius-lg)',
        }}
        data-testid="mobile-streams-all-songs"
      >
        全部歌曲
      </button>

      {filteredStreams.length === 0 ? (
        <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>沒有符合條件的歌枠</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredStreams.map(stream => (
            <button
              key={stream.id}
              data-testid="mobile-stream-card"
              onClick={() => onShowStream(stream.id)}
              className="w-full text-left px-4 py-3 rounded-radius-lg transition-all"
              style={{
                background: 'var(--bg-surface-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{stream.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stream.date}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
