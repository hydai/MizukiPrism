import type {
  Performance as SharedPerformance,
  Song as SharedSong,
  SongMetadata as SharedSongMetadata,
  Stream as SharedStream,
} from '../../shared/types';

export type CatalogPerformance = SharedPerformance;

export interface CatalogSong extends SharedSong {
  albumArtUrl?: string;
}

export type CatalogStream = Pick<SharedStream, 'id' | 'title' | 'date' | 'videoId'>;

export interface FlattenedSong extends CatalogSong {
  performanceId: string;
  streamId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
  note: string;
  searchString: string;
  year: number;
}

export type CatalogMetadataEntry = Pick<SharedSongMetadata, 'songId' | 'albumArtUrl' | 'albumArtUrls'>;

export interface CatalogMetadataResponse {
  songMetadata: CatalogMetadataEntry[];
}

export interface CatalogFilterState {
  searchTerm: string;
  selectedStreamId: string | null;
  selectedArtist: string | null;
  selectedYears: ReadonlySet<number>;
}

function getCatalogDateYear(date: string): number {
  return Number(date.slice(0, 4));
}

export function buildAlbumArtMap(metadata: CatalogMetadataEntry[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of metadata) {
    const url = entry.albumArtUrl ?? entry.albumArtUrls?.small;
    if (url) {
      map.set(entry.songId, url);
    }
  }

  return map;
}

export function mergeAlbumArtIntoSongs(
  songs: CatalogSong[],
  albumArtBySongId: Map<string, string>,
): CatalogSong[] {
  return songs.map((song) => ({
    ...song,
    albumArtUrl: albumArtBySongId.get(song.id),
  }));
}

export function sortStreamsByDateDesc<T extends Pick<CatalogStream, 'date'>>(streams: T[]): T[] {
  return streams
    .map((stream) => ({ stream, timestamp: Date.parse(stream.date) }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(({ stream }) => stream);
}

export function buildCatalogArtistList(songs: CatalogSong[]): string[] {
  const artists = new Set<string>();
  songs.forEach((song) => artists.add(song.originalArtist));
  return Array.from(artists).sort((a, b) => a.localeCompare(b, 'zh-TW'));
}

export function buildCatalogYears(streams: Pick<CatalogStream, 'date'>[]): number[] {
  const years = new Set<number>();
  streams.forEach((stream) => years.add(getCatalogDateYear(stream.date)));
  return Array.from(years).sort((a, b) => b - a);
}

export function filterCatalogStreamsByYears<T extends Pick<CatalogStream, 'date'>>(
  streams: T[],
  selectedYears: ReadonlySet<number>,
): T[] {
  if (selectedYears.size === 0) return streams;
  return streams.filter((stream) => selectedYears.has(getCatalogDateYear(stream.date)));
}

export function flattenCatalogSongs(songs: CatalogSong[]): FlattenedSong[] {
  const result: FlattenedSong[] = [];

  songs.forEach((song) => {
    song.performances.forEach((performance) => {
      result.push({
        ...song,
        performanceId: performance.id,
        streamId: performance.streamId,
        date: performance.date,
        streamTitle: performance.streamTitle,
        videoId: performance.videoId,
        timestamp: performance.timestamp,
        endTimestamp: performance.endTimestamp ?? undefined,
        note: performance.note,
        searchString: `${song.title} ${song.originalArtist} ${performance.streamTitle}`.toLowerCase(),
        year: getCatalogDateYear(performance.date),
      });
    });
  });

  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

export function filterFlattenedCatalogSongs(
  songs: FlattenedSong[],
  filters: CatalogFilterState,
): FlattenedSong[] {
  const lowerTerm = filters.searchTerm.toLowerCase();

  return songs.filter((song) => {
    const matchesSearch = !lowerTerm || song.searchString.includes(lowerTerm);
    const matchesStream = filters.selectedStreamId ? song.streamId === filters.selectedStreamId : true;
    const matchesArtist = filters.selectedArtist ? song.originalArtist === filters.selectedArtist : true;
    const matchesYear = filters.selectedYears.size > 0 ? filters.selectedYears.has(song.year) : true;
    return matchesSearch && matchesStream && matchesArtist && matchesYear;
  });
}

export function sortCatalogSongsByTitle(songs: CatalogSong[]): CatalogSong[] {
  return [...songs].sort((a, b) => a.title.localeCompare(b.title, 'zh-TW'));
}

export function filterGroupedCatalogSongs(
  songs: CatalogSong[],
  filters: CatalogFilterState,
): CatalogSong[] {
  const lowerTerm = filters.searchTerm.toLowerCase();

  return songs.filter((song) => {
    const matchesSearch = !lowerTerm || `${song.title} ${song.originalArtist}`.toLowerCase().includes(lowerTerm);
    const matchesStream = filters.selectedStreamId
      ? song.performances.some((performance) => performance.streamId === filters.selectedStreamId)
      : true;
    const matchesArtist = filters.selectedArtist ? song.originalArtist === filters.selectedArtist : true;
    const matchesYear = filters.selectedYears.size > 0
      ? song.performances.some((performance) => filters.selectedYears.has(getCatalogDateYear(performance.date)))
      : true;
    return matchesSearch && matchesStream && matchesArtist && matchesYear;
  });
}
