// Shared types between Workers API and Admin UI
// Derived from lib/types.ts (fan site) with admin-specific additions

export type Status = 'pending' | 'approved' | 'rejected';

// --- Database row types (match D1 schema) ---

export interface SongRow {
  id: string;
  title: string;
  original_artist: string;
  tags: string;       // JSON array string
  status: Status;
  submitted_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerformanceRow {
  id: string;
  song_id: string;
  stream_id: string;
  date: string;
  stream_title: string;
  video_id: string;
  timestamp: number;
  end_timestamp: number | null;
  note: string;
  status: Status;
  submitted_by: string | null;
  created_at: string;
}

export interface StreamRow {
  id: string;
  title: string;
  date: string;
  video_id: string;
  youtube_url: string;
  credit: string;     // JSON object string
  status: Status;
  submitted_by: string | null;
  reviewed_by: string | null;
  created_at: string;
}

// --- API response types (parsed JSON fields) ---

export interface Song {
  id: string;
  title: string;
  originalArtist: string;
  tags: string[];
  status: Status;
  submittedBy: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  performances?: Performance[];
}

export interface Performance {
  id: string;
  songId: string;
  streamId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp: number | null;
  note: string;
  status: Status;
  submittedBy: string | null;
  createdAt: string;
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
  credit: StreamCredit;
  status: Status;
  submittedBy: string | null;
  reviewedBy: string | null;
  createdAt: string;
}

// --- Request body types ---

export interface CreateSongBody {
  title: string;
  originalArtist: string;
  tags?: string[];
  performances?: CreatePerformanceBody[];
}

export interface UpdateSongBody {
  title?: string;
  originalArtist?: string;
  tags?: string[];
}

export interface CreatePerformanceBody {
  songId: string;
  streamId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number | null;
  note?: string;
}

export interface CreateStreamBody {
  title: string;
  date: string;
  videoId: string;
  youtubeUrl: string;
  credit?: StreamCredit;
}

export interface StatusUpdateBody {
  status: 'approved' | 'rejected';
}

// --- Auth types ---

export type Role = 'curator' | 'contributor';

export interface AuthUser {
  email: string;
  role: Role;
}

// --- API list response ---

export interface ListResponse<T> {
  data: T[];
  total: number;
}

// --- Dashboard stats ---

export interface DashboardStats {
  songs: { pending: number; approved: number; rejected: number };
  streams: { pending: number; approved: number; rejected: number };
  performances: { pending: number; approved: number; rejected: number };
  recentSubmissions: (Song | Stream)[];
}
