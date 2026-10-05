---
id: TMU-CTR-004
title: Author contract schemas for claims, chat and handover (API-CLM-01..10, API-CHT-01..04)
status: DONE
lane: contracts
slug: contract-claims-chat
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-002, TMU-ARC-004]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-004 — Author contract schemas for claims, chat and handover (API-CLM-01..10, API-CHT-01..04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-CLM-01..10` and
`API-CHT-01..04` per `BE-03` and state machine specifications.

## Acceptance criteria

- [x] All claim, handover, and chat endpoints defined with prompt masking and two-sided confirmation states.
- [x] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `packages/contracts/src/common.ts`
- `packages/contracts/src/registry.ts`
- `packages/contracts/src/examples.ts`
- `packages/contracts/src/registry.test.ts`
- `docs/04-contracts/backend/BE-02-openapi.yaml`
- `packages/contracts/generated/*`
- `docs/08-project/tasks/TMU-CTR-004.md`
- `docs/08-project/reviews/TMU-CTR-004.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/contracts/TMU-CTR-004-contract-claims-chat` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020, TMU-CTR-002, TMU-ARC-004` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Define Claim & Chat schemas in common.ts (Challenge, ClaimCreate, ClaimView, ClaimDecisionRequest, ClaimRejectRequest, HandoverPlanRequest, ClaimDisputeRequest, ChatMessage, ChatMessageCreate, ChatStreamEvent, ChatReadReceiptRequest); 2) Add API-CLM-01..10 and API-CHT-01..04 to registry.ts; 3) Add synthetic examples to examples.ts; 4) Update registry.test.ts; 5) Run contracts:build, check, lint, breaking; 6) Run pnpm gate:quick; 7) Write review; 8) Ship |
| 2026-10-03 | architect | 5 GREEN | Implemented Challenge, ClaimCreate, ClaimView, all claim action requests, ChatMessage and ChatStreamEvent schemas; added API-CLM-01..10 and API-CHT-01..04 routes with synthetic examples; regenerated all contract artefacts |
| 2026-10-03 | architect | 7 GATE | `pnpm contracts:check` OK (1.0.0), `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` → `OK gate(quick) passed` (140/140 unit tests) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-004.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — contract schema authoring task
- Green: `contracts:check` OK, `contracts:lint` OK, `contracts:breaking` OK, `pnpm gate:quick` passed (140/140 unit tests)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-CTR-004.md`

## Blockers

(none)
