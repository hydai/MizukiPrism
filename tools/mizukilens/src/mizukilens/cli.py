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
    """Discover YouTube livestream archives and save them to the local cache."""
    import sys
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
    from mizukilens.cache import open_db
    from mizukilens.discovery import (
        fetch_streams, get_active_channel_info, NetworkError
    )

    # --- Validate: exactly one mode must be provided ----------------------
    modes_given = sum([fetch_all, recent is not None, after is not None])
    if modes_given == 0:
        console.print(
            "[red]エラー:[/red] 実行モードを指定してください: "
            "[bold]--all[/bold], [bold]--recent N[/bold], または [bold]--after YYYY-MM-DD[/bold]"
        )
        sys.exit(1)
    if fetch_all and recent is not None:
        console.print("[red]エラー:[/red] [bold]--all[/bold] と [bold]--recent[/bold] は同時に指定できません。")
        sys.exit(1)
    if fetch_all and after is not None:
        console.print("[red]エラー:[/red] [bold]--all[/bold] と [bold]--after[/bold] は同時に指定できません。")
        sys.exit(1)
    if recent is not None and after is not None:
        console.print("[red]エラー:[/red] [bold]--recent[/bold] と [bold]--after[/bold] は同時に指定できません。")
        sys.exit(1)
    if before is not None and after is None:
        console.print("[red]エラー:[/red] [bold]--before[/bold] は [bold]--after[/bold] と一緒に指定してください。")
        sys.exit(1)

    # --- Load config -------------------------------------------------------
    try:
        channel_id, keywords = get_active_channel_info()
    except RuntimeError as exc:
        console.print(f"[red]設定エラー:[/red] {exc}")
        sys.exit(1)

    # --- Describe what we're doing ----------------------------------------
    if fetch_all:
        mode_desc = "すべての直播アーカイブを取得中"
    elif recent is not None:
        mode_desc = f"最新 {recent} 件の直播アーカイブを取得中"
    else:
        if before:
            mode_desc = f"{after} 〜 {before} の直播アーカイブを取得中"
        else:
            mode_desc = f"{after} 以降の直播アーカイブを取得中"

    console.print(f"[cyan]チャンネル:[/cyan] {channel_id}")
    console.print(f"[cyan]モード:[/cyan] {mode_desc}")
    if force:
        console.print("[yellow]--force: excluded/imported を含む全場次を再処理します[/yellow]")

    # --- First attempt: content_type="streams" ----------------------------
    conn = open_db()
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
            transient=True,
        ) as progress:
            task = progress.add_task(mode_desc, total=None)
            processed: list[dict] = []

            def on_progress(info: dict) -> None:
                processed.append(info)
                progress.update(task, advance=1, description=f"{mode_desc} ({len(processed)} 件)")

            try:
                result = fetch_streams(
                    conn,
                    channel_id=channel_id,
                    channel_id_str=channel_id,
                    keywords=keywords,
                    fetch_all=fetch_all,
                    recent=recent,
                    after=after,
                    before=before,
                    force=force,
                    use_keyword_filter=False,
                    progress_callback=on_progress,
                )
            except NetworkError as exc:
                console.print(f"\n[red]ネットワークエラー:[/red] {exc}")
                console.print(
                    "[yellow]ヒント:[/yellow] しばらく待ってから再度 fetch を実行してください。"
                )
                console.print(
                    f"[dim]部分的な結果（{len(processed)} 件）はキャッシュに保存されました。[/dim]"
                )
                return

    finally:
        conn.close()

    # --- Print summary ----------------------------------------------------
    console.print()
    console.print(f"[bold green]完了![/bold green]  {result.summary_line()}")
    if result.skipped > 0:
        console.print(
            f"[dim]キーワードに一致しない動画をスキップ: {result.skipped} 件[/dim]"
        )


# ---------------------------------------------------------------------------
# extract  (implemented)
# ---------------------------------------------------------------------------

@main.command("extract")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Extract timestamps for a specific stream only.")
@click.option("--all", "extract_all", is_flag=True, default=False,
              help="Extract timestamps for all discovered streams.")
def extract_cmd(stream_id: str | None, extract_all: bool) -> None:
    """Extract song timestamps from comments or description for discovered streams."""
    import sys
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from mizukilens.cache import open_db, get_stream, list_streams
    from mizukilens.extraction import extract_timestamps, extract_all_discovered

    # Validate: must specify one mode
    if stream_id is None and not extract_all:
        console.print(
            "[red]エラー:[/red] 実行モードを指定してください: "
            "[bold]--stream VIDEO_ID[/bold] または [bold]--all[/bold]"
        )
        sys.exit(1)

    conn = open_db()
    try:
        if stream_id:
            # Single stream extraction
            stream = get_stream(conn, stream_id)
            if stream is None:
                console.print(f"[red]エラー:[/red] ストリーム [bold]{stream_id}[/bold] がキャッシュに見つかりません。")
                sys.exit(1)

            console.print(f"[cyan]抽出中:[/cyan] {stream_id}")
            result = extract_timestamps(conn, stream_id)

            if result.status == "extracted":
                source_label = "留言区" if result.source == "comment" else "概要欄"
                console.print(
                    f"[green]完了![/green]  {source_label}から {len(result.songs)} 曲を抽出しました。"
                )
                if result.suspicious_timestamps:
                    console.print(
                        f"[yellow]警告:[/yellow] 疑わしいタイムスタンプが {len(result.suspicious_timestamps)} 件あります（12時間超）。"
                    )
            else:
                console.print(
                    f"[yellow]待機中:[/yellow] ストリーム {stream_id} のタイムスタンプを自動抽出できませんでした。"
                )
                console.print("[dim]TUI で手動入力するか、後で再試行してください。[/dim]")
        else:
            # Batch extraction of all discovered streams
            streams = list_streams(conn, status="discovered")
            if not streams:
                console.print("[dim]抽出待ちのストリームがありません（status=discovered）。[/dim]")
                return

            console.print(f"[cyan]抽出対象:[/cyan] {len(streams)} 件のストリーム")

            extracted_count = 0
            pending_count = 0
            processed = 0

            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
                transient=True,
            ) as progress:
                task = progress.add_task("タイムスタンプ抽出中...", total=len(streams))

                def on_progress(result):
                    nonlocal extracted_count, pending_count, processed
                    processed += 1
                    if result.status == "extracted":
                        extracted_count += 1
                    else:
                        pending_count += 1
                    progress.update(
                        task,
                        advance=1,
                        description=f"抽出中 ({processed}/{len(streams)}) — 成功: {extracted_count}, 待機: {pending_count}",
                    )

                extract_all_discovered(conn, progress_callback=on_progress)

            console.print()
            console.print(
                f"[bold green]完了![/bold green]  "
                f"抽出成功: {extracted_count} 件、待処理: {pending_count} 件"
            )
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# review  (TUI)
# ---------------------------------------------------------------------------

@main.command("review")
@click.option("--all", "show_all", is_flag=True, default=False,
              help="Show all streams (including excluded/imported) instead of only reviewable ones.")
def review_cmd(show_all: bool) -> None:
    """Launch the interactive TUI curation interface.

    \b
    Displays a split-pane terminal UI:
      Left  — Stream list with status indicators
      Right — Song details for the selected stream

    \b
    Keyboard shortcuts:
      a  Approve stream        s  Skip (no change)
      x  Exclude stream        e  Edit selected song
      n  Add new song          d  Delete selected song
      r  Re-fetch timestamps   ?  Help
      q  Quit
    """
    import shutil
    import sys
    from mizukilens.cache import open_db
    from mizukilens.tui import launch_review_tui

    # Warn if terminal is too small (< 80×24)
    term_size = shutil.get_terminal_size(fallback=(0, 0))
    if term_size.columns > 0 and term_size.lines > 0:
        if term_size.columns < 80 or term_size.lines < 24:
            console.print(
                f"[yellow]警告:[/yellow] ターミナルが小さすぎます "
                f"({term_size.columns}×{term_size.lines})。"
                "最低 80×24 が必要です。表示が崩れる可能性があります。"
            )

    conn = open_db()
    try:
        launch_review_tui(conn, show_all=show_all)
    finally:
        conn.close()


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
