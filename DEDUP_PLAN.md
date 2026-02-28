# Plan: Song Name Standardization

## Context

The song catalog (`data/songs.json`) has 3,183 songs / 5,125 performances. ~671 title groups have inconsistent naming due to varying case, punctuation, spacing, artist attribution styles, and typos. This creates a messy catalog for fans.

**Goal**: Standardize title and artist names so all entries referring to the same song use identical spelling. **No merging** — every song entry keeps its own performances.

## Approach

### Step 1: Generate a standardization report

Create `tools/find_duplicates.py` that analyzes `songs.json` and outputs `DEDUP_REPORT.md` listing all groups that need name decisions, organized by category:

**Category A — Exact title match, same/similar artist** (~300+ groups)
- Same title (case-insensitive), artist differs only by case/spacing/separators/annotations
- e.g., `"Calc."` appears 7 times with artists like `ジミーサムP`, `ジミーサムP feat.初音ミク`, `ジミーサムP ft. 初音ミク`
- Script picks the most common (or most-performed) variant as the **suggested canonical** title + artist
- User reviews and overrides where needed

**Category B — Fuzzy title matches, same artist** (~100+ groups)
- Similar but not identical titles after normalization
- Subcategories:
  - **B1: Punctuation/spacing** — `"Ahoy!! 我ら宝鐘海賊団"` vs `"Ahoy!!我ら宝鐘海賊団"`
  - **B2: Possible typos** — `"Nerve Enough"` vs `"Never Enough"` (need human confirmation)
- User confirms whether these are the same song or genuinely different

**Category C — Same title, clearly different artists** (~170+ groups)
- Covers or different songs sharing a name
- e.g., `"Shallow"` attributed to `Lady Gaga & Bradley Cooper` vs `浠、汐` (a duet performance)
- Listed for review: user picks canonical artist per sub-group, or marks entries as intentionally distinct (different cover attributions are fine to keep)

### Step 2: User reviews DEDUP_REPORT.md

The report file contains every group with:
- All entries (song ID, current title, current artist, performance count)
- Suggested canonical title + artist (auto-picked)
- A `decision` field per group: `accept` (use suggestion), `override` (user specifies), or `skip` (leave as-is)

User edits the report or a companion JSON decisions file.

### Step 3: Apply standardization

Create `tools/apply_standardization.py` that:
1. Reads a decisions JSON file
2. For each group: updates `title` and `originalArtist` on all entries in the group to the canonical value
3. Writes updated `songs.json` (no entries are deleted, no performances moved)

## Files to create/modify

| File | Action |
|------|--------|
| `tools/find_duplicates.py` | Create — analysis + report generation |
| `DEDUP_REPORT.md` | Generated — human-readable review file |
| `tools/dedup_decisions.json` | Generated — machine-readable decisions (editable) |
| `tools/apply_standardization.py` | Create — applies decisions to songs.json |
| `data/songs.json` | Modified — after user approves standardization |

## Verification

1. Run `find_duplicates.py` → verify report is generated and readable
2. User reviews `DEDUP_REPORT.md`, edits `dedup_decisions.json`
3. Run `apply_standardization.py` → verify song count unchanged (still 3,183)
4. `npm run build` must pass
5. Spot-check standardized songs in dev server
