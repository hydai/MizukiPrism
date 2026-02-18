"""Tests for the MizukiLens SQLite cache module (LENS-002)."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any
from unittest.mock import patch

import pytest
from click.testing import CliRunner

from mizukilens.cache import (
    VALID_STATUSES,
    VALID_TRANSITIONS,
    clear_all,
    clear_stream,
    delete_stream,
    get_db_path,
    get_parsed_songs,
    get_status_counts,
    get_stream,
    is_valid_transition,
    list_streams,
    open_db,
    update_stream_status,
    upsert_parsed_songs,
    upsert_stream,
)
from mizukilens.cli import main


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def db(tmp_path: Path) -> sqlite3.Connection:
    """Return an in-memory-like connection backed by a temp file."""
    conn = open_db(tmp_path / "test_cache.db")
    yield conn
    conn.close()


def _add_stream(conn: sqlite3.Connection, video_id: str = "abc123", **kwargs: Any) -> None:
    """Helper — insert a stream row with sensible defaults."""
    defaults: dict[str, Any] = {
        "channel_id": "UCtest",
        "title": "Test Stream",
        "date": "2024-03-15",
        "status": "discovered",
    }
    defaults.update(kwargs)
    upsert_stream(conn, video_id=video_id, **defaults)


# ===========================================================================
# SECTION 1: Database creation & schema
# ===========================================================================

class TestDatabaseCreation:
    """Verify the DB file is created and the schema is correct."""

    def test_open_db_creates_file(self, tmp_path: Path) -> None:
        db_path = tmp_path / "test.db"
        assert not db_path.exists()
        conn = open_db(db_path)
        conn.close()
        assert db_path.exists()

    def test_open_db_creates_parent_directories(self, tmp_path: Path) -> None:
        nested = tmp_path / "a" / "b" / "c" / "cache.db"
        assert not nested.parent.exists()
        conn = open_db(nested)
        conn.close()
        assert nested.exists()

    def test_streams_table_exists(self, db: sqlite3.Connection) -> None:
        cur = db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='streams'"
        )
        assert cur.fetchone() is not None

    def test_parsed_songs_table_exists(self, db: sqlite3.Connection) -> None:
        cur = db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='parsed_songs'"
        )
        assert cur.fetchone() is not None

    def test_streams_columns(self, db: sqlite3.Connection) -> None:
        cur = db.execute("PRAGMA table_info(streams)")
        columns = {row["name"] for row in cur.fetchall()}
        expected = {
            "video_id", "channel_id", "title", "date", "status",
            "source", "raw_comment", "raw_description", "created_at", "updated_at",
        }
        assert expected == columns

    def test_parsed_songs_columns(self, db: sqlite3.Connection) -> None:
        cur = db.execute("PRAGMA table_info(parsed_songs)")
        columns = {row["name"] for row in cur.fetchall()}
        expected = {
            "id", "video_id", "order_index", "song_name", "artist",
            "start_timestamp", "end_timestamp", "note",
        }
        assert expected == columns

    def test_streams_primary_key_is_video_id(self, db: sqlite3.Connection) -> None:
        cur = db.execute("PRAGMA table_info(streams)")
        pk_cols = [row["name"] for row in cur.fetchall() if row["pk"] == 1]
        assert pk_cols == ["video_id"]

    def test_parsed_songs_primary_key_is_id(self, db: sqlite3.Connection) -> None:
        cur = db.execute("PRAGMA table_info(parsed_songs)")
        pk_cols = [row["name"] for row in cur.fetchall() if row["pk"] == 1]
        assert pk_cols == ["id"]

    def test_open_db_is_idempotent(self, tmp_path: Path) -> None:
        """Opening the same DB twice should not raise."""
        db_path = tmp_path / "test.db"
        c1 = open_db(db_path)
        c1.close()
        c2 = open_db(db_path)
        c2.close()

    def test_get_db_path_default(self) -> None:
        """With no override, get_db_path should return a path under ~/.local/share."""
        # load_config is imported inside _resolve_cache_path so patch from the config module
        with patch("mizukilens.config.load_config", return_value=None):
            path = get_db_path()
        assert "mizukilens" in str(path)
        assert path.suffix == ".db"

    def test_get_db_path_from_config(self, tmp_path: Path) -> None:
        db_file = tmp_path / "custom.db"
        cfg = {"cache": {"path": str(db_file)}}
        with patch("mizukilens.config.load_config", return_value=cfg):
            path = get_db_path()
        assert path == db_file


# ===========================================================================
# SECTION 2: Stream CRUD
# ===========================================================================

class TestStreamCRUD:
    """Test insert, update, get, list, and delete operations for streams."""

    def test_upsert_stream_insert(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "vid001")
        row = get_stream(db, "vid001")
        assert row is not None
        assert row["video_id"] == "vid001"
        assert row["status"] == "discovered"

    def test_upsert_stream_stores_all_fields(self, db: sqlite3.Connection) -> None:
        upsert_stream(
            db,
            video_id="vid002",
            channel_id="UCfoo",
            title="歌回 Vol.1",
            date="2024-01-01",
            status="discovered",
            source="comment",
            raw_comment="0:01:00 song A",
            raw_description="description text",
        )
        row = get_stream(db, "vid002")
        assert row["channel_id"] == "UCfoo"
        assert row["title"] == "歌回 Vol.1"
        assert row["date"] == "2024-01-01"
        assert row["source"] == "comment"
        assert row["raw_comment"] == "0:01:00 song A"
        assert row["raw_description"] == "description text"

    def test_upsert_stream_sets_timestamps(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "vid003")
        row = get_stream(db, "vid003")
        assert row["created_at"] is not None
        assert row["updated_at"] is not None

    def test_upsert_stream_update_does_not_change_created_at(
        self, db: sqlite3.Connection
    ) -> None:
        _add_stream(db, "vid004")
        before = get_stream(db, "vid004")["created_at"]
        upsert_stream(db, video_id="vid004", title="New Title", status="extracted")
        after = get_stream(db, "vid004")
        assert after["created_at"] == before
        assert after["title"] == "New Title"
        assert after["status"] == "extracted"

    def test_upsert_stream_update_preserves_nulls(self, db: sqlite3.Connection) -> None:
        """Passing None for optional fields on update should keep the old value."""
        upsert_stream(
            db, video_id="vid005", channel_id="UCfoo", title="Orig", status="discovered"
        )
        upsert_stream(db, video_id="vid005", status="extracted")
        row = get_stream(db, "vid005")
        assert row["channel_id"] == "UCfoo"  # preserved
        assert row["title"] == "Orig"        # preserved

    def test_upsert_stream_rejects_invalid_status(self, db: sqlite3.Connection) -> None:
        with pytest.raises(ValueError, match="Invalid status"):
            upsert_stream(db, video_id="vid006", status="unknown_status")

    def test_get_stream_returns_none_for_missing(self, db: sqlite3.Connection) -> None:
        assert get_stream(db, "does_not_exist") is None

    def test_list_streams_empty(self, db: sqlite3.Connection) -> None:
        assert list_streams(db) == []

    def test_list_streams_returns_all(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "a")
        _add_stream(db, "b")
        _add_stream(db, "c")
        rows = list_streams(db)
        assert len(rows) == 3
        ids = {r["video_id"] for r in rows}
        assert ids == {"a", "b", "c"}

    def test_list_streams_filter_by_status(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "d1", status="discovered")
        _add_stream(db, "d2", status="discovered")
        _add_stream(db, "e1", status="extracted")
        discovered = list_streams(db, status="discovered")
        assert len(discovered) == 2
        extracted = list_streams(db, status="extracted")
        assert len(extracted) == 1

    def test_delete_stream_removes_row(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "del1")
        assert delete_stream(db, "del1") is True
        assert get_stream(db, "del1") is None

    def test_delete_stream_returns_false_for_missing(self, db: sqlite3.Connection) -> None:
        assert delete_stream(db, "not_here") is False


# ===========================================================================
# SECTION 3: Status transitions
# ===========================================================================

class TestStatusTransitions:
    """Validate the status state machine."""

    def test_valid_initial_transition(self) -> None:
        assert is_valid_transition(None, "discovered") is True

    def test_invalid_initial_transition(self) -> None:
        assert is_valid_transition(None, "approved") is False

    @pytest.mark.parametrize("from_s, to_s", [
        ("discovered", "extracted"),
        ("discovered", "excluded"),
        ("extracted", "pending"),
        ("extracted", "approved"),
        ("pending", "approved"),
        ("pending", "extracted"),
        ("pending", "excluded"),
        ("approved", "exported"),
        ("approved", "extracted"),
        ("exported", "imported"),
        ("exported", "approved"),
        ("imported", "approved"),
        ("excluded", "discovered"),
    ])
    def test_valid_transitions(self, from_s: str, to_s: str) -> None:
        assert is_valid_transition(from_s, to_s) is True, (
            f"Expected {from_s!r} → {to_s!r} to be valid"
        )

    @pytest.mark.parametrize("from_s, to_s", [
        ("discovered", "approved"),
        ("discovered", "imported"),
        ("extracted", "imported"),
        ("extracted", "exported"),
        ("approved", "discovered"),
        ("imported", "discovered"),
    ])
    def test_invalid_transitions(self, from_s: str, to_s: str) -> None:
        assert is_valid_transition(from_s, to_s) is False, (
            f"Expected {from_s!r} → {to_s!r} to be invalid"
        )

    def test_unknown_status_is_invalid(self) -> None:
        assert is_valid_transition("discovered", "nonexistent") is False

    def test_update_stream_status_valid(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "upd1", status="discovered")
        update_stream_status(db, "upd1", "extracted")
        assert get_stream(db, "upd1")["status"] == "extracted"

    def test_update_stream_status_invalid_raises(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "upd2", status="discovered")
        with pytest.raises(ValueError, match="Cannot transition"):
            update_stream_status(db, "upd2", "imported")

    def test_update_stream_status_missing_raises(self, db: sqlite3.Connection) -> None:
        with pytest.raises(KeyError):
            update_stream_status(db, "ghost_id", "extracted")

    def test_full_happy_path_transition(self, db: sqlite3.Connection) -> None:
        """Walk through the full normal pipeline."""
        _add_stream(db, "happy", status="discovered")
        update_stream_status(db, "happy", "extracted")
        update_stream_status(db, "happy", "approved")
        update_stream_status(db, "happy", "exported")
        update_stream_status(db, "happy", "imported")
        assert get_stream(db, "happy")["status"] == "imported"

    def test_exclusion_branch(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "excl", status="discovered")
        update_stream_status(db, "excl", "excluded")
        assert get_stream(db, "excl")["status"] == "excluded"

    def test_pending_branch(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "pend", status="discovered")
        update_stream_status(db, "pend", "extracted")
        update_stream_status(db, "pend", "pending")
        assert get_stream(db, "pend")["status"] == "pending"

    def test_all_statuses_listed_in_valid_statuses(self) -> None:
        expected = {
            "discovered", "extracted", "pending",
            "approved", "exported", "imported", "excluded",
        }
        assert set(VALID_STATUSES) == expected


# ===========================================================================
# SECTION 4: Parsed songs CRUD
# ===========================================================================

class TestParsedSongsCRUD:
    """Test insert, retrieve, and replace operations for parsed_songs."""

    def _sample_songs(self) -> list[dict]:
        return [
            {
                "order_index": 0,
                "song_name": "打上花火",
                "artist": "DAOKO×米津玄師",
                "start_timestamp": "0:03:20",
                "end_timestamp": "0:08:15",
                "note": None,
            },
            {
                "order_index": 1,
                "song_name": "Lemon",
                "artist": "米津玄師",
                "start_timestamp": "0:08:15",
                "end_timestamp": None,
                "note": "清唱版",
            },
        ]

    def test_upsert_and_retrieve_parsed_songs(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "ps1")
        upsert_parsed_songs(db, "ps1", self._sample_songs())
        rows = get_parsed_songs(db, "ps1")
        assert len(rows) == 2
        assert rows[0]["song_name"] == "打上花火"
        assert rows[1]["song_name"] == "Lemon"

    def test_parsed_songs_ordered_by_order_index(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "ps2")
        songs = list(reversed(self._sample_songs()))  # insert in reverse order
        upsert_parsed_songs(db, "ps2", songs)
        rows = get_parsed_songs(db, "ps2")
        assert rows[0]["order_index"] == 0
        assert rows[1]["order_index"] == 1

    def test_upsert_parsed_songs_replaces_existing(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "ps3")
        upsert_parsed_songs(db, "ps3", self._sample_songs())
        new_songs = [
            {
                "order_index": 0,
                "song_name": "New Song",
                "artist": "Artist A",
                "start_timestamp": "0:01:00",
                "end_timestamp": None,
                "note": None,
            }
        ]
        upsert_parsed_songs(db, "ps3", new_songs)
        rows = get_parsed_songs(db, "ps3")
        assert len(rows) == 1
        assert rows[0]["song_name"] == "New Song"

    def test_upsert_parsed_songs_missing_stream_raises(self, db: sqlite3.Connection) -> None:
        with pytest.raises(KeyError):
            upsert_parsed_songs(db, "nonexistent_vid", self._sample_songs())

    def test_parsed_songs_empty_artist_allowed(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "ps4")
        upsert_parsed_songs(
            db, "ps4",
            [{"order_index": 0, "song_name": "Solo", "start_timestamp": "0:01:00"}]
        )
        rows = get_parsed_songs(db, "ps4")
        assert rows[0]["artist"] is None

    def test_delete_stream_cascades_to_parsed_songs(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "ps5")
        upsert_parsed_songs(db, "ps5", self._sample_songs())
        delete_stream(db, "ps5")
        # Direct query to verify cascade
        cur = db.execute("SELECT COUNT(*) FROM parsed_songs WHERE video_id = 'ps5'")
        assert cur.fetchone()[0] == 0

    def test_get_parsed_songs_empty_for_missing_stream(self, db: sqlite3.Connection) -> None:
        rows = get_parsed_songs(db, "no_such_vid")
        assert rows == []


# ===========================================================================
# SECTION 5: Status statistics
# ===========================================================================

class TestStatusCounts:
    """Test the get_status_counts aggregation."""

    def test_all_statuses_present_when_empty(self, db: sqlite3.Connection) -> None:
        counts = get_status_counts(db)
        for status in VALID_STATUSES:
            assert status in counts
            assert counts[status] == 0

    def test_counts_are_accurate(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "c1", status="discovered")
        _add_stream(db, "c2", status="discovered")
        _add_stream(db, "c3", status="extracted")
        counts = get_status_counts(db)
        assert counts["discovered"] == 2
        assert counts["extracted"] == 1
        assert counts["approved"] == 0


# ===========================================================================
# SECTION 6: Cache clear operations
# ===========================================================================

class TestCacheClearOperations:
    """Test clear_all and clear_stream helpers."""

    def test_clear_all_removes_streams(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "x1")
        _add_stream(db, "x2")
        count = clear_all(db)
        assert count == 2
        assert list_streams(db) == []

    def test_clear_all_returns_zero_when_empty(self, db: sqlite3.Connection) -> None:
        assert clear_all(db) == 0

    def test_clear_all_removes_parsed_songs_too(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "y1")
        upsert_parsed_songs(
            db, "y1",
            [{"order_index": 0, "song_name": "X", "start_timestamp": "0:01:00"}]
        )
        clear_all(db)
        cur = db.execute("SELECT COUNT(*) FROM parsed_songs")
        assert cur.fetchone()[0] == 0

    def test_clear_stream_removes_only_target(self, db: sqlite3.Connection) -> None:
        _add_stream(db, "z1")
        _add_stream(db, "z2")
        result = clear_stream(db, "z1")
        assert result is True
        assert get_stream(db, "z1") is None
        assert get_stream(db, "z2") is not None

    def test_clear_stream_returns_false_for_missing(self, db: sqlite3.Connection) -> None:
        assert clear_stream(db, "ghost") is False


# ===========================================================================
# SECTION 7: CLI status command output
# ===========================================================================

class TestStatusCLICommand:
    """Test the ``mizukilens status`` and ``mizukilens status --detail`` commands."""

    def _make_db(self, tmp_path: Path) -> Path:
        db_path = tmp_path / "cache.db"
        conn = open_db(db_path)
        _add_stream(conn, "v1", title="歌回 Vol.1", date="2024-01-01", status="discovered")
        _add_stream(conn, "v2", title="歌回 Vol.2", date="2024-02-01", status="extracted")
        _add_stream(conn, "v3", title="歌回 Vol.3", date="2024-03-01", status="approved")
        conn.close()
        return db_path

    def test_status_shows_counts(self, tmp_path: Path) -> None:
        db_path = self._make_db(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(main, ["status"], catch_exceptions=False)
        assert result.exit_code == 0
        assert "discovered" in result.output
        assert "extracted" in result.output
        assert "approved" in result.output

    def test_status_shows_total(self, tmp_path: Path) -> None:
        db_path = self._make_db(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(main, ["status"], catch_exceptions=False)
        assert result.exit_code == 0
        assert "Total" in result.output

    def test_status_detail_shows_streams(self, tmp_path: Path) -> None:
        db_path = self._make_db(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(main, ["status", "--detail"], catch_exceptions=False)
        assert result.exit_code == 0
        assert "v1" in result.output
        assert "歌回 Vol.1" in result.output
        assert "2024-01-01" in result.output

    def test_status_detail_shows_all_streams(self, tmp_path: Path) -> None:
        db_path = self._make_db(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(main, ["status", "--detail"], catch_exceptions=False)
        assert result.exit_code == 0
        assert "v1" in result.output
        assert "v2" in result.output
        assert "v3" in result.output

    def test_status_empty_cache(self, tmp_path: Path) -> None:
        db_path = tmp_path / "empty.db"
        conn = open_db(db_path)
        conn.close()
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(main, ["status"], catch_exceptions=False)
        assert result.exit_code == 0
        assert "0" in result.output  # all counts are 0


# ===========================================================================
# SECTION 8: CLI cache clear command
# ===========================================================================

class TestCacheClearCLICommand:
    """Test the ``mizukilens cache clear`` command."""

    def _make_db_with_streams(self, tmp_path: Path) -> Path:
        db_path = tmp_path / "cache.db"
        conn = open_db(db_path)
        _add_stream(conn, "v1", title="歌回 Vol.1", date="2024-01-01")
        _add_stream(conn, "v2", title="歌回 Vol.2", date="2024-02-01")
        conn.close()
        return db_path

    def test_cache_clear_all_with_confirm(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear"], input="y\n", catch_exceptions=False
            )
        assert result.exit_code == 0
        # Verify DB is empty
        conn = open_db(db_path)
        assert list_streams(conn) == []
        conn.close()

    def test_cache_clear_all_aborted(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear"], input="n\n", catch_exceptions=False
            )
        assert result.exit_code == 0
        # Data should still be present
        conn = open_db(db_path)
        assert len(list_streams(conn)) == 2
        conn.close()

    def test_cache_clear_stream_with_confirm(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear", "--stream", "v1"],
                input="y\n", catch_exceptions=False,
            )
        assert result.exit_code == 0
        conn = open_db(db_path)
        assert get_stream(conn, "v1") is None
        assert get_stream(conn, "v2") is not None
        conn.close()

    def test_cache_clear_stream_aborted(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear", "--stream", "v1"],
                input="n\n", catch_exceptions=False,
            )
        assert result.exit_code == 0
        conn = open_db(db_path)
        assert get_stream(conn, "v1") is not None  # still there
        conn.close()

    def test_cache_clear_missing_stream_reports_not_found(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear", "--stream", "no_such_id"],
                input="y\n", catch_exceptions=False,
            )
        assert result.exit_code == 0
        assert "存在しません" in result.output or "not" in result.output.lower()

    def test_cache_clear_confirmation_prompt_shown(self, tmp_path: Path) -> None:
        db_path = self._make_db_with_streams(tmp_path)
        runner = CliRunner()
        with patch("mizukilens.cache._resolve_cache_path", return_value=db_path):
            result = runner.invoke(
                main, ["cache", "clear"], input="n\n", catch_exceptions=False
            )
        # A confirmation question should be present in output
        assert "?" in result.output or "confirm" in result.output.lower() or "削除" in result.output
