---
id: TMU-CTR-009
title: Generator bug — types.ts emits duplicate path keys, breaking typecheck for every generated-client consumer
status: DONE
lane: contracts
slug: fix-generated-paths-dupes
milestone: M3
priority: P1
owner: frontend-dev
deps: []
refs: [BE-02, FE-03, TMU-CTR-007]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-CTR-009 — Generator bug: `types.ts` emits duplicate path keys

## Goal

`buildTypesFile` in `packages/contracts/src/generate.ts` iterates the registry once per
operation and emits one `paths` member per route, so any path served by several HTTP methods
(`/api/v1/me`, `/api/v1/reports`, …) appears as **duplicate keys inside one TypeScript
interface** (`TS2300`/`TS2717`). The contracts package excludes `generated/**` from its own
`tsconfig.json`, so the defect stayed latent until a consumer project typechecked the file —
discovered by `TMU-FE-002` while wiring the generated client (nothing in
`tsconfig.test.json` imported `generated/client.ts` before).

The OpenAPI YAML emitter already merges methods per path (`existingPath` / `pathItem`); the
TS emitter must do the same. No registry, schema, or `CONTRACT_VERSION` change: the yaml,
client and MSW artefacts must remain byte-identical, only `generated/types.ts` changes.

## Acceptance criteria

- [x] Red first: a generator test asserting `paths` declares each path key exactly once, and
      that `/api/v1/me` groups `get` + `patch` + `delete` under one member, fails before the fix.
- [x] `pnpm contracts:build` regenerates `generated/types.ts` with merged path members;
      `pnpm contracts:check` reports no drift and `BE-02-openapi.yaml` is unchanged.
- [x] `tsc --noEmit -p tsconfig.test.json` typechecks a file importing
      `@temuunair/contracts/generated/client` without `TS2300`/`TS2717` (evidence below).
- [x] `pnpm gate` green (red → green evidence in the Progress log).

## Files expected to change

- `packages/contracts/src/generate.ts`, `packages/contracts/src/generate.test.ts`
- `packages/contracts/generated/types.ts` (regenerated)
- `docs/08-project/tasks/TMU-CTR-009.md`

## Progress log

- 2026-10-05 — created by `frontend-dev` while implementing `TMU-FE-002`: a scratch test
  importing `generated/client.ts` turned root typecheck red with `TS2300 Duplicate identifier
  '/api/v1/me'` (×3, plus every other multi-method path). Never-break rule: generator fix is
  contracts lane, so it became this task instead of being smuggled into the FE branch.
- 2026-10-05 — **red evidence**: `pnpm exec vitest run packages/contracts/src/generate.test.ts`
  → `Tests 2 failed | 17 passed (19)`; the uniqueness failure printed
  `duplicates: /api/v1/me,/api/v1/me,/api/v1/me/notification-preferences,/api/v1/reports,
  /api/v1/reports/{id},/api/v1/claims,/api/v1/claims/{id}/messages,/api/v1/admin/locations,
  /api/v1/admin/drop-points: expected 123 to be 132` (9 duplicated keys, 9 extra members).
- 2026-10-05 — **green**: `buildTypesFile` now groups routes with a first-appearance-order
  `Map<path, entries[]>` and emits one interface member carrying every method. Re-run →
  `Tests 19 passed (19)`.
- 2026-10-05 — `pnpm contracts:build` rewritten all four artefacts; `git status` shows only
  `packages/contracts/generated/types.ts` modified (yaml/client/msw byte-identical) and
  `pnpm contracts:check` → `contracts:check OK (version 1.1.0)`.
- 2026-10-05 — **typecheck evidence**: with a transient
  `apps/web/src/features/shell/scratch.test.ts` importing
  `@temuunair/contracts/generated/client`, `tsc --noEmit -p tsconfig.json` → exit 0 and
  `tsc --noEmit -p tsconfig.test.json` → exit 0 (before the fix the latter failed with
  `TS2300`/`TS2717`; scratch removed after the run — `TMU-FE-002`'s hook test keeps the
  import permanently typechecked).
- 2026-10-05 — `pnpm format` clean, `pnpm backlog:build` → `98 tasks`, **`pnpm gate` →
  `Test Files 53 passed (53) / Tests 464 passed (464)`, `contracts:check OK (version 1.1.0)`,
  `OK gate(quick) passed`**.
- 2026-10-05 — review `APPROVE` cycle 1: `docs/08-project/reviews/TMU-CTR-009.md`.
