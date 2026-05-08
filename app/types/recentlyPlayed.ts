export interface RecentPlay {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
  albumArtUrl?: string;
  playedAt: number;
}

export type RecentPlayable = Omit<RecentPlay, 'playedAt'>;
