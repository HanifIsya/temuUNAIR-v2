---
id: TMU-CTR-008
title: Split BE-03 admin locations/drop-points combined rows into per-method API IDs
status: TODO
lane: contracts
slug: split-admin-places-verbs
milestone: M7
priority: P3
owner: architect
deps: [TMU-CTR-005]
refs: [BE-03, FE-02, FE-04, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-008 — Split BE-03 admin locations/drop-points combined rows into per-method API IDs

## Goal

Resolve contract-minor `N1` from `REV-TMU-CTR-005`: `BE-03` rows `API-ADM-12` and `API-ADM-13`
bundle `GET/POST/PATCH` of `/admin/locations[/{id}]` and `/admin/drop-points[/{id}]` under a
single ID each, but the route registry enforces exactly one method per unique
`API-<AREA>-<NN>` operationId. `TMU-CTR-005` therefore registered only the collection-`POST`
upsert for each. This task amends `BE-03` with distinct IDs for the list and update surfaces
and implements them, before any M3 admin UI (`SCR-021`) consumes them.

## Context

- Filed from `REV-TMU-CTR-005` (cycle 1, MINOR N1) and the `TMU-CTR-005` Progress-log handoff row.
- Registry constraint: `packages/contracts/src/lint.ts` `OPERATION_ID_PATTERN = /^API-[A-Z]+-\d{2}$/`
  and the uniqueness rule in `registry.test.ts`.
- Required surfaces for the admin places UI: `GET /admin/locations` (list),
  `PATCH /admin/locations/{id}` (update), and the same two for `drop-points`.
- Contract-change protocol applies (`docs/04-contracts/README.md`): `BE-03` amendment +
  `CHANGELOG.md` entry + `contracts:build|check|lint|breaking` green. Additive optional
  endpoints = minor version bump.
- If `FE-02`/`FE-04` (page data requirements) already reference these surfaces, this task is
  a prerequisite for the affected `TMU-FE-*` admin task.

## Acceptance criteria

- [ ] `BE-03` carries distinct IDs (continuing the `API-ADM-<NN>` sequence from 18) for the
      locations list/update and drop-points list/update operations, and the combined
      `API-ADM-12`/`API-ADM-13` rows are restated as the create/upsert operation only.
- [ ] The new routes are registered in `packages/contracts/src/registry.ts` with typed Zod
      request/response schemas and synthetic examples.
- [ ] `docs/04-contracts/CHANGELOG.md` records the amendment and the version bump.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking` all green.
- [ ] `pnpm gate:quick` green.

## Files expected to change

- `docs/04-contracts/backend/BE-03-endpoint-catalog.md`
- `docs/04-contracts/CONTRACT_VERSION`
- `docs/04-contracts/CHANGELOG.md`
- `packages/contracts/src/common.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml` (generated)
- `packages/contracts/generated/*` (generated)
- `docs/08-project/tasks/TMU-CTR-008.md`
- `docs/08-project/reviews/TMU-CTR-008.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | architect | filed | Follow-up from `REV-TMU-CTR-005` MINOR N1 / `TMU-CTR-005` handoff row |

## Blockers

(none)
