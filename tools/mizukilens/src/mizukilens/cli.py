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
# export  (implemented)
# ---------------------------------------------------------------------------

@main.command("export")
@click.option("--since", "since", type=str, default=None, metavar="YYYY-MM-DD",
              help="Only export streams approved after this date.")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Only export the specified stream.")
def export_cmd(since: str | None, stream_id: str | None) -> None:
    """Export approved data to MizukiPrism JSON format."""
    import sys
    from mizukilens.cache import open_db
    from mizukilens.export import export_approved_streams
    from mizukilens.discovery import get_active_channel_info

    # Resolve channel ID for JSON header (best effort; empty string if unconfigured)
    channel_id = ""
    try:
        channel_id, _ = get_active_channel_info()
    except RuntimeError:
        pass

    conn = open_db()
    try:
        result = export_approved_streams(
            conn,
            since=since,
            stream_id=stream_id,
            channel_id=channel_id,
        )
    except ValueError as exc:
        if "no_approved_streams" in str(exc):
            console.print("無可匯出的資料，請先完成審核")
            sys.exit(0)
        raise
    finally:
        conn.close()

    console.print(f"[bold green]匯出完成！[/bold green]")
    console.print(f"  ファイル: [cyan]{result.output_path}[/cyan]")
    console.print(f"  場次 (Streams): [bold]{result.stream_count}[/bold]")
    console.print(f"  歌曲 (Songs):   [bold]{result.song_count}[/bold]")
    console.print(f"  版本 (Versions):[bold]{result.version_count}[/bold]")


# ---------------------------------------------------------------------------
# import  (implemented)
# ---------------------------------------------------------------------------

@main.command("import")
@click.argument("file", type=click.Path(exists=True, dir_okay=False), required=False)
@click.option(
    "--songs-file",
    "songs_file",
    type=click.Path(dir_okay=False),
    default=None,
    help="Path to MizukiPrism data/songs.json (auto-detected if not specified).",
)
@click.option(
    "--streams-file",
    "streams_file",
    type=click.Path(dir_okay=False),
    default=None,
    help="Path to MizukiPrism data/streams.json (auto-detected if not specified).",
)
def import_cmd(file: str | None, songs_file: str | None, streams_file: str | None) -> None:
    """Import exported JSON into MizukiPrism data files.

    \b
    Reads a MizukiLens export JSON, compares against existing MizukiPrism data,
    shows a change summary, asks for confirmation, then writes the updated files.

    \b
    Field mappings applied:
      name         → title
      artist       → originalArtist
      startTimestamp (H:MM:SS) → timestamp (seconds)
      endTimestamp  (H:MM:SS)  → endTimestamp (number | null)
      versions[]   → embedded performances[] in Song
    """
    import sys
    import json
    from pathlib import Path

    from mizukilens.importer import (
        validate_export_json,
        load_mizukiprism_data,
        compute_import_plan,
        execute_import,
    )

    if file is None:
        console.print("[red]エラー:[/red] インポートするファイルを指定してください。")
        console.print("  使用方法: [bold]mizukilens import FILE[/bold]")
        sys.exit(1)

    # --- Resolve MizukiPrism data file paths --------------------------------
    file_path = Path(file).resolve()

    def _find_prism_root() -> Path | None:
        """Walk up from the export file to find the MizukiPrism repo root."""
        # Try common relative locations
        candidate = file_path
        for _ in range(10):
            candidate = candidate.parent
            if (candidate / "data" / "songs.json").exists():
                return candidate
        return None

    if songs_file is None or streams_file is None:
        prism_root = _find_prism_root()
        if prism_root is None:
            console.print(
                "[red]エラー:[/red] MizukiPrism の data ディレクトリが見つかりません。\n"
                "  [bold]--songs-file[/bold] と [bold]--streams-file[/bold] を明示的に指定してください。"
            )
            sys.exit(1)
        if songs_file is None:
            songs_file = str(prism_root / "data" / "songs.json")
        if streams_file is None:
            streams_file = str(prism_root / "data" / "streams.json")

    songs_path = Path(songs_file)
    streams_path = Path(streams_file)

    # --- Read and validate export JSON --------------------------------------
    try:
        raw = file_path.read_text(encoding="utf-8")
    except OSError as exc:
        console.print(f"[red]エラー:[/red] ファイルを読み込めません: {exc}")
        sys.exit(1)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        console.print(f"[red]JSON 解析エラー:[/red] {exc}")
        sys.exit(1)

    try:
        validate_export_json(payload)
    except ValueError as exc:
        console.print(f"[red]スキーマ検証エラー:[/red]\n{exc}")
        sys.exit(1)

    console.print(f"[cyan]インポートファイル:[/cyan] {file_path.name}")

    # --- Load existing MizukiPrism data -------------------------------------
    try:
        existing_songs, existing_streams = load_mizukiprism_data(songs_path, streams_path)
    except (FileNotFoundError, ValueError) as exc:
        console.print(f"[red]データ読み込みエラー:[/red] {exc}")
        sys.exit(1)

    console.print(
        f"[dim]既存データ: {len(existing_songs)} 首歌曲、{len(existing_streams)} 場直播[/dim]"
    )

    # --- Compute import plan ------------------------------------------------
    plan = compute_import_plan(payload, existing_songs, existing_streams)

    # --- Show change summary ------------------------------------------------
    console.print()
    console.print("[bold]変更サマリー:[/bold]")
    console.print(
        f"  新增 [bold]{plan.new_song_count}[/bold] 首歌曲、"
        f"新增 [bold]{plan.new_version_count}[/bold] 個版本、"
        f"新增 [bold]{plan.new_stream_count}[/bold] 場直播"
    )

    if plan.new_songs:
        console.print("\n[bold]新增歌曲:[/bold]")
        for song in plan.new_songs:
            artist = song.get("originalArtist", "")
            perf_count = len(song.get("performances", []))
            console.print(f"  + {song['title']}  ({artist})  [{perf_count} 個版本]")

    if plan.updated_songs:
        console.print("\n[bold]更新歌曲（新增版本）:[/bold]")
        for song in plan.updated_songs:
            n = song.get("_new_perf_count", 0)
            console.print(f"  ~ {song['title']}  (+{n} 個版本)")

    if plan.new_streams:
        console.print("\n[bold]新增直播:[/bold]")
        for stream in plan.new_streams:
            console.print(f"  + [{stream['id']}] {stream['title']}  ({stream['date']})")

    # --- Handle conflicts ---------------------------------------------------
    overwrite_ids: set[str] = set()
    skip_ids: set[str] = set()

    if plan.conflicts:
        console.print()
        console.print(f"[yellow]⚠ 衝突:[/yellow]  {len(plan.conflicts)} 場直播已存在於 MizukiPrism。")
        for conflict in plan.conflicts:
            console.print(
                f"  [bold]{conflict.video_id}[/bold]  "
                f"既存: [{conflict.existing_stream_id}] {conflict.existing_stream_title}"
            )
            choice = click.prompt(
                "    上書き (overwrite) / スキップ (skip)?",
                type=click.Choice(["overwrite", "skip", "o", "s"], case_sensitive=False),
                default="skip",
            )
            if choice in ("overwrite", "o"):
                overwrite_ids.add(conflict.video_id)
            else:
                skip_ids.add(conflict.video_id)

    # --- Confirm and execute ------------------------------------------------
    if plan.new_song_count == 0 and plan.new_version_count == 0 and plan.new_stream_count == 0 and not overwrite_ids:
        console.print("\n[dim]インポートするデータがありません。[/dim]")
        return

    console.print()
    confirmed = click.confirm("MizukiPrism のデータファイルに書き込みますか？", default=True)
    if not confirmed:
        console.print("[dim]キャンセルしました。[/dim]")
        return

    from mizukilens.cache import open_db
    conn = None
    try:
        conn = open_db()
    except Exception:  # noqa: BLE001
        pass

    try:
        result = execute_import(
            plan,
            songs_path=songs_path,
            streams_path=streams_path,
            conn=conn,
            overwrite_video_ids=overwrite_ids,
            skip_video_ids=skip_ids,
            payload=payload,
        )
    finally:
        if conn is not None:
            conn.close()

    console.print()
    console.print("[bold green]匯入完成！[/bold green]")
    console.print(f"  新增 [bold]{result.new_song_count}[/bold] 首歌曲")
    console.print(f"  新增 [bold]{result.new_version_count}[/bold] 個版本")
    console.print(f"  新增 [bold]{result.new_stream_count}[/bold] 場直播")
    if result.overwritten_count:
        console.print(f"  上書き: [bold]{result.overwritten_count}[/bold] 場直播")
    if result.skipped_count:
        console.print(f"  スキップ: [bold]{result.skipped_count}[/bold] 場直播")
    console.print(f"\n  [dim]バックアップ: {songs_path}.bak, {streams_path}.bak[/dim]")


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
