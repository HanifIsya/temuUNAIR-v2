---
id: TMU-CTR-001
title: Author contract schemas for ME, preferences and uploads (API-ME-*, API-UPL-*, API-META-02/04)
status: DONE
lane: contracts
slug: contract-me-uploads
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-ARC-001]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-001 — Author contract schemas for ME, preferences and uploads (API-ME-*, API-UPL-*, API-META-02/04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-ME-01..05`,
`API-UPL-01..03`, `API-META-02`, and `API-META-04` per `BE-03` specifications.

## Acceptance criteria

- [x] All ME, UPL, and remaining META endpoints are defined in the route registry with typed Zod schemas.
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `packages/contracts/src/common.ts`
- `packages/contracts/src/enums.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/generate.ts`
- `packages/contracts/src/generate.test.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml`
- `packages/contracts/generated/*`
- `docs/08-project/tasks/TMU-CTR-001.md`
- `docs/08-project/reviews/TMU-CTR-001.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-001-contract-me-uploads` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020, TMU-ARC-001` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Define Zod schemas in common.ts & enums.ts for Me, MeUpdate, AccountDeletionResponse, NotificationPrefs, UploadInitRequest/Response, UploadState, CampusMeta, DropPointMeta; 2) Add 10 route definitions to registry.ts; 3) Add synthetic examples to examples.ts; 4) Extend generate.ts for requestBody and path parameters; 5) Run contracts:build, contracts:check, contracts:lint, contracts:breaking; 6) Run pnpm gate:quick; 7) Write review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | Implemented 10 endpoints in registry.ts with full Zod types and synthetic examples; updated generator for requestBody; all 4 generated contract artefacts updated |
| 2026-10-03 | architect | 7 GATE | `pnpm contracts:check` OK (1.0.0), `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` → `OK gate(quick) passed` (lane check, 140/140 unit tests, contracts, db, ml) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-001.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — contract schema authoring task
- Green: `contracts:check` OK, `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` passed (140/140 unit tests)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-001.md`

## Blockers

(none)
