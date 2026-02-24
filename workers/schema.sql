-- MizukiPrism D1 Schema
-- Initialize with: wrangler d1 execute mizukiprism-db --file=schema.sql

CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID v4
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,      -- ISO 8601
  updated_at TEXT NOT NULL       -- ISO 8601
);

CREATE TABLE playlists (
  id TEXT PRIMARY KEY,           -- Client-generated playlist ID
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  versions TEXT NOT NULL,        -- JSON array of PlaylistVersion[]
  created_at INTEGER NOT NULL,   -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL,   -- Unix timestamp (ms)
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
