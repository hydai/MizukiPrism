"""Tests for mizukilens.ssl — SSL artist normalisation logic."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from mizukilens.ssl import (
    ArtistDiff,
    DiffReport,
    NormalizeChange,
    NormalizePlan,
    apply_normalize_plan,
    compute_diff,
    compute_normalize_plan,
    count_ssl_whitespace_issues,
    load_ssl_songs,
    normalize_title,
)


# ── normalize_title ──────────────────────────────────────────────────────


class TestNormalizeTitle:
    def test_lowercase(self) -> None:
        assert normalize_title("Hello World") == "hello world"

    def test_strip(self) -> None:
        assert normalize_title("  hello  ") == "hello"

    def test_collapse_spaces(self) -> None:
        assert normalize_title("hello   world") == "hello world"

    def test_nfkc_fullwidth(self) -> None:
        # Ｈｅｌｌｏ → hello via NFKC
        assert normalize_title("\uff28\uff45\uff4c\uff4c\uff4f") == "hello"

    def test_nfkc_cjk(self) -> None:
        # CJK compatibility: ㍻ (U+337B) → 平成 via NFKC
        assert normalize_title("\u337b") == "平成"

    def test_empty(self) -> None:
        assert normalize_title("") == ""

    def test_mixed_whitespace(self) -> None:
        assert normalize_title("\t hello \n world \t") == "hello world"

    def test_already_normalised(self) -> None:
        assert normalize_title("ただ君に晴れ") == "ただ君に晴れ"


# ── load_ssl_songs ───────────────────────────────────────────────────────


class TestLoadSslSongs:
    def test_valid_json(self, tmp_path: Path) -> None:
        data = [
            {"title": "Song A", "artist": "Artist X"},
            {"title": "Song B", "artist": "Artist Y"},
        ]
        p = tmp_path / "ssl.json"
        p.write_text(json.dumps(data), encoding="utf-8")
        result = load_ssl_songs(str(p))
        assert len(result) == 2
        assert result[0]["title"] == "Song A"

    def test_whitespace_trimming(self, tmp_path: Path) -> None:
        data = [{"title": "  Song A  ", "artist": "  Artist  X  "}]
        p = tmp_path / "ssl.json"
        p.write_text(json.dumps(data), encoding="utf-8")
        result = load_ssl_songs(str(p))
        assert result[0]["title"] == "Song A"
        assert result[0]["artist"] == "Artist X"

    def test_non_array_rejection(self, tmp_path: Path) -> None:
        p = tmp_path / "ssl.json"
        p.write_text('{"not": "array"}', encoding="utf-8")
        with pytest.raises(ValueError, match="Expected JSON array"):
            load_ssl_songs(str(p))

    def test_empty_array(self, tmp_path: Path) -> None:
        p = tmp_path / "ssl.json"
        p.write_text("[]", encoding="utf-8")
        assert load_ssl_songs(str(p)) == []

    def test_preserves_extra_fields(self, tmp_path: Path) -> None:
        data = [{"title": "Song", "artist": "Art", "extra": 42}]
        p = tmp_path / "ssl.json"
        p.write_text(json.dumps(data), encoding="utf-8")
        result = load_ssl_songs(str(p))
        assert result[0]["extra"] == 42


# ── count_ssl_whitespace_issues ──────────────────────────────────────────


class TestCountSslWhitespaceIssues:
    def test_no_issues(self) -> None:
        data = [{"title": "Song", "artist": "Art"}]
        assert count_ssl_whitespace_issues(data) == 0

    def test_leading_space(self) -> None:
        data = [{"title": " Song", "artist": "Art"}]
        assert count_ssl_whitespace_issues(data) == 1

    def test_trailing_space(self) -> None:
        data = [{"title": "Song ", "artist": "Art"}]
        assert count_ssl_whitespace_issues(data) == 1

    def test_double_internal_space(self) -> None:
        data = [{"title": "Song  A", "artist": "Art"}]
        assert count_ssl_whitespace_issues(data) == 1

    def test_counts_once_per_entry(self) -> None:
        # Both name and artist dirty → still counts 1
        data = [{"title": " Song ", "artist": " Art "}]
        assert count_ssl_whitespace_issues(data) == 1


# ── compute_diff ─────────────────────────────────────────────────────────


class TestComputeDiff:
    def test_exact_match_same_artist(self) -> None:
        mp = [{"id": "1", "title": "Song A", "originalArtist": "Art"}]
        ssl = [{"title": "Song A", "artist": "Art"}]
        report = compute_diff(mp, ssl)
        assert report.exact_matches == 1
        assert len(report.diffs) == 0

    def test_artist_differs(self) -> None:
        mp = [{"id": "1", "title": "Song A", "originalArtist": "Old Art"}]
        ssl = [{"title": "Song A", "artist": "New Art"}]
        report = compute_diff(mp, ssl)
        assert len(report.diffs) == 1
        assert report.diffs[0].mp_artist == "Old Art"
        assert report.diffs[0].ssl_artist == "New Art"

    def test_normalised_title_match(self) -> None:
        mp = [{"id": "1", "title": "  SONG A  ", "originalArtist": "Old"}]
        ssl = [{"title": "song a", "artist": "New"}]
        report = compute_diff(mp, ssl)
        assert len(report.diffs) == 1
        assert report.diffs[0].match_type == "normalized"

    def test_mp_only(self) -> None:
        mp = [{"id": "1", "title": "MP Only", "originalArtist": "Art"}]
        ssl: list[dict] = []
        report = compute_diff(mp, ssl)
        assert report.mp_only == 1

    def test_ssl_only(self) -> None:
        mp: list[dict] = []
        ssl = [{"title": "SSL Only", "artist": "Art"}]
        report = compute_diff(mp, ssl)
        assert report.ssl_only == 1

    def test_multiple_mp_songs_same_title(self) -> None:
        mp = [
            {"id": "1", "title": "Song", "originalArtist": "Old"},
            {"id": "2", "title": "Song", "originalArtist": "Old"},
        ]
        ssl = [{"title": "Song", "artist": "New"}]
        report = compute_diff(mp, ssl)
        assert len(report.diffs) == 2

    def test_empty_inputs(self) -> None:
        report = compute_diff([], [])
        assert report.exact_matches == 0
        assert len(report.diffs) == 0
        assert report.mp_only == 0
        assert report.ssl_only == 0


# ── compute_normalize_plan ───────────────────────────────────────────────


class TestComputeNormalizePlan:
    def test_simple_rename(self) -> None:
        mp = [{"id": "1", "title": "Song", "originalArtist": "Old"}]
        ssl = [{"title": "Song", "artist": "New"}]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 1
        assert plan.changes[0].old_artist == "Old"
        assert plan.changes[0].new_artist == "New"

    def test_no_changes_when_same(self) -> None:
        mp = [{"id": "1", "title": "Song", "originalArtist": "Art"}]
        ssl = [{"title": "Song", "artist": "Art"}]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 0

    def test_ambiguous_skip(self) -> None:
        mp = [{"id": "1", "title": "Song", "originalArtist": "Old"}]
        ssl = [
            {"title": "Song", "artist": "A"},
            {"title": "Song", "artist": "B"},
        ]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 0
        assert len(plan.skipped_ambiguous) == 1

    def test_ambiguous_deduped_across_mp_songs(self) -> None:
        mp = [
            {"id": "1", "title": "Song", "originalArtist": "Old"},
            {"id": "2", "title": "Song", "originalArtist": "Old"},
        ]
        ssl = [
            {"title": "Song", "artist": "A"},
            {"title": "Song", "artist": "B"},
        ]
        plan = compute_normalize_plan(mp, ssl)
        # Only one ambiguous entry even though two MP songs share the title
        assert len(plan.skipped_ambiguous) == 1

    def test_no_match_skip(self) -> None:
        mp = [{"id": "1", "title": "Unknown", "originalArtist": "Art"}]
        ssl: list[dict] = []
        plan = compute_normalize_plan(mp, ssl)
        assert plan.skipped_no_match == 1

    def test_multiple_ssl_same_artist_is_not_ambiguous(self) -> None:
        """Multiple SSL entries with the same artist should be used."""
        mp = [{"id": "1", "title": "Song", "originalArtist": "Old"}]
        ssl = [
            {"title": "Song", "artist": "Correct"},
            {"title": "Song", "artist": "Correct"},
        ]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 1
        assert plan.changes[0].new_artist == "Correct"

    def test_empty_mp_artist_gets_filled(self) -> None:
        mp = [{"id": "1", "title": "Song", "originalArtist": ""}]
        ssl = [{"title": "Song", "artist": "New"}]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 1
        assert plan.changes[0].new_artist == "New"

    def test_normalised_matching(self) -> None:
        mp = [{"id": "1", "title": "  Song A  ", "originalArtist": "Old"}]
        ssl = [{"title": "song a", "artist": "New"}]
        plan = compute_normalize_plan(mp, ssl)
        assert len(plan.changes) == 1


# ── apply_normalize_plan ─────────────────────────────────────────────────


class TestApplyNormalizePlan:
    def test_applies_changes(self) -> None:
        songs = [
            {"id": "1", "title": "Song", "originalArtist": "Old"},
            {"id": "2", "title": "Other", "originalArtist": "Keep"},
        ]
        plan = NormalizePlan(
            changes=[NormalizeChange("1", "Song", "Old", "New")]
        )
        count = apply_normalize_plan(songs, plan)
        assert count == 1
        assert songs[0]["originalArtist"] == "New"
        assert songs[1]["originalArtist"] == "Keep"

    def test_preserves_other_fields(self) -> None:
        songs = [{"id": "1", "title": "Song", "originalArtist": "Old", "extra": 99}]
        plan = NormalizePlan(
            changes=[NormalizeChange("1", "Song", "Old", "New")]
        )
        apply_normalize_plan(songs, plan)
        assert songs[0]["extra"] == 99
        assert songs[0]["title"] == "Song"

    def test_empty_plan(self) -> None:
        songs = [{"id": "1", "title": "Song", "originalArtist": "Art"}]
        plan = NormalizePlan()
        count = apply_normalize_plan(songs, plan)
        assert count == 0
        assert songs[0]["originalArtist"] == "Art"

    def test_multiple_changes(self) -> None:
        songs = [
            {"id": "1", "title": "A", "originalArtist": "X"},
            {"id": "2", "title": "B", "originalArtist": "Y"},
        ]
        plan = NormalizePlan(
            changes=[
                NormalizeChange("1", "A", "X", "X2"),
                NormalizeChange("2", "B", "Y", "Y2"),
            ]
        )
        count = apply_normalize_plan(songs, plan)
        assert count == 2
        assert songs[0]["originalArtist"] == "X2"
        assert songs[1]["originalArtist"] == "Y2"
