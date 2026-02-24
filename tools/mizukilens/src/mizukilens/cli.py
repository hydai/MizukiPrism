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
    if result.dates_resolved > 0:
        console.print(f"[dim]正確な日付を取得: {result.dates_resolved} 件[/dim]")
    if result.upcoming_skipped > 0:
        console.print(
            f"[dim]予定/未配信のストリームをスキップ: {result.upcoming_skipped} 件[/dim]"
        )
    if result.dates_updated > 0:
        console.print(
            f"[dim]既存エントリの日付を補完: {result.dates_updated} 件[/dim]"
        )
    if result.skipped > 0:
        console.print(
            f"[dim]キーワードに一致しない動画をスキップ: {result.skipped} 件[/dim]"
        )


# ---------------------------------------------------------------------------
# fix-dates
# ---------------------------------------------------------------------------

@main.command("fix-dates")
@click.option("--stream", "stream_id", type=str, default=None, metavar="VIDEO_ID",
              help="Fix date for a specific stream only.")
def fix_dates_cmd(stream_id: str | None) -> None:
    """Fetch precise upload dates for cached streams using yt-dlp."""
    from mizukilens.cache import open_db
    from mizukilens.discovery import resolve_precise_dates

    conn = open_db()
    try:
        video_ids = [stream_id] if stream_id else None

        # Count how many need resolving
        if video_ids is None:
            cur = conn.execute(
                "SELECT COUNT(*) FROM streams "
                "WHERE date_source IS NULL OR date_source != 'precise'"
            )
            total = cur.fetchone()[0]
        else:
            total = 1

        if total == 0:
            console.print("[dim]すべてのストリームの日付は正確です。[/dim]")
            return

        console.print(f"[cyan]日付解決対象:[/cyan] {total} 件")

        resolved = [0]

        def on_progress(vid: str, date_str: str | None) -> None:
            resolved[0] += 1
            status = f"[green]{date_str}[/green]" if date_str else "[yellow]失敗[/yellow]"
            console.print(f"  ({resolved[0]}/{total}) {vid}: {status}")

        count = resolve_precise_dates(conn, video_ids, progress_callback=on_progress)
        console.print(f"\n[bold green]完了![/bold green]  {count}/{total} 件の日付を解決しました。")
    finally:
        conn.close()


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
# review  (TUI + batch subcommands)
# ---------------------------------------------------------------------------

@main.group("review", invoke_without_command=True)
@click.option("--all", "show_all", is_flag=True, default=False,
              help="Show all streams (including excluded/imported) instead of only reviewable ones.")
@click.pass_context
def review_group(ctx: click.Context, show_all: bool) -> None:
    """Curation interface — interactive TUI or batch subcommands.

    \b
    Without a subcommand, launches the interactive TUI.
    Subcommands: report, approve, exclude, clean
    """
    ctx.ensure_object(dict)
    ctx.obj["show_all"] = show_all

    if ctx.invoked_subcommand is not None:
        return

    # Default: launch TUI
    import shutil
    from mizukilens.cache import open_db
    from mizukilens.tui import launch_review_tui

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


@review_group.command("report")
@click.option("--detail", is_flag=True, default=False,
              help="Show per-stream detail with category, song count, and quality score.")
def review_report_cmd(detail: bool) -> None:
    """Show batch review analysis report."""
    from mizukilens.cache import open_db
    from mizukilens.review_ops import generate_report

    conn = open_db()
    try:
        generate_report(conn, detail=detail)
    finally:
        conn.close()


@review_group.command("approve")
@click.option("--karaoke", is_flag=True, default=False,
              help="Approve streams categorized as Karaoke.")
@click.option("--category", type=str, default=None, metavar="CATEGORY",
              help="Approve streams matching this category (Karaoke, ASMR, Game, FreeTalk, 3D/Dance, Other).")
@click.option("--video", "video_id", type=str, default=None, metavar="VIDEO_ID",
              help="Approve a specific stream by video ID.")
@click.option("--min-songs", type=int, default=0,
              help="Only approve streams with at least this many parsed songs.")
@click.option("--dry-run", is_flag=True, default=False,
              help="Show what would be approved without making changes.")
@click.option("--yes", "-y", is_flag=True, default=False,
              help="Skip confirmation prompt.")
def review_approve_cmd(
    karaoke: bool,
    category: str | None,
    video_id: str | None,
    min_songs: int,
    dry_run: bool,
    yes: bool,
) -> None:
    """Batch-approve extracted streams."""
    import sys

    if not karaoke and not category and not video_id:
        console.print("[red]エラー:[/red] Specify at least one filter: --karaoke, --category, or --video")
        sys.exit(1)

    from mizukilens.cache import open_db
    from mizukilens.review_ops import batch_approve

    conn = open_db()
    try:
        batch_approve(
            conn,
            karaoke=karaoke,
            category=category,
            video_id=video_id,
            min_songs=min_songs,
            dry_run=dry_run,
            yes=yes,
        )
    finally:
        conn.close()


@review_group.command("exclude")
@click.option("--non-karaoke", is_flag=True, default=False,
              help="Exclude all non-Karaoke streams.")
@click.option("--category", type=str, default=None, metavar="CATEGORY",
              help="Exclude streams matching this category.")
@click.option("--video", "video_id", type=str, default=None, metavar="VIDEO_ID",
              help="Exclude a specific stream by video ID.")
@click.option("--no-songs", is_flag=True, default=False,
              help="Exclude streams with zero parsed songs.")
@click.option("--dry-run", is_flag=True, default=False,
              help="Show what would be excluded without making changes.")
@click.option("--yes", "-y", is_flag=True, default=False,
              help="Skip confirmation prompt.")
def review_exclude_cmd(
    non_karaoke: bool,
    category: str | None,
    video_id: str | None,
    no_songs: bool,
    dry_run: bool,
    yes: bool,
) -> None:
    """Batch-exclude extracted streams."""
    import sys

    if not non_karaoke and not category and not video_id and not no_songs:
        console.print("[red]エラー:[/red] Specify at least one filter: --non-karaoke, --category, --video, or --no-songs")
        sys.exit(1)

    from mizukilens.cache import open_db
    from mizukilens.review_ops import batch_exclude

    conn = open_db()
    try:
        batch_exclude(
            conn,
            non_karaoke=non_karaoke,
            category=category,
            video_id=video_id,
            no_songs=no_songs,
            dry_run=dry_run,
            yes=yes,
        )
    finally:
        conn.close()


@review_group.command("clean")
@click.option("--dry-run", is_flag=True, default=False,
              help="Show what would be cleaned without making changes.")
def review_clean_cmd(dry_run: bool) -> None:
    """Clean emoji/emote artifacts from artist fields."""
    from mizukilens.cache import open_db
    from mizukilens.review_ops import clean_parsed_songs

    conn = open_db()
    try:
        clean_parsed_songs(conn, dry_run=dry_run)
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

# ---------------------------------------------------------------------------
# candidates  (implemented)
# ---------------------------------------------------------------------------

@main.group("candidates", invoke_without_command=True)
@click.option("--video", "video_id", type=str, default=None, metavar="VIDEO_ID",
              help="Filter candidates by video ID.")
@click.option("--status", "status", type=click.Choice(["pending", "approved", "rejected"]),
              default=None, help="Filter candidates by status.")
@click.pass_context
def candidates_group(ctx: click.Context, video_id: str | None, status: str | None) -> None:
    """View and manage songlist keyword candidate comments.

    \b
    Without a subcommand, lists all candidates matching the filters.
    Subcommands: show, approve, reject
    """
    ctx.ensure_object(dict)
    ctx.obj["video_id"] = video_id
    ctx.obj["status"] = status

    if ctx.invoked_subcommand is not None:
        return

    # Default behavior: list candidates
    from mizukilens.cache import open_db, list_candidate_comments
    from rich.table import Table
    from rich import box

    conn = open_db()
    try:
        rows = list_candidate_comments(conn, video_id=video_id, status=status)
        if not rows:
            console.print("[dim]候補留言がありません。[/dim]")
            return

        tbl = Table(
            title="候選留言 (Candidate Comments)",
            box=box.ROUNDED,
            show_header=True,
            header_style="bold cyan",
        )
        tbl.add_column("ID", justify="right", style="bold")
        tbl.add_column("Video ID", style="cyan", no_wrap=True)
        tbl.add_column("Author")
        tbl.add_column("Keywords", style="yellow")
        tbl.add_column("Status")
        tbl.add_column("Preview")

        status_styles = {
            "pending":  "[yellow]pending[/yellow]",
            "approved": "[green]approved[/green]",
            "rejected": "[red]rejected[/red]",
        }

        for row in rows:
            text_preview = (row["comment_text"] or "")[:60]
            text_preview = text_preview.replace("\n", " ")
            if len(row["comment_text"] or "") > 60:
                text_preview += "..."
            tbl.add_row(
                str(row["id"]),
                row["video_id"],
                row["comment_author"] or "",
                row["keywords_matched"] or "",
                status_styles.get(row["status"], row["status"]),
                text_preview,
            )

        console.print(tbl)
    finally:
        conn.close()


@candidates_group.command("show")
@click.argument("candidate_id", type=int)
def candidates_show_cmd(candidate_id: int) -> None:
    """Show the full text of a candidate comment."""
    import sys
    from mizukilens.cache import open_db, get_candidate_comment
    from rich.panel import Panel

    conn = open_db()
    try:
        row = get_candidate_comment(conn, candidate_id)
        if row is None:
            console.print(f"[red]エラー:[/red] 候補留言 ID={candidate_id} が見つかりません。")
            sys.exit(1)

        status_styles = {
            "pending":  "[yellow]pending[/yellow]",
            "approved": "[green]approved[/green]",
            "rejected": "[red]rejected[/red]",
        }

        console.print()
        console.print(f"[bold cyan]候補留言 #{candidate_id}[/bold cyan]")
        console.print(f"  Video:    [cyan]{row['video_id']}[/cyan]")
        console.print(f"  Author:   {row['comment_author'] or '(不明)'}")
        console.print(f"  Keywords: [yellow]{row['keywords_matched'] or ''}[/yellow]")
        console.print(f"  Status:   {status_styles.get(row['status'], row['status'])}")
        console.print(f"  Created:  {row['created_at']}")
        console.print()
        console.print(Panel(
            row["comment_text"],
            title="コメント全文",
            border_style="cyan",
        ))
    finally:
        conn.close()


@candidates_group.command("approve")
@click.argument("candidate_id", type=int)
def candidates_approve_cmd(candidate_id: int) -> None:
    """Approve a candidate comment and re-extract timestamps from it."""
    import sys
    from mizukilens.cache import open_db, get_candidate_comment
    from mizukilens.extraction import extract_from_candidate

    conn = open_db()
    try:
        row = get_candidate_comment(conn, candidate_id)
        if row is None:
            console.print(f"[red]エラー:[/red] 候補留言 ID={candidate_id} が見つかりません。")
            sys.exit(1)

        video_id = row["video_id"]
        console.print(f"[cyan]候補留言 #{candidate_id}[/cyan] から再抽出中...")

        result = extract_from_candidate(conn, video_id, candidate_id)

        if result.songs:
            console.print(
                f"[green]完了![/green]  {len(result.songs)} 曲を抽出しました。"
            )
            if result.suspicious_timestamps:
                console.print(
                    f"[yellow]警告:[/yellow] 疑わしいタイムスタンプが "
                    f"{len(result.suspicious_timestamps)} 件あります。"
                )
        else:
            console.print(
                "[yellow]注意:[/yellow] このコメントからタイムスタンプを抽出できませんでした。"
            )
    except (KeyError, ValueError) as exc:
        console.print(f"[red]エラー:[/red] {exc}")
        sys.exit(1)
    finally:
        conn.close()


@candidates_group.command("reject")
@click.argument("candidate_id", type=int)
def candidates_reject_cmd(candidate_id: int) -> None:
    """Mark a candidate comment as rejected."""
    import sys
    from mizukilens.cache import open_db, update_candidate_status

    conn = open_db()
    try:
        update_candidate_status(conn, candidate_id, "rejected")
        console.print(f"[dim]候補留言 #{candidate_id} を却下しました。[/dim]")
    except KeyError:
        console.print(f"[red]エラー:[/red] 候補留言 ID={candidate_id} が見つかりません。")
        sys.exit(1)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# metadata  (implemented)
# ---------------------------------------------------------------------------

def _find_prism_root_from_cwd() -> "Path | None":
    """Walk up from the current working directory to find MizukiPrism repo root."""
    from pathlib import Path
    candidate = Path.cwd().resolve()
    for _ in range(20):
        if (candidate / "data" / "songs.json").exists():
            return candidate
        parent = candidate.parent
        if parent == candidate:
            break
        candidate = parent
    return None


@main.group("metadata")
def metadata_group() -> None:
    """Manage song metadata (album art, lyrics) fetched from external APIs.

    \b
    Subcommands:
      fetch    — fetch metadata from Deezer (album art) and LRCLIB (lyrics)
      status   — view metadata status for all songs
      override — manually override album art URL and/or lyrics
      clear    — remove metadata entries so they can be re-fetched
    """


@metadata_group.command("fetch")
@click.option("--missing", "mode", flag_value="missing", default=True,
              help="Fetch songs without any metadata entry (default).")
@click.option("--stale", "mode", flag_value="stale",
              help="Re-fetch entries older than 90 days.")
@click.option("--all", "mode", flag_value="all",
              help="Re-fetch all songs (skips manual unless --force).")
@click.option("--song", "song_id", type=str, default=None, metavar="ID",
              help="Fetch a specific song by ID.")
@click.option("--force", is_flag=True, default=False,
              help="Allow overwriting manual entries.")
@click.option("--lyrics-only", "lyrics_only", is_flag=True, default=False,
              help="Only fetch lyrics from LRCLIB (skip Deezer).")
@click.option("--art-only", "art_only", is_flag=True, default=False,
              help="Only fetch album art from Deezer (skip LRCLIB).")
def metadata_fetch_cmd(
    mode: str,
    song_id: str | None,
    force: bool,
    lyrics_only: bool,
    art_only: bool,
) -> None:
    """Fetch album art and lyrics metadata from Deezer and LRCLIB.

    \b
    Examples:
      mizukilens metadata fetch --missing       # new songs only (default)
      mizukilens metadata fetch --stale         # re-fetch entries >90 days old
      mizukilens metadata fetch --all           # re-fetch everything
      mizukilens metadata fetch --song song-1   # fetch one specific song
      mizukilens metadata fetch --art-only      # Deezer only
      mizukilens metadata fetch --lyrics-only   # LRCLIB only
    """
    import sys
    import json
    from pathlib import Path
    from datetime import datetime, timezone
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
    from rich.table import Table
    from rich import box
    from mizukilens.metadata import (
        read_metadata_file,
        fetch_song_metadata,
        is_stale,
        STALE_DAYS,
    )

    if lyrics_only and art_only:
        console.print("[red]Error:[/red] --lyrics-only and --art-only cannot be used together.")
        sys.exit(1)

    # Determine fetch flags
    do_deezer = not lyrics_only
    do_lyrics = not art_only

    # Locate MizukiPrism root
    prism_root = _find_prism_root_from_cwd()
    if prism_root is None:
        console.print(
            "[red]Error:[/red] Could not locate MizukiPrism project root "
            "(expected data/songs.json). Run from inside the MizukiPrism directory."
        )
        sys.exit(1)

    songs_path = prism_root / "data" / "songs.json"
    metadata_dir = prism_root / "data" / "metadata"

    # Load songs
    try:
        songs_text = songs_path.read_text(encoding="utf-8")
        all_songs: list[dict] = json.loads(songs_text)
    except (OSError, json.JSONDecodeError) as exc:
        console.print(f"[red]Error:[/red] Could not read songs.json: {exc}")
        sys.exit(1)

    if not isinstance(all_songs, list):
        console.print("[red]Error:[/red] songs.json must be a JSON array.")
        sys.exit(1)

    # Load existing metadata records for filtering
    metadata_path = metadata_dir / "song-metadata.json"
    existing_metadata: list[dict] = read_metadata_file(metadata_path)
    existing_by_id: dict[str, dict] = {r["songId"]: r for r in existing_metadata if "songId" in r}

    # Determine target songs
    if song_id is not None:
        # Single song mode
        target_songs = [s for s in all_songs if s.get("id") == song_id]
        if not target_songs:
            console.print(f"[red]Error:[/red] Song ID [bold]{song_id}[/bold] not found in songs.json.")
            sys.exit(1)
    elif mode == "missing":
        target_songs = [s for s in all_songs if s.get("id") not in existing_by_id]
    elif mode == "stale":
        target_songs = [
            s for s in all_songs
            if s.get("id") in existing_by_id and is_stale(existing_by_id[s["id"]])
        ]
    elif mode == "all":
        if force:
            target_songs = list(all_songs)
        else:
            # Skip manual entries unless --force
            target_songs = [
                s for s in all_songs
                if existing_by_id.get(s.get("id", ""), {}).get("fetchStatus") != "manual"
            ]
    else:
        target_songs = []

    if not target_songs:
        console.print("[dim]No songs to fetch. Nothing to do.[/dim]")
        return

    console.print(f"[cyan]Fetching metadata for[/cyan] [bold]{len(target_songs)}[/bold] songs...")
    if not do_deezer:
        console.print("[dim](Lyrics only — Deezer skipped)[/dim]")
    if not do_lyrics:
        console.print("[dim](Art only — LRCLIB skipped)[/dim]")

    # --- Fetch with progress bar ---
    matched = 0
    no_match = 0
    errored = 0
    skipped_count = 0

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
        transient=True,
    ) as progress:
        task = progress.add_task("Fetching...", total=len(target_songs))

        for i, song in enumerate(target_songs):
            title = song.get("title", "")
            artist = song.get("originalArtist", "")
            progress.update(
                task,
                advance=0,
                description=f"[{i + 1}/{len(target_songs)}] {artist} — {title}",
            )

            try:
                result = fetch_song_metadata(
                    song=song,
                    metadata_dir=metadata_dir,
                    fetch_deezer=do_deezer,
                    fetch_lyrics=do_lyrics,
                )
            except Exception as exc:  # noqa: BLE001
                console.print(f"\n[red]Unexpected error[/red] for song {song.get('id')}: {exc}")
                errored += 1
                progress.advance(task)
                continue

            status = result.overall_status
            if status == "matched":
                matched += 1
            elif status == "no_match":
                no_match += 1
            elif status == "error":
                errored += 1
            elif status == "skipped":
                skipped_count += 1

            progress.advance(task)

    console.print()

    # --- Summary table ---
    tbl = Table(
        title="Metadata Fetch Summary",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold cyan",
    )
    tbl.add_column("Result", style="bold")
    tbl.add_column("Count", justify="right")

    tbl.add_row("[green]Matched[/green]", str(matched))
    tbl.add_row("[yellow]No match[/yellow]", str(no_match))
    tbl.add_row("[red]Error[/red]", str(errored))
    tbl.add_row("[dim]Skipped[/dim]", str(skipped_count))
    tbl.add_section()
    tbl.add_row("[bold]Total[/bold]", f"[bold]{len(target_songs)}[/bold]")

    console.print(tbl)


@metadata_group.command("status")
@click.option("--detail", is_flag=True, default=False,
              help="Show additional columns (URLs, Deezer IDs, error messages, fetched time).")
@click.option(
    "--filter", "filter_status",
    type=click.Choice(["matched", "no_match", "error", "manual", "pending"], case_sensitive=False),
    default=None,
    metavar="STATUS",
    help="Filter by status (matched, no_match, error, manual, pending).",
)
def metadata_status_cmd(detail: bool, filter_status: str | None) -> None:
    """Show metadata status for all songs.

    \b
    Cross-references songs.json with song-metadata.json and song-lyrics.json.
    Songs without a metadata entry are shown as 'pending'.

    \b
    Examples:
      mizukilens metadata status
      mizukilens metadata status --filter pending
      mizukilens metadata status --filter matched --detail
    """
    import sys
    import json
    from pathlib import Path
    from rich.table import Table
    from rich import box
    from mizukilens.metadata import get_metadata_status

    # Locate MizukiPrism root
    prism_root = _find_prism_root_from_cwd()
    if prism_root is None:
        console.print(
            "[red]Error:[/red] Could not locate MizukiPrism project root "
            "(expected data/songs.json). Run from inside the MizukiPrism directory."
        )
        sys.exit(1)

    songs_path = prism_root / "data" / "songs.json"
    metadata_dir = prism_root / "data" / "metadata"

    records = get_metadata_status(songs_path, metadata_dir)

    if not records:
        console.print("[dim]No songs found in songs.json.[/dim]")
        return

    # Apply filter
    if filter_status is not None:
        records = [
            r for r in records
            if r.cover_status == filter_status or r.lyrics_status == filter_status
        ]

    # Status styling
    _status_style = {
        "matched":  "[green]matched[/green]",
        "no_match": "[yellow]no_match[/yellow]",
        "error":    "[red]error[/red]",
        "manual":   "[cyan]manual[/cyan]",
        "pending":  "[dim]pending[/dim]",
    }

    def _fmt_status(s: str) -> str:
        return _status_style.get(s, s)

    def _fmt_confidence(c: str | None) -> str:
        return c if c is not None else "[dim]\u2014[/dim]"

    def _fmt_fetched(f: str | None) -> str:
        return f if f is not None else "[dim]\u2014[/dim]"

    # Build table
    tbl = Table(
        title="Metadata Status",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold cyan",
    )
    tbl.add_column("Song Title", style="bold", min_width=20)
    tbl.add_column("Original Artist", min_width=12)
    tbl.add_column("Cover", no_wrap=True)
    tbl.add_column("Lyrics", no_wrap=True)
    tbl.add_column("Confidence", no_wrap=True)
    tbl.add_column("Fetched", no_wrap=True)
    if detail:
        tbl.add_column("Album Art URL", overflow="fold")
        tbl.add_column("Deezer Track ID", no_wrap=True)
        tbl.add_column("Last Error", overflow="fold")

    for r in records:
        row = [
            r.title,
            r.original_artist,
            _fmt_status(r.cover_status),
            _fmt_status(r.lyrics_status),
            _fmt_confidence(r.match_confidence),
            _fmt_fetched(r.fetched_at),
        ]
        if detail:
            row.append(r.album_art_url or "[dim]\u2014[/dim]")
            row.append(str(r.deezer_track_id) if r.deezer_track_id is not None else "[dim]\u2014[/dim]")
            # Show first non-None error
            last_err = r.cover_last_error or r.lyrics_last_error or ""
            row.append(last_err or "[dim]\u2014[/dim]")
        tbl.add_row(*row)

    console.print(tbl)

    # --- Compute summary counts (over all records, before filter) ---
    all_records = get_metadata_status(songs_path, metadata_dir)
    status_counts: dict[str, int] = {
        "matched": 0,
        "no_match": 0,
        "error": 0,
        "manual": 0,
        "pending": 0,
    }
    for r in all_records:
        # A song is counted by its cover_status (primary metadata source)
        cs = r.cover_status
        if cs in status_counts:
            status_counts[cs] += 1
        else:
            status_counts["pending"] += 1

    total = len(all_records)
    summary_parts = [f"Total: {total}"]
    for key in ("matched", "no_match", "error", "manual", "pending"):
        summary_parts.append(f"{key}: {status_counts[key]}")
    console.print("[dim]" + " | ".join(summary_parts) + "[/dim]")


@metadata_group.command("clear")
@click.argument("song_id", metavar="SONG_ID", required=False, default=None)
@click.option("--all", "clear_all", is_flag=True, default=False,
              help="Clear ALL song metadata and lyrics entries.")
@click.option("--force", is_flag=True, default=False,
              help="Skip confirmation prompt.")
def metadata_clear_cmd(song_id: str | None, clear_all: bool, force: bool) -> None:
    """Clear metadata entries for a song or all songs.

    \b
    Removes SongMetadata and SongLyrics entries so the song can be re-fetched.
    Does NOT remove ArtistInfo — artist records are shared across songs.

    \b
    Examples:
      mizukilens metadata clear song-1              # clear one song (prompts)
      mizukilens metadata clear song-1 --force      # clear without prompt
      mizukilens metadata clear --all --force       # clear everything, no prompt
    """
    import sys
    import json
    from pathlib import Path
    from mizukilens.metadata import read_metadata_file, write_metadata_file

    # Validate args: either SONG_ID or --all, not both, not neither
    if clear_all and song_id is not None:
        console.print("[red]Error:[/red] SONG_ID and --all cannot be used together.")
        sys.exit(1)
    if not clear_all and song_id is None:
        console.print(
            "[red]Error:[/red] Provide SONG_ID or use --all to clear everything."
        )
        sys.exit(1)

    # Locate MizukiPrism root
    prism_root = _find_prism_root_from_cwd()
    if prism_root is None:
        console.print(
            "[red]Error:[/red] Could not locate MizukiPrism project root "
            "(expected data/songs.json). Run from inside the MizukiPrism directory."
        )
        sys.exit(1)

    songs_path = prism_root / "data" / "songs.json"
    metadata_dir = prism_root / "data" / "metadata"
    metadata_path = metadata_dir / "song-metadata.json"
    lyrics_path = metadata_dir / "song-lyrics.json"

    if clear_all:
        # --- Clear all ---
        metadata_records = read_metadata_file(metadata_path)
        lyrics_records = read_metadata_file(lyrics_path)
        n_meta = len(metadata_records)
        n_lyrics = len(lyrics_records)

        if n_meta == 0 and n_lyrics == 0:
            console.print("[dim]No metadata entries to clear.[/dim]")
            return

        if not force:
            confirmed = click.confirm(
                f"Clear ALL song metadata and lyrics? This will reset {n_meta} entries. [y/N]",
                default=False,
                prompt_suffix=" ",
            )
            if not confirmed:
                console.print("[dim]Cancelled.[/dim]")
                return

        write_metadata_file(metadata_path, [])
        write_metadata_file(lyrics_path, [])
        console.print(
            f"Cleared all song metadata ({n_meta} entries) and lyrics ({n_lyrics} entries)"
        )

    else:
        # --- Clear single song ---
        assert song_id is not None  # narrowed above

        # Load metadata files
        metadata_records = read_metadata_file(metadata_path)
        lyrics_records = read_metadata_file(lyrics_path)

        # Check if there's anything to clear
        has_meta = any(r.get("songId") == song_id for r in metadata_records)
        has_lyrics = any(r.get("songId") == song_id for r in lyrics_records)

        if not has_meta and not has_lyrics:
            console.print(f"No metadata found for song ID '{song_id}'")
            return

        # Look up song display info from songs.json (best effort)
        song_title: str | None = None
        song_artist: str | None = None
        try:
            songs_text = songs_path.read_text(encoding="utf-8")
            all_songs: list[dict] = json.loads(songs_text)
            for s in all_songs:
                if s.get("id") == song_id:
                    song_title = s.get("title", "")
                    song_artist = s.get("originalArtist", "")
                    break
        except (OSError, json.JSONDecodeError) as exc:
            console.print(f"[yellow]Warning:[/yellow] Could not read songs.json: {exc}")

        if song_title is None:
            console.print(
                f"[yellow]Warning:[/yellow] Song ID [bold]{song_id}[/bold] not found in songs.json. "
                "Proceeding with clear anyway."
            )

        # Build confirmation prompt label
        if song_title is not None:
            label = f"'{song_title}'"
            if song_artist:
                label += f" by {song_artist}"
        else:
            label = f"'{song_id}'"

        if not force:
            confirmed = click.confirm(
                f"Clear metadata for {label}?",
                default=False,
            )
            if not confirmed:
                console.print("[dim]Cancelled.[/dim]")
                return

        # Remove entries
        new_meta = [r for r in metadata_records if r.get("songId") != song_id]
        new_lyrics = [r for r in lyrics_records if r.get("songId") != song_id]
        write_metadata_file(metadata_path, new_meta)
        write_metadata_file(lyrics_path, new_lyrics)

        if song_title is not None:
            console.print(f"Cleared metadata for '{song_title}'")
        else:
            console.print(f"Cleared metadata for '{song_id}'")


@metadata_group.command("override")
@click.argument("song_id", metavar="SONG_ID")
@click.option("--album-art-url", "album_art_url", type=str, default=None, metavar="URL",
              help="Manually specify album art URL.")
@click.option("--lyrics", "lyrics_file", type=click.Path(dir_okay=False), default=None, metavar="FILE",
              help="Path to a lyrics file (LRC or plain text).")
def metadata_override_cmd(song_id: str, album_art_url: str | None, lyrics_file: str | None) -> None:
    """Manually override album art URL and/or lyrics for a song.

    \b
    At least one of --album-art-url or --lyrics must be provided.
    LRC format auto-detected: if file contains [MM:SS.xx] timestamps,
    stores as syncedLyrics; otherwise stores as plainLyrics.

    \b
    Sets fetchStatus: 'manual', matchConfidence: 'manual' to prevent
    automatic overwrite by subsequent `metadata fetch` runs.

    \b
    Examples:
      mizukilens metadata override song-1 --album-art-url "https://example.com/cover.jpg"
      mizukilens metadata override song-1 --lyrics song.lrc
      mizukilens metadata override song-1 --album-art-url URL --lyrics song.lrc
    """
    import sys
    import json
    from pathlib import Path
    from mizukilens.metadata import (
        is_lrc_format,
        read_metadata_file,
        write_metadata_file,
        upsert_song_metadata,
        upsert_song_lyrics,
        _now_iso,
    )

    # Validate: at least one option must be provided
    if album_art_url is None and lyrics_file is None:
        console.print(
            "[red]Error:[/red] At least one of [bold]--album-art-url[/bold] or "
            "[bold]--lyrics[/bold] must be provided."
        )
        sys.exit(1)

    # Validate lyrics file exists if provided
    lyrics_path: Path | None = None
    if lyrics_file is not None:
        lyrics_path = Path(lyrics_file).resolve()
        if not lyrics_path.exists():
            console.print(
                f"[red]Error:[/red] Lyrics file not found: [bold]{lyrics_path}[/bold]"
            )
            sys.exit(1)
        if not lyrics_path.is_file():
            console.print(
                f"[red]Error:[/red] Lyrics path is not a file: [bold]{lyrics_path}[/bold]"
            )
            sys.exit(1)

    # Locate MizukiPrism root
    prism_root = _find_prism_root_from_cwd()
    if prism_root is None:
        console.print(
            "[red]Error:[/red] Could not locate MizukiPrism project root "
            "(expected data/songs.json). Run from inside the MizukiPrism directory."
        )
        sys.exit(1)

    songs_path = prism_root / "data" / "songs.json"
    metadata_dir = prism_root / "data" / "metadata"

    # Load songs to validate SONG_ID
    song_title: str | None = None
    song_artist: str | None = None
    try:
        songs_text = songs_path.read_text(encoding="utf-8")
        all_songs: list[dict] = json.loads(songs_text)
        for s in all_songs:
            if s.get("id") == song_id:
                song_title = s.get("title", "")
                song_artist = s.get("originalArtist", "")
                break
    except (OSError, json.JSONDecodeError) as exc:
        console.print(f"[yellow]Warning:[/yellow] Could not read songs.json: {exc}")

    if song_title is None:
        console.print(
            f"[yellow]Warning:[/yellow] Song ID [bold]{song_id}[/bold] not found in songs.json. "
            "Proceeding with override anyway."
        )

    now = _now_iso()

    # --- Album art override ---
    if album_art_url is not None:
        metadata_path = metadata_dir / "song-metadata.json"
        metadata_records = read_metadata_file(metadata_path)

        art_urls = {
            "small": album_art_url,
            "medium": album_art_url,
            "big": album_art_url,
            "xl": album_art_url,
        }
        song_meta_entry: dict = {
            "songId": song_id,
            "fetchStatus": "manual",
            "matchConfidence": "manual",
            "albumArtUrl": album_art_url,
            "albumArtUrls": art_urls,
            "albumTitle": None,
            "deezerTrackId": None,
            "deezerArtistId": None,
            "trackDuration": None,
            "fetchedAt": now,
            "lastError": None,
        }
        metadata_records = upsert_song_metadata(metadata_records, song_meta_entry)
        write_metadata_file(metadata_path, metadata_records)

    # --- Lyrics override ---
    if lyrics_path is not None:
        try:
            lyrics_content = lyrics_path.read_text(encoding="utf-8")
        except OSError as exc:
            console.print(f"[red]Error:[/red] Could not read lyrics file: {exc}")
            sys.exit(1)

        lrc_format = is_lrc_format(lyrics_content)

        lyrics_file_path = metadata_dir / "song-lyrics.json"
        lyrics_records = read_metadata_file(lyrics_file_path)

        if lrc_format:
            synced_lyrics = lyrics_content
            plain_lyrics = None
        else:
            synced_lyrics = None
            plain_lyrics = lyrics_content

        lyrics_entry: dict = {
            "songId": song_id,
            "fetchStatus": "manual",
            "syncedLyrics": synced_lyrics,
            "plainLyrics": plain_lyrics,
            "fetchedAt": now,
            "lastError": None,
        }
        lyrics_records = upsert_song_lyrics(lyrics_records, lyrics_entry)
        write_metadata_file(lyrics_file_path, lyrics_records)

    # --- Output confirmation ---
    console.print()
    if song_title is not None:
        console.print(
            f"[bold]Song:[/bold] {song_title}"
            + (f"  ([dim]{song_artist}[/dim])" if song_artist else "")
        )
    else:
        console.print(f"[bold]Song ID:[/bold] {song_id}")

    overridden: list[str] = []
    if album_art_url is not None:
        overridden.append(f"[green]Album art URL[/green]: {album_art_url}")
    if lyrics_path is not None:
        lyrics_kind = "synced (LRC)" if is_lrc_format(lyrics_content) else "plain text"  # type: ignore[possibly-undefined]
        overridden.append(f"[green]Lyrics[/green]: {lyrics_path.name} ({lyrics_kind})")

    for item in overridden:
        console.print(f"  Overrode {item}")

    console.print(
        f"[dim]fetchStatus: manual | matchConfidence: manual | fetchedAt: {now}[/dim]"
    )


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
