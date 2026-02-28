#!/usr/bin/env bash
# eximport-all.sh — Run mizukilens eximport per-stream for all approved streams.
# Keeps interactive prompts intact so you can confirm/skip each stream.
set -euo pipefail

CACHE_DB="${MIZUKILENS_CACHE:-$HOME/.local/share/mizukilens/cache.db}"
# Resolve MIZUKILENS to absolute path before cd (relative paths would break).
MIZUKILENS="${MIZUKILENS_CMD:-mizukilens}"
if [[ "$MIZUKILENS" == */* && -x "$MIZUKILENS" ]]; then
  MIZUKILENS="$(cd "$(dirname "$MIZUKILENS")" && pwd)/$(basename "$MIZUKILENS")"
fi

# Resolve repo root (eximport needs data/songs.json to be findable from cwd).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [[ ! -f "$REPO_ROOT/data/songs.json" ]]; then
  echo "Error: cannot find data/songs.json under $REPO_ROOT"
  exit 1
fi
cd "$REPO_ROOT"

if [[ ! -f "$CACHE_DB" ]]; then
  echo "Error: cache DB not found at $CACHE_DB"
  echo "Set MIZUKILENS_CACHE to override the path."
  exit 1
fi

if ! command -v sqlite3 &>/dev/null; then
  echo "Error: sqlite3 is required but not found."
  exit 1
fi

if ! command -v "$MIZUKILENS" &>/dev/null && [[ ! -x "$MIZUKILENS" ]]; then
  echo "Error: mizukilens CLI not found at '$MIZUKILENS'."
  echo "Set MIZUKILENS_CMD to override (e.g. path to venv binary)."
  exit 1
fi

# Query exportable streams — eximport accepts both 'approved' and 'exported'.
# Read into array without mapfile (Bash 3.2 compat for macOS).
rows=()
while IFS= read -r line; do
  rows+=("$line")
done < <(
  sqlite3 -separator $'\t' "$CACHE_DB" \
    "SELECT video_id, title, date FROM streams WHERE status IN ('approved', 'exported') ORDER BY date"
)

total=${#rows[@]}
if [[ $total -eq 0 ]]; then
  echo "No approved/exported streams found. Nothing to do."
  exit 0
fi

echo "=== Streams to process: $total ==="
for row in "${rows[@]}"; do
  IFS=$'\t' read -r vid title date <<< "$row"
  echo "  $date  $vid  $title"
done
echo ""

succeeded=0
failed=0
skipped_ids=()

for i in "${!rows[@]}"; do
  IFS=$'\t' read -r vid title date <<< "${rows[$i]}"
  n=$((i + 1))
  echo "--- [$n/$total] $date  $vid  $title ---"

  if "$MIZUKILENS" eximport --stream "$vid"; then
    ((succeeded++))
  else
    rc=$?
    echo "Warning: eximport exited with status $rc for $vid"
    ((failed++))
    skipped_ids+=("$vid")
  fi
  echo ""
done

echo "=== Done ==="
echo "  Succeeded: $succeeded / $total"
if [[ $failed -gt 0 ]]; then
  echo "  Failed:    $failed"
  echo "  Failed IDs:"
  for sid in "${skipped_ids[@]}"; do
    echo "    $sid"
  done
fi
