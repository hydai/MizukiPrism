'use client';

import { useMemo } from 'react';
import {
  buildCatalogArtistList,
  buildCatalogYears,
  filterCatalogStreamsByYears,
  filterFlattenedCatalogSongs,
  filterGroupedCatalogSongs,
  flattenCatalogSongs,
  sortCatalogSongsByTitle,
  type CatalogFilterState,
  type CatalogSong,
  type CatalogStream,
} from '../lib/catalogData';

interface UseCatalogDerivedDataOptions {
  streams: CatalogStream[];
  songs: CatalogSong[];
  searchTerm: string;
  selectedStreamId: string | null;
  selectedArtist: string | null;
  selectedYears: ReadonlySet<number>;
}

export function useCatalogDerivedData({
  streams,
  songs,
  searchTerm,
  selectedStreamId,
  selectedArtist,
  selectedYears,
}: UseCatalogDerivedDataOptions) {
  const filters: CatalogFilterState = useMemo(() => ({
    searchTerm,
    selectedStreamId,
    selectedArtist,
    selectedYears,
  }), [searchTerm, selectedArtist, selectedStreamId, selectedYears]);

  const allArtists = useMemo(() => {
    return buildCatalogArtistList(songs);
  }, [songs]);

  const availableYears = useMemo(() => {
    return buildCatalogYears(streams);
  }, [streams]);

  const filteredStreams = useMemo(() => {
    return filterCatalogStreamsByYears(streams, selectedYears);
  }, [streams, selectedYears]);

  const allFlattenedSongs = useMemo(() => {
    return flattenCatalogSongs(songs);
  }, [songs]);

  const flattenedSongs = useMemo(() => {
    return filterFlattenedCatalogSongs(allFlattenedSongs, filters);
  }, [allFlattenedSongs, filters]);

  const allGroupedSongs = useMemo(() => {
    return sortCatalogSongsByTitle(songs);
  }, [songs]);

  const groupedSongs = useMemo(() => {
    return filterGroupedCatalogSongs(allGroupedSongs, filters);
  }, [allGroupedSongs, filters]);

  return {
    allArtists,
    availableYears,
    filteredStreams,
    flattenedSongs,
    groupedSongs,
  };
}
