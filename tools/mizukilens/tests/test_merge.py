"""Tests for mizukilens.merge — duplicate song merging logic."""

from __future__ import annotations

import pytest

from mizukilens.merge import (
    MergeGroup,
    MergePlan,
    apply_merge_plan,
    compute_merge_plan,
    normalize_artist,
    normalize_title,
    update_metadata_for_merge,
)


# ---------------------------------------------------------------------------
# Helpers to build test songs
# ---------------------------------------------------------------------------

def _song(
    sid: str,
    title: str = "Song",
    artist: str = "Artist",
    tags: list[str] | None = None,
    perfs: list[dict] | None = None,
) -> dict:
    return {
        "id": sid,
        "title": title,
        "originalArtist": artist,
        "tags": tags or [],
        "performances": perfs or [],
    }


def _perf(
    pid: str = "p1-1",
    stream_id: str = "stream-2024-01-01",
    date: str = "2024-01-01",
    timestamp: int = 100,
) -> dict:
    return {
        "id": pid,
        "streamId": stream_id,
        "date": date,
        "streamTitle": "Test Stream",
        "videoId": "abc123",
        "timestamp": timestamp,
        "endTimestamp": None,
        "note": "",
    }


# ── normalize_title ─────────────────────────────────────────────────────

class TestNormalizeTitle:
    def test_basic(self) -> None:
        assert normalize_title("Hello World") == "hello world"

    def test_strip_and_collapse(self) -> None:
        assert normalize_title("  hello   world  ") == "hello world"

    def test_nfkc(self) -> None:
        assert normalize_title("\uff28\uff45\uff4c\uff4c\uff4f") == "hello"

    def test_empty(self) -> None:
        assert normalize_title("") == ""


# ── normalize_artist ────────────────────────────────────────────────────

class TestNormalizeArtist:
    def test_basic(self) -> None:
        assert normalize_artist("Hatsune Miku") == "hatsune miku"

    def test_strip_and_collapse(self) -> None:
        assert normalize_artist("  hatsune   miku  ") == "hatsune miku"

    def test_nfkc(self) -> None:
        assert normalize_artist("\uff28\uff45\uff4c\uff4c\uff4f") == "hello"

    def test_empty(self) -> None:
        assert normalize_artist("") == ""

    def test_case_insensitive(self) -> None:
        assert normalize_artist("MIZUKI") == normalize_artist("mizuki")


# ── compute_merge_plan ──────────────────────────────────────────────────

class TestComputeMergePlan:
    def test_no_duplicates(self) -> None:
        songs = [
            _song("song-1", "A", "X"),
            _song("song-2", "B", "Y"),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 0
        assert plan.total_duplicates_removed == 0
        assert plan.song_id_remap == {}

    def test_basic_merge(self) -> None:
        songs = [
            _song("song-1", "aLIEz", "mizuki", perfs=[_perf("p1-1")]),
            _song("song-2", "aLIEz", "mizuki", perfs=[_perf("p2-1", stream_id="stream-2024-02-01", date="2024-02-01")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1
        assert plan.total_duplicates_removed == 1
        assert plan.groups[0].canonical_id == "song-1"
        assert plan.groups[0].duplicate_ids == ["song-2"]
        assert plan.groups[0].perf_count == 2
        assert plan.song_id_remap == {"song-2": "song-1"}

    def test_canonical_most_performances(self) -> None:
        """Canonical should be the entry with the most performances."""
        songs = [
            _song("song-10", "Song", "Art", perfs=[_perf("p10-1")]),
            _song("song-5", "Song", "Art", perfs=[
                _perf("p5-1", stream_id="s1", date="2024-01-01"),
                _perf("p5-2", stream_id="s2", date="2024-02-01"),
                _perf("p5-3", stream_id="s3", date="2024-03-01"),
            ]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.groups[0].canonical_id == "song-5"
        assert plan.groups[0].duplicate_ids == ["song-10"]

    def test_canonical_tiebreak_lowest_id(self) -> None:
        """Same perf count: pick lowest song-ID number."""
        songs = [
            _song("song-100", "Song", "Art", perfs=[_perf("p100-1")]),
            _song("song-5", "Song", "Art", perfs=[_perf("p5-1", stream_id="s2")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.groups[0].canonical_id == "song-5"

    def test_different_artists_kept_separate(self) -> None:
        """Same title, different artist — not merged."""
        songs = [
            _song("song-1", "Hello", "Artist A"),
            _song("song-2", "Hello", "Artist B"),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 0

    def test_case_insensitive_title_match(self) -> None:
        songs = [
            _song("song-1", "aLIEz", "mizuki", perfs=[_perf("p1-1")]),
            _song("song-2", "ALIEZ", "mizuki", perfs=[_perf("p2-1", stream_id="s2")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1

    def test_case_insensitive_artist_match(self) -> None:
        songs = [
            _song("song-1", "Song", "Mizuki", perfs=[_perf("p1-1")]),
            _song("song-2", "Song", "mizuki", perfs=[_perf("p2-1", stream_id="s2")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1

    def test_whitespace_normalised_match(self) -> None:
        songs = [
            _song("song-1", "  Hello  World ", "art", perfs=[_perf("p1-1")]),
            _song("song-2", "Hello World", "art", perfs=[_perf("p2-1", stream_id="s2")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1

    def test_performance_dedup_by_stream_timestamp(self) -> None:
        """Same (streamId, timestamp) should be deduplicated."""
        perf_a = _perf("p1-1", stream_id="stream-1", timestamp=100)
        perf_b = _perf("p2-1", stream_id="stream-1", timestamp=100)  # duplicate
        perf_c = _perf("p2-2", stream_id="stream-2", timestamp=200)

        songs = [
            _song("song-1", "Song", "Art", perfs=[perf_a]),
            _song("song-2", "Song", "Art", perfs=[perf_b, perf_c]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.groups[0].perf_count == 2  # deduped: 100@stream-1 + 200@stream-2

    def test_three_way_merge(self) -> None:
        songs = [
            _song("song-1", "Song", "Art", perfs=[_perf("p1-1", stream_id="s1")]),
            _song("song-2", "Song", "Art", perfs=[_perf("p2-1", stream_id="s2")]),
            _song("song-3", "Song", "Art", perfs=[_perf("p3-1", stream_id="s3")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1
        assert plan.total_duplicates_removed == 2
        assert plan.groups[0].perf_count == 3

    def test_multiple_independent_groups(self) -> None:
        songs = [
            _song("song-1", "A", "X", perfs=[_perf("p1-1")]),
            _song("song-2", "A", "X", perfs=[_perf("p2-1", stream_id="s2")]),
            _song("song-3", "B", "Y", perfs=[_perf("p3-1")]),
            _song("song-4", "B", "Y", perfs=[_perf("p4-1", stream_id="s3")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 2
        assert plan.total_duplicates_removed == 2

    def test_songs_before_count(self) -> None:
        songs = [
            _song("song-1", "A", "X"),
            _song("song-2", "A", "X"),
            _song("song-3", "B", "Y"),
        ]
        plan = compute_merge_plan(songs)
        assert plan.songs_before == 3

    def test_unicode_nfkc_matching(self) -> None:
        """Fullwidth characters should match their ASCII equivalents."""
        songs = [
            _song("song-1", "\uff28\uff45\uff4c\uff4c\uff4f", "art", perfs=[_perf("p1-1")]),
            _song("song-2", "Hello", "art", perfs=[_perf("p2-1", stream_id="s2")]),
        ]
        plan = compute_merge_plan(songs)
        assert plan.total_groups == 1


# ── apply_merge_plan ────────────────────────────────────────────────────

class TestApplyMergePlan:
    def test_no_groups_returns_copy(self) -> None:
        songs = [_song("song-1", "A", "X")]
        plan = MergePlan()
        result = apply_merge_plan(songs, plan)
        assert len(result) == 1
        assert result[0]["id"] == "song-1"
        assert result is not songs  # new list

    def test_basic_merge(self) -> None:
        perf_a = _perf("p1-1", stream_id="s1", date="2024-01-01", timestamp=100)
        perf_b = _perf("p2-1", stream_id="s2", date="2024-02-01", timestamp=200)
        songs = [
            _song("song-1", "Song", "Art", perfs=[perf_a]),
            _song("song-2", "Song", "Art", perfs=[perf_b]),
            _song("song-3", "Other", "Other"),
        ]
        plan = compute_merge_plan(songs)
        result = apply_merge_plan(songs, plan)

        assert len(result) == 2  # song-1 merged, song-2 removed, song-3 kept
        merged = result[0]
        assert merged["id"] == "song-1"
        assert len(merged["performances"]) == 2
        assert result[1]["id"] == "song-3"

    def test_performances_renumbered(self) -> None:
        songs = [
            _song("song-5", "Song", "Art", perfs=[
                _perf("p5-1", stream_id="s1", date="2024-01-01"),
            ]),
            _song("song-10", "Song", "Art", perfs=[
                _perf("p10-1", stream_id="s2", date="2024-02-01"),
            ]),
        ]
        plan = compute_merge_plan(songs)
        result = apply_merge_plan(songs, plan)

        perfs = result[0]["performances"]
        assert perfs[0]["id"] == "p5-1"
        assert perfs[1]["id"] == "p5-2"

    def test_performances_sorted_by_date(self) -> None:
        songs = [
            _song("song-1", "S", "A", perfs=[
                _perf("p1-1", stream_id="s2", date="2024-06-01"),
            ]),
            _song("song-2", "S", "A", perfs=[
                _perf("p2-1", stream_id="s1", date="2024-01-01"),
            ]),
        ]
        plan = compute_merge_plan(songs)
        result = apply_merge_plan(songs, plan)

        perfs = result[0]["performances"]
        assert perfs[0]["date"] == "2024-01-01"
        assert perfs[1]["date"] == "2024-06-01"

    def test_tags_union(self) -> None:
        songs = [
            _song("song-1", "S", "A", tags=["jpop", "anime"]),
            _song("song-2", "S", "A", tags=["anime", "cover"]),
        ]
        plan = compute_merge_plan(songs)
        result = apply_merge_plan(songs, plan)

        assert set(result[0]["tags"]) == {"jpop", "anime", "cover"}

    def test_does_not_mutate_input(self) -> None:
        songs = [
            _song("song-1", "S", "A", perfs=[_perf("p1-1")]),
            _song("song-2", "S", "A", perfs=[_perf("p2-1", stream_id="s2")]),
        ]
        original_len = len(songs)
        original_perf_count = len(songs[0]["performances"])
        plan = compute_merge_plan(songs)
        apply_merge_plan(songs, plan)

        assert len(songs) == original_len
        assert len(songs[0]["performances"]) == original_perf_count

    def test_performance_dedup_in_apply(self) -> None:
        """Same (streamId, timestamp) across duplicates should be deduped."""
        perf_shared = _perf("p1-1", stream_id="s1", timestamp=100)
        perf_shared2 = _perf("p2-1", stream_id="s1", timestamp=100)
        perf_unique = _perf("p2-2", stream_id="s2", timestamp=200)

        songs = [
            _song("song-1", "S", "A", perfs=[perf_shared]),
            _song("song-2", "S", "A", perfs=[perf_shared2, perf_unique]),
        ]
        plan = compute_merge_plan(songs)
        result = apply_merge_plan(songs, plan)

        assert len(result[0]["performances"]) == 2


# ── update_metadata_for_merge ───────────────────────────────────────────

class TestUpdateMetadataForMerge:
    def test_no_remap(self) -> None:
        metadata = [{"songId": "song-1", "fetchStatus": "matched"}]
        plan = MergePlan()
        result = update_metadata_for_merge(metadata, plan)
        assert len(result) == 1
        assert result[0]["songId"] == "song-1"

    def test_duplicate_remapped_when_canonical_missing(self) -> None:
        """If canonical has no metadata, remap the duplicate's entry."""
        metadata = [{"songId": "song-2", "fetchStatus": "matched", "albumTitle": "Album"}]
        plan = MergePlan(song_id_remap={"song-2": "song-1"})
        result = update_metadata_for_merge(metadata, plan)
        assert len(result) == 1
        assert result[0]["songId"] == "song-1"
        assert result[0]["albumTitle"] == "Album"

    def test_duplicate_dropped_when_canonical_exists(self) -> None:
        """If canonical already has metadata, drop the duplicate's entry."""
        metadata = [
            {"songId": "song-1", "fetchStatus": "matched", "albumTitle": "Original"},
            {"songId": "song-2", "fetchStatus": "matched", "albumTitle": "Duplicate"},
        ]
        plan = MergePlan(song_id_remap={"song-2": "song-1"})
        result = update_metadata_for_merge(metadata, plan)
        assert len(result) == 1
        assert result[0]["songId"] == "song-1"
        assert result[0]["albumTitle"] == "Original"

    def test_only_first_duplicate_remapped(self) -> None:
        """If multiple duplicates map to same canonical, only one is kept."""
        metadata = [
            {"songId": "song-2", "fetchStatus": "matched", "albumTitle": "Dup1"},
            {"songId": "song-3", "fetchStatus": "matched", "albumTitle": "Dup2"},
        ]
        plan = MergePlan(song_id_remap={"song-2": "song-1", "song-3": "song-1"})
        result = update_metadata_for_merge(metadata, plan)
        assert len(result) == 1
        assert result[0]["songId"] == "song-1"

    def test_does_not_mutate_input(self) -> None:
        metadata = [{"songId": "song-2", "fetchStatus": "matched"}]
        plan = MergePlan(song_id_remap={"song-2": "song-1"})
        update_metadata_for_merge(metadata, plan)
        assert metadata[0]["songId"] == "song-2"  # unchanged
