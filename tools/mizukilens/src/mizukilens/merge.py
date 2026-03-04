"""Merge duplicate song entries in MizukiPrism's songs.json.

Duplicate songs — same title and artist appearing as separate entries —
accumulate when the importer fails to match against all existing entries.
This module consolidates them: one canonical entry absorbs all performances
from its duplicates.

Public API
----------
compute_merge_plan(songs)
    Analyze songs for duplicates and build a merge plan.

apply_merge_plan(songs, plan)
    Return a new song list with duplicates merged (no mutation).

update_metadata_for_merge(song_metadata, plan)
    Remap songId references in metadata from duplicate IDs to canonical IDs.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

def normalize_title(title: str) -> str:
    """Strip → lowercase → NFKC → collapse whitespace.

    Re-exported from ssl.py for consistency; duplicated here to avoid
    a circular-import risk if ssl.py ever imports from merge.py.
    """
    title = title.strip().lower()
    title = unicodedata.normalize("NFKC", title)
    return " ".join(title.split())


def normalize_artist(artist: str) -> str:
    """Strip → lowercase → NFKC → collapse whitespace."""
    artist = artist.strip().lower()
    artist = unicodedata.normalize("NFKC", artist)
    return " ".join(artist.split())


def _song_id_number(song_id: str) -> int:
    """Extract the numeric suffix from a song ID like 'song-42'.

    Returns a large sentinel for non-numeric IDs so they sort last.
    """
    m = re.match(r"song-(\d+)$", song_id)
    return int(m.group(1)) if m else 999_999_999


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class MergeGroup:
    """One group of duplicate songs to be merged."""

    canonical_id: str
    duplicate_ids: list[str]
    title: str          # display title (from canonical)
    artist: str         # display artist (from canonical)
    perf_count: int     # total performances after merge


@dataclass
class MergePlan:
    """Full merge plan."""

    groups: list[MergeGroup] = field(default_factory=list)
    song_id_remap: dict[str, str] = field(default_factory=dict)

    @property
    def total_groups(self) -> int:
        return len(self.groups)

    @property
    def total_duplicates_removed(self) -> int:
        return sum(len(g.duplicate_ids) for g in self.groups)

    @property
    def songs_before(self) -> int:
        """Only meaningful when set externally."""
        return self._songs_before

    @songs_before.setter
    def songs_before(self, value: int) -> None:
        self._songs_before = value

    _songs_before: int = field(default=0, repr=False)


# ---------------------------------------------------------------------------
# Compute merge plan
# ---------------------------------------------------------------------------

def compute_merge_plan(songs: list[dict]) -> MergePlan:
    """Analyze songs for duplicates and build a merge plan.

    Groups songs by (normalized title, normalized artist).  Within each
    group the *canonical* entry is the one with the most performances;
    ties are broken by lowest song-ID number.

    Performances are deduplicated by (streamId, timestamp).
    Tags are unioned.
    """
    # Group by normalized key
    groups: dict[tuple[str, str], list[dict]] = {}
    for song in songs:
        key = (
            normalize_title(song.get("title", "")),
            normalize_artist(song.get("originalArtist", "")),
        )
        groups.setdefault(key, []).append(song)

    plan = MergePlan()
    plan.songs_before = len(songs)

    for _key, group_songs in groups.items():
        if len(group_songs) < 2:
            continue

        # Pick canonical: most performances, tie-break lowest song-ID number
        group_songs.sort(
            key=lambda s: (-len(s.get("performances", [])), _song_id_number(s.get("id", "")))
        )
        canonical = group_songs[0]
        duplicates = group_songs[1:]

        # Collect all performances, deduplicate by (streamId, timestamp)
        seen_perfs: set[tuple[str, int]] = set()
        merged_perfs: list[dict] = []

        for song in group_songs:
            for perf in song.get("performances", []):
                perf_key = (perf.get("streamId", ""), perf.get("timestamp", 0))
                if perf_key not in seen_perfs:
                    seen_perfs.add(perf_key)
                    merged_perfs.append(perf)

        # Sort performances by date (oldest first), then timestamp
        merged_perfs.sort(key=lambda p: (p.get("date", ""), p.get("timestamp", 0)))

        merge_group = MergeGroup(
            canonical_id=canonical["id"],
            duplicate_ids=[d["id"] for d in duplicates],
            title=canonical.get("title", ""),
            artist=canonical.get("originalArtist", ""),
            perf_count=len(merged_perfs),
        )
        plan.groups.append(merge_group)

        for dup in duplicates:
            plan.song_id_remap[dup["id"]] = canonical["id"]

    # Sort groups by number of duplicates removed (descending) for display
    plan.groups.sort(key=lambda g: -len(g.duplicate_ids))

    return plan


# ---------------------------------------------------------------------------
# Apply merge plan
# ---------------------------------------------------------------------------

def apply_merge_plan(songs: list[dict], plan: MergePlan) -> list[dict]:
    """Return a new song list with duplicates merged.

    Does NOT mutate the input list.  The canonical entry gets all
    merged performances (renumbered) and a union of all tags.
    Duplicate entries are removed.
    """
    if not plan.groups:
        return list(songs)

    # Build quick lookups
    duplicate_ids: set[str] = set(plan.song_id_remap.keys())

    # For each canonical, gather all songs in its group
    canonical_to_group: dict[str, list[str]] = {}
    for group in plan.groups:
        canonical_to_group[group.canonical_id] = group.duplicate_ids

    # Index original songs by id
    song_by_id: dict[str, dict] = {s["id"]: s for s in songs}

    result: list[dict] = []
    for song in songs:
        sid = song["id"]

        if sid in duplicate_ids:
            # Skip — absorbed into canonical
            continue

        if sid in canonical_to_group:
            # This is a canonical entry; merge in duplicates
            dup_ids = canonical_to_group[sid]
            group_songs = [song] + [song_by_id[d] for d in dup_ids if d in song_by_id]

            # Collect performances, deduplicate by (streamId, timestamp)
            seen_perfs: set[tuple[str, int]] = set()
            merged_perfs: list[dict] = []
            for s in group_songs:
                for perf in s.get("performances", []):
                    perf_key = (perf.get("streamId", ""), perf.get("timestamp", 0))
                    if perf_key not in seen_perfs:
                        seen_perfs.add(perf_key)
                        merged_perfs.append(dict(perf))  # shallow copy

            # Sort by date then timestamp
            merged_perfs.sort(key=lambda p: (p.get("date", ""), p.get("timestamp", 0)))

            # Renumber performance IDs: p{song_number}-{perf_index}
            song_number = _song_id_number(sid)
            for i, perf in enumerate(merged_perfs, 1):
                perf["id"] = f"p{song_number}-{i}"

            # Union tags
            all_tags: list[str] = []
            seen_tags: set[str] = set()
            for s in group_songs:
                for tag in s.get("tags", []):
                    if tag not in seen_tags:
                        seen_tags.add(tag)
                        all_tags.append(tag)

            # Build merged song (shallow copy of canonical, override perfs/tags)
            merged_song = dict(song)
            merged_song["performances"] = merged_perfs
            merged_song["tags"] = all_tags
            result.append(merged_song)
        else:
            # No merge needed — pass through
            result.append(dict(song))

    return result


# ---------------------------------------------------------------------------
# Metadata remapping
# ---------------------------------------------------------------------------

def update_metadata_for_merge(
    song_metadata: list[dict],
    plan: MergePlan,
) -> list[dict]:
    """Remap songId references in metadata from duplicate IDs to canonical.

    - If the canonical already has metadata, drop the duplicate's entry.
    - If only the duplicate has metadata, remap its songId to canonical.

    Returns a new list (no mutation).
    """
    if not plan.song_id_remap:
        return list(song_metadata)

    remap = plan.song_id_remap

    # Which canonical IDs already have metadata?
    canonical_ids_with_meta: set[str] = set()
    for entry in song_metadata:
        sid = entry.get("songId", "")
        if sid not in remap:
            canonical_ids_with_meta.add(sid)

    result: list[dict] = []
    seen_canonical: set[str] = set()

    for entry in song_metadata:
        sid = entry.get("songId", "")

        if sid not in remap:
            # Not a duplicate — keep as-is
            result.append(dict(entry))
            seen_canonical.add(sid)
        else:
            # Duplicate entry — remap if canonical doesn't have metadata yet
            canonical_id = remap[sid]
            if canonical_id not in canonical_ids_with_meta and canonical_id not in seen_canonical:
                new_entry = dict(entry)
                new_entry["songId"] = canonical_id
                result.append(new_entry)
                seen_canonical.add(canonical_id)
            # else: canonical already has metadata, drop this duplicate's entry

    return result
