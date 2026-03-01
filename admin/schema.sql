-- MizukiPrism Admin Staging Database Schema
-- Cloudflare D1 (SQLite-based)

-- Songs staging table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_artist TEXT NOT NULL,
  tags TEXT DEFAULT '[]',  -- JSON array of strings
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  reviewed_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Performances (linked to songs)
CREATE TABLE IF NOT EXISTS performances (
  id TEXT PRIMARY KEY,
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  date TEXT NOT NULL,
  stream_title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  end_timestamp INTEGER,
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Streams staging table
CREATE TABLE IF NOT EXISTS streams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  video_id TEXT NOT NULL UNIQUE,
  youtube_url TEXT NOT NULL,
  credit TEXT DEFAULT '{}',  -- JSON object {author, authorUrl, commentUrl}
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  reviewed_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_performances_song_id ON performances(song_id);
CREATE INDEX IF NOT EXISTS idx_performances_status ON performances(status);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_video_id ON streams(video_id);
