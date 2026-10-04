---
id: TMU-BE-005
title: META handlers (API-META-01..04) — categories, campuses, locations, drop points
status: DONE
lane: be
slug: be-meta-handlers
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-003]
refs: [BE-03, API-META-01..04, FR-REP, DEC-005, DEC-022]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-005 — META handlers (API-META-01..04) — categories, campuses, locations, drop points

## Goal

Serve the four `/api/v1/meta/*` catalog endpoints from the registry: static category meta
(`CategoryMeta[]` with `labelKey`, `isSensitive`, hint prompt suggestions), campuses,
`locations?campus=` (`VALIDATION_FAILED` on bad campus filter) and
`drop-points?campus=`. Drop points read seeded data — synthetic "contoh" entries stand
until the real list lands (DEC-005/DEC-022 due M3 seeds).

## Acceptance criteria

- [x] `expectMatchesContract` for all four API-META ids; authn user-level.
      → `handlers/meta.test.ts`: contract parses for META-01..04; 401 `AUTH_REQUIRED` on all four
      when unauthenticated.
- [x] Sensitive categories flagged exactly per the shared `Category` enum + metadata table.
      → values asserted `toEqual([...Category])` (enum loaded via `loadContractEnums()`), sensitive set
      asserted exactly `{BANK_CARD, ID_CARD, WALLET}` per FR-REP-009, `labelKey === "category.<value>"`,
      every entry has ≥ 2 hint prompts (BE-03 style, DEC-014 ≥ 2 hints).
- [x] Unknown `campus` filter rejected with validation error, never a 500.
      → `?campus=KAMPUS_X` → 422 `VALIDATION_FAILED` (`fields[0].path === "campus"`) on locations;
      `?campus=NOPE` → 422 envelope on drop-points.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/meta/**/route.ts`, `apps/web/src/server/services/meta.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-005.md`

## Actual files changed

- `apps/web/src/server/services/meta.ts` — `CATEGORY_META` (19 categories, enum order,
  `SENSITIVE_CATEGORIES = ID_CARD|BANK_CARD|WALLET`), `CAMPUS_META`, `parseCampusParam`
  (zod enum → `VALIDATION_FAILED`), `getCampuses` (adds `locationCount`), `getLocations`,
  `getDropPoints` (jsonb `hours` → display string).
- `apps/web/src/server/repositories/meta.ts` — `PgMetaRepository` (active-only, campus
  filter, `ORDER BY name`, counts grouped by campus).
- `apps/web/src/server/handlers/meta.ts` — `GET_CATEGORIES` / `GET_CAMPUSES` /
  `GET_LOCATIONS` / `GET_DROP_POINTS` via the shared `dispatch` (auth, no CSRF on GET).
- Routes: `app/api/v1/meta/{categories,campuses,locations,drop-points}/route.ts`.
- `apps/web/src/server/contract-test-utils.ts` — added `loadContractEnums()`
  (same non-literal dynamic-import escape hatch; exposes `Category`/`Campus` options).
- Test: `apps/web/src/server/handlers/meta.test.ts` (12 live tests, scratch DB + the M3
  `packages/db/seeds` locations/drop-points SQL applied).

## Progress log

- 2026-10-04 — **picked** via `next-task.mjs`; DoR checked: deps DONE (TMU-BE-003), contract
  entries merged (v1.1.0), AC present, lane covers every file, seeds exist from TMU-DB-005.
- 2026-10-04 — research: `report_images` not involved; catalog = static meta + 2 seeded
  tables (`locations`, `drop_points` from migration 0002, filled by
  `packages/db/seeds/seed.ts` — 40 locations, 6 "contoh" drop points per DEC-022).
  Sensitive set from FR-REP-009 (`ID_CARD`, `BANK_CARD`, `WALLET` sensitive-lite).
  `DropPointMeta.hours` is a string in the contract but jsonb objects in the seed →
  formatted `day: time, …`.
- 2026-10-04 — **red evidence**: `pnpm exec vitest run apps/web/src/server/handlers/meta.test.ts`
  → `Test Files 1 failed (1)` / `Tests no tests` with `Cannot find module './meta'`.
- 2026-10-04 — green: same command → `Test Files 1 passed (1)` / `Tests 12 passed (12)`.
- 2026-10-04 — first `pnpm gate` attempt failed typecheck: (a) two service interfaces were
  imported from the repository instead of declared locally (fixed), (b) the static
  `@temuunair/db/seeds/seed` import pulled `packages/db/seeds/seed.ts` into the typecheck
  program — that db-lane file was never typechecked and fails `noUncheckedIndexedAccess`
  (fixed with the non-literal dynamic import; the file was NOT edited — db lane).
- 2026-10-04 — `pnpm format` + `pnpm gate` → `OK gate(quick) passed` (format, lint,
  typecheck, i18n, unit tests incl. 12 new, contracts:check OK 1.1.0, contracts:lint OK,
  db:check: ok, ML 7/7).

## Contract observations (for a future `TMU-CTR-*`, not changed here)

1. Registry `API-META-04.errors` is empty although BE-03 documents
   `GET /meta/drop-points?campus=` — the endpoint validates the filter like META-03 and
   can emit `VALIDATION_FAILED`.
2. `LocationMeta.building`/`note` are optional in the contract but `locations` has no such
   columns (`kind`, `lat`, `lng` instead) → never returned.
3. `CampusMeta.locationCount` (optional) is populated from active locations so the FE can
   show catalog size without a second query.

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence: red/green commands + gate
tail above; review verdict in `docs/08-project/reviews/TMU-BE-005.md`.
