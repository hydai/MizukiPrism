export interface LikedVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
  albumArtUrl?: string;
  likedAt: number;
}

export type LikeableVersion = Omit<LikedVersion, 'likedAt'>;
