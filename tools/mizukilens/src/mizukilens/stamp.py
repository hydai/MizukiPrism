"""Flask web app for interactively stamping end timestamps on parsed songs.

Launch via ``mizukilens stamp``.  Reads/writes the SQLite cache only — data
flows through the normal export → import pipeline to reach songs.json.
"""

from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, request


def create_app(db_path: str | Path | None = None) -> Flask:
    """Application factory.

    Args:
        db_path: Override the cache DB path (useful for testing).
    """
    app = Flask(
        __name__,
        template_folder=str(Path(__file__).parent / "stamp_templates"),
        static_folder=str(Path(__file__).parent / "stamp_static"),
        static_url_path="/static",
    )

    # Store db_path in app config so routes can access it.
    app.config["DB_PATH"] = db_path

    def _open():
        from mizukilens.cache import open_db
        return open_db(app.config["DB_PATH"])

    # ------------------------------------------------------------------
    # Page
    # ------------------------------------------------------------------

    @app.route("/")
    def index():
        return app.send_static_file("../stamp_templates/index.html") if False else \
            _render_index()

    def _render_index():
        from flask import render_template
        return render_template("index.html")

    # ------------------------------------------------------------------
    # API: streams
    # ------------------------------------------------------------------

    @app.route("/api/streams")
    def api_streams():
        """List streams in approved/exported/imported status with pending stamp counts."""
        conn = _open()
        try:
            cur = conn.execute(
                "SELECT s.video_id, s.title, s.date, s.status, "
                "  (SELECT COUNT(*) FROM parsed_songs p "
                "   WHERE p.video_id = s.video_id AND p.end_timestamp IS NULL) AS pending "
                "FROM streams s "
                "WHERE s.status IN ('approved', 'exported', 'imported') "
                "ORDER BY s.date DESC, s.video_id"
            )
            rows = cur.fetchall()
            return jsonify([
                {
                    "videoId": r["video_id"],
                    "title": r["title"],
                    "date": r["date"],
                    "status": r["status"],
                    "pending": r["pending"],
                }
                for r in rows
            ])
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # API: songs for a stream
    # ------------------------------------------------------------------

    @app.route("/api/streams/<video_id>/songs")
    def api_stream_songs(video_id: str):
        """Return parsed songs for a stream, sorted by order_index."""
        conn = _open()
        try:
            cur = conn.execute(
                "SELECT id, order_index, song_name, artist, "
                "       start_timestamp, end_timestamp, note, manual_end_ts "
                "FROM parsed_songs WHERE video_id = ? ORDER BY order_index",
                (video_id,),
            )
            rows = cur.fetchall()
            return jsonify([
                {
                    "id": r["id"],
                    "orderIndex": r["order_index"],
                    "songName": r["song_name"],
                    "artist": r["artist"],
                    "startTimestamp": r["start_timestamp"],
                    "endTimestamp": r["end_timestamp"],
                    "note": r["note"],
                    "manualEndTs": bool(r["manual_end_ts"]),
                }
                for r in rows
            ])
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # API: set end timestamp
    # ------------------------------------------------------------------

    @app.route("/api/songs/<int:song_pk>/end-timestamp", methods=["PUT"])
    def api_set_end_timestamp(song_pk: int):
        """Set end_timestamp + manual flag for a parsed song."""
        from mizukilens.cache import update_song_end_timestamp

        data = request.get_json(silent=True)
        if not data or "endTimestamp" not in data:
            return jsonify({"error": "Missing endTimestamp in request body"}), 400

        end_ts = data["endTimestamp"]
        if not isinstance(end_ts, str) or not end_ts.strip():
            return jsonify({"error": "endTimestamp must be a non-empty string"}), 400

        conn = _open()
        try:
            updated = update_song_end_timestamp(
                conn, song_pk, end_ts.strip(), manual=True
            )
            if not updated:
                return jsonify({"error": f"Song {song_pk} not found"}), 404
            return jsonify({"ok": True, "songId": song_pk, "endTimestamp": end_ts.strip()})
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # API: clear end timestamp
    # ------------------------------------------------------------------

    @app.route("/api/songs/<int:song_pk>/end-timestamp", methods=["DELETE"])
    def api_clear_end_timestamp(song_pk: int):
        """Clear end_timestamp + manual flag (undo)."""
        from mizukilens.cache import clear_song_end_timestamp

        conn = _open()
        try:
            updated = clear_song_end_timestamp(conn, song_pk)
            if not updated:
                return jsonify({"error": f"Song {song_pk} not found"}), 404
            return jsonify({"ok": True, "songId": song_pk})
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # API: progress stats
    # ------------------------------------------------------------------

    @app.route("/api/stats")
    def api_stats():
        """Return stamp progress: total / filled / remaining."""
        conn = _open()
        try:
            cur = conn.execute(
                "SELECT COUNT(*) as total, "
                "  SUM(CASE WHEN end_timestamp IS NOT NULL THEN 1 ELSE 0 END) as filled "
                "FROM parsed_songs p "
                "JOIN streams s ON p.video_id = s.video_id "
                "WHERE s.status IN ('approved', 'exported', 'imported')"
            )
            row = cur.fetchone()
            total = row["total"]
            filled = row["filled"]
            return jsonify({
                "total": total,
                "filled": filled,
                "remaining": total - filled,
            })
        finally:
            conn.close()

    return app
