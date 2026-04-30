'use client';

import { useCallback, useState } from 'react';

export function useCatalogSongExpansion() {
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());

  const toggleSongExpansion = useCallback((songId: string) => {
    setExpandedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  }, []);

  const isSongExpanded = useCallback((songId: string) => {
    return expandedSongs.has(songId);
  }, [expandedSongs]);

  return {
    isSongExpanded,
    toggleSongExpansion,
  };
}
