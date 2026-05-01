'use client';

interface MobileYearFilterScrollProps {
  availableYears: readonly number[];
  selectedYears: ReadonlySet<number>;
  onClearYears: () => void;
  onToggleYear: (year: number) => void;
}

export default function MobileYearFilterScroll({
  availableYears,
  selectedYears,
  onClearYears,
  onToggleYear,
}: MobileYearFilterScrollProps) {
  return (
    <div
      data-testid="mobile-stream-scroll"
      className="lg:hidden flex items-center flex-shrink-0 sticky top-0 z-[15]"
      style={{
        padding: '12px 20px',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        borderBottom: '1px solid var(--border-glass)',
        background: 'var(--bg-surface-frosted)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* All years chip */}
      <button
        onClick={onClearYears}
        className="flex-shrink-0 font-medium transition-all"
        style={{
          height: '36px',
          borderRadius: '12px',
          padding: '0 16px',
          fontSize: 'var(--font-size-sm)',
          ...(selectedYears.size === 0
            ? {
                background: 'var(--bg-accent-pink)',
                border: '1px solid var(--border-accent-pink)',
                color: 'var(--accent-pink)',
              }
            : {
                background: 'transparent',
                border: 'none',
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
          className="flex-shrink-0 font-medium transition-all"
          style={{
            height: '36px',
            borderRadius: '12px',
            padding: '0 16px',
            fontSize: 'var(--font-size-sm)',
            whiteSpace: 'nowrap',
            ...(selectedYears.has(year)
              ? {
                  background: '#FDF2F8',
                  border: '1px solid #FBCFE8',
                  color: 'var(--accent-pink)',
                }
              : {
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                }),
          }}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
