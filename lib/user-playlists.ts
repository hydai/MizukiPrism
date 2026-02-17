import fs from 'fs';
import path from 'path';

export interface PlaylistVersion {
  performanceId: string;
  songTitle: string;
  originalArtist: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number;
}

export interface CloudPlaylist {
  id: string;
  name: string;
  versions: PlaylistVersion[];
  createdAt: number;
  updatedAt: number;
}

const userPlaylistsDir = path.join(process.cwd(), 'data', 'user-playlists');

function ensureDir() {
  if (!fs.existsSync(userPlaylistsDir)) {
    fs.mkdirSync(userPlaylistsDir, { recursive: true });
  }
}

export function readUserPlaylists(userId: string): CloudPlaylist[] {
  ensureDir();
  const filePath = path.join(userPlaylistsDir, `${userId}.json`);
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as CloudPlaylist[];
  } catch {
    return [];
  }
}

export function writeUserPlaylists(userId: string, playlists: CloudPlaylist[]): void {
  ensureDir();
  const filePath = path.join(userPlaylistsDir, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(playlists, null, 2), 'utf-8');
}
