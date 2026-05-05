export interface PlaylistVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}

export interface Playlist {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistExportEnvelope {
  version: 1;
  exportedAt: string;
  source: 'MizukiPrism';
  playlists: Playlist[];
}
