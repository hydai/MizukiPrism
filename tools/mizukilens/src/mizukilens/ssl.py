"""Normalize MP artist names using StreamerSongList (SSL) as reference.

SSL contains songs curated by the streamer herself — when SSL and MP
disagree on ``originalArtist`` for the same title, SSL wins.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Title normalisation (same approach as fill_artists.py)
# ---------------------------------------------------------------------------

def normalize_title(title: str) -> str:
    """Strip → lowercase → NFKC → collapse whitespace."""
    title = title.strip().lower()
    title = unicodedata.normalize("NFKC", title)
    return " ".join(title.split())


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

_WS_COLLAPSE = re.compile(r"\s+")


def load_ssl_songs(path: str) -> list[dict]:
    """Load an SSL JSON dump, trimming whitespace from title/artist fields.

    Expects a JSON array of objects, each with at least ``name`` and
    ``artist`` keys.  Returns the cleaned list.
    """
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)

    if not isinstance(data, list):
        raise ValueError(f"Expected JSON array, got {type(data).__name__}")

    cleaned: list[dict] = []
    for entry in data:
        entry = dict(entry)  # shallow copy
        for key in ("name", "artist"):
            val = entry.get(key, "")
            if isinstance(val, str):
                entry[key] = _WS_COLLAPSE.sub(" ", val.strip())
        cleaned.append(entry)

    return cleaned


def count_ssl_whitespace_issues(songs: list[dict]) -> int:
    """Count SSL entries where name/artist had leading/trailing/excess whitespace.

    Operates on the *raw* loaded list (before cleaning), so call this
    **before** ``load_ssl_songs`` or on the original data.
    """
    count = 0
    for entry in songs:
        for key in ("name", "artist"):
            val = entry.get(key, "")
            if isinstance(val, str):
                cleaned = _WS_COLLAPSE.sub(" ", val.strip())
                if cleaned != val:
                    count += 1
                    break  # one issue per entry is enough
    return count


# ---------------------------------------------------------------------------
# Diff
# ---------------------------------------------------------------------------

@dataclass
class ArtistDiff:
    """One artist discrepancy between MP and SSL."""

    mp_song_id: str
    title: str
    ssl_title: str
    mp_artist: str
    ssl_artist: str
    match_type: str  # "exact" | "normalized"


@dataclass
class DiffReport:
    """Full diff report between MP and SSL."""

    diffs: list[ArtistDiff] = field(default_factory=list)
    exact_matches: int = 0
    mp_only: int = 0
    ssl_only: int = 0
    ssl_whitespace_issues: int = 0


def compute_diff(mp_songs: list[dict], ssl_songs: list[dict]) -> DiffReport:
    """Match MP songs to SSL by title and report artist discrepancies."""
    # Build SSL index: normalized_title → list of (original_title, artist)
    ssl_index: dict[str, list[tuple[str, str]]] = {}
    for entry in ssl_songs:
        name = entry.get("name", "")
        artist = entry.get("artist", "")
        norm = normalize_title(name)
        if norm:
            ssl_index.setdefault(norm, []).append((name, artist))

    # Track which SSL titles were matched
    matched_ssl_norms: set[str] = set()

    report = DiffReport()

    for song in mp_songs:
        title = song.get("title", "")
        mp_artist = song.get("originalArtist", "")
        norm = normalize_title(title)

        if norm not in ssl_index:
            report.mp_only += 1
            continue

        matched_ssl_norms.add(norm)

        # Pick the first SSL entry for comparison (they may all share the same artist)
        ssl_title, ssl_artist = ssl_index[norm][0]

        # Determine match type
        match_type = "exact" if title.strip() == ssl_title.strip() else "normalized"

        if mp_artist == ssl_artist:
            report.exact_matches += 1
        else:
            report.diffs.append(
                ArtistDiff(
                    mp_song_id=song.get("id", ""),
                    title=title,
                    ssl_title=ssl_title,
                    mp_artist=mp_artist,
                    ssl_artist=ssl_artist,
                    match_type=match_type,
                )
            )

    # SSL-only: normalized titles that had no MP match
    report.ssl_only = sum(
        1 for norm in ssl_index if norm not in matched_ssl_norms
    )

    return report


# ---------------------------------------------------------------------------
# Normalize plan
# ---------------------------------------------------------------------------

@dataclass
class NormalizeChange:
    """One planned artist rename."""

    mp_song_id: str
    title: str
    old_artist: str
    new_artist: str


@dataclass
class NormalizePlan:
    """What to apply when normalizing artists from SSL."""

    changes: list[NormalizeChange] = field(default_factory=list)
    skipped_ambiguous: list[tuple[str, list[str]]] = field(
        default_factory=list
    )  # (title, [artists...])
    skipped_no_match: int = 0


def compute_normalize_plan(
    mp_songs: list[dict], ssl_songs: list[dict]
) -> NormalizePlan:
    """Build a plan to update MP artists using SSL data.

    - When all SSL entries for a title agree on the artist → use it.
    - When SSL entries disagree → skip (ambiguous).
    - When no SSL match exists → skip (no match).
    """
    # Build SSL index: normalized_title → set of distinct artists
    ssl_artist_map: dict[str, set[str]] = {}
    for entry in ssl_songs:
        name = entry.get("name", "")
        artist = entry.get("artist", "")
        norm = normalize_title(name)
        if norm:
            ssl_artist_map.setdefault(norm, set()).add(artist)

    plan = NormalizePlan()
    seen_ambiguous: set[str] = set()

    for song in mp_songs:
        title = song.get("title", "")
        mp_artist = song.get("originalArtist", "")
        norm = normalize_title(title)

        if norm not in ssl_artist_map:
            plan.skipped_no_match += 1
            continue

        artists = ssl_artist_map[norm]

        if len(artists) > 1:
            # Ambiguous — multiple different artists in SSL for same title
            if norm not in seen_ambiguous:
                plan.skipped_ambiguous.append((title, sorted(artists)))
                seen_ambiguous.add(norm)
            continue

        ssl_artist = next(iter(artists))
        if mp_artist != ssl_artist:
            plan.changes.append(
                NormalizeChange(
                    mp_song_id=song.get("id", ""),
                    title=title,
                    old_artist=mp_artist,
                    new_artist=ssl_artist,
                )
            )

    return plan


def apply_normalize_plan(songs: list[dict], plan: NormalizePlan) -> int:
    """Mutate *songs* in place according to the plan. Returns count of changes."""
    change_map: dict[str, str] = {
        c.mp_song_id: c.new_artist for c in plan.changes
    }
    if not change_map:
        return 0

    count = 0
    for song in songs:
        new_artist = change_map.get(song.get("id", ""))
        if new_artist is not None:
            song["originalArtist"] = new_artist
            count += 1
    return count
