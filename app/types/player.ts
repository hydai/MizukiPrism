export interface Track {
  id: string;
  songId: string;
  title: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
  deleted?: boolean;
  albumArtUrl?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
