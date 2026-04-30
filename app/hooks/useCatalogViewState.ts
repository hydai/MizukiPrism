'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type CatalogViewMode = 'timeline' | 'grouped';
export type CatalogMobileTab = 'home' | 'search' | 'library' | 'streams';

const VIEW_MODE_STORAGE_KEY = 'mizukiprism-view-mode';

function isCatalogViewMode(value: string | null): value is CatalogViewMode {
  return value === 'timeline' || value === 'grouped';
}

export function useCatalogViewState() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<CatalogViewMode>('timeline');
  const [mobileTab, setMobileTab] = useState<CatalogMobileTab>('home');

  useEffect(() => {
    const savedView = sessionStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (isCatalogViewMode(savedView)) {
      setViewMode(savedView);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
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
