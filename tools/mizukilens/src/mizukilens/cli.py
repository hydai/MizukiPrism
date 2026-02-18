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
# status  (stub)
# ---------------------------------------------------------------------------

@main.command("status")
@click.option("--detail", is_flag=True, default=False,
              help="List all streams and their individual statuses.")
def status_cmd(detail: bool) -> None:
    """Show cache statistics and stream status summary. (not yet implemented)"""
    console.print("[yellow]status コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-002 で実装予定です。")


# ---------------------------------------------------------------------------
# cache  (stub)
# ---------------------------------------------------------------------------

@main.group("cache")
def cache_group() -> None:
    """Manage the local SQLite cache. (not yet implemented)"""


@cache_group.command("clear")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Clear cache for a specific stream only.")
def cache_clear_cmd(stream_id: str | None) -> None:
    """Clear all cached data (or a single stream's cache). (not yet implemented)"""
    console.print("[yellow]cache clear コマンドはまだ実装されていません（stub）。[/yellow]")
    console.print("LENS-002 で実装予定です。")
