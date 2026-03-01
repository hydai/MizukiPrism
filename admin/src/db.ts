import type {
  Song,
  SongRow,
  Performance,
  PerformanceRow,
  Stream,
  StreamRow,
  StreamCredit,
} from '../shared/types';

// --- Row → API type mappers ---

export function songFromRow(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    originalArtist: row.original_artist,
    tags: JSON.parse(row.tags),
    status: row.status,
    submittedBy: row.submitted_by,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function performanceFromRow(row: PerformanceRow): Performance {
  return {
    id: row.id,
    songId: row.song_id,
    streamId: row.stream_id,
    date: row.date,
    streamTitle: row.stream_title,
    videoId: row.video_id,
    timestamp: row.timestamp,
    endTimestamp: row.end_timestamp,
    note: row.note,
    status: row.status,
    submittedBy: row.submitted_by,
    createdAt: row.created_at,
  };
}

export function streamFromRow(row: StreamRow): Stream {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    videoId: row.video_id,
    youtubeUrl: row.youtube_url,
    credit: JSON.parse(row.credit) as StreamCredit,
    status: row.status,
    submittedBy: row.submitted_by,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
  };
}

// --- ID generation ---

export function generateSongId(): string {
  return `song-${crypto.randomUUID().slice(0, 8)}`;
}

export function generatePerformanceId(): string {
  return `p-${crypto.randomUUID().slice(0, 8)}`;
}

export function generateStreamId(date: string): string {
  return `stream-${date}`;
}

export function generateStreamIdFallback(): string {
  return `stream-${crypto.randomUUID().slice(0, 8)}`;
}

// --- Query helpers ---

export async function listSongs(
  db: D1Database,
  status?: string,
): Promise<Song[]> {
  const query = status
    ? db.prepare('SELECT * FROM songs WHERE status = ? ORDER BY created_at DESC').bind(status)
    : db.prepare('SELECT * FROM songs ORDER BY created_at DESC');
  const { results } = await query.all<SongRow>();
  return results.map(songFromRow);
}

export async function getSongById(
  db: D1Database,
  id: string,
): Promise<Song | null> {
  const row = await db
    .prepare('SELECT * FROM songs WHERE id = ?')
    .bind(id)
    .first<SongRow>();
  if (!row) return null;

  const song = songFromRow(row);
  const { results: perfRows } = await db
    .prepare('SELECT * FROM performances WHERE song_id = ? ORDER BY date DESC')
    .bind(id)
    .all<PerformanceRow>();
  song.performances = perfRows.map(performanceFromRow);
  return song;
}

export async function insertSong(
  db: D1Database,
  id: string,
  title: string,
  originalArtist: string,
  tags: string[],
  submittedBy: string,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO songs (id, title, original_artist, tags, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(id, title, originalArtist, JSON.stringify(tags), 'pending', submittedBy)
    .run();
}

export async function updateSong(
  db: D1Database,
  id: string,
  fields: { title?: string; originalArtist?: string; tags?: string[] },
): Promise<void> {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (fields.title !== undefined) {
    sets.push('title = ?');
    values.push(fields.title);
  }
  if (fields.originalArtist !== undefined) {
    sets.push('original_artist = ?');
    values.push(fields.originalArtist);
  }
  if (fields.tags !== undefined) {
    sets.push('tags = ?');
    values.push(JSON.stringify(fields.tags));
  }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE songs SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function updateSongStatus(
  db: D1Database,
  id: string,
  status: string,
  reviewedBy: string,
): Promise<boolean> {
  const result = await db
    .prepare(
      "UPDATE songs SET status = ?, reviewed_by = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .bind(status, reviewedBy, id)
    .run();
  return result.meta.changes > 0;
}

// --- Performances ---

export async function listPerformances(
  db: D1Database,
  songId?: string,
  status?: string,
): Promise<Performance[]> {
  let sql = 'SELECT * FROM performances WHERE 1=1';
  const binds: string[] = [];

  if (songId) {
    sql += ' AND song_id = ?';
    binds.push(songId);
  }
  if (status) {
    sql += ' AND status = ?';
    binds.push(status);
  }
  sql += ' ORDER BY date DESC';

  const stmt = binds.length > 0
    ? db.prepare(sql).bind(...binds)
    : db.prepare(sql);
  const { results } = await stmt.all<PerformanceRow>();
  return results.map(performanceFromRow);
}

export async function insertPerformance(
  db: D1Database,
  id: string,
  songId: string,
  streamId: string,
  date: string,
  streamTitle: string,
  videoId: string,
  timestamp: number,
  endTimestamp: number | null,
  note: string,
  submittedBy: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO performances (id, song_id, stream_id, date, stream_title, video_id, timestamp, end_timestamp, note, status, submitted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, songId, streamId, date, streamTitle, videoId, timestamp, endTimestamp, note, 'pending', submittedBy)
    .run();
}

export async function updatePerformanceStatus(
  db: D1Database,
  id: string,
  status: string,
): Promise<boolean> {
  const result = await db
    .prepare('UPDATE performances SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();
  return result.meta.changes > 0;
}

// --- Streams ---

export async function listStreams(
  db: D1Database,
  status?: string,
): Promise<Stream[]> {
  const query = status
    ? db.prepare('SELECT * FROM streams WHERE status = ? ORDER BY date DESC').bind(status)
    : db.prepare('SELECT * FROM streams ORDER BY date DESC');
  const { results } = await query.all<StreamRow>();
  return results.map(streamFromRow);
}

export async function getStreamById(
  db: D1Database,
  id: string,
): Promise<Stream | null> {
  const row = await db
    .prepare('SELECT * FROM streams WHERE id = ?')
    .bind(id)
    .first<StreamRow>();
  return row ? streamFromRow(row) : null;
}

export async function insertStream(
  db: D1Database,
  id: string,
  title: string,
  date: string,
  videoId: string,
  youtubeUrl: string,
  credit: string,
  submittedBy: string,
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO streams (id, title, date, video_id, youtube_url, credit, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(id, title, date, videoId, youtubeUrl, credit, 'pending', submittedBy)
    .run();
}

export async function streamIdExists(
  db: D1Database,
  id: string,
): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 FROM streams WHERE id = ?')
    .bind(id)
    .first();
  return row !== null;
}

export async function updateStreamStatus(
  db: D1Database,
  id: string,
  status: string,
  reviewedBy: string,
): Promise<boolean> {
  const result = await db
    .prepare("UPDATE streams SET status = ?, reviewed_by = ? WHERE id = ?")
    .bind(status, reviewedBy, id)
    .run();
  return result.meta.changes > 0;
}

// --- Stats ---

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

async function countByStatus(
  db: D1Database,
  table: string,
): Promise<StatusCounts> {
  const { results } = await db
    .prepare(`SELECT status, COUNT(*) as count FROM ${table} GROUP BY status`)
    .all<{ status: string; count: number }>();

  const counts: StatusCounts = { pending: 0, approved: 0, rejected: 0 };
  for (const row of results) {
    if (row.status in counts) {
      counts[row.status as keyof StatusCounts] = row.count;
    }
  }
  return counts;
}

export async function getDashboardStats(db: D1Database) {
  const [songs, streams, performances] = await Promise.all([
    countByStatus(db, 'songs'),
    countByStatus(db, 'streams'),
    countByStatus(db, 'performances'),
  ]);

  // Recent submissions: last 10 songs + streams, sorted by created_at
  const { results: recentSongRows } = await db
    .prepare("SELECT * FROM songs ORDER BY created_at DESC LIMIT 5")
    .all<SongRow>();
  const { results: recentStreamRows } = await db
    .prepare("SELECT * FROM streams ORDER BY created_at DESC LIMIT 5")
    .all<StreamRow>();

  const recentSubmissions = [
    ...recentSongRows.map(songFromRow),
    ...recentStreamRows.map(streamFromRow),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return { songs, streams, performances, recentSubmissions };
}

// --- Export helpers (fan-site format) ---

export async function exportSongs(db: D1Database) {
  const { results: songRows } = await db
    .prepare("SELECT * FROM songs WHERE status = 'approved' ORDER BY title")
    .all<SongRow>();
  const { results: perfRows } = await db
    .prepare("SELECT * FROM performances WHERE status = 'approved' ORDER BY date")
    .all<PerformanceRow>();

  // Group performances by song_id
  const perfsBySong = new Map<string, PerformanceRow[]>();
  for (const p of perfRows) {
    const list = perfsBySong.get(p.song_id) || [];
    list.push(p);
    perfsBySong.set(p.song_id, list);
  }

  return songRows.map((row) => ({
    id: row.id,
    title: row.title,
    originalArtist: row.original_artist,
    tags: JSON.parse(row.tags) as string[],
    performances: (perfsBySong.get(row.id) || []).map((p) => ({
      id: p.id,
      streamId: p.stream_id,
      date: p.date,
      streamTitle: p.stream_title,
      videoId: p.video_id,
      timestamp: p.timestamp,
      endTimestamp: p.end_timestamp,
      note: p.note,
    })),
  }));
}

export async function exportStreams(db: D1Database) {
  const { results: rows } = await db
    .prepare("SELECT * FROM streams WHERE status = 'approved' ORDER BY date DESC")
    .all<StreamRow>();

  return rows.map((row) => {
    const credit = JSON.parse(row.credit);
    const stream: Record<string, unknown> = {
      id: row.id,
      title: row.title,
      date: row.date,
      videoId: row.video_id,
      youtubeUrl: row.youtube_url,
    };
    // Only include credit if non-empty
    if (credit && Object.keys(credit).length > 0) {
      stream.credit = credit;
    }
    return stream;
  });
}
