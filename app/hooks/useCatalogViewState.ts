'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  readStoredCatalogViewMode,
  writeStoredCatalogViewMode,
  type CatalogViewMode,
} from '../lib/catalogViewStorage';

export type { CatalogViewMode } from '../lib/catalogViewStorage';
export type CatalogMobileTab = 'home' | 'search' | 'library' | 'streams';

export function useCatalogViewState() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<CatalogViewMode>('timeline');
  const [mobileTab, setMobileTab] = useState<CatalogMobileTab>('home');
  const hasSkippedInitialViewModeSave = useRef(false);

  useEffect(() => {
    const storedViewMode = readStoredCatalogViewMode();
    if (storedViewMode) {
      setViewMode(storedViewMode);
    }
  }, []);

  useEffect(() => {
    if (!hasSkippedInitialViewModeSave.current) {
      hasSkippedInitialViewModeSave.current = true;
      return;
    }

    writeStoredCatalogViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (searchInput === '') {
      setDebouncedSearch('');
      return;
    }
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
    setSelectedStreamId(null);
  }, []);

  const clearYears = useCallback(() => {
    setSelectedYears(new Set());
    setSelectedStreamId(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedStreamId(null);
    setSelectedArtist(null);
    setSelectedYears(new Set());
  }, []);

  const toggleStreamFilter = useCallback((streamId: string) => {
    setSelectedStreamId((current) => (current === streamId ? null : streamId));
  }, []);

  const clearStreamFilter = useCallback(() => {
    setSelectedStreamId(null);
  }, []);

  const showAllStreamsOnHome = useCallback(() => {
    setSelectedStreamId(null);
    setMobileTab('home');
  }, []);

  const showStreamOnHome = useCallback((streamId: string) => {
    setSelectedStreamId(streamId);
    setMobileTab('home');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchInput !== ''
      || selectedStreamId !== null
      || selectedArtist !== null
      || selectedYears.size > 0;
  }, [searchInput, selectedArtist, selectedStreamId, selectedYears]);

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedStreamId,
    selectedArtist,
    setSelectedArtist,
    selectedYears,
    viewMode,
    setViewMode,
    mobileTab,
    setMobileTab,
    toggleYear,
    clearYears,
    clearAllFilters,
    toggleStreamFilter,
    clearStreamFilter,
    showAllStreamsOnHome,
    showStreamOnHome,
    hasActiveFilters,
  };
}
