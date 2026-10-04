---
id: TMU-DB-004
title: Claims and chat migration — claims, claim_answers, messages (+BE-05 indexes)
status: DONE
lane: db
slug: db-claims-chat
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-003]
refs: [BE-05, ARCH-STATES]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-DB-004 — Claims and chat migration — claims, claim_answers, messages (+BE-05 indexes)

## Goal

Land `claims` (status enum per BE-05, `expires_at`, handover columns), `claim_answers`
(composite PK, cascade), and `messages` (≤1000 char CHECK, `read_at`) with the state-machine
invariants: partial unique indexes `claims_one_active_per_claimant` and
`claims_one_approved_per_report`, plus the auxiliary indexes BE-05 §TMU-DB-004 assigns to
this task (`claims_status_idx`, `messages_claim_created_idx`).

## Acceptance criteria

- [x] Migration reproduces the two partial unique indexes and both BE-05 §TMU-DB-004 indexes.
- [x] Drizzle schema mirrors BE-05; `pnpm db:check` green.
- [x] Red tests: second active claim per claimant rejected; message length CHECK enforced.
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0005_claims_chat.sql`, meta snapshot
- `packages/db/src/schema.ts`
- `tests/db/claims-chat.test.ts`
- `docs/08-project/tasks/TMU-DB-004.md`
- `docs/08-project/reviews/TMU-DB-004.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | 1 PICK | branch `agent/db/TMU-DB-004-db-claims-chat` created from `main`; dep `TMU-DB-003` DONE |
| 2026-10-03 | backend-dev | 2 RED | `tests/db/claims-chat.test.ts` run against scratch DB → **5/5 fail** for the right reason (`claims`, `claim_answers`, `messages` absent) |
| 2026-10-03 | backend-dev | 3 PLAN | 1) Add `claimStatus` enum, `claims` with 2 partial uniques and status index, `claimAnswers` with composite PK, and `messages` with body length CHECK to `schema.ts`; 2) `pnpm db:generate` → `0005_claims_chat.sql`; 3) rollback header; 4) re-run gate |
| 2026-10-03 | backend-dev | 5 GREEN | `tests/db/claims-chat.test.ts` passes 5/5 (including second-claim 23505 and message-length 23514 checks); `pnpm db:check` → `db:check: ok`; all live tests pass |
| 2026-10-03 | backend-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` (162/162 unit tests passed) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 B, 0 M, 0 MINOR) → `docs/08-project/reviews/TMU-DB-004.md` |
| 2026-10-03 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Red: `tests/db/claims-chat.test.ts` 5/5 FAIL against pre-migration DB, 5/5 PASS after migration
- Green: `drizzle-kit generate` reports zero drift; `pnpm db:check` → `db:check: ok`; all live tests pass
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-DB-004.md`

## Blockers

(none)
