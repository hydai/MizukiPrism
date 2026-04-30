'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CatalogMobileTab, CatalogViewMode } from './useCatalogViewState';

interface UseCatalogVirtualizersOptions {
  viewMode: CatalogViewMode;
  mobileTab: CatalogMobileTab;
  flattenedSongCount: number;
  groupedSongCount: number;
}

export function useCatalogVirtualizers({
  viewMode,
  mobileTab,
  flattenedSongCount,
  groupedSongCount,
}: UseCatalogVirtualizersOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineListRef = useRef<HTMLDivElement>(null);
  const groupedListRef = useRef<HTMLDivElement>(null);
  const mobileSearchListRef = useRef<HTMLDivElement>(null);

  const isTimelineActive = viewMode === 'timeline' && mobileTab === 'home';
  const isGroupedActive = viewMode === 'grouped' && mobileTab === 'home';
  const isMobileSearchActive = mobileTab === 'search';

  const timelineVirtualizer = useVirtualizer({
    count: isTimelineActive ? flattenedSongCount : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 56,
    overscan: 15,
    scrollMargin: timelineListRef.current?.offsetTop ?? 0,
  });

  const groupedVirtualizer = useVirtualizer({
    count: isGroupedActive ? groupedSongCount : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 96,
    overscan: 10,
    scrollMargin: groupedListRef.current?.offsetTop ?? 0,
  });

  const mobileSearchVirtualizer = useVirtualizer({
    count: isMobileSearchActive ? flattenedSongCount : 0,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 64,
    overscan: 15,
    scrollMargin: mobileSearchListRef.current?.offsetTop ?? 0,
  });

  return {
    scrollContainerRef,
    timelineListRef,
    groupedListRef,
    mobileSearchListRef,
    timelineVirtualizer,
    groupedVirtualizer,
    mobileSearchVirtualizer,
  };
}
