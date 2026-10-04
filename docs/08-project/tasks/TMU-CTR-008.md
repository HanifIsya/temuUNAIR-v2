---
id: TMU-CTR-008
title: Split BE-03 admin locations/drop-points combined rows into per-method API IDs
status: DONE
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
bundled `GET/POST/PATCH` of `/admin/locations[/{id}]` and `…/drop-points[/{id}]` under a
single ID each, but the route registry enforces one method per unique `API-<AREA>-<NN>`
operationId. This task amends `BE-03` with distinct IDs for the list and update surfaces
(`API-ADM-18..21`), registers them, and ships a contract minor version bump
(`CONTRACT_VERSION` 1.0.0 → 1.1.0).

## Decision (option: additive split)

`API-ADM-12/13` keep their merged IDs with the create (`POST`) semantics restated —
`contracts:breaking` validated this as additive (baseline 1.0.0 unchanged → OK, minor bump
allowed). Renumbering/removing the merged rows would have been breaking and required a major
bump + ADR; the additive `API-ADM-18..21` keeps every existing operationId stable.

## Acceptance criteria

- [x] `BE-03` carries distinct IDs (`API-ADM-18..21`) for the locations list/update and
      drop-points list/update operations, and the combined `API-ADM-12`/`API-ADM-13` rows are
      restated as the create/upsert operation only (amendment note in BE-03 + CHANGELOG).
- [x] The new routes are registered in `packages/contracts/src/registry.ts` with typed Zod
      request/response schemas and synthetic examples.
- [x] `docs/04-contracts/CHANGELOG.md` records the amendment and the version bump;
      `CONTRACT_VERSION` 1.0.0 → 1.1.0 (additive = minor per governance).
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking` all green.
- [x] `pnpm gate:quick` green (`gate:full` re-run for the version bump: 66/66 ops, 866 cases).

## Files expected to change

- `docs/04-contracts/backend/BE-03-endpoint-catalog.md`
- `docs/04-contracts/CONTRACT_VERSION`
- `docs/04-contracts/CHANGELOG.md`
- `packages/contracts/src/common.ts` (no new schemas needed — reuses LocationMeta/DropPointMeta/Upserts)
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `packages/contracts/src/contract-lint.test.ts` (VERSION fixture now reads CONTRACT_VERSION instead of pinning 1.0.0)
- `docs/04-contracts/backend/BE-02-openapi.yaml` (generated)
- `packages/contracts/generated/*` (generated)
- `docs/08-project/tasks/TMU-CTR-008.md`
- `docs/08-project/reviews/TMU-CTR-008.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | architect | filed | Follow-up from `REV-TMU-CTR-005` MINOR N1 / `TMU-CTR-005` handoff row |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-008-split-admin-places-verbs` created from `main`; status → `IN_PROGRESS`; dep `TMU-CTR-005` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Choose additive split (keep ADM-12/13 = create; add ADM-18..21) so contracts:breaking stays green; 2) Amend BE-03 rows + explanatory note; 3) Bump CONTRACT_VERSION 1.0.0→1.1.0 (minor, additive) + CHANGELOG entry covering CTR-001..005 and CTR-008; 4) Register 4 routes reusing existing schemas; 5) Examples + registry.test + contract-lint fixture reads the version file; 6) contracts:build/check/lint/breaking + full gate; 7) Review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | 4 new routes registered (ADM-18 GET locations, ADM-19 PATCH location, ADM-20 GET drop-points, ADM-21 PATCH drop-point) reusing paged(LocationMeta/DropPointMeta) and LocationUpsert/DropPointUpsert; BE-03 split + amendment comment; CHANGELOG + version 1.1.0; registry.test.ts and the generated doc assert the new set |
| 2026-10-03 | architect | 7 GATE | First full-gate run red: contract-lint pinned VERSION=1.0.0 vs CONTRACT_VERSION 1.1.0 (root cause, not a weakening — fixture now reads the version file). Re-run: contracts:check OK (1.1.0), lint OK, breaking OK (baseline 1.0.0, additive), gate:full green with 66/66 ops and 866/866 fuzz cases, e2e smoke pass, gitleaks clean |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-008.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated; closes TMU-CTR-005 N1 |

## Evidence

- Red: N/A — contract amendment task; the red-first equivalent is the gate catching the version-fixture pin and the generated-document drift (both fixed at root cause, nothing weakened)
- Green: `contracts:build` regenerates 66 operations; `contracts:check` OK (1.1.0); `contracts:lint` OK; `contracts:breaking` OK (baseline 1.0.0 — additive minor); `pnpm gate:full` → `OK gate(full) passed` (Schemathesis 66/66 ops, 866/866 passed; warnings are mock-server coverage, tracked in TMU-CTR-007 handoff)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-008.md`

## Blockers

(none)
