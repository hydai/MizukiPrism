"""Local SQLite cache for MizukiLens stream data.

Handles database creation, schema initialization, and CRUD operations for
the ``streams`` and ``parsed_songs`` tables as defined in §4.3.2 of the spec.

Cache path comes from the config file (default: ``~/.local/share/mizukilens/cache.db``).
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Status enum values (§3.1.7)
# ---------------------------------------------------------------------------

VALID_STATUSES: tuple[str, ...] = (
    "discovered",
    "extracted",
    "pending",
    "approved",
    "exported",
    "imported",
    "excluded",
)

# Valid status transitions: each key may transition to any value in its set.
# ``None`` key covers the initial insertion (no prior status).
VALID_TRANSITIONS: dict[str | None, set[str]] = {
    None:          {"discovered"},
    "discovered":  {"extracted", "pending", "excluded"},
    "extracted":   {"pending", "approved", "excluded"},
    "pending":     {"extracted", "approved", "excluded"},
    "approved":    {"exported", "extracted"},   # re-review goes back to extracted
    "exported":    {"imported", "approved"},
    "imported":    {"approved"},                # allow re-review after import
    "excluded":    {"discovered"},              # undo exclusion if needed
}


# ---------------------------------------------------------------------------
# Default cache path
# ---------------------------------------------------------------------------

DEFAULT_CACHE_PATH = Path.home() / ".local" / "share" / "mizukilens" / "cache.db"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _resolve_cache_path(path: str | Path | None = None) -> Path:
    """Return the resolved Path for the cache database.

    Priority: explicit *path* argument → config → DEFAULT_CACHE_PATH.
    The ``~`` prefix is expanded.
    """
    if path is not None:
        return Path(path).expanduser()
    # Try to load from config
    try:
        from mizukilens.config import load_config  # local import to avoid cycles
        cfg = load_config()
        if cfg:
            raw = cfg.get("cache", {}).get("path")
            if raw:
                return Path(raw).expanduser()
    except Exception:  # noqa: BLE001
        pass
    return DEFAULT_CACHE_PATH


def _now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(tz=timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Schema DDL
# ---------------------------------------------------------------------------

_CREATE_STREAMS = """
CREATE TABLE IF NOT EXISTS streams (
    video_id            TEXT PRIMARY KEY,
    channel_id          TEXT,
    title               TEXT,
    date                TEXT,
    date_source         TEXT,
    status              TEXT NOT NULL,
    source              TEXT,
    raw_comment         TEXT,
    raw_description     TEXT,
    comment_author      TEXT,
    comment_author_url  TEXT,
    comment_id          TEXT,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);
"""

_CREATE_PARSED_SONGS = """
CREATE TABLE IF NOT EXISTS parsed_songs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id         TEXT NOT NULL REFERENCES streams(video_id) ON DELETE CASCADE,
    order_index      INTEGER NOT NULL,
    song_name        TEXT NOT NULL,
    artist           TEXT,
    start_timestamp  TEXT NOT NULL,
    end_timestamp    TEXT,
    note             TEXT
);
"""

_CREATE_CANDIDATE_COMMENTS = """
CREATE TABLE IF NOT EXISTS candidate_comments (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id           TEXT NOT NULL REFERENCES streams(video_id) ON DELETE CASCADE,
    comment_cid        TEXT,
    comment_author     TEXT,
    comment_author_url TEXT,
    comment_text       TEXT NOT NULL,
    keywords_matched   TEXT,
    status             TEXT NOT NULL DEFAULT 'pending',
    created_at         TEXT NOT NULL,
    updated_at         TEXT NOT NULL
);
"""

VALID_CANDIDATE_STATUSES: tuple[str, ...] = ("pending", "approved", "rejected")

_CREATE_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);",
    "CREATE INDEX IF NOT EXISTS idx_parsed_songs_video_id ON parsed_songs(video_id);",
    "CREATE INDEX IF NOT EXISTS idx_candidate_comments_video_id ON candidate_comments(video_id);",
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_db_path(path: str | Path | None = None) -> Path:
    """Return the resolved database path without opening it."""
    return _resolve_cache_path(path)


def open_db(path: str | Path | None = None) -> sqlite3.Connection:
    """Open (and initialise) the SQLite database, creating directories as needed.

    Args:
        path: Override the database path.  Defaults to the config-specified path
              or ``~/.local/share/mizukilens/cache.db``.

    Returns:
        An open :class:`sqlite3.Connection` with foreign-key support enabled.
        The caller is responsible for closing the connection (use as a context
        manager or call ``conn.close()``).
    """
    db_path = _resolve_cache_path(path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    _init_schema(conn)
    return conn


def _init_schema(conn: sqlite3.Connection) -> None:
    """Create tables and indexes if they do not exist."""
    conn.execute(_CREATE_STREAMS)
    conn.execute(_CREATE_PARSED_SONGS)
    conn.execute(_CREATE_CANDIDATE_COMMENTS)
    for idx in _CREATE_INDEXES:
        conn.execute(idx)

    # Migration: add comment attribution columns to existing databases.
    # ALTER TABLE ... ADD COLUMN is a no-op if the column already exists
    # (SQLite raises "duplicate column name" which we catch and ignore).
    for col in ("comment_author TEXT", "comment_author_url TEXT", "comment_id TEXT"):
        try:
            conn.execute(f"ALTER TABLE streams ADD COLUMN {col}")
        except sqlite3.OperationalError:
            pass  # column already exists

    # Migration: add date_source column to track date precision.
    try:
        conn.execute("ALTER TABLE streams ADD COLUMN date_source TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists

    conn.commit()


# ---------------------------------------------------------------------------
# Status transition validation
# ---------------------------------------------------------------------------

def is_valid_transition(from_status: str | None, to_status: str) -> bool:
    """Return True if transitioning from *from_status* to *to_status* is legal.

    ``from_status=None`` represents a fresh insertion (no prior state).

    Examples::

        is_valid_transition(None, "discovered")      # True  — initial insert
        is_valid_transition("discovered", "extracted")  # True
        is_valid_transition("discovered", "imported")   # False
    """
    if to_status not in VALID_STATUSES:
        return False
    allowed = VALID_TRANSITIONS.get(from_status, set())
    return to_status in allowed


# ---------------------------------------------------------------------------
# Stream CRUD
# ---------------------------------------------------------------------------

def upsert_stream(
    conn: sqlite3.Connection,
    *,
    video_id: str,
    channel_id: str | None = None,
    title: str | None = None,
    date: str | None = None,
    date_source: str | None = None,
    status: str,
    source: str | None = None,
    raw_comment: str | None = None,
    raw_description: str | None = None,
    comment_author: str | None = None,
    comment_author_url: str | None = None,
    comment_id: str | None = None,
) -> None:
    """Insert or update a stream row.

    On conflict (same *video_id*), updates all provided fields and bumps
    ``updated_at``.  The ``created_at`` field is only set on first insertion.

    When *date_source* is ``"precise"``, the date is considered authoritative.
    A subsequent upsert with a non-precise source will not overwrite a precise
    date or date_source.

    Raises:
        ValueError: If *status* is not in :data:`VALID_STATUSES`.
    """
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status {status!r}. Must be one of {VALID_STATUSES}")

    now = _now_iso()
    conn.execute(
        """
        INSERT INTO streams
            (video_id, channel_id, title, date, date_source, status, source,
             raw_comment, raw_description,
             comment_author, comment_author_url, comment_id,
             created_at, updated_at)
        VALUES
            (:video_id, :channel_id, :title, :date, :date_source, :status, :source,
             :raw_comment, :raw_description,
             :comment_author, :comment_author_url, :comment_id,
             :now, :now)
        ON CONFLICT(video_id) DO UPDATE SET
            channel_id         = COALESCE(:channel_id, channel_id),
            title              = COALESCE(:title, title),
            date               = CASE
                WHEN date_source = 'precise'
                     AND (:date_source IS NULL OR :date_source != 'precise')
                    THEN date
                ELSE COALESCE(:date, date)
            END,
            date_source        = CASE
                WHEN date_source = 'precise'
                     AND (:date_source IS NULL OR :date_source != 'precise')
                    THEN date_source
                ELSE COALESCE(:date_source, date_source)
            END,
            status             = :status,
            source             = COALESCE(:source, source),
            raw_comment        = COALESCE(:raw_comment, raw_comment),
            raw_description    = COALESCE(:raw_description, raw_description),
            comment_author     = COALESCE(:comment_author, comment_author),
            comment_author_url = COALESCE(:comment_author_url, comment_author_url),
            comment_id         = COALESCE(:comment_id, comment_id),
            updated_at         = :now
        """,
        {
            "video_id":           video_id,
            "channel_id":         channel_id,
            "title":              title,
            "date":               date,
            "date_source":        date_source,
            "status":             status,
            "source":             source,
            "raw_comment":        raw_comment,
            "raw_description":    raw_description,
            "comment_author":     comment_author,
            "comment_author_url": comment_author_url,
            "comment_id":         comment_id,
            "now":                now,
        },
    )
    conn.commit()


def update_stream_status(
    conn: sqlite3.Connection,
    video_id: str,
    new_status: str,
) -> None:
    """Update the status of an existing stream, validating the transition.

    Raises:
        ValueError: If *new_status* is invalid or the transition is not allowed.
        KeyError: If *video_id* is not found in the cache.
    """
    row = get_stream(conn, video_id)
    if row is None:
        raise KeyError(f"Stream {video_id!r} not found in cache.")

    current = row["status"]
    if not is_valid_transition(current, new_status):
        raise ValueError(
            f"Cannot transition stream {video_id!r} from {current!r} to {new_status!r}."
        )

    conn.execute(
        "UPDATE streams SET status = ?, updated_at = ? WHERE video_id = ?",
        (new_status, _now_iso(), video_id),
    )
    conn.commit()


def update_stream_date(
    conn: sqlite3.Connection,
    video_id: str,
    new_date: str,
) -> bool:
    """Backfill a NULL date for an existing stream.

    Only updates when the current ``date`` is NULL **and** ``date_source``
    is not ``'precise'`` (precise dates should never be overwritten by a
    relative backfill).

    Returns:
        True if the date was updated, False otherwise.
    """
    cur = conn.execute(
        "UPDATE streams SET date = ?, date_source = 'relative', updated_at = ? "
        "WHERE video_id = ? AND date IS NULL AND (date_source IS NULL OR date_source != 'precise')",
        (new_date, _now_iso(), video_id),
    )
    conn.commit()
    return cur.rowcount > 0


def get_stream(conn: sqlite3.Connection, video_id: str) -> sqlite3.Row | None:
    """Fetch a single stream row by *video_id*, or None if not found."""
    cur = conn.execute("SELECT * FROM streams WHERE video_id = ?", (video_id,))
    return cur.fetchone()


def list_streams(
    conn: sqlite3.Connection,
    status: str | None = None,
) -> list[sqlite3.Row]:
    """Return all stream rows, optionally filtered by *status*."""
    if status is not None:
        cur = conn.execute(
            "SELECT * FROM streams WHERE status = ? ORDER BY date DESC, video_id",
            (status,),
        )
    else:
        cur = conn.execute("SELECT * FROM streams ORDER BY date DESC, video_id")
    return cur.fetchall()


def delete_stream(conn: sqlite3.Connection, video_id: str) -> bool:
    """Delete a stream (and its parsed songs via cascade).

    Returns:
        True if a row was deleted, False if not found.
    """
    cur = conn.execute("DELETE FROM streams WHERE video_id = ?", (video_id,))
    conn.commit()
    return cur.rowcount > 0


# ---------------------------------------------------------------------------
# Status statistics
# ---------------------------------------------------------------------------

def get_status_counts(conn: sqlite3.Connection) -> dict[str, int]:
    """Return a dict mapping each status to the number of streams with that status.

    All seven canonical statuses are included even if their count is zero.
    """
    cur = conn.execute(
        "SELECT status, COUNT(*) as cnt FROM streams GROUP BY status"
    )
    counts: dict[str, int] = {s: 0 for s in VALID_STATUSES}
    for row in cur.fetchall():
        counts[row["status"]] = row["cnt"]
    return counts


# ---------------------------------------------------------------------------
# Parsed songs CRUD
# ---------------------------------------------------------------------------

def upsert_parsed_songs(
    conn: sqlite3.Connection,
    video_id: str,
    songs: list[dict[str, Any]],
) -> None:
    """Replace all parsed songs for *video_id* with *songs*.

    Each item in *songs* is a dict with keys:
      - ``order_index`` (int)
      - ``song_name`` (str)
      - ``artist`` (str | None)
      - ``start_timestamp`` (str)
      - ``end_timestamp`` (str | None)
      - ``note`` (str | None)

    Existing rows for the stream are deleted before inserting the new list.

    Raises:
        KeyError: If *video_id* does not exist in the streams table.
    """
    if get_stream(conn, video_id) is None:
        raise KeyError(f"Stream {video_id!r} not found; cannot insert parsed songs.")

    conn.execute("DELETE FROM parsed_songs WHERE video_id = ?", (video_id,))
    conn.executemany(
        """
        INSERT INTO parsed_songs
            (video_id, order_index, song_name, artist,
             start_timestamp, end_timestamp, note)
        VALUES
            (:video_id, :order_index, :song_name, :artist,
             :start_timestamp, :end_timestamp, :note)
        """,
        [
            {
                "video_id":        video_id,
                "order_index":     s["order_index"],
                "song_name":       s["song_name"],
                "artist":          s.get("artist"),
                "start_timestamp": s["start_timestamp"],
                "end_timestamp":   s.get("end_timestamp"),
                "note":            s.get("note"),
            }
            for s in songs
        ],
    )
    conn.commit()


def get_parsed_songs(
    conn: sqlite3.Connection,
    video_id: str,
) -> list[sqlite3.Row]:
    """Return all parsed songs for *video_id*, ordered by *order_index*."""
    cur = conn.execute(
        "SELECT * FROM parsed_songs WHERE video_id = ? ORDER BY order_index",
        (video_id,),
    )
    return cur.fetchall()


# ---------------------------------------------------------------------------
# Cache-clear operations
# ---------------------------------------------------------------------------

def clear_all(conn: sqlite3.Connection) -> int:
    """Delete every stream (and its parsed songs) from the cache.

    Returns:
        The number of stream rows deleted.
    """
    cur = conn.execute("SELECT COUNT(*) FROM streams")
    count = cur.fetchone()[0]
    conn.execute("DELETE FROM parsed_songs")
    conn.execute("DELETE FROM streams")
    conn.commit()
    return count


def clear_stream(conn: sqlite3.Connection, video_id: str) -> bool:
    """Delete a single stream (and its parsed songs) from the cache.

    Returns:
        True if the stream was found and deleted, False otherwise.
    """
    return delete_stream(conn, video_id)


# ---------------------------------------------------------------------------
# Candidate comments CRUD
# ---------------------------------------------------------------------------

def save_candidate_comments(
    conn: sqlite3.Connection,
    video_id: str,
    candidates: list[dict[str, Any]],
) -> int:
    """Bulk-insert candidate comments, deduplicating by ``comment_cid``.

    Each item in *candidates* should have keys:
      - ``comment_cid`` (str | None)
      - ``comment_author`` (str | None)
      - ``comment_author_url`` (str | None)
      - ``comment_text`` (str)
      - ``keywords_matched`` (list[str])

    Returns:
        Number of new candidates inserted (after dedup).
    """
    # Fetch existing cids for this video
    cur = conn.execute(
        "SELECT comment_cid FROM candidate_comments WHERE video_id = ?",
        (video_id,),
    )
    existing_cids: set[str | None] = {row["comment_cid"] for row in cur.fetchall()}

    now = _now_iso()
    inserted = 0
    for c in candidates:
        cid = c.get("comment_cid")
        # Skip if this cid is already stored (dedup)
        if cid is not None and cid in existing_cids:
            continue
        keywords = c.get("keywords_matched", [])
        keywords_str = ",".join(keywords) if keywords else None
        conn.execute(
            """
            INSERT INTO candidate_comments
                (video_id, comment_cid, comment_author, comment_author_url,
                 comment_text, keywords_matched, status, created_at, updated_at)
            VALUES
                (:video_id, :comment_cid, :comment_author, :comment_author_url,
                 :comment_text, :keywords_matched, 'pending', :now, :now)
            """,
            {
                "video_id":           video_id,
                "comment_cid":        cid,
                "comment_author":     c.get("comment_author"),
                "comment_author_url": c.get("comment_author_url"),
                "comment_text":       c["comment_text"],
                "keywords_matched":   keywords_str,
                "now":                now,
            },
        )
        if cid is not None:
            existing_cids.add(cid)
        inserted += 1

    conn.commit()
    return inserted


def list_candidate_comments(
    conn: sqlite3.Connection,
    video_id: str | None = None,
    status: str | None = None,
) -> list[sqlite3.Row]:
    """Return candidate comment rows, optionally filtered by *video_id* and/or *status*."""
    query = "SELECT * FROM candidate_comments WHERE 1=1"
    params: list[Any] = []
    if video_id is not None:
        query += " AND video_id = ?"
        params.append(video_id)
    if status is not None:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    cur = conn.execute(query, params)
    return cur.fetchall()


def get_candidate_comment(
    conn: sqlite3.Connection,
    candidate_id: int,
) -> sqlite3.Row | None:
    """Fetch a single candidate comment row by *candidate_id*, or None if not found."""
    cur = conn.execute(
        "SELECT * FROM candidate_comments WHERE id = ?",
        (candidate_id,),
    )
    return cur.fetchone()


def update_candidate_status(
    conn: sqlite3.Connection,
    candidate_id: int,
    status: str,
) -> None:
    """Update the status of a candidate comment.

    Raises:
        ValueError: If *status* is not in ``("pending", "approved", "rejected")``.
        KeyError: If *candidate_id* is not found.
    """
    if status not in VALID_CANDIDATE_STATUSES:
        raise ValueError(
            f"Invalid candidate status {status!r}. "
            f"Must be one of {VALID_CANDIDATE_STATUSES}"
        )
    row = get_candidate_comment(conn, candidate_id)
    if row is None:
        raise KeyError(f"Candidate comment {candidate_id} not found.")

    conn.execute(
        "UPDATE candidate_comments SET status = ?, updated_at = ? WHERE id = ?",
        (status, _now_iso(), candidate_id),
    )
    conn.commit()


def clear_candidates(
    conn: sqlite3.Connection,
    video_id: str | None = None,
) -> int:
    """Delete candidate comments, optionally filtered by *video_id*.

    Returns:
        Number of rows deleted.
    """
    if video_id is not None:
        cur = conn.execute(
            "DELETE FROM candidate_comments WHERE video_id = ?",
            (video_id,),
        )
    else:
        cur = conn.execute("DELETE FROM candidate_comments")
    conn.commit()
    return cur.rowcount
