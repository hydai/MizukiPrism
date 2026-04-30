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
  streamId?: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
  note: string;
  searchString: string;
  year?: number;
}

export type CatalogMetadataEntry = Pick<SharedSongMetadata, 'songId' | 'albumArtUrl' | 'albumArtUrls'>;

export interface CatalogMetadataResponse {
  songMetadata: CatalogMetadataEntry[];
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
