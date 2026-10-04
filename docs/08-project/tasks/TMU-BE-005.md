---
id: TMU-BE-005
title: META handlers (API-META-01..04) — categories, campuses, locations, drop points
status: TODO
lane: be
slug: be-meta-handlers
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-003]
refs: [BE-03, API-META-01..04, FR-REP, DEC-005, DEC-022]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-BE-005 — META handlers (API-META-01..04) — categories, campuses, locations, drop points

## Goal

Serve the four `/api/v1/meta/*` catalog endpoints from the registry: static category meta
(`CategoryMeta[]` with `labelKey`, `isSensitive`, hint prompt suggestions), campuses,
`locations?campus=` (`VALIDATION_FAILED` on bad campus filter) and
`drop-points?campus=`. Drop points read seeded data — synthetic "contoh" entries stand
until the real list lands (DEC-005/DEC-022 due M3 seeds).

## Acceptance criteria

- [ ] `expectMatchesContract` for all four API-META ids; authn user-level.
- [ ] Sensitive categories flagged exactly per the shared `Category` enum + metadata table.
- [ ] Unknown `campus` filter rejected with validation error, never a 500.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/meta/**/route.ts`, `apps/web/src/server/services/meta.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-005.md`
