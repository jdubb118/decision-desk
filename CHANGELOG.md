# Changelog

All notable changes to Decision Desk will be documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/); versions are dated rather than semver-numbered until a formal v1.0 cut.

## [Unreleased]

### Added
- Retention policy: optional auto-null of `html_content` on decided cards older than N days. Keeps decisions and learning records forever; only frees the card bodies. Off by default.
- Rate limiting on write endpoints (defense-in-depth alongside optional auth).
- Hero screenshots in the README.

## [2026-04-16] — Day 3: Docker + optional auth

### Added
- Multi-stage `Dockerfile` (node:22-alpine, non-root `desk` user) and `docker-compose.yml` with persistent `./data` volume.
- Optional bearer-token auth on write endpoints. `DECISION_DESK_WRITE_TOKEN` or `config.auth.write_token` protects every `POST`/`PATCH`/`PUT`/`DELETE` under `/api/*`. Reads remain open.
- `/api/config` now reports `auth_required`.
- `src/authFetch.ts` wraps `window.fetch` once at boot — the reviewer UI auto-injects a localStorage-cached token on writes, prompts on 401/403 and retries.
- Python and Node SDKs now accept `token` in their constructor.

### Changed
- `README.md` rewritten around Docker as the primary quickstart.

## [2026-04-16] — Day 2: config layer + SDKs

### Added
- `config.json` loader with precedence env > file > defaults.
- `GET /api/config` endpoint — frontend hydrates at boot.
- Multi-brand UI: `BrandToggle` in nav, per-brand theming propagates into mockup previews via `brandPalette()` in `src/components/mockups/_shared.tsx`.
- Per-brand `context_path` field overrides `brand_context_dir` for `/api/brand-profile`.
- Python SDK (`sdk/python/decision_desk.py`, stdlib only).
- Node SDK (`sdk/node/index.mjs`, Node 18+ with built-in fetch).
- `examples/basic-agent/` with runnable submit + poll + execute scripts in both languages.

## [2026-04-16] — Day 1: fork + scrub

### Added
- Public repository at `github.com/jdubb118/decision-desk`.

### Removed
- All OpenClaw-specific coupling (jeff-inbox shim, probation auto-write, Telegram spawn, pre-flight checklist subsystem).

### Changed
- Paths resolved via env vars (`DECISION_DESK_DATA_DIR`, `DECISION_DESK_DB`, `DECISION_DESK_SAFE_ROOTS`, `DECISION_DESK_CALENDAR_PATHS`, `DECISION_DESK_BRAND_CONTEXT_DIR`, `DECISION_DESK_WEBHOOK_URL`, `DECISION_DESK_WEBHOOK_SECRET`).
- Defaults bound to `127.0.0.1` instead of `0.0.0.0`.

### Fixed (scrub)
- Stripped personal references (operator name, test identifiers).
- Stripped customer brand DNA from mockup presets (founder names, real domains, handles).
- Replaced every `brand === 'X' ? A : B` ternary with `brandPalette(brand)` lookups so unknown brands get neutral placeholder previews.
