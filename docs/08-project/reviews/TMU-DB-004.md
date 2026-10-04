---
id: REV-TMU-DB-004
task: TMU-DB-004
title: "Claims and chat migration — claims, claim_answers, messages (+BE-05 indexes)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DB-004 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/db/TMU-DB-004-db-claims-chat`.
Files reviewed: `packages/db/migrations/0005_claims_chat.sql`,
`packages/db/migrations/meta/*`, `packages/db/src/schema.ts`,
`tests/db/claims-chat.test.ts`, `tasks/TMU-DB-004.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All claims and chat domain tables specified in BE-05 are landed in
`0005_claims_chat.sql` and matched in `packages/db/src/schema.ts`:
- `claim_status` PostgreSQL enum matching BE-05 ('SUBMITTED','APPROVED','REJECTED','DISPUTED','COMPLETED','CANCELLED','EXPIRED')
- `claims` table with all columns, status default 'SUBMITTED', handover timestamps
- `claims_one_active_per_claimant` partial unique index on (found_report_id, claimant_id)
  where status IN ('SUBMITTED','APPROVED','DISPUTED')
- `claims_one_approved_per_report` partial unique index on (found_report_id) where status = 'APPROVED'
- `claims_status_idx` on (status, created_at)
- `claim_answers` table with composite PK (claim_id, hint_id) and cascade FK to claims
- `messages` table with `CHECK (char_length(body) <= 1000)` and `messages_claim_created_idx`

Red tests (`tests/db/claims-chat.test.ts`) failed 5/5 before the migration and pass 5/5 after,
including behavioral verification of the partial unique index (second active claim rejected with code 23505)
and message body length constraint (oversized message rejected with code 23514).
`drizzle-kit generate` reports zero drift. `pnpm db:check` passes with `db:check: ok`.
Full `pnpm gate:quick` exits 0 (162/162 unit tests passed).

## Acceptance Criteria Verification

- [x] Forward-only migration `0005_claims_chat.sql` + rollback note in header.
- [x] Two partial unique indexes and two auxiliary indexes created and verified.
- [x] Drizzle schema mirrors BE-05; `pnpm db:check` reports `db:check: ok`.
- [x] Red tests first: `tests/db/claims-chat.test.ts` 5/5 failed on empty DB, 5/5 passed after migration.
- [x] `pnpm gate:quick` green.

## Verdict

**APPROVE.** Clean migration, correct Drizzle schema, red-first live test coverage. Ready to merge to `main`.
