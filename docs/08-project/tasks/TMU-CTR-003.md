---
id: TMU-CTR-003
title: Author contract schemas for search and matching (API-SRC-01, API-MAT-01..04)
status: DONE
lane: contracts
slug: contract-search-matching
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-002, TMU-ARC-005]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-003 — Author contract schemas for search and matching (API-SRC-01, API-MAT-01..04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-SRC-01` and
`API-MAT-01..04` per `BE-03` and `MATCH-SPEC`.

## Acceptance criteria

- [x] Search and match endpoints defined with bands, reasons, and no raw score leakage.
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `packages/contracts/src/common.ts`
- `packages/contracts/src/enums.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml`
- `packages/contracts/generated/*`
- `docs/08-project/tasks/TMU-CTR-003.md`
- `docs/08-project/reviews/TMU-CTR-003.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-003-contract-search-matching` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020, TMU-CTR-002, TMU-ARC-005` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Define Search & Match schemas in common.ts & enums.ts (MatchState, SearchRequest, SearchHit, MatchView, RematchResponse, ActionStatusResponse); 2) Add API-SRC-01 and API-MAT-01..04 to registry.ts; 3) Add synthetic examples to examples.ts; 4) Update registry.test.ts; 5) Run contracts:build, check, lint, breaking; 6) Run pnpm gate:quick; 7) Write review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | Implemented SearchRequest, SearchHit, MatchView and routes API-SRC-01, API-MAT-01..04 in registry.ts with synthetic examples; regenerated all contract artefacts |
| 2026-10-03 | architect | 7 GATE | `pnpm contracts:check` OK (1.0.0), `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` → `OK gate(quick) passed` (lane check, 140/140 unit tests, contracts, db, ml) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-003.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — contract schema authoring task
- Green: `contracts:check` OK, `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` passed (140/140 unit tests)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-003.md`

## Blockers

(none)
