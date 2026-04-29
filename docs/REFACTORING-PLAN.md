# MizukiPrism Refactoring Plan

This plan keeps the refactor split into small pull requests that each improve
one boundary and leave the product shippable.

## PR 1: Verification Baseline

Goal: make the expected checks discoverable and repeatable before larger code
movement starts.

Scope:
- Add root scripts for fan app, admin Worker, admin UI, and MizukiLens checks.
- Let Playwright start the local Next.js dev server automatically.
- Document the planned PR stack.

Validation:
- Fresh checkout setup: `npm install && npm run install:all`
- `npm run check`
- `npm run test:e2e` when browser coverage is needed.

## PR 2: Canonical Admin Boundary

Goal: remove the ambiguity between the static fan app admin and the
Cloudflare/D1 admin.

Scope:
- Decide the Cloudflare Worker admin is the canonical curator surface.
- Remove the Next.js `/admin` and `/api/*/manage` legacy write surface.
- Move remaining useful static-data edit flows to MizukiLens or the Worker
  admin.
- Update docs and E2E coverage to stop depending on static-export-incompatible
  API routes.

Validation:
- `npm run check`
- targeted admin UI build/typecheck
- updated admin E2E path

## PR 3: Shared Data Contracts

Goal: make song, stream, performance, metadata, playlist, and timestamp
contracts consistent across the fan app, admin app, and pipeline.

Scope:
- Consolidate TypeScript data types under a shared module.
- Add schema validation for `data/songs.json`, `data/streams.json`, and
  metadata JSON.
- Replace duplicate timestamp parsing/formatting helpers where practical.
- Keep Python parsing behavior covered by its existing tests while documenting
  cross-language contract expectations.

Validation:
- contract/schema tests
- `npm run check`

## PR 4: Fan Catalog Decomposition

Goal: reduce `app/page.tsx` from a mixed data/rendering container into smaller
units.

Scope:
- Extract catalog data loading and metadata merging.
- Extract filter state and derived song lists.
- Extract virtualizer setup.
- Split large page regions into focused components without visual changes.

Validation:
- unit tests for filtering/flattening helpers
- existing Playwright catalog/search tests
- `npm run check`

## PR 5: Player State Refactor

Goal: make playback behavior testable without the YouTube iframe.

Scope:
- Move queue, history, deleted-track skipping, repeat, and shuffle transitions
  into pure functions or a reducer.
- Keep YouTube IFrame API integration behind a small adapter.
- Preserve the current `usePlayer` public API during the transition.

Validation:
- reducer/unit tests for playback transitions
- existing playback Playwright tests
- `npm run check`

## PR 6: Admin Backend Modules

Goal: split the Worker backend by domain and reduce database coupling.

Scope:
- Move routes from `admin/src/index.ts` into domain route modules.
- Split `admin/src/db.ts` into repositories/services.
- Reuse existing song rows during bulk import instead of always inserting new
  songs.
- Centralize status transition rules.

Validation:
- admin Worker typecheck
- focused route/repository tests where feasible
- admin UI flows

## PR 7: Admin UI Stamp Editor Split

Goal: make the Stamp Editor easier to change safely.

Scope:
- Extract modals, stream list, performance table, keyboard shortcuts, and
  timestamp actions from `StampEditor.tsx`.
- Move API mutation orchestration into hooks.
- Keep the current UI and shortcuts stable.

Validation:
- admin UI build
- targeted Stamp Editor E2E/manual smoke test

## PR 8: MizukiLens CLI Modules

Goal: reduce `cli.py` into command modules while keeping the tested core
pipeline stable.

Scope:
- Move Click command groups into `commands/`.
- Keep core behavior in existing modules.
- Add the missing MizukiLens README referenced by `pyproject.toml`, or update
  the package metadata to point at an existing file.

Validation:
- `.venv/bin/python3 -m pytest tests -q`
- CLI smoke tests for command registration
