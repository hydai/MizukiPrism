"""Metadata module for MizukiLens — Deezer album art and LRCLIB lyrics fetching.

Fetches music metadata from external APIs and stores results in static JSON
files under data/metadata/ in the MizukiPrism project root.

Public API
----------
normalize_artist(name: str) -> str
    Normalize an artist name for use as an ArtistInfo lookup key.

is_lrc_format(content: str) -> bool
    Return True if the content contains at least one LRC timestamp line.

fetch_deezer_metadata(artist: str, title: str) -> dict | None
    Search Deezer for a track, returning structured metadata.

fetch_lrclib_lyrics(artist: str, title: str) -> dict | None
    Search LRCLIB for synced/plain lyrics.

read_metadata_file(path: Path) -> list[dict]
    Load a JSON array from a metadata file (graceful on missing/corrupt).

write_metadata_file(path: Path, data: list[dict]) -> None
    Atomically write a JSON array to a metadata file.

upsert_song_metadata(records: list[dict], entry: dict) -> list[dict]
    Upsert a SongMetadata record by songId.

upsert_song_lyrics(records: list[dict], entry: dict) -> list[dict]
    Upsert a SongLyrics record by songId.

upsert_artist_info(records: list[dict], entry: dict) -> list[dict]
    Upsert an ArtistInfo record by normalizedArtist.

fetch_song_metadata(song: dict, metadata_dir: Path, fetch_deezer: bool, fetch_lyrics: bool) -> FetchResult
    Fetch and persist metadata for a single song.

get_metadata_status(songs_path: Path, metadata_dir: Path) -> list[SongStatusRecord]
    Cross-reference songs.json with metadata files to compute per-song status.
"""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEEZER_SEARCH_URL = "https://api.deezer.com/search"
LRCLIB_SEARCH_URL = "https://lrclib.net/api/search"

# Rate limiting: 200ms min between calls, max 8 req/sec
_MIN_INTERVAL_SEC = 0.2
_TIMEOUT_SEC = 5.0

# Staleness threshold: 90 days
STALE_DAYS = 90


# ---------------------------------------------------------------------------
# Rate limiter state (module-level, shared across all calls in a session)
# ---------------------------------------------------------------------------

_last_deezer_call: float = 0.0
_last_lrclib_call: float = 0.0


def _wait_deezer() -> None:
    """Enforce minimum interval between Deezer API calls."""
    global _last_deezer_call
    elapsed = time.monotonic() - _last_deezer_call
    if elapsed < _MIN_INTERVAL_SEC:
        time.sleep(_MIN_INTERVAL_SEC - elapsed)
    _last_deezer_call = time.monotonic()


def _wait_lrclib() -> None:
    """Enforce minimum interval between LRCLIB API calls."""
    global _last_lrclib_call
    elapsed = time.monotonic() - _last_lrclib_call
    if elapsed < _MIN_INTERVAL_SEC:
        time.sleep(_MIN_INTERVAL_SEC - elapsed)
    _last_lrclib_call = time.monotonic()


# ---------------------------------------------------------------------------
# Artist name normalization
# ---------------------------------------------------------------------------

def normalize_artist(name: str) -> str:
    """Normalize an artist name for use as an ArtistInfo lookup key.

    Converts to lowercase, strips leading/trailing whitespace, and collapses
    multiple internal spaces into a single space.

    Examples::

        normalize_artist("YOASOBI")         -> "yoasobi"
        normalize_artist("  宇多田 光  ")   -> "宇多田 光"
        normalize_artist("Ado")             -> "ado"
    """
    return " ".join(name.lower().strip().split())


# LRC timestamp pattern: [MM:SS] or [MM:SS.xx] or [MM:SS.xxx]
_LRC_TIMESTAMP_RE = re.compile(r"\[\d{2}:\d{2}[.\d]*\]")


def is_lrc_format(content: str) -> bool:
    """Return True if the content contains at least one LRC timestamp line.

    LRC format detection: a line matches if it contains a timestamp of the
    form ``[MM:SS]``, ``[MM:SS.xx]``, or ``[MM:SS.xxx]``.

    Examples::

        is_lrc_format("[00:05.00] Test lyric line\\n")  -> True
        is_lrc_format("Just plain text\\n")             -> False
        is_lrc_format("[01:23] line\\n[02:34] more\\n") -> True
    """
    for line in content.splitlines():
        if _LRC_TIMESTAMP_RE.search(line):
            return True
    return False


# ---------------------------------------------------------------------------
# HTTP helper
# ---------------------------------------------------------------------------

def _http_get_json(url: str, timeout: float = _TIMEOUT_SEC) -> Any:
    """Perform a GET request and return parsed JSON.

    Raises:
        urllib.error.URLError: On network failure.
        urllib.error.HTTPError: On non-2xx HTTP response.
        TimeoutError: On connection/read timeout (mapped from socket.timeout).
        json.JSONDecodeError: If the response is not valid JSON.
    """
    import socket
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "MizukiLens/1.0 (MizukiPrism curator tool)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except socket.timeout as exc:
        raise TimeoutError(f"Request timed out: {url}") from exc


# ---------------------------------------------------------------------------
# Deezer API client
# ---------------------------------------------------------------------------

def _deezer_search(query: str) -> list[dict]:
    """Execute a single Deezer search and return the data list."""
    _wait_deezer()
    encoded = urllib.parse.urlencode({"q": query})
    url = f"{DEEZER_SEARCH_URL}?{encoded}"
    try:
        data = _http_get_json(url)
    except TimeoutError:
        raise
    except (urllib.error.URLError, json.JSONDecodeError) as exc:
        raise urllib.error.URLError(str(exc)) from exc
    return data.get("data", []) if isinstance(data, dict) else []


def _extract_deezer_metadata(track: dict) -> dict:
    """Extract structured metadata from a Deezer track result."""
    album = track.get("album", {})
    artist = track.get("artist", {})
    return {
        "deezerTrackId": track.get("id"),
        "deezerArtistId": artist.get("id"),
        "albumTitle": album.get("title"),
        "trackDuration": track.get("duration"),
        "albumArtUrls": {
            "small": album.get("cover_small", ""),
            "medium": album.get("cover_medium", ""),
            "big": album.get("cover_big", ""),
            "xl": album.get("cover_xl", ""),
        },
        "artistName": artist.get("name", ""),
        "artistPictureUrls": {
            "medium": artist.get("picture_medium", ""),
            "big": artist.get("picture_big", ""),
            "xl": artist.get("picture_xl", ""),
        },
    }


def fetch_deezer_metadata(original_artist: str, title: str) -> dict | None:
    """Search Deezer for a track using 4 fallback strategies.

    Strategy order:
      1. Structured: ``artist:"<artist>" track:"<title>"``
      2. Romanized:  convert artist to romaji (currently skipped; reserved slot)
      3. Simple:     ``<artist> <title>``
      4. Title-only: ``track:"<title>"``

    Returns a dict with keys: track_result, match_confidence, and the
    extracted Deezer metadata. Returns None only when no API call succeeded
    (network error propagated).

    On no-match (all strategies return 0 results), returns a dict with
    ``match_confidence=None`` and ``track_result=None``.
    """
    strategies = [
        (f'artist:"{original_artist}" track:"{title}"', "exact"),
        # Strategy 2: Romanized — reserved for future implementation.
        # Skipped because adding a romanization dependency (cutlet/pykakasi)
        # is complex and the simple fallback (strategy 3) often suffices.
        (f"{original_artist} {title}", "fuzzy"),
        (f'track:"{title}"', "fuzzy"),
    ]

    last_error: str | None = None

    for query, confidence in strategies:
        try:
            results = _deezer_search(query)
        except TimeoutError:
            last_error = "timeout"
            continue
        except urllib.error.URLError as exc:
            last_error = str(exc)
            continue

        if results:
            track = results[0]
            meta = _extract_deezer_metadata(track)
            meta["match_confidence"] = confidence
            return meta

    # All strategies exhausted with no results
    return {"match_confidence": None, "last_error": last_error}


# ---------------------------------------------------------------------------
# LRCLIB API client
# ---------------------------------------------------------------------------

def fetch_lrclib_lyrics(original_artist: str, title: str) -> dict:
    """Search LRCLIB for synced or plain lyrics.

    Uses a single search strategy (LRCLIB's own fuzzy matching).
    Prefers results with syncedLyrics; falls back to plainLyrics.

    Returns a dict with keys:
      - ``synced_lyrics``: LRC-format string or None
      - ``plain_lyrics``: plain text or None
      - ``matched``: bool — whether any result was found
      - ``last_error``: error message string or None
    """
    _wait_lrclib()

    params = urllib.parse.urlencode({
        "artist_name": original_artist,
        "track_name": title,
    })
    url = f"{LRCLIB_SEARCH_URL}?{params}"

    try:
        results = _http_get_json(url)
    except TimeoutError:
        return {"synced_lyrics": None, "plain_lyrics": None, "matched": False, "last_error": "timeout"}
    except (urllib.error.URLError, json.JSONDecodeError) as exc:
        return {"synced_lyrics": None, "plain_lyrics": None, "matched": False, "last_error": str(exc)}

    if not results or not isinstance(results, list):
        return {"synced_lyrics": None, "plain_lyrics": None, "matched": False, "last_error": None}

    # Prefer a result with synced lyrics
    synced_result = next((r for r in results if r.get("syncedLyrics")), None)
    if synced_result:
        return {
            "synced_lyrics": synced_result["syncedLyrics"],
            "plain_lyrics": synced_result.get("plainLyrics"),
            "matched": True,
            "last_error": None,
        }

    # Fallback: take first result's plain lyrics
    first = results[0]
    plain = first.get("plainLyrics")
    if plain:
        return {
            "synced_lyrics": None,
            "plain_lyrics": plain,
            "matched": True,
            "last_error": None,
        }

    return {"synced_lyrics": None, "plain_lyrics": None, "matched": False, "last_error": None}


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------

def read_metadata_file(path: Path) -> list[dict]:
    """Load a JSON array from a metadata file.

    Handles missing files and corrupted JSON gracefully — returns [] and
    prints a warning if the file cannot be parsed.
    """
    if not path.exists():
        return []
    try:
        text = path.read_text(encoding="utf-8")
        data = json.loads(text)
        if isinstance(data, list):
            return data
        # File contains non-list JSON — treat as corrupted
        import warnings
        warnings.warn(f"Metadata file {path} does not contain a JSON array; initializing empty.", stacklevel=2)
        return []
    except (json.JSONDecodeError, OSError) as exc:
        import warnings
        warnings.warn(f"Could not read metadata file {path}: {exc}; initializing empty.", stacklevel=2)
        return []


def write_metadata_file(path: Path, data: list[dict]) -> None:
    """Atomically write a JSON array to a metadata file.

    Creates parent directories if necessary.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    # Write to a temp file first, then rename for atomicity
    tmp_path = path.with_suffix(".json.tmp")
    try:
        with tmp_path.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        tmp_path.replace(path)
    except Exception:
        if tmp_path.exists():
            tmp_path.unlink()
        raise


# ---------------------------------------------------------------------------
# Upsert helpers
# ---------------------------------------------------------------------------

def upsert_song_metadata(records: list[dict], entry: dict) -> list[dict]:
    """Upsert a SongMetadata record by songId.

    If a record with the same songId exists, it is replaced. Otherwise,
    the entry is appended. Returns a new list.
    """
    song_id = entry["songId"]
    new_records = [r for r in records if r.get("songId") != song_id]
    new_records.append(entry)
    return new_records


def upsert_song_lyrics(records: list[dict], entry: dict) -> list[dict]:
    """Upsert a SongLyrics record by songId.

    If a record with the same songId exists, it is replaced. Otherwise,
    the entry is appended. Returns a new list.
    """
    song_id = entry["songId"]
    new_records = [r for r in records if r.get("songId") != song_id]
    new_records.append(entry)
    return new_records


def upsert_artist_info(records: list[dict], entry: dict) -> list[dict]:
    """Upsert an ArtistInfo record by normalizedArtist.

    If a record with the same normalizedArtist exists, it is replaced.
    Otherwise, the entry is appended. Returns a new list.
    """
    key = entry["normalizedArtist"]
    new_records = [r for r in records if r.get("normalizedArtist") != key]
    new_records.append(entry)
    return new_records


# ---------------------------------------------------------------------------
# FetchResult dataclass
# ---------------------------------------------------------------------------

@dataclass
class FetchResult:
    """Result of fetching metadata for a single song."""

    song_id: str
    title: str
    original_artist: str
    deezer_status: str  # 'matched', 'no_match', 'error', 'skipped'
    lyrics_status: str  # 'matched', 'no_match', 'error', 'skipped'
    deezer_confidence: str | None = None
    deezer_error: str | None = None
    lyrics_error: str | None = None

    @property
    def overall_status(self) -> str:
        """Return 'matched', 'no_match', 'error', or 'skipped'."""
        statuses = {self.deezer_status, self.lyrics_status}
        if statuses == {"skipped"}:
            return "skipped"
        if "matched" in statuses:
            return "matched"
        if "error" in statuses:
            return "error"
        return "no_match"


# ---------------------------------------------------------------------------
# Single-song fetch orchestrator
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(tz=timezone.utc).isoformat()


def fetch_song_metadata(
    song: dict,
    metadata_dir: Path,
    fetch_deezer: bool = True,
    fetch_lyrics: bool = True,
) -> FetchResult:
    """Fetch and persist metadata for a single song.

    Reads the three metadata JSON files, performs API calls, upserts the
    results, and writes the files back.

    Args:
        song: A song dict with at least ``id``, ``title``, ``originalArtist``.
        metadata_dir: Path to the ``data/metadata/`` directory.
        fetch_deezer: Whether to call the Deezer API.
        fetch_lyrics: Whether to call the LRCLIB API.

    Returns:
        A :class:`FetchResult` describing what was fetched.
    """
    song_id: str = song["id"]
    title: str = song.get("title", "")
    original_artist: str = song.get("originalArtist", "")

    # File paths
    metadata_path = metadata_dir / "song-metadata.json"
    lyrics_path = metadata_dir / "song-lyrics.json"
    artist_path = metadata_dir / "artist-info.json"

    # Load current records
    metadata_records = read_metadata_file(metadata_path)
    lyrics_records = read_metadata_file(lyrics_path)
    artist_records = read_metadata_file(artist_path)

    now = _now_iso()

    # --- Deezer ---
    deezer_status = "skipped"
    deezer_confidence: str | None = None
    deezer_error: str | None = None

    if fetch_deezer:
        deezer_result = fetch_deezer_metadata(original_artist, title)

        if deezer_result is None:
            # Should not happen with current implementation, but be safe
            deezer_status = "error"
            deezer_error = "unexpected None from fetch_deezer_metadata"
        elif deezer_result.get("match_confidence") is not None:
            # Matched
            deezer_status = "matched"
            deezer_confidence = deezer_result["match_confidence"]
            art_urls = deezer_result.get("albumArtUrls", {})
            album_art_url = art_urls.get("xl") or art_urls.get("big") or art_urls.get("medium") or art_urls.get("small") or ""

            song_meta_entry: dict[str, Any] = {
                "songId": song_id,
                "fetchStatus": "matched",
                "matchConfidence": deezer_confidence,
                "albumArtUrl": album_art_url,
                "albumArtUrls": art_urls,
                "albumTitle": deezer_result.get("albumTitle"),
                "deezerTrackId": deezer_result.get("deezerTrackId"),
                "deezerArtistId": deezer_result.get("deezerArtistId"),
                "trackDuration": deezer_result.get("trackDuration"),
                "fetchedAt": now,
                "lastError": None,
            }
            metadata_records = upsert_song_metadata(metadata_records, song_meta_entry)

            # Upsert ArtistInfo
            deezer_artist_name = deezer_result.get("artistName", original_artist)
            artist_entry: dict[str, Any] = {
                "normalizedArtist": normalize_artist(original_artist),
                "originalName": deezer_artist_name,
                "deezerArtistId": deezer_result.get("deezerArtistId"),
                "pictureUrls": deezer_result.get("artistPictureUrls", {}),
                "fetchedAt": now,
            }
            artist_records = upsert_artist_info(artist_records, artist_entry)
        else:
            # No match or error
            last_err = deezer_result.get("last_error")
            if last_err is not None:
                deezer_status = "error"
                deezer_error = last_err
            else:
                deezer_status = "no_match"

            song_meta_entry = {
                "songId": song_id,
                "fetchStatus": deezer_status,
                "matchConfidence": None,
                "albumArtUrl": None,
                "albumArtUrls": None,
                "albumTitle": None,
                "deezerTrackId": None,
                "deezerArtistId": None,
                "trackDuration": None,
                "fetchedAt": now,
                "lastError": deezer_error,
            }
            metadata_records = upsert_song_metadata(metadata_records, song_meta_entry)

    # --- LRCLIB ---
    lyrics_status = "skipped"
    lyrics_error: str | None = None

    if fetch_lyrics:
        lrc_result = fetch_lrclib_lyrics(original_artist, title)

        if lrc_result["matched"]:
            lyrics_status = "matched"
            lyrics_entry: dict[str, Any] = {
                "songId": song_id,
                "fetchStatus": "matched",
                "syncedLyrics": lrc_result.get("synced_lyrics"),
                "plainLyrics": lrc_result.get("plain_lyrics"),
                "fetchedAt": now,
                "lastError": None,
            }
            lyrics_records = upsert_song_lyrics(lyrics_records, lyrics_entry)
        else:
            err = lrc_result.get("last_error")
            if err is not None:
                lyrics_status = "error"
                lyrics_error = err
            else:
                lyrics_status = "no_match"

            lyrics_entry = {
                "songId": song_id,
                "fetchStatus": lyrics_status,
                "syncedLyrics": None,
                "plainLyrics": None,
                "fetchedAt": now,
                "lastError": lyrics_error,
            }
            lyrics_records = upsert_song_lyrics(lyrics_records, lyrics_entry)

    # --- Persist ---
    if fetch_deezer:
        write_metadata_file(metadata_path, metadata_records)
        write_metadata_file(artist_path, artist_records)
    if fetch_lyrics:
        write_metadata_file(lyrics_path, lyrics_records)

    return FetchResult(
        song_id=song_id,
        title=title,
        original_artist=original_artist,
        deezer_status=deezer_status,
        lyrics_status=lyrics_status,
        deezer_confidence=deezer_confidence,
        deezer_error=deezer_error,
        lyrics_error=lyrics_error,
    )


# ---------------------------------------------------------------------------
# Staleness check helper
# ---------------------------------------------------------------------------

def is_stale(entry: dict) -> bool:
    """Return True if the entry's fetchedAt is older than STALE_DAYS days."""
    fetched_at_str = entry.get("fetchedAt")
    if not fetched_at_str:
        return True
    try:
        fetched_at = datetime.fromisoformat(fetched_at_str)
        if fetched_at.tzinfo is None:
            fetched_at = fetched_at.replace(tzinfo=timezone.utc)
        age = datetime.now(tz=timezone.utc) - fetched_at
        return age.days >= STALE_DAYS
    except (ValueError, TypeError):
        return True


# ---------------------------------------------------------------------------
# Metadata status
# ---------------------------------------------------------------------------

@dataclass
class SongStatusRecord:
    """Per-song metadata status, computed by cross-referencing data files."""

    song_id: str
    title: str
    original_artist: str
    cover_status: str           # 'matched', 'no_match', 'error', 'manual', 'pending'
    lyrics_status: str          # 'matched', 'no_match', 'error', 'manual', 'pending'
    match_confidence: str | None = None   # 'exact', 'fuzzy', 'manual', or None
    fetched_at: str | None = None         # ISO 8601 date string (date portion only)
    album_art_url: str | None = None
    deezer_track_id: int | None = None
    cover_last_error: str | None = None
    lyrics_last_error: str | None = None


def get_metadata_status(
    songs_path: Path,
    metadata_dir: Path,
) -> list[SongStatusRecord]:
    """Cross-reference songs.json with metadata files to compute per-song status.

    ``pending`` is a virtual status: songs in songs.json with NO entry in
    song-metadata.json / song-lyrics.json are reported as ``pending``.

    Args:
        songs_path: Path to data/songs.json.
        metadata_dir: Path to data/metadata/ directory.

    Returns:
        A list of :class:`SongStatusRecord`, one per song in songs.json,
        in the same order as songs.json.
    """
    import json as _json

    # Load songs
    try:
        raw = songs_path.read_text(encoding="utf-8")
        all_songs: list[dict] = _json.loads(raw)
    except (OSError, _json.JSONDecodeError):
        all_songs = []
    if not isinstance(all_songs, list):
        all_songs = []

    # Load metadata files
    metadata_records = read_metadata_file(metadata_dir / "song-metadata.json")
    lyrics_records = read_metadata_file(metadata_dir / "song-lyrics.json")

    # Build lookup dicts
    metadata_by_id: dict[str, dict] = {r["songId"]: r for r in metadata_records if "songId" in r}
    lyrics_by_id: dict[str, dict] = {r["songId"]: r for r in lyrics_records if "songId" in r}

    records: list[SongStatusRecord] = []
    for song in all_songs:
        song_id = song.get("id", "")
        title = song.get("title", "")
        artist = song.get("originalArtist", "")

        meta = metadata_by_id.get(song_id)
        lyric = lyrics_by_id.get(song_id)

        # Cover status
        if meta is None:
            cover_status = "pending"
            match_confidence = None
            fetched_at = None
            album_art_url = None
            deezer_track_id = None
            cover_last_error = None
        else:
            cover_status = meta.get("fetchStatus", "pending")
            match_confidence = meta.get("matchConfidence")
            raw_fetched = meta.get("fetchedAt")
            # Extract date portion only (YYYY-MM-DD)
            if raw_fetched:
                fetched_at = raw_fetched[:10]
            else:
                fetched_at = None
            album_art_url = meta.get("albumArtUrl")
            deezer_track_id = meta.get("deezerTrackId")
            cover_last_error = meta.get("lastError")

        # Lyrics status
        if lyric is None:
            lyrics_status = "pending"
            lyrics_last_error = None
        else:
            lyrics_status = lyric.get("fetchStatus", "pending")
            lyrics_last_error = lyric.get("lastError")

        records.append(SongStatusRecord(
            song_id=song_id,
            title=title,
            original_artist=artist,
            cover_status=cover_status,
            lyrics_status=lyrics_status,
            match_confidence=match_confidence,
            fetched_at=fetched_at,
            album_art_url=album_art_url,
            deezer_track_id=deezer_track_id,
            cover_last_error=cover_last_error,
            lyrics_last_error=lyrics_last_error,
        ))

    return records
