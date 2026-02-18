"""Tests for mizukilens CLI entry point and stub commands."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import patch

import pytest
from click.testing import CliRunner

from mizukilens.cli import main


class TestCliHelp:
    """Verify the root --help output."""

    def test_help_shows_all_subcommands(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["--help"])
        assert result.exit_code == 0
        for cmd in ("config", "fetch", "review", "export", "import", "status", "cache"):
            assert cmd in result.output

    def test_module_invocable(self) -> None:
        """Ensure the entry-point function exists and is callable."""
        assert callable(main)


class TestStubCommands:
    """Stub commands should exit cleanly and print an informational message."""

    def test_fetch_stub(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["fetch"])
        assert result.exit_code == 0
        assert "stub" in result.output.lower() or "実装" in result.output

    def test_review_stub(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["review"])
        assert result.exit_code == 0

    def test_export_stub(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["export"])
        assert result.exit_code == 0

    def test_import_stub_no_args(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["import"])
        assert result.exit_code == 0

    def test_status_stub(self) -> None:
        runner = CliRunner()
        result = runner.invoke(main, ["status"])
        assert result.exit_code == 0

    def test_cache_clear_stub(self) -> None:
        runner = CliRunner()
        # Answer "n" to the confirmation prompt — should exit cleanly
        result = runner.invoke(main, ["cache", "clear"], input="n\n")
        assert result.exit_code == 0


class TestConfigCommand:
    """Integration tests for the config subcommand."""

    def test_config_first_run_prompts(self, tmp_path: Path) -> None:
        """When no config exists, config command should prompt the user."""
        runner = CliRunner()
        missing_cfg = tmp_path / "config.toml"

        # Provide valid UC channel ID via stdin
        with (
            patch("mizukilens.config.CONFIG_PATH", missing_cfg),
            patch("mizukilens.config.CONFIG_DIR", tmp_path),
        ):
            result = runner.invoke(
                main,
                ["config"],
                input="UCxxxxxxxxxxxxxxxxxxxxxx\nMizuki Test\n",
                catch_exceptions=False,
            )

        assert result.exit_code == 0
        assert missing_cfg.exists(), "Config file should have been created"

    def test_config_first_run_invalid_url_shows_error(self, tmp_path: Path) -> None:
        """Invalid channel input should show the error message and re-prompt."""
        runner = CliRunner()
        missing_cfg = tmp_path / "config.toml"

        with (
            patch("mizukilens.config.CONFIG_PATH", missing_cfg),
            patch("mizukilens.config.CONFIG_DIR", tmp_path),
        ):
            # First input is invalid, second is valid
            result = runner.invoke(
                main,
                ["config"],
                input="not-a-channel\nUCxxxxxxxxxxxxxxxxxxxxxx\nMizuki\n",
                catch_exceptions=False,
            )

        assert result.exit_code == 0
        assert "無法解析頻道 ID，請確認格式" in result.output

    def test_config_existing_shows_settings(self, tmp_path: Path) -> None:
        """When config already exists, the command shows current settings."""
        import sys
        if sys.version_info >= (3, 11):
            import tomllib
        else:
            import tomli as tomllib
        import tomli_w

        cfg_file = tmp_path / "config.toml"
        cfg: dict[str, Any] = {
            "default": {"active_channel": "mizuki"},
            "channels": {
                "mizuki": {
                    "id": "UCxxxxxxxxxxxxxxxxxxxxxx",
                    "name": "Mizuki",
                    "keywords": ["歌回"],
                },
            },
            "cache": {"path": "~/.local/share/mizukilens/cache.db"},
            "export": {"output_dir": "~/.local/share/mizukilens/exports"},
        }
        with cfg_file.open("wb") as fh:
            tomli_w.dump(cfg, fh)

        runner = CliRunner()
        with (
            patch("mizukilens.config.CONFIG_PATH", cfg_file),
            patch("mizukilens.config.CONFIG_DIR", tmp_path),
        ):
            # Choose 'q' to quit without modification
            result = runner.invoke(
                main,
                ["config"],
                input="q\n",
                catch_exceptions=False,
            )

        assert result.exit_code == 0
        # Current config should be displayed
        assert "mizuki" in result.output

    def test_config_url_with_at_handle(self, tmp_path: Path) -> None:
        """@handle URL should be accepted and saved."""
        runner = CliRunner()
        missing_cfg = tmp_path / "config.toml"

        with (
            patch("mizukilens.config.CONFIG_PATH", missing_cfg),
            patch("mizukilens.config.CONFIG_DIR", tmp_path),
        ):
            result = runner.invoke(
                main,
                ["config"],
                input="https://www.youtube.com/@MizukiStar\nMizuki\n",
                catch_exceptions=False,
            )

        assert result.exit_code == 0
        assert missing_cfg.exists()

        import sys
        if sys.version_info >= (3, 11):
            import tomllib
        else:
            import tomli as tomllib

        with missing_cfg.open("rb") as fh:
            saved = tomllib.load(fh)

        # The handle should be stored
        active_key = saved["default"]["active_channel"]
        assert saved["channels"][active_key]["id"] == "MizukiStar"

    def test_config_toml_structure_matches_spec(self, tmp_path: Path) -> None:
        """Saved TOML should have [default], [channels.*], [cache], [export] sections."""
        runner = CliRunner()
        missing_cfg = tmp_path / "config.toml"

        with (
            patch("mizukilens.config.CONFIG_PATH", missing_cfg),
            patch("mizukilens.config.CONFIG_DIR", tmp_path),
        ):
            result = runner.invoke(
                main,
                ["config"],
                input="UCxxxxxxxxxxxxxxxxxxxxxx\nMizuki\n",
                catch_exceptions=False,
            )

        assert result.exit_code == 0

        import sys
        if sys.version_info >= (3, 11):
            import tomllib
        else:
            import tomli as tomllib

        with missing_cfg.open("rb") as fh:
            saved = tomllib.load(fh)

        # Spec §4.3.3 required keys
        assert "default" in saved
        assert "active_channel" in saved["default"]
        assert "channels" in saved
        active_ch = saved["default"]["active_channel"]
        assert active_ch in saved["channels"]
        ch = saved["channels"][active_ch]
        assert "id" in ch
        assert "name" in ch
        assert "keywords" in ch
        assert isinstance(ch["keywords"], list)
        assert "cache" in saved
        assert "path" in saved["cache"]
        assert "export" in saved
        assert "output_dir" in saved["export"]
