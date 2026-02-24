"""Batch review operations for MizukiLens.

Non-interactive CLI commands for batch review: report, approve, exclude,
and emoji cleanup of parsed song data. Used alongside the interactive TUI
for efficient curation at scale.
"""

from __future__ import annotations

import re
import sqlite3

from rich import box
from rich.console import Console
from rich.table import Table

from mizukilens.cache import (
    get_parsed_songs,
    list_streams,
    update_stream_status,
    upsert_parsed_songs,
)

console = Console()

# ---------------------------------------------------------------------------
# Stream categorization
# ---------------------------------------------------------------------------

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Karaoke": ["歌枠", "Karaoke", "うたわく", "歌回", "Acoustic", "合唱", "MINI LIVE"],
    "ASMR": ["ASMR"],
    "Game": ["Game", "ゲーム"],
    "FreeTalk": ["雜談", "Free Talk", "棉花糖"],
    "3D/Dance": ["3D", "跳舞", "練舞"],
}


def categorize_stream(title: str) -> str:
    """Classify a stream by its title keywords.

    Returns one of: "Karaoke", "ASMR", "Game", "FreeTalk", "3D/Dance", "Other".
    First match wins (categories are checked in definition order).
    """
    title_lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in title_lower:
                return category
    return "Other"


# ---------------------------------------------------------------------------
# Emoji / emote artifact patterns
# ---------------------------------------------------------------------------

# Matches patterns like ✰:_MIZUKIMilk:, ✩:_SomeThing:, ✰□, etc.
_EMOJI_PATTERNS = [
    re.compile(r"[✰✩☆★]:_[^:]+:"),  # emote codes like ✰:_MIZUKIMilk:
    re.compile(r"[✰✩☆★][□■]"),       # star + box artifacts
    re.compile(r":_[A-Za-z0-9_]+:"),  # bare emote codes :_SomeThing:
]


def _clean_artist_field(artist: str) -> str:
    """Remove emoji/emote artifacts from an artist string."""
    cleaned = artist
    for pat in _EMOJI_PATTERNS:
        cleaned = pat.sub("", cleaned)
    # Collapse multiple spaces and strip
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned


def _has_emoji_artifacts(artist: str) -> bool:
    """Return True if the artist field contains emoji/emote artifacts."""
    return any(pat.search(artist) for pat in _EMOJI_PATTERNS)


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def generate_report(conn: sqlite3.Connection, *, detail: bool = False) -> None:
    """Print a batch review analysis report.

    Shows stream counts by status, category breakdown for extracted streams,
    data quality metrics, and actionable recommendations.
    """
    from mizukilens.cache import get_status_counts

    counts = get_status_counts(conn)
    total = sum(counts.values())

    # --- Status summary ---
    status_tbl = Table(
        title="批次審核報告 — 場次狀態統計",
        box=box.ROUNDED,
        header_style="bold cyan",
    )
    status_tbl.add_column("Status", style="bold")
    status_tbl.add_column("Count", justify="right")

    status_labels = {
        "discovered": "[blue]discovered[/blue]",
        "extracted":  "[cyan]extracted[/cyan]",
        "pending":    "[yellow]pending[/yellow]",
        "approved":   "[green]approved[/green]",
        "exported":   "[magenta]exported[/magenta]",
        "imported":   "[bright_green]imported[/bright_green]",
        "excluded":   "[red]excluded[/red]",
    }
    for status, label in status_labels.items():
        status_tbl.add_row(label, str(counts.get(status, 0)))
    status_tbl.add_section()
    status_tbl.add_row("[bold]Total[/bold]", f"[bold]{total}[/bold]")
    console.print(status_tbl)

    # --- Category breakdown for extracted streams ---
    extracted = list_streams(conn, status="extracted")
    if not extracted:
        console.print("\n[dim]No extracted streams to analyze.[/dim]")
        return

    cat_counts: dict[str, int] = {}
    cat_songs: dict[str, int] = {}
    cat_streams: dict[str, list[sqlite3.Row]] = {}
    total_songs = 0
    songs_with_artist = 0
    songs_with_emoji = 0

    for stream in extracted:
        cat = categorize_stream(stream["title"] or "")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        if cat not in cat_streams:
            cat_streams[cat] = []
        cat_streams[cat].append(stream)

        songs = get_parsed_songs(conn, stream["video_id"])
        song_count = len(songs)
        cat_songs[cat] = cat_songs.get(cat, 0) + song_count
        total_songs += song_count

        for song in songs:
            artist = song["artist"] or ""
            if artist.strip():
                songs_with_artist += 1
            if _has_emoji_artifacts(artist):
                songs_with_emoji += 1

    console.print()
    cat_tbl = Table(
        title="場次分類 (Extracted Only)",
        box=box.ROUNDED,
        header_style="bold cyan",
    )
    cat_tbl.add_column("Category", style="bold")
    cat_tbl.add_column("Streams", justify="right")
    cat_tbl.add_column("Songs", justify="right")

    for cat in [*CATEGORY_KEYWORDS.keys(), "Other"]:
        if cat in cat_counts:
            cat_tbl.add_row(cat, str(cat_counts[cat]), str(cat_songs.get(cat, 0)))
    cat_tbl.add_section()
    cat_tbl.add_row("[bold]Total[/bold]", f"[bold]{len(extracted)}[/bold]", f"[bold]{total_songs}[/bold]")
    console.print(cat_tbl)

    # --- Data quality ---
    console.print()
    pct_artist = (songs_with_artist / total_songs * 100) if total_songs else 0
    console.print(f"[bold]資料品質:[/bold]")
    console.print(f"  歌曲含原唱者: {songs_with_artist}/{total_songs} ({pct_artist:.0f}%)")
    console.print(f"  emoji 雜訊: {songs_with_emoji} songs")

    # --- Recommendations ---
    console.print()
    console.print("[bold]建議操作:[/bold]")
    karaoke_count = cat_counts.get("Karaoke", 0)
    non_karaoke = len(extracted) - karaoke_count
    if karaoke_count:
        console.print(f"  1. review approve --karaoke  → 批次核准 {karaoke_count} 場歌回")
    if non_karaoke:
        console.print(f"  2. review exclude --non-karaoke  → 批次排除 {non_karaoke} 場非歌回")
    if songs_with_emoji:
        console.print(f"  3. review clean  → 清理 {songs_with_emoji} 筆 emoji 雜訊")

    # --- Detail view ---
    if detail:
        console.print()
        detail_tbl = Table(
            title="場次明細 (Extracted Streams)",
            box=box.SIMPLE,
            header_style="bold",
        )
        detail_tbl.add_column("Video ID", style="cyan", no_wrap=True)
        detail_tbl.add_column("Title")
        detail_tbl.add_column("Date", no_wrap=True)
        detail_tbl.add_column("Category")
        detail_tbl.add_column("Songs", justify="right")
        detail_tbl.add_column("Quality", justify="right")

        for stream in extracted:
            cat = categorize_stream(stream["title"] or "")
            songs = get_parsed_songs(conn, stream["video_id"])
            song_count = len(songs)
            with_artist = sum(1 for s in songs if (s["artist"] or "").strip())
            quality = f"{with_artist}/{song_count}" if song_count else "—"
            detail_tbl.add_row(
                stream["video_id"],
                (stream["title"] or "")[:50],
                stream["date"] or "",
                cat,
                str(song_count),
                quality,
            )

        console.print(detail_tbl)


# ---------------------------------------------------------------------------
# Batch approve
# ---------------------------------------------------------------------------

def batch_approve(
    conn: sqlite3.Connection,
    *,
    karaoke: bool = False,
    category: str | None = None,
    video_id: str | None = None,
    min_songs: int = 0,
    dry_run: bool = False,
    yes: bool = False,
) -> int:
    """Batch-approve extracted streams matching the given filters.

    Returns the number of streams approved (or that would be approved in dry-run).
    """
    extracted = list_streams(conn, status="extracted")
    targets: list[sqlite3.Row] = []

    for stream in extracted:
        if video_id and stream["video_id"] != video_id:
            continue

        title = stream["title"] or ""
        cat = categorize_stream(title)

        if karaoke and cat != "Karaoke":
            continue
        if category and cat != category:
            continue

        if min_songs > 0:
            songs = get_parsed_songs(conn, stream["video_id"])
            if len(songs) < min_songs:
                continue

        targets.append(stream)

    if not targets:
        console.print("[dim]No matching streams to approve.[/dim]")
        return 0

    # Show what will be affected
    tbl = Table(box=box.SIMPLE, header_style="bold")
    tbl.add_column("Video ID", style="cyan")
    tbl.add_column("Title")
    tbl.add_column("Date")
    tbl.add_column("Category")
    for s in targets:
        tbl.add_row(
            s["video_id"],
            (s["title"] or "")[:50],
            s["date"] or "",
            categorize_stream(s["title"] or ""),
        )
    console.print(tbl)
    console.print(f"\n[bold]{len(targets)}[/bold] streams will be approved.")

    if dry_run:
        console.print("[yellow]Dry run — no changes made.[/yellow]")
        return len(targets)

    if not yes:
        if not _confirm("Proceed?"):
            console.print("[dim]Cancelled.[/dim]")
            return 0

    count = 0
    for s in targets:
        update_stream_status(conn, s["video_id"], "approved")
        count += 1

    console.print(f"[green]Approved {count} streams.[/green]")
    return count


# ---------------------------------------------------------------------------
# Batch exclude
# ---------------------------------------------------------------------------

def batch_exclude(
    conn: sqlite3.Connection,
    *,
    non_karaoke: bool = False,
    category: str | None = None,
    video_id: str | None = None,
    no_songs: bool = False,
    dry_run: bool = False,
    yes: bool = False,
) -> int:
    """Batch-exclude extracted streams matching the given filters.

    Returns the number of streams excluded (or that would be excluded in dry-run).
    """
    extracted = list_streams(conn, status="extracted")
    targets: list[sqlite3.Row] = []

    for stream in extracted:
        if video_id and stream["video_id"] != video_id:
            continue

        title = stream["title"] or ""
        cat = categorize_stream(title)

        if non_karaoke and cat == "Karaoke":
            continue
        if category and cat != category:
            continue

        if no_songs:
            songs = get_parsed_songs(conn, stream["video_id"])
            if len(songs) > 0:
                continue

        targets.append(stream)

    if not targets:
        console.print("[dim]No matching streams to exclude.[/dim]")
        return 0

    tbl = Table(box=box.SIMPLE, header_style="bold")
    tbl.add_column("Video ID", style="cyan")
    tbl.add_column("Title")
    tbl.add_column("Date")
    tbl.add_column("Category")
    for s in targets:
        tbl.add_row(
            s["video_id"],
            (s["title"] or "")[:50],
            s["date"] or "",
            categorize_stream(s["title"] or ""),
        )
    console.print(tbl)
    console.print(f"\n[bold]{len(targets)}[/bold] streams will be excluded.")

    if dry_run:
        console.print("[yellow]Dry run — no changes made.[/yellow]")
        return len(targets)

    if not yes:
        if not _confirm("Proceed?"):
            console.print("[dim]Cancelled.[/dim]")
            return 0

    count = 0
    for s in targets:
        update_stream_status(conn, s["video_id"], "excluded")
        count += 1

    console.print(f"[red]Excluded {count} streams.[/red]")
    return count


# ---------------------------------------------------------------------------
# Clean emoji artifacts
# ---------------------------------------------------------------------------

def clean_parsed_songs(
    conn: sqlite3.Connection,
    *,
    dry_run: bool = False,
) -> int:
    """Strip emoji/emote artifacts from artist fields across all streams.

    Returns the count of songs cleaned (or that would be cleaned in dry-run).
    """
    all_streams = list_streams(conn)
    cleaned_total = 0

    for stream in all_streams:
        songs = get_parsed_songs(conn, stream["video_id"])
        if not songs:
            continue

        dirty = []
        for song in songs:
            artist = song["artist"] or ""
            if _has_emoji_artifacts(artist):
                dirty.append(song)

        if not dirty:
            continue

        if dry_run:
            for song in dirty:
                original = song["artist"] or ""
                cleaned = _clean_artist_field(original)
                console.print(
                    f"  [cyan]{stream['video_id']}[/cyan] #{song['order_index']}: "
                    f"[red]{original!r}[/red] → [green]{cleaned!r}[/green]"
                )
            cleaned_total += len(dirty)
            continue

        # Rebuild the full song list with cleaned artists
        updated_songs = []
        for song in songs:
            artist = song["artist"] or ""
            if _has_emoji_artifacts(artist):
                artist = _clean_artist_field(artist)
                cleaned_total += 1
            updated_songs.append({
                "order_index": song["order_index"],
                "song_name": song["song_name"],
                "artist": artist if artist else None,
                "start_timestamp": song["start_timestamp"],
                "end_timestamp": song["end_timestamp"],
                "note": song["note"],
            })

        upsert_parsed_songs(conn, stream["video_id"], updated_songs)

    if dry_run:
        console.print(f"\n[yellow]Dry run — {cleaned_total} songs would be cleaned.[/yellow]")
    else:
        console.print(f"[green]Cleaned {cleaned_total} songs.[/green]")

    return cleaned_total


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _confirm(message: str) -> bool:
    """Prompt the user for yes/no confirmation."""
    import click
    return click.confirm(message)
