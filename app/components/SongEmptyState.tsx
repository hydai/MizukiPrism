'use client';

interface SongEmptyStateProps {
  isCatalogEmpty: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function SongEmptyState({
  isCatalogEmpty,
  hasActiveFilters,
  onClearFilters,
}: SongEmptyStateProps) {
  if (isCatalogEmpty) {
    return (
      <div
        className="py-20 text-center"
        data-testid="empty-catalog"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>目前尚無歌曲資料</p>
      </div>
    );
  }

  return (
    <div
      className="py-20 text-center"
      data-testid="empty-state"
      style={{ color: 'var(--text-tertiary)' }}
    >
      <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>找不到符合條件的歌曲</p>
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-3 text-sm font-medium underline underline-offset-2 transition-colors"
          style={{ color: 'var(--accent-pink)' }}
          data-testid="clear-filters-empty"
        >
          清除所有篩選條件
        </button>
      )}
    </div>
  );
}
