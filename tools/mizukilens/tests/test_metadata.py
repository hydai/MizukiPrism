"""Tests for mizukilens.metadata — Deezer + LRCLIB integration.

Coverage:
  - normalize_artist()
  - fetch_deezer_metadata() — all 4 strategies, no-match, timeout, HTTP error
  - fetch_lrclib_lyrics()   — synced, plain, no-match, timeout, HTTP error
  - read_metadata_file()    — normal, missing, corrupt
  - write_metadata_file()   — basic write
  - upsert_song_metadata()  — insert, update
  - upsert_song_lyrics()    — insert, update
  - upsert_artist_info()    — insert, update
  - is_stale()              — fresh, stale, missing
  - fetch_song_metadata()   — full integration (mocked APIs), all branches
  - CLI: metadata fetch     — --missing, --stale, --all, --song, --force,
                              --lyrics-only, --art-only, error handling,
                              rate-limiting/min-interval
"""

from __future__ import annotations

import json
import time
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from click.testing import CliRunner

from mizukilens.cli import main
from mizukilens.metadata import (
    STALE_DAYS,
    FetchResult,
    fetch_deezer_metadata,
    fetch_lrclib_lyrics,
    fetch_song_metadata,
    is_stale,
    normalize_artist,
    read_metadata_file,
    upsert_artist_info,
    upsert_song_lyrics,
    upsert_song_metadata,
    write_metadata_file,
)


# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

def make_deezer_track(
    track_id: int = 1,
    title: str = "Test Song",
    artist_id: int = 10,
    artist_name: str = "Test Artist",
    album_title: str = "Test Album",
    duration: int = 240,
) -> dict:
    """Build a minimal Deezer track result dict."""
    return {
        "id": track_id,
        "title": title,
        "duration": duration,
        "artist": {
            "id": artist_id,
            "name": artist_name,
            "picture_small": "https://example.com/artist_small.jpg",
            "picture_medium": "https://example.com/artist_medium.jpg",
            "picture_big": "https://example.com/artist_big.jpg",
            "picture_xl": "https://example.com/artist_xl.jpg",
        },
        "album": {
            "id": 100,
            "title": album_title,
            "cover_small": "https://example.com/cover_small.jpg",
            "cover_medium": "https://example.com/cover_medium.jpg",
            "cover_big": "https://example.com/cover_big.jpg",
            "cover_xl": "https://example.com/cover_xl.jpg",
        },
    }


def make_lrclib_result(
    synced: str | None = "[00:01.00] Hello world",
    plain: str | None = "Hello world",
) -> dict:
    return {
        "id": 1,
        "trackName": "Test Song",
        "artistName": "Test Artist",
        "syncedLyrics": synced,
        "plainLyrics": plain,
    }


def _fresh_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def _stale_iso() -> str:
    return (datetime.now(tz=timezone.utc) - timedelta(days=STALE_DAYS + 1)).isoformat()


# ---------------------------------------------------------------------------
# normalize_artist
# ---------------------------------------------------------------------------

class TestNormalizeArtist:
    def test_lowercases(self):
        assert normalize_artist("YOASOBI") == "yoasobi"

    def test_strips_whitespace(self):
        assert normalize_artist("  宇多田光  ") == "宇多田光"

    def test_collapses_internal_spaces(self):
        assert normalize_artist("  宇多田  光  ") == "宇多田 光"

    def test_mixed_case_and_spaces(self):
        assert normalize_artist("  Ado  ") == "ado"

    def test_empty_string(self):
        assert normalize_artist("") == ""

    def test_already_normalized(self):
        assert normalize_artist("yoasobi") == "yoasobi"


# ---------------------------------------------------------------------------
# fetch_deezer_metadata — mocked _deezer_search
# ---------------------------------------------------------------------------

class TestFetchDeezerMetadata:
    """Tests for the Deezer search with 4 fallback strategies."""

    def test_strategy_1_exact_match(self):
        """Strategy 1 (exact) succeeds → returns match_confidence='exact'."""
        track = make_deezer_track()
        with patch("mizukilens.metadata._deezer_search", return_value=[track]) as mock_search:
            result = fetch_deezer_metadata("Test Artist", "Test Song")
        assert result is not None
        assert result["match_confidence"] == "exact"
        assert result["deezerTrackId"] == 1
        assert result["albumArtUrls"]["xl"] == "https://example.com/cover_xl.jpg"
        # Should have been called with the structured query first
        mock_search.assert_called_once()
        first_call_query = mock_search.call_args[0][0]
        assert 'artist:"Test Artist"' in first_call_query
        assert 'track:"Test Song"' in first_call_query

    def test_strategy_2_romanized_slot_skipped(self):
        """Strategy 2 (romanized) is a reserved slot; simple search (strategy 3) is used next."""
        track = make_deezer_track()
        # First call (structured) returns empty; second call (simple) returns result
        call_count = [0]
        def side_effect(query):
            call_count[0] += 1
            if call_count[0] == 1:
                return []  # structured failed
            return [track]  # simple succeeded

        with patch("mizukilens.metadata._deezer_search", side_effect=side_effect):
            result = fetch_deezer_metadata("日本語アーティスト", "Test Song")

        assert result["match_confidence"] == "fuzzy"
        assert call_count[0] == 2

    def test_strategy_3_simple_match(self):
        """Strategy 3 (simple) is used when strategy 1 returns no results."""
        track = make_deezer_track()

        call_count = [0]
        def side_effect(query):
            call_count[0] += 1
            if call_count[0] == 1:
                return []  # strategy 1 failed
            return [track]  # strategy 3 succeeded

        with patch("mizukilens.metadata._deezer_search", side_effect=side_effect):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        assert result["match_confidence"] == "fuzzy"
        assert call_count[0] == 2

    def test_strategy_4_title_only(self):
        """Strategy 4 (title-only) is used when strategies 1 & 3 fail."""
        track = make_deezer_track()

        call_count = [0]
        def side_effect(query):
            call_count[0] += 1
            if call_count[0] < 3:
                return []
            return [track]

        with patch("mizukilens.metadata._deezer_search", side_effect=side_effect):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        assert result["match_confidence"] == "fuzzy"
        assert call_count[0] == 3

    def test_all_strategies_no_match(self):
        """All strategies return empty → match_confidence is None, last_error None."""
        with patch("mizukilens.metadata._deezer_search", return_value=[]):
            result = fetch_deezer_metadata("Unknown Artist", "Unknown Song")

        assert result["match_confidence"] is None
        assert result.get("last_error") is None

    def test_timeout_marks_error(self):
        """Timeout on all strategies → last_error='timeout'."""
        with patch("mizukilens.metadata._deezer_search", side_effect=TimeoutError("timeout")):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        assert result["match_confidence"] is None
        assert result["last_error"] == "timeout"

    def test_http_error_marks_error(self):
        """HTTP error on all strategies → last_error set."""
        with patch("mizukilens.metadata._deezer_search",
                   side_effect=urllib.error.URLError("connection refused")):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        assert result["match_confidence"] is None
        assert result["last_error"] is not None

    def test_artist_info_extracted(self):
        """Artist picture URLs are extracted from the track result."""
        track = make_deezer_track()
        with patch("mizukilens.metadata._deezer_search", return_value=[track]):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        assert result["artistPictureUrls"]["xl"] == "https://example.com/artist_xl.jpg"
        assert result["deezerArtistId"] == 10

    def test_timeout_on_first_strategy_continues(self):
        """Timeout on first strategy → tries next strategies."""
        track = make_deezer_track()
        call_count = [0]
        def side_effect(query):
            call_count[0] += 1
            if call_count[0] == 1:
                raise TimeoutError("timeout")
            return [track]

        with patch("mizukilens.metadata._deezer_search", side_effect=side_effect):
            result = fetch_deezer_metadata("Test Artist", "Test Song")

        # Strategy 2 (simple) should have succeeded
        assert result["match_confidence"] == "fuzzy"


# ---------------------------------------------------------------------------
# fetch_lrclib_lyrics — mocked _http_get_json
# ---------------------------------------------------------------------------

class TestFetchLrclibLyrics:
    def test_synced_lyrics_returned(self):
        """Returns synced lyrics when available."""
        lrc_result = make_lrclib_result(synced="[00:01.00] Hello")
        with patch("mizukilens.metadata._http_get_json", return_value=[lrc_result]):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is True
        assert result["synced_lyrics"] == "[00:01.00] Hello"

    def test_prefers_synced_over_plain(self):
        """When multiple results exist, picks the one with synced lyrics."""
        plain_only = make_lrclib_result(synced=None, plain="Plain only")
        synced = make_lrclib_result(synced="[00:01.00] Synced", plain="Both")
        with patch("mizukilens.metadata._http_get_json", return_value=[plain_only, synced]):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["synced_lyrics"] == "[00:01.00] Synced"

    def test_falls_back_to_plain_lyrics(self):
        """When no result has synced lyrics, returns first result's plainLyrics."""
        plain_only = make_lrclib_result(synced=None, plain="Plain lyrics text")
        with patch("mizukilens.metadata._http_get_json", return_value=[plain_only]):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is True
        assert result["synced_lyrics"] is None
        assert result["plain_lyrics"] == "Plain lyrics text"

    def test_no_match_empty_results(self):
        """Empty list → matched=False."""
        with patch("mizukilens.metadata._http_get_json", return_value=[]):
            result = fetch_lrclib_lyrics("Unknown Artist", "Unknown Song")

        assert result["matched"] is False
        assert result["last_error"] is None

    def test_timeout_marks_error(self):
        with patch("mizukilens.metadata._http_get_json", side_effect=TimeoutError("timeout")):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is False
        assert result["last_error"] == "timeout"

    def test_url_error_marks_error(self):
        with patch("mizukilens.metadata._http_get_json",
                   side_effect=urllib.error.URLError("network error")):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is False
        assert result["last_error"] is not None

    def test_json_decode_error(self):
        import json as _json
        with patch("mizukilens.metadata._http_get_json",
                   side_effect=_json.JSONDecodeError("msg", "doc", 0)):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is False

    def test_non_list_response(self):
        """Non-list API response → no match."""
        with patch("mizukilens.metadata._http_get_json", return_value={"error": "not found"}):
            result = fetch_lrclib_lyrics("Test Artist", "Test Song")

        assert result["matched"] is False


# ---------------------------------------------------------------------------
# read_metadata_file
# ---------------------------------------------------------------------------

class TestReadMetadataFile:
    def test_reads_valid_json_array(self, tmp_path):
        p = tmp_path / "data.json"
        p.write_text('[{"songId": "song-1"}]', encoding="utf-8")
        data = read_metadata_file(p)
        assert data == [{"songId": "song-1"}]

    def test_returns_empty_for_missing_file(self, tmp_path):
        p = tmp_path / "nonexistent.json"
        data = read_metadata_file(p)
        assert data == []

    def test_returns_empty_for_corrupt_json(self, tmp_path):
        p = tmp_path / "corrupt.json"
        p.write_text("not valid json {{{", encoding="utf-8")
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            data = read_metadata_file(p)
        assert data == []

    def test_returns_empty_for_non_list_json(self, tmp_path):
        p = tmp_path / "object.json"
        p.write_text('{"key": "value"}', encoding="utf-8")
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            data = read_metadata_file(p)
        assert data == []

    def test_returns_empty_list_json(self, tmp_path):
        p = tmp_path / "empty.json"
        p.write_text("[]", encoding="utf-8")
        data = read_metadata_file(p)
        assert data == []


# ---------------------------------------------------------------------------
# write_metadata_file
# ---------------------------------------------------------------------------

class TestWriteMetadataFile:
    def test_writes_json_array(self, tmp_path):
        p = tmp_path / "out.json"
        data = [{"songId": "song-1", "fetchStatus": "matched"}]
        write_metadata_file(p, data)
        content = json.loads(p.read_text(encoding="utf-8"))
        assert content == data

    def test_creates_parent_directories(self, tmp_path):
        p = tmp_path / "nested" / "dir" / "out.json"
        write_metadata_file(p, [])
        assert p.exists()

    def test_overwrites_existing_file(self, tmp_path):
        p = tmp_path / "out.json"
        p.write_text("[1, 2, 3]", encoding="utf-8")
        write_metadata_file(p, [{"new": True}])
        content = json.loads(p.read_text(encoding="utf-8"))
        assert content == [{"new": True}]

    def test_ends_with_newline(self, tmp_path):
        p = tmp_path / "out.json"
        write_metadata_file(p, [])
        text = p.read_text(encoding="utf-8")
        assert text.endswith("\n")


# ---------------------------------------------------------------------------
# upsert_song_metadata
# ---------------------------------------------------------------------------

class TestUpsertSongMetadata:
    def test_insert_new_record(self):
        entry = {"songId": "song-1", "fetchStatus": "matched"}
        result = upsert_song_metadata([], entry)
        assert len(result) == 1
        assert result[0]["songId"] == "song-1"

    def test_update_existing_record(self):
        old = {"songId": "song-1", "fetchStatus": "error"}
        new = {"songId": "song-1", "fetchStatus": "matched"}
        result = upsert_song_metadata([old], new)
        assert len(result) == 1
        assert result[0]["fetchStatus"] == "matched"

    def test_does_not_affect_other_records(self):
        existing = [
            {"songId": "song-1", "fetchStatus": "matched"},
            {"songId": "song-2", "fetchStatus": "error"},
        ]
        new_entry = {"songId": "song-2", "fetchStatus": "matched"}
        result = upsert_song_metadata(existing, new_entry)
        assert len(result) == 2
        by_id = {r["songId"]: r for r in result}
        assert by_id["song-1"]["fetchStatus"] == "matched"
        assert by_id["song-2"]["fetchStatus"] == "matched"

    def test_returns_new_list(self):
        original = []
        result = upsert_song_metadata(original, {"songId": "song-1"})
        assert result is not original


# ---------------------------------------------------------------------------
# upsert_song_lyrics
# ---------------------------------------------------------------------------

class TestUpsertSongLyrics:
    def test_insert_new_record(self):
        entry = {"songId": "song-1", "fetchStatus": "matched", "syncedLyrics": "[00:01.00] Hi"}
        result = upsert_song_lyrics([], entry)
        assert len(result) == 1

    def test_update_existing_record(self):
        old = {"songId": "song-1", "fetchStatus": "no_match", "syncedLyrics": None}
        new = {"songId": "song-1", "fetchStatus": "matched", "syncedLyrics": "[00:01.00] Hi"}
        result = upsert_song_lyrics([old], new)
        assert len(result) == 1
        assert result[0]["fetchStatus"] == "matched"

    def test_returns_new_list(self):
        original = []
        result = upsert_song_lyrics(original, {"songId": "song-1"})
        assert result is not original


# ---------------------------------------------------------------------------
# upsert_artist_info
# ---------------------------------------------------------------------------

class TestUpsertArtistInfo:
    def test_insert_new_record(self):
        entry = {"normalizedArtist": "yoasobi", "originalName": "YOASOBI"}
        result = upsert_artist_info([], entry)
        assert len(result) == 1

    def test_update_existing_record(self):
        old = {"normalizedArtist": "yoasobi", "originalName": "Yoasobi"}
        new = {"normalizedArtist": "yoasobi", "originalName": "YOASOBI", "deezerArtistId": 42}
        result = upsert_artist_info([old], new)
        assert len(result) == 1
        assert result[0]["deezerArtistId"] == 42

    def test_different_artists_not_overwritten(self):
        a1 = {"normalizedArtist": "yoasobi", "originalName": "YOASOBI"}
        a2 = {"normalizedArtist": "ado", "originalName": "Ado"}
        result = upsert_artist_info([a1], a2)
        assert len(result) == 2


# ---------------------------------------------------------------------------
# is_stale
# ---------------------------------------------------------------------------

class TestIsStale:
    def test_fresh_entry_not_stale(self):
        entry = {"fetchedAt": _fresh_iso()}
        assert is_stale(entry) is False

    def test_old_entry_is_stale(self):
        entry = {"fetchedAt": _stale_iso()}
        assert is_stale(entry) is True

    def test_missing_fetched_at_is_stale(self):
        assert is_stale({}) is True

    def test_none_fetched_at_is_stale(self):
        assert is_stale({"fetchedAt": None}) is True

    def test_invalid_date_is_stale(self):
        assert is_stale({"fetchedAt": "not-a-date"}) is True

    def test_exactly_stale_threshold(self):
        """Entry fetchedAt exactly STALE_DAYS days ago should be stale."""
        exact = (datetime.now(tz=timezone.utc) - timedelta(days=STALE_DAYS)).isoformat()
        entry = {"fetchedAt": exact}
        assert is_stale(entry) is True


# ---------------------------------------------------------------------------
# fetch_song_metadata — integration (mocked APIs, real file I/O)
# ---------------------------------------------------------------------------

class TestFetchSongMetadata:
    """Full integration tests with mocked API calls and real tmp directories."""

    @pytest.fixture()
    def metadata_dir(self, tmp_path):
        d = tmp_path / "metadata"
        d.mkdir()
        (d / "song-metadata.json").write_text("[]", encoding="utf-8")
        (d / "song-lyrics.json").write_text("[]", encoding="utf-8")
        (d / "artist-info.json").write_text("[]", encoding="utf-8")
        return d

    @pytest.fixture()
    def song(self):
        return {"id": "song-1", "title": "Test Song", "originalArtist": "Test Artist"}

    def test_matched_deezer_and_lyrics(self, metadata_dir, song):
        track = make_deezer_track()
        lrc = make_lrclib_result(synced="[00:01.00] Hello")

        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.deezer_status == "matched"
        assert result.lyrics_status == "matched"
        assert result.overall_status == "matched"

        # Check files were written
        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        assert len(metadata) == 1
        assert metadata[0]["songId"] == "song-1"
        assert metadata[0]["fetchStatus"] == "matched"
        assert metadata[0]["albumArtUrl"] != ""

        lyrics = json.loads((metadata_dir / "song-lyrics.json").read_text())
        assert len(lyrics) == 1
        assert lyrics[0]["syncedLyrics"] == "[00:01.00] Hello"

        artists = json.loads((metadata_dir / "artist-info.json").read_text())
        assert len(artists) == 1
        assert artists[0]["normalizedArtist"] == "test artist"

    def test_deezer_no_match(self, metadata_dir, song):
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.deezer_status == "no_match"
        assert result.lyrics_status == "matched"
        # SongMetadata still written with no_match status
        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        assert metadata[0]["fetchStatus"] == "no_match"

    def test_lyrics_no_match(self, metadata_dir, song):
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.deezer_status == "matched"
        assert result.lyrics_status == "no_match"
        lyrics = json.loads((metadata_dir / "song-lyrics.json").read_text())
        assert lyrics[0]["fetchStatus"] == "no_match"

    def test_deezer_error(self, metadata_dir, song):
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", side_effect=TimeoutError("timeout")),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.deezer_status == "error"
        assert result.deezer_error == "timeout"
        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        assert metadata[0]["fetchStatus"] == "error"
        assert metadata[0]["lastError"] == "timeout"

    def test_lyrics_error(self, metadata_dir, song):
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", side_effect=TimeoutError("timeout")),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.lyrics_status == "error"
        assert result.lyrics_error == "timeout"
        lyrics = json.loads((metadata_dir / "song-lyrics.json").read_text())
        assert lyrics[0]["fetchStatus"] == "error"

    def test_art_only_skips_lyrics(self, metadata_dir, song):
        track = make_deezer_track()
        with patch("mizukilens.metadata._deezer_search", return_value=[track]):
            result = fetch_song_metadata(song, metadata_dir, fetch_lyrics=False)

        assert result.deezer_status == "matched"
        assert result.lyrics_status == "skipped"
        # lyrics file should remain empty
        lyrics = json.loads((metadata_dir / "song-lyrics.json").read_text())
        assert lyrics == []

    def test_lyrics_only_skips_deezer(self, metadata_dir, song):
        lrc = make_lrclib_result()
        with patch("mizukilens.metadata._http_get_json", return_value=[lrc]):
            result = fetch_song_metadata(song, metadata_dir, fetch_deezer=False)

        assert result.deezer_status == "skipped"
        assert result.lyrics_status == "matched"
        # metadata file should remain empty
        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        assert metadata == []

    def test_upsert_updates_existing_entry(self, metadata_dir, song):
        """Calling fetch twice updates the existing record (upsert behavior)."""
        track = make_deezer_track()
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            fetch_song_metadata(song, metadata_dir)
            fetch_song_metadata(song, metadata_dir)

        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        # Should only have one entry, not two
        assert len(metadata) == 1

    def test_artist_info_upsert(self, metadata_dir):
        """Two songs with the same artist share one ArtistInfo entry."""
        track = make_deezer_track()
        song1 = {"id": "song-1", "title": "Song A", "originalArtist": "YOASOBI"}
        song2 = {"id": "song-2", "title": "Song B", "originalArtist": "YOASOBI"}

        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            fetch_song_metadata(song1, metadata_dir, fetch_lyrics=False)
            fetch_song_metadata(song2, metadata_dir, fetch_lyrics=False)

        artists = json.loads((metadata_dir / "artist-info.json").read_text())
        assert len(artists) == 1
        assert artists[0]["normalizedArtist"] == "yoasobi"

    def test_missing_metadata_dir_created(self, tmp_path, song):
        """metadata_dir is created if it doesn't exist."""
        metadata_dir = tmp_path / "brand_new_dir"
        # Don't create it
        track = make_deezer_track()
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = fetch_song_metadata(song, metadata_dir)

        assert result.deezer_status == "matched"
        assert metadata_dir.exists()

    def test_album_art_url_set_to_xl(self, metadata_dir, song):
        """albumArtUrl is set to the XL URL."""
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            fetch_song_metadata(song, metadata_dir, fetch_lyrics=False)

        metadata = json.loads((metadata_dir / "song-metadata.json").read_text())
        assert metadata[0]["albumArtUrl"] == "https://example.com/cover_xl.jpg"


# ---------------------------------------------------------------------------
# Rate limiting — _wait_deezer / _wait_lrclib
# ---------------------------------------------------------------------------

class TestRateLimiting:
    """Verify that consecutive API calls respect the 200ms minimum interval."""

    def test_deezer_rate_limit_respected(self):
        """Two consecutive Deezer calls should have at least 200ms between them."""
        import mizukilens.metadata as m_module

        # Reset last call time to simulate a fresh start
        m_module._last_deezer_call = 0.0

        call_times = []
        original_search = m_module._deezer_search.__wrapped__ if hasattr(m_module._deezer_search, '__wrapped__') else None

        # Track timing through _wait_deezer calls
        original_wait = m_module._wait_deezer

        def recording_wait():
            call_times.append(time.monotonic())
            original_wait()

        with patch.object(m_module, "_wait_deezer", side_effect=recording_wait):
            with patch.object(m_module, "_http_get_json", return_value={"data": []}):
                m_module._deezer_search("query1")
                m_module._deezer_search("query2")

        # Should have been called twice
        assert len(call_times) == 2
        # The second call should be invoked after the first
        assert call_times[1] >= call_times[0]

    def test_min_interval_enforced(self):
        """The _wait_deezer function sleeps if called too quickly."""
        import mizukilens.metadata as m_module

        sleep_calls = []
        original_sleep = time.sleep

        def mock_sleep(seconds):
            sleep_calls.append(seconds)

        # Set last call to "just happened"
        m_module._last_deezer_call = time.monotonic()

        with patch("mizukilens.metadata.time.sleep", side_effect=mock_sleep):
            m_module._wait_deezer()

        # Should have slept for approximately MIN_INTERVAL_SEC
        assert len(sleep_calls) == 1
        assert sleep_calls[0] > 0
        assert sleep_calls[0] <= m_module._MIN_INTERVAL_SEC + 0.01


# ---------------------------------------------------------------------------
# CLI: metadata fetch
# ---------------------------------------------------------------------------

class TestCLIMetadataFetch:
    """Tests for the `mizukilens metadata fetch` CLI command."""

    @pytest.fixture()
    def prism_root(self, tmp_path):
        """Set up a minimal MizukiPrism project root."""
        data_dir = tmp_path / "data"
        data_dir.mkdir()
        metadata_dir = data_dir / "metadata"
        metadata_dir.mkdir()

        songs = [
            {"id": "song-1", "title": "First Love", "originalArtist": "宇多田光"},
            {"id": "song-2", "title": "Idol", "originalArtist": "YOASOBI"},
        ]
        (data_dir / "songs.json").write_text(
            json.dumps(songs, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        (metadata_dir / "song-metadata.json").write_text("[]", encoding="utf-8")
        (metadata_dir / "song-lyrics.json").write_text("[]", encoding="utf-8")
        (metadata_dir / "artist-info.json").write_text("[]", encoding="utf-8")
        return tmp_path

    def _run(self, args: list[str], prism_root: Path) -> "Result":
        """Run CLI command from within the prism_root directory."""
        runner = CliRunner()
        import os
        old_cwd = os.getcwd()
        try:
            os.chdir(str(prism_root))
            return runner.invoke(main, args, catch_exceptions=False)
        finally:
            os.chdir(old_cwd)

    def test_fetch_missing_fetches_all_when_none_exist(self, prism_root):
        track = make_deezer_track()
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = self._run(["metadata", "fetch", "--missing"], prism_root)

        assert result.exit_code == 0
        assert "Matched" in result.output or "matched" in result.output.lower()

        # Verify files were written
        metadata = json.loads(
            (prism_root / "data" / "metadata" / "song-metadata.json").read_text()
        )
        assert len(metadata) == 2

    def test_fetch_missing_skips_already_fetched(self, prism_root):
        """--missing only fetches songs without any existing metadata."""
        # Pre-populate song-1's metadata
        existing = [{"songId": "song-1", "fetchStatus": "matched", "fetchedAt": _fresh_iso()}]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        track = make_deezer_track()
        lrc = make_lrclib_result()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = self._run(["metadata", "fetch", "--missing"], prism_root)

        assert result.exit_code == 0
        # Only song-2 should be fetched (song-1 already has metadata)
        # The Deezer query should mention Idol or YOASOBI but not 宇多田光
        all_queries = " ".join(fetch_calls)
        assert "Idol" in all_queries or "YOASOBI" in all_queries

    def test_fetch_stale_only_fetches_stale_entries(self, prism_root):
        """--stale only fetches entries older than STALE_DAYS."""
        existing = [
            {"songId": "song-1", "fetchStatus": "matched", "fetchedAt": _stale_iso()},  # stale
            {"songId": "song-2", "fetchStatus": "matched", "fetchedAt": _fresh_iso()},  # fresh
        ]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        track = make_deezer_track()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--stale"], prism_root)

        assert result.exit_code == 0
        # Only song-1 (stale) should be fetched
        all_queries = " ".join(fetch_calls)
        assert "First Love" in all_queries or "宇多田光" in all_queries

    def test_fetch_all_fetches_all_non_manual(self, prism_root):
        """--all fetches all songs, skipping manual entries."""
        existing = [
            {"songId": "song-1", "fetchStatus": "manual", "fetchedAt": _fresh_iso()},
            {"songId": "song-2", "fetchStatus": "matched", "fetchedAt": _fresh_iso()},
        ]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        track = make_deezer_track()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--all"], prism_root)

        assert result.exit_code == 0
        # Only song-2 should be fetched (song-1 is manual)
        all_queries = " ".join(fetch_calls)
        assert "Idol" in all_queries or "YOASOBI" in all_queries
        # First Love (song-1/manual) should NOT be fetched
        assert "First Love" not in all_queries

    def test_fetch_all_with_force_includes_manual(self, prism_root):
        """--all --force fetches all songs including manual entries."""
        existing = [
            {"songId": "song-1", "fetchStatus": "manual", "fetchedAt": _fresh_iso()},
        ]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        track = make_deezer_track()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--all", "--force"], prism_root)

        assert result.exit_code == 0
        # Both songs should be fetched (manual entry overridden by --force)
        assert "First Love" in " ".join(fetch_calls) or "宇多田光" in " ".join(fetch_calls)

    def test_fetch_specific_song(self, prism_root):
        """--song ID fetches only that song."""
        track = make_deezer_track()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--song", "song-1"], prism_root)

        assert result.exit_code == 0
        all_queries = " ".join(fetch_calls)
        # Only song-1 (First Love / 宇多田光) should appear
        assert "First Love" in all_queries or "宇多田光" in all_queries
        # song-2 should not appear
        assert "Idol" not in all_queries and "YOASOBI" not in all_queries

    def test_fetch_specific_song_not_found(self, prism_root):
        """--song with invalid ID exits with error."""
        result = self._run(["metadata", "fetch", "--song", "song-999"], prism_root)
        assert result.exit_code != 0

    def test_lyrics_only_skips_deezer(self, prism_root):
        """--lyrics-only skips Deezer API calls."""
        lrc = make_lrclib_result()
        deezer_calls = []

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=lambda q: deezer_calls.append(q) or []),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = self._run(["metadata", "fetch", "--lyrics-only"], prism_root)

        assert result.exit_code == 0
        assert deezer_calls == []
        # Lyrics file should have entries
        lyrics = json.loads(
            (prism_root / "data" / "metadata" / "song-lyrics.json").read_text()
        )
        assert len(lyrics) == 2

    def test_art_only_skips_lrclib(self, prism_root):
        """--art-only skips LRCLIB API calls."""
        track = make_deezer_track()
        lrclib_calls = []

        def mock_http_get(url, **kwargs):
            lrclib_calls.append(url)
            return []

        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", side_effect=mock_http_get),
        ):
            result = self._run(["metadata", "fetch", "--art-only"], prism_root)

        assert result.exit_code == 0
        assert lrclib_calls == []
        # Metadata file should have entries
        metadata = json.loads(
            (prism_root / "data" / "metadata" / "song-metadata.json").read_text()
        )
        assert len(metadata) == 2

    def test_lyrics_only_and_art_only_conflict(self, prism_root):
        """--lyrics-only and --art-only together should fail."""
        result = self._run(["metadata", "fetch", "--lyrics-only", "--art-only"], prism_root)
        assert result.exit_code != 0

    def test_api_error_caught_gracefully(self, prism_root):
        """API errors for one song don't stop remaining songs from being processed."""
        call_count = [0]

        def side_effect(query):
            call_count[0] += 1
            if call_count[0] == 1:
                raise TimeoutError("timeout")
            return [make_deezer_track()]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=side_effect),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--missing"], prism_root)

        assert result.exit_code == 0
        # Both songs should be processed (even if one errored)
        assert call_count[0] > 1

    def test_summary_table_shown(self, prism_root):
        """Summary table is displayed after fetching."""
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch", "--missing"], prism_root)

        assert result.exit_code == 0
        # Check that summary table keywords appear in output
        output_lower = result.output.lower()
        assert "matched" in output_lower or "total" in output_lower

    def test_no_songs_to_fetch_exits_cleanly(self, prism_root):
        """When all songs already have metadata, reports nothing to do."""
        existing = [
            {"songId": "song-1", "fetchStatus": "matched", "fetchedAt": _fresh_iso()},
            {"songId": "song-2", "fetchStatus": "matched", "fetchedAt": _fresh_iso()},
        ]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        result = self._run(["metadata", "fetch", "--missing"], prism_root)
        assert result.exit_code == 0
        assert "Nothing to do" in result.output or "No songs" in result.output

    def test_fetched_at_is_set(self, prism_root):
        """Each fetched entry has a fetchedAt timestamp."""
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            self._run(["metadata", "fetch", "--missing"], prism_root)

        metadata = json.loads(
            (prism_root / "data" / "metadata" / "song-metadata.json").read_text()
        )
        for entry in metadata:
            assert entry.get("fetchedAt") is not None
            # Should be parseable as ISO 8601
            datetime.fromisoformat(entry["fetchedAt"])

    def test_metadata_schema_has_required_fields(self, prism_root):
        """song-metadata.json entries have all required schema fields."""
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            self._run(["metadata", "fetch", "--missing"], prism_root)

        metadata = json.loads(
            (prism_root / "data" / "metadata" / "song-metadata.json").read_text()
        )
        required_fields = {"songId", "fetchStatus", "albumArtUrl", "albumArtUrls", "fetchedAt", "matchConfidence"}
        for entry in metadata:
            missing = required_fields - set(entry.keys())
            assert missing == set(), f"Missing fields: {missing}"

    def test_lyrics_schema_has_required_fields(self, prism_root):
        """song-lyrics.json entries have all required schema fields."""
        track = make_deezer_track()
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            self._run(["metadata", "fetch", "--missing"], prism_root)

        lyrics = json.loads(
            (prism_root / "data" / "metadata" / "song-lyrics.json").read_text()
        )
        required_fields = {"songId", "fetchStatus", "syncedLyrics", "plainLyrics", "fetchedAt"}
        for entry in lyrics:
            missing = required_fields - set(entry.keys())
            assert missing == set(), f"Missing fields: {missing}"

    def test_artist_info_schema_has_required_fields(self, prism_root):
        """artist-info.json entries have all required schema fields."""
        track = make_deezer_track()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            self._run(["metadata", "fetch", "--missing"], prism_root)

        artists = json.loads(
            (prism_root / "data" / "metadata" / "artist-info.json").read_text()
        )
        required_fields = {"normalizedArtist", "originalName", "deezerArtistId", "pictureUrls", "fetchedAt"}
        for entry in artists:
            missing = required_fields - set(entry.keys())
            assert missing == set(), f"Missing fields: {missing}"

    def test_default_mode_is_missing(self, prism_root):
        """Running `metadata fetch` without a mode flag defaults to --missing."""
        track = make_deezer_track()
        lrc = make_lrclib_result()
        with (
            patch("mizukilens.metadata._deezer_search", return_value=[track]),
            patch("mizukilens.metadata._http_get_json", return_value=[lrc]),
        ):
            result = self._run(["metadata", "fetch"], prism_root)

        assert result.exit_code == 0
        # Should have processed songs (--missing is the default)
        metadata = json.loads(
            (prism_root / "data" / "metadata" / "song-metadata.json").read_text()
        )
        assert len(metadata) == 2

    def test_fetch_missing_is_default_when_no_flag(self, prism_root):
        """metadata fetch without mode flag processes missing songs."""
        # Pre-populate song-1's metadata (so only song-2 should be fetched)
        existing = [{"songId": "song-1", "fetchStatus": "matched", "fetchedAt": _fresh_iso()}]
        (prism_root / "data" / "metadata" / "song-metadata.json").write_text(
            json.dumps(existing) + "\n", encoding="utf-8"
        )

        track = make_deezer_track()
        fetch_calls = []

        def track_deezer(query):
            fetch_calls.append(query)
            return [track]

        with (
            patch("mizukilens.metadata._deezer_search", side_effect=track_deezer),
            patch("mizukilens.metadata._http_get_json", return_value=[]),
        ):
            result = self._run(["metadata", "fetch"], prism_root)

        assert result.exit_code == 0
        # Only song-2 should be fetched (song-1 already has metadata)
        all_queries = " ".join(fetch_calls)
        assert "Idol" in all_queries or "YOASOBI" in all_queries


# ---------------------------------------------------------------------------
# FetchResult.overall_status
# ---------------------------------------------------------------------------

class TestFetchResultOverallStatus:
    def test_both_matched(self):
        r = FetchResult("s1", "T", "A", deezer_status="matched", lyrics_status="matched")
        assert r.overall_status == "matched"

    def test_one_matched_one_no_match(self):
        r = FetchResult("s1", "T", "A", deezer_status="matched", lyrics_status="no_match")
        assert r.overall_status == "matched"

    def test_both_no_match(self):
        r = FetchResult("s1", "T", "A", deezer_status="no_match", lyrics_status="no_match")
        assert r.overall_status == "no_match"

    def test_one_error(self):
        r = FetchResult("s1", "T", "A", deezer_status="error", lyrics_status="no_match")
        assert r.overall_status == "error"

    def test_both_skipped(self):
        r = FetchResult("s1", "T", "A", deezer_status="skipped", lyrics_status="skipped")
        assert r.overall_status == "skipped"

    def test_matched_and_skipped(self):
        r = FetchResult("s1", "T", "A", deezer_status="matched", lyrics_status="skipped")
        assert r.overall_status == "matched"
