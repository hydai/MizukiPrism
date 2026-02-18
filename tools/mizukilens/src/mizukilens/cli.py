"""Command-line interface for MizukiLens.

Entry point: ``mizukilens`` (defined in pyproject.toml [project.scripts]).
Also runnable as a module: ``python3 -m mizukilens``.
"""

from __future__ import annotations

import click
from rich.console import Console

console = Console()


# ---------------------------------------------------------------------------
# Root group
# ---------------------------------------------------------------------------

@click.group()
@click.version_option(package_name="mizukilens")
def main() -> None:
    """MizukiLens — YouTube livestream archive scraper for MizukiPrism.

    \b
    Workflow:
      1. mizukilens config   — configure your YouTube channel
      2. mizukilens fetch    — discover & scrape livestream archives
      3. mizukilens review   — curate the extracted song timestamps (TUI)
      4. mizukilens export   — export approved data to MizukiPrism JSON
      5. mizukilens import   — import the JSON into MizukiPrism
      6. mizukilens status   — view cache statistics
      7. mizukilens cache    — manage the local cache
    """


# ---------------------------------------------------------------------------
# config  (fully implemented)
# ---------------------------------------------------------------------------

@main.command("config")
def config_cmd() -> None:
    """Configure the target YouTube channel.

    \b
    First run: interactive setup wizard.
    Subsequent runs: show current settings and offer modifications.
    """
    from mizukilens.config import run_config_command
    run_config_command()


# ---------------------------------------------------------------------------
# fetch  (stub)
# ---------------------------------------------------------------------------

@main.command("fetch")
@click.option("--all", "fetch_all", is_flag=True, default=False,
              help="Fetch all livestream archives from the channel.")
@click.option("--recent", "recent", type=int, default=None, metavar="N",
              help="Fetch the most recent N livestream archives.")
@click.option("--after", "after", type=str, default=None, metavar="YYYY-MM-DD",
              help="Fetch archives published after this date.")
@click.option("--before", "before", type=str, default=None, metavar="YYYY-MM-DD",
              help="Fetch archives published before this date.")
@click.option("--force", is_flag=True, default=False,
              help="Ignore cache state and reprocess all matching archives.")
def fetch_cmd(fetch_all: bool, recent: int | None, after: str | None,
              before: str | None, force: bool) -> None:
    """Discover and scrape YouTube livestream archives. (not yet implemented)"""
    console.print("[yellow]fetch コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-003 で実装予定です。")


# ---------------------------------------------------------------------------
# review  (stub)
# ---------------------------------------------------------------------------

@main.command("review")
def review_cmd() -> None:
    """Launch the TUI curation interface. (not yet implemented)"""
    console.print("[yellow]review コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-005 で実装予定です。")


# ---------------------------------------------------------------------------
# export  (stub)
# ---------------------------------------------------------------------------

@main.command("export")
@click.option("--since", "since", type=str, default=None, metavar="YYYY-MM-DD",
              help="Only export streams approved after this date.")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Only export the specified stream.")
def export_cmd(since: str | None, stream_id: str | None) -> None:
    """Export approved data to MizukiPrism JSON format. (not yet implemented)"""
    console.print("[yellow]export コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-006 で実装予定です。")


# ---------------------------------------------------------------------------
# import  (stub)
# ---------------------------------------------------------------------------

@main.command("import")
@click.argument("file", type=click.Path(exists=True, dir_okay=False), required=False)
def import_cmd(file: str | None) -> None:
    """Import exported JSON into MizukiPrism. (not yet implemented)"""
    console.print("[yellow]import コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-007 で実装予定です。")


# ---------------------------------------------------------------------------
# status  (implemented)
# ---------------------------------------------------------------------------

@main.command("status")
@click.option("--detail", is_flag=True, default=False,
              help="List all streams and their individual statuses.")
def status_cmd(detail: bool) -> None:
    """Show cache statistics and stream status summary."""
    from mizukilens.cache import open_db, get_status_counts, list_streams
    from rich.table import Table
    from rich import box

    conn = open_db()
    try:
        counts = get_status_counts(conn)
        total = sum(counts.values())

        # Summary statistics table
        tbl = Table(
            title="MizukiLens — キャッシュ統計 (Cache Statistics)",
            box=box.ROUNDED,
            show_header=True,
            header_style="bold cyan",
        )
        tbl.add_column("Status", style="bold")
        tbl.add_column("Count", justify="right")

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
            cnt = counts.get(status, 0)
            tbl.add_row(label, str(cnt))

        tbl.add_section()
        tbl.add_row("[bold]Total[/bold]", f"[bold]{total}[/bold]")
        console.print(tbl)

        if detail:
            streams = list_streams(conn)
            if not streams:
                console.print("\n[dim]キャッシュにデータがありません。[/dim]")
                return

            detail_tbl = Table(
                title="Stream Detail",
                box=box.SIMPLE,
                show_header=True,
                header_style="bold",
            )
            detail_tbl.add_column("Video ID", style="cyan", no_wrap=True)
            detail_tbl.add_column("Title")
            detail_tbl.add_column("Date", no_wrap=True)
            detail_tbl.add_column("Status", no_wrap=True)

            for row in streams:
                status_val = row["status"] or ""
                label = status_labels.get(status_val, status_val)
                detail_tbl.add_row(
                    row["video_id"] or "",
                    row["title"] or "",
                    row["date"] or "",
                    label,
                )
            console.print(detail_tbl)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# cache  (implemented)
# ---------------------------------------------------------------------------

@main.group("cache")
def cache_group() -> None:
    """Manage the local SQLite cache."""


@cache_group.command("clear")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Clear cache for a specific stream only.")
def cache_clear_cmd(stream_id: str | None) -> None:
    """Clear all cached data (or a single stream's cache)."""
    from mizukilens.cache import open_db, clear_all, clear_stream

    conn = open_db()
    try:
        if stream_id:
            # Confirm before deleting a specific stream
            confirmed = click.confirm(
                f"ストリーム {stream_id!r} のキャッシュを削除しますか？ (Delete cache for stream {stream_id!r}?)",
                default=False,
            )
            if not confirmed:
                console.print("[dim]キャンセルしました。[/dim]")
                return
            deleted = clear_stream(conn, stream_id)
            if deleted:
                console.print(f"[green]ストリーム {stream_id!r} のキャッシュを削除しました。[/green]")
            else:
                console.print(f"[yellow]ストリーム {stream_id!r} はキャッシュに存在しません。[/yellow]")
        else:
            # Confirm before clearing all cache
            confirmed = click.confirm(
                "すべてのキャッシュデータを削除しますか？ (Clear ALL cache data?)",
                default=False,
            )
            if not confirmed:
                console.print("[dim]キャンセルしました。[/dim]")
                return
            count = clear_all(conn)
            console.print(f"[green]キャッシュを削除しました。{count} 件のストリームを削除しました。[/green]")
    finally:
        conn.close()
