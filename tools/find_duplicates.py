#!/usr/bin/env python3
"""Analyze songs.json for naming inconsistencies.

Outputs:
  DEDUP_REPORT.md          — Human-readable report of all duplicate groups
  tools/dedup_decisions.json — Machine-readable decisions for apply_standardization.py

Usage:
  python3 tools/find_duplicates.py
"""

import json
import re
import unicodedata
from collections import defaultdict
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SONGS_FILE = REPO / "data" / "songs.json"
REPORT_FILE = REPO / "DEDUP_REPORT.md"
DECISIONS_FILE = REPO / "tools" / "dedup_decisions.json"

FUZZY_THRESHOLD = 0.80
MIN_FUZZY_LEN = 4


# ── Normalization ─────────────────────────────────────────────────


def norm_title(t: str) -> str:
    """Normalize title for exact matching: NFKC, lowercase, collapse whitespace."""
    t = unicodedata.normalize("NFKC", t)
    # Normalize curly quotes/apostrophes to ASCII
    t = t.replace("\u2018", "'").replace("\u2019", "'")
    t = t.replace("\u201c", '"').replace("\u201d", '"')
    t = t.lower().strip()
    return re.sub(r"\s+", " ", t)


def norm_title_stripped(t: str) -> str:
    """Remove all non-word chars for aggressive comparison."""
    return re.sub(r"[^\w]", "", norm_title(t), flags=re.UNICODE)


def norm_artist(a: str) -> str:
    """Normalize artist: strip annotations, normalize separators, lowercase."""
    if not a or not a.strip():
        return ""
    a = unicodedata.normalize("NFKC", a).strip()
    # Remove "(with ...)" and trailing "with ..."
    a = re.sub(r"\s*\(with\s+[^)]*\)", "", a, flags=re.I)
    a = re.sub(r"\s+with\s+\S.*$", "", a, flags=re.I)
    # Remove feat./ft./featuring and everything after
    a = re.sub(r"\s*(feat\.?|ft\.?|featuring)\s+.*$", "", a, flags=re.I)
    # Remove parenthetical annotations like (CV:...), (IA)
    a = re.sub(r"\s*\([^)]*\)", "", a)
    # Normalize separators: & × to comma
    a = re.sub(r"\s*[&×]\s*", ", ", a)
    # Hyphen between non-space chars → separator (handles "A-B-C" style)
    a = re.sub(r"(?<=\S)-(?=\S)", ", ", a)
    a = a.lower().strip()
    return re.sub(r"\s+", " ", a)


# ── Helpers ───────────────────────────────────────────────────────


def _cleanliness(s: str) -> float:
    """Score string cleanliness (higher = better). Used for tie-breaking."""
    score = 0.0
    # Penalize double spaces
    if "  " not in s:
        score += 100
    # Penalize very long strings (annotation-heavy)
    score -= len(s) * 0.1
    # Prefer strings that don't start lowercase (favor Title Case)
    if s and not s[0].islower():
        score += 10
    return score


_global_freq: dict[str, dict[str, int]] = {"title": {}, "originalArtist": {}}


def build_global_freq(songs: list) -> None:
    """Build global frequency tables for tie-breaking in pick_canonical."""
    for key in ("title", "originalArtist"):
        counts: dict[str, int] = {}
        for s in songs:
            v = s[key].strip()
            counts[v] = counts.get(v, 0) + 1
        _global_freq[key] = counts


def pick_canonical(entries: list, key: str) -> str:
    """Pick the best canonical value: most frequent, then most performances, then cleanest."""
    votes: dict[str, list[int]] = {}
    for e in entries:
        v = e[key].strip() if isinstance(e.get(key), str) else e.get(key, "")
        if not v:
            continue
        if v not in votes:
            votes[v] = [0, 0]
        votes[v][0] += 1
        perfs = e.get("performances", [])
        votes[v][1] += len(perfs) if isinstance(perfs, list) else perfs
    if not votes:
        return entries[0].get(key, "")
    freq_key = key if key in _global_freq else "originalArtist"
    gf = _global_freq.get(freq_key, {})
    return max(
        votes,
        key=lambda v: (votes[v][0], votes[v][1], gf.get(v, 0), _cleanliness(v)),
    )


def song_info(s: dict) -> dict:
    return {
        "id": s["id"],
        "title": s["title"],
        "artist": s["originalArtist"],
        "performances": len(s["performances"]),
    }


# ── Artist Similarity ─────────────────────────────────────────────


def _artists_similar(a: str, b: str) -> bool:
    """Check if two normalized artist strings refer to the same artist."""
    if a == b:
        return True
    if not a or not b:
        return False
    # Check if shorter is a prefix of longer (up to a separator)
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    if longer.startswith(shorter) and (
        len(longer) == len(shorter) or longer[len(shorter)] in ", "
    ):
        return True
    return SequenceMatcher(None, a, b).ratio() > 0.75


def _merge_artist_clusters(by_artist: dict) -> list[list]:
    """Merge artist sub-groups whose normalized names are similar (union-find)."""
    keys = list(by_artist.keys())
    if len(keys) <= 1:
        return [songs for songs in by_artist.values()]

    parent = {k: k for k in keys}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            if _artists_similar(keys[i], keys[j]):
                union(keys[i], keys[j])

    clusters: dict[str, list] = defaultdict(list)
    for k in keys:
        clusters[find(k)].extend(by_artist[k])
    return list(clusters.values())


# ── Analysis ──────────────────────────────────────────────────────


def analyze(songs: list) -> tuple[list, list, list]:
    # Phase 1: Group by exact normalized title
    by_title: dict[str, list] = defaultdict(list)
    for s in songs:
        by_title[norm_title(s["title"])].append(s)

    cat_a: list[dict] = []
    cat_c: list[dict] = []
    a_counter = 0
    c_counter = 0
    a_song_ids: set[str] = set()

    for nt in sorted(by_title):
        group = by_title[nt]
        if len(group) < 2:
            continue

        # Sub-group by normalized artist
        by_artist: dict[str, list] = defaultdict(list)
        for s in group:
            by_artist[norm_artist(s["originalArtist"])].append(s)

        # Merge similar artist sub-groups
        merged_clusters = _merge_artist_clusters(by_artist)

        # Clusters with 2+ entries → Category A
        for cluster in merged_clusters:
            if len(cluster) >= 2:
                a_counter += 1
                cat_a.append(
                    {
                        "group_id": f"A-{a_counter:04d}",
                        "category": "A",
                        "canonical_title": pick_canonical(cluster, "title"),
                        "canonical_artist": pick_canonical(cluster, "originalArtist"),
                        "decision": "accept",
                        "songs": [song_info(s) for s in cluster],
                    }
                )
                for s in cluster:
                    a_song_ids.add(s["id"])

        # Multiple distinct clusters → Category C (informational)
        if len(merged_clusters) >= 2:
            c_counter += 1
            cat_c.append(
                {
                    "group_id": f"C-{c_counter:04d}",
                    "category": "C",
                    "title_example": pick_canonical(group, "title"),
                    "sub_groups": [
                        {
                            "artist": pick_canonical(c, "originalArtist"),
                            "songs": [song_info(s) for s in c],
                        }
                        for c in merged_clusters
                    ],
                }
            )

    # Phase 2: Fuzzy title matching (Category B)
    cat_b = _find_fuzzy(songs, a_song_ids)

    return cat_a, cat_b, cat_c


def _find_fuzzy(songs: list, already_grouped: set) -> list[dict]:
    """Find fuzzy title matches within the same normalized artist.

    Uses union-find to merge overlapping fuzzy pairs into single groups.
    """
    # Group by normalized artist → {norm_artist: {norm_title: [songs]}}
    by_artist: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for s in songs:
        na = norm_artist(s["originalArtist"])
        nt = norm_title(s["title"])
        by_artist[na][nt].append(s)

    # Collect all fuzzy edges (pairs of matching titles within an artist)
    # Key: (artist, title), edges connect fuzzy-matching titles
    edges: list[tuple[str, str, str, float, str]] = []  # (na, t1, t2, sim, subcat)

    for na, title_map in by_artist.items():
        if not na:
            continue
        titles = list(title_map.keys())
        if len(titles) > 500:
            continue

        for i in range(len(titles)):
            for j in range(i + 1, len(titles)):
                t1, t2 = titles[i], titles[j]
                if len(t1) < MIN_FUZZY_LEN or len(t2) < MIN_FUZZY_LEN:
                    continue

                s1 = norm_title_stripped(t1)
                s2 = norm_title_stripped(t2)
                is_stripped_match = s1 == s2 and s1 != ""

                if is_stripped_match:
                    sim = 1.0
                else:
                    sim = SequenceMatcher(None, t1, t2).ratio()
                    if sim < FUZZY_THRESHOLD:
                        continue

                subcat = "B1" if is_stripped_match else "B2"
                edges.append((na, t1, t2, sim, subcat))

    # Union-find to merge connected titles within each artist
    parent: dict[tuple[str, str], tuple[str, str]] = {}

    def find(x: tuple[str, str]) -> tuple[str, str]:
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: tuple[str, str], b: tuple[str, str]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    min_sim: dict[tuple[str, str], float] = {}  # track min similarity per group
    subcats: dict[tuple[str, str], set] = {}  # track subcategories per group

    for na, t1, t2, sim, subcat in edges:
        k1, k2 = (na, t1), (na, t2)
        union(k1, k2)
        # Track metadata by root (updated after union-find settles)

    # Build groups from union-find
    groups: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    all_keys: set[tuple[str, str]] = set()
    for na, t1, t2, _, _ in edges:
        all_keys.add((na, t1))
        all_keys.add((na, t2))
    for k in all_keys:
        groups[find(k)].append(k)

    # Deduplicate members within each group
    deduped_groups: dict[tuple[str, str], list[tuple[str, str]]] = {}
    for root, members in groups.items():
        deduped_groups[root] = list(dict.fromkeys(members))

    # Collect edge metadata per group
    for na, t1, t2, sim, subcat in edges:
        root = find((na, t1))
        min_sim.setdefault(root, 1.0)
        min_sim[root] = min(min_sim[root], sim)
        subcats.setdefault(root, set())
        subcats[root].add(subcat)

    # Build Category B output
    cat_b: list[dict] = []
    counter = 0

    for root, members in sorted(deduped_groups.items()):
        na = root[0]
        combined = []
        for _, nt in members:
            combined.extend(by_artist[na][nt])

        # Skip if every song is already in a Category A group
        if all(s["id"] in already_grouped for s in combined):
            continue

        counter += 1
        group_subcats = subcats.get(root, set())
        subcat = "B1" if group_subcats == {"B1"} else "B2"
        sim = min_sim.get(root, 1.0)

        cat_b.append(
            {
                "group_id": f"B-{counter:04d}",
                "category": "B",
                "subcategory": subcat,
                "similarity": round(sim, 3),
                "canonical_title": pick_canonical(combined, "title"),
                "canonical_artist": pick_canonical(combined, "originalArtist"),
                "decision": "skip",
                "songs": [song_info(s) for s in combined],
            }
        )

    return cat_b


# ── Report Generation ─────────────────────────────────────────────


def write_report(songs: list, cat_a: list, cat_b: list, cat_c: list) -> None:
    total_perfs = sum(len(s["performances"]) for s in songs)
    a_songs = sum(len(g["songs"]) for g in cat_a)
    b_songs = sum(len(g["songs"]) for g in cat_b)
    c_songs = sum(
        sum(len(sg["songs"]) for sg in g["sub_groups"]) for g in cat_c
    )

    lines = [
        "# Song Name Standardization Report",
        "",
        f"Generated: {date.today().isoformat()}",
        f"Total songs: {len(songs):,} | Total performances: {total_perfs:,}",
        "",
        "## Summary",
        "",
        f"| Category | Groups | Songs | Default |",
        f"|----------|--------|-------|---------|",
        f"| A: Exact title + same artist | {len(cat_a)} | {a_songs} | accept |",
        f"| B: Fuzzy title match | {len(cat_b)} | {b_songs} | skip (review) |",
        f"| C: Same title, different artists | {len(cat_c)} | {c_songs} | informational |",
        "",
        "## How to use this report",
        "",
        "1. Review groups below. Each has a **suggested canonical** title + artist.",
        "2. Edit `tools/dedup_decisions.json` to change decisions:",
        '   - `"accept"` → apply the canonical name to all songs in the group',
        '   - `"skip"` → leave unchanged',
        '   - `"override"` → set custom `canonical_title` / `canonical_artist`',
        "3. Run `python3 tools/apply_standardization.py --dry-run` to preview.",
        "4. Run `python3 tools/apply_standardization.py` to apply.",
        "",
        "---",
        "",
    ]

    # ── Category A ──
    lines += [
        f"## Category A: Exact Title + Same Artist ({len(cat_a)} groups, {a_songs} songs)",
        "",
        "Same title (case-insensitive) and same/similar artist after normalization.",
        "**Default: accept** — standardize to canonical name.",
        "",
    ]
    for g in cat_a:
        total_p = sum(s["performances"] for s in g["songs"])
        lines.append(
            f'### {g["group_id"]}: "{g["canonical_title"]}"'
            f" ({len(g['songs'])} entries, {total_p} perfs)"
        )
        lines.append(
            f'**Canonical**: "{g["canonical_title"]}" by {g["canonical_artist"]}'
        )
        lines.append("")
        lines.append("| Song ID | Current Title | Current Artist | Perfs |")
        lines.append("|---------|--------------|----------------|-------|")
        for s in sorted(g["songs"], key=lambda x: -x["performances"]):
            lines.append(
                f"| {s['id']} | {s['title']} | {s['artist']} | {s['performances']} |"
            )
        lines.append("")

    # ── Category B ──
    lines += [
        "---",
        "",
        f"## Category B: Fuzzy Title Matches ({len(cat_b)} groups, {b_songs} songs)",
        "",
        "Similar but not identical titles within the same artist.",
        "B1 = punctuation/spacing difference, B2 = possible typo.",
        '**Default: skip** — change to `"accept"` if they are the same song.',
        "",
    ]
    for g in cat_b:
        total_p = sum(s["performances"] for s in g["songs"])
        sub = g.get("subcategory", "")
        sim = g.get("similarity", 0)
        lines.append(
            f'### {g["group_id"]} [{sub}] (sim={sim}):'
            f' "{g["canonical_title"]}"'
            f" ({len(g['songs'])} entries, {total_p} perfs)"
        )
        lines.append(
            f'**Suggested**: "{g["canonical_title"]}" by {g["canonical_artist"]}'
        )
        lines.append("")
        lines.append("| Song ID | Current Title | Current Artist | Perfs |")
        lines.append("|---------|--------------|----------------|-------|")
        for s in sorted(g["songs"], key=lambda x: -x["performances"]):
            lines.append(
                f"| {s['id']} | {s['title']} | {s['artist']} | {s['performances']} |"
            )
        lines.append("")

    # ── Category C ──
    lines += [
        "---",
        "",
        f"## Category C: Same Title, Different Artists ({len(cat_c)} groups, informational)",
        "",
        "These titles appear with multiple distinct artists (covers, different attributions).",
        "Listed for reference. To standardize any, add groups to `dedup_decisions.json`.",
        "",
    ]
    for g in cat_c:
        total = sum(len(sg["songs"]) for sg in g["sub_groups"])
        lines.append(
            f'### {g["group_id"]}: "{g["title_example"]}"'
            f" ({total} entries, {len(g['sub_groups'])} artist variants)"
        )
        for sg in g["sub_groups"]:
            ids = ", ".join(s["id"] for s in sg["songs"])
            perfs = sum(s["performances"] for s in sg["songs"])
            lines.append(f'- **{sg["artist"]}**: {ids} ({perfs} perfs)')
        lines.append("")

    REPORT_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"Report written to {REPORT_FILE}")


def write_decisions(cat_a: list, cat_b: list) -> None:
    decisions = cat_a + cat_b
    DECISIONS_FILE.write_text(
        json.dumps(decisions, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Decisions written to {DECISIONS_FILE} ({len(decisions)} groups)")


# ── Main ──────────────────────────────────────────────────────────


def main():
    songs = json.loads(SONGS_FILE.read_text(encoding="utf-8"))
    print(f"Loaded {len(songs)} songs")

    build_global_freq(songs)
    cat_a, cat_b, cat_c = analyze(songs)

    a_songs = sum(len(g["songs"]) for g in cat_a)
    b_songs = sum(len(g["songs"]) for g in cat_b)
    print(f"Category A: {len(cat_a)} groups ({a_songs} songs)")
    print(f"Category B: {len(cat_b)} groups ({b_songs} songs)")
    print(f"Category C: {len(cat_c)} groups (informational)")

    write_report(songs, cat_a, cat_b, cat_c)
    write_decisions(cat_a, cat_b)


if __name__ == "__main__":
    main()
