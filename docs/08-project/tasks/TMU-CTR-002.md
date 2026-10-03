---
id: TMU-CTR-002
title: Author contract schemas for reports (API-REP-01..08)
status: DONE
lane: contracts
slug: contract-reports
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-001, TMU-ARC-004]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-002 — Author contract schemas for reports (API-REP-01..08)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-REP-01..08`
per `BE-03` and `BE-05` specifications.

## Acceptance criteria

- [x] All 8 report endpoints are defined in the route registry with typed Zod schemas.
- [x] Cross-field rules (custody, hints, sensitive masking) are reflected in contract types.
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `packages/contracts/src/common.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml`
- `packages/contracts/generated/*`
- `docs/08-project/tasks/TMU-CTR-002.md`
- `docs/08-project/reviews/TMU-CTR-002.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-002-contract-reports` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020, TMU-CTR-001, TMU-ARC-004` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Define Report schemas (ReportCreate, ReportPublic, ReportOwnerView, ReportModeratorView, ReportUpdate, ReportCancelRequest, ReportFlagRequest, ReportFlagResponse) in common.ts; 2) Add routes API-REP-01..08 to registry.ts; 3) Add synthetic examples to examples.ts; 4) Update registry.test.ts; 5) Run contracts:build, check, lint, breaking; 6) Run pnpm gate:quick; 7) Write review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | Implemented ReportCreate, ReportPublic, ReportOwnerView, ReportUpdate and routes API-REP-01..08 in registry.ts with synthetic examples; regenerated all contract artefacts |
| 2026-10-03 | architect | 7 GATE | `pnpm contracts:check` OK (1.0.0), `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` → `OK gate(quick) passed` (lane check, 140/140 unit tests, contracts, db, ml) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-002.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — contract schema authoring task
- Green: `contracts:check` OK, `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` passed (140/140 unit tests)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-002.md`

## Blockers

(none)
