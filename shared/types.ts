export type FetchStatus = 'matched' | 'no_match' | 'error' | 'manual';
export type MatchConfidence = 'exact' | 'fuzzy' | 'manual';

export interface Performance {
  id: string;
  streamId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp: number | null;
  note: string;
}

export interface Song {
  id: string;
  title: string;
  originalArtist: string;
  tags: string[];
  performances: Performance[];
}

export interface StreamCredit {
  author?: string;
  authorUrl?: string;
  commentUrl?: string;
}

export interface Stream {
  id: string;
  title: string;
  date: string;
  videoId: string;
  youtubeUrl: string;
  credit?: StreamCredit;
}

export interface AlbumArtUrls {
  small?: string;
  medium?: string;
  big?: string;
  xl?: string;
}

export interface SongMetadata {
  songId: string;
  fetchStatus: FetchStatus;
  matchConfidence: MatchConfidence | null;
  albumArtUrl: string | null;
  albumArtUrls: AlbumArtUrls | null;
  albumTitle: string | null;
  deezerTrackId: number | null;
  deezerArtistId: number | null;
  itunesTrackId?: number | null;
  itunesCollectionId?: number | null;
  trackDuration: number | null;
  fetchedAt: string;
  lastError: string | null;
}

export interface ArtistPictureUrls {
  medium?: string;
  big?: string;
  xl?: string;
}

export interface ArtistInfo {
  normalizedArtist: string;
  originalName: string;
  deezerArtistId?: number | null;
  itunesArtistId?: number | null;
  pictureUrls?: ArtistPictureUrls | null;
  fetchedAt: string;
}
