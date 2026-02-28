#!/usr/bin/env python3
"""Apply naming standardization decisions to songs.json.

Reads tools/dedup_decisions.json and updates song titles and artists
in data/songs.json.  No songs are deleted; only title and originalArtist
fields are updated.

Usage:
  python3 tools/apply_standardization.py --dry-run   # preview changes
  python3 tools/apply_standardization.py              # apply changes
"""

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SONGS_FILE = REPO / "data" / "songs.json"
DECISIONS_FILE = REPO / "tools" / "dedup_decisions.json"


def main():
    dry_run = "--dry-run" in sys.argv

    songs = json.loads(SONGS_FILE.read_text(encoding="utf-8"))
    decisions = json.loads(DECISIONS_FILE.read_text(encoding="utf-8"))

    song_map = {s["id"]: s for s in songs}
    changes = 0
    skipped = 0
    accepted = 0

    for group in decisions:
        decision = group.get("decision", "skip")
        if decision not in ("accept", "override"):
            skipped += 1
            continue

        accepted += 1
        canon_title = group["canonical_title"]
        canon_artist = group["canonical_artist"]

        for entry in group["songs"]:
            sid = entry["id"]
            if sid not in song_map:
                print(f"  WARNING: {sid} not found in songs.json, skipping")
                continue

            song = song_map[sid]
            title_changed = song["title"] != canon_title
            artist_changed = song["originalArtist"] != canon_artist

            if title_changed or artist_changed:
                changes += 1
                if dry_run:
                    parts = []
                    if title_changed:
                        parts.append(
                            f'title: "{song["title"]}" → "{canon_title}"'
                        )
                    if artist_changed:
                        parts.append(
                            f'artist: "{song["originalArtist"]}" → "{canon_artist}"'
                        )
                    print(f"  {sid}: {' | '.join(parts)}")
                else:
                    song["title"] = canon_title
                    song["originalArtist"] = canon_artist

    print()
    print(f"Groups accepted: {accepted} | Groups skipped: {skipped}")

    if dry_run:
        print(f"Dry run: {changes} songs would be updated")
        print(f"Song count unchanged: {len(songs)}")
    else:
        SONGS_FILE.write_text(
            json.dumps(songs, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Updated {changes} songs in {SONGS_FILE}")
        print(f"Song count unchanged: {len(songs)}")


if __name__ == "__main__":
    main()
