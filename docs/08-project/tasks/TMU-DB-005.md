---
id: TMU-DB-005
title: Ops migration — notifications, prefs, flags, audit_logs (+BE-05 indexes) and M3 seeds
status: DONE
lane: db
slug: db-ops-seeds
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-004]
refs: [BE-05, BE-08, DEC-005, DEC-022]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-DB-005 — Ops migration — notifications, prefs, flags, audit_logs (+BE-05 indexes) and M3 seeds

## Goal

Land `notifications` (`dedupe_key` unique per BE-08), `notification_prefs`, `flags` and
`audit_logs` (append-only: `REVOKE UPDATE, DELETE` from the app role) with the three
auxiliary indexes BE-05 §TMU-DB-005 assigns here (`notifications_user_created_idx`,
`audit_logs_created_idx`, partial `flags_report_idx`). Extend `packages/db/seeds/` to the
BE-05 seed spec: 4 campuses, ~40 locations, 4–6 drop points (synthetic "contoh" pending
DEC-022 confirmation), 12 users (1 admin, 4 moderators, 7 users), 30 mixed reports incl.
3 sensitive, synthetic emails on `example.test` only.

## Acceptance criteria

- [x] Migration includes all four tables, the dedupe unique constraint, audit REVOKEs and BE-05 §TMU-DB-005 indexes.
- [x] Seeds idempotent, deterministic, PII-free (AGENTS.md rule 5); `pnpm db:check` and seed run green.
- [x] Red tests: duplicate dedupe_key rejected; audit UPDATE denied for app role.
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0006_ops.sql`, meta snapshot
- `packages/db/src/schema.ts`, `packages/db/seeds/*`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-005.md`

## Progress log

### 2026-10-04 — backend-dev

1. **RED**: Wrote `tests/db/ops-seeds.test.ts` with 6 tests — all 6 failed (tables missing).
   - creates notifications, notification_prefs, flags, audit_logs tables
   - creates BE-05 §TMU-DB-005 indexes (notifications_user_created_idx, audit_logs_created_idx, flags_report_idx)
   - enforces notifications.dedupe_key unique constraint (duplicate rejected → 23505)
   - rejects UPDATE on audit_logs (append-only via REVOKE → 42501, tested with restricted app role)
   - notification_prefs has correct structure (user_id PK, email_enabled, muted_types)
   - flags table has status column and resolved_by FK

2. **GREEN**: Added 4 tables + 3 indexes to `packages/db/src/schema.ts`; generated migration
   `0006_ops.sql` with rollback note header and `REVOKE UPDATE, DELETE ON audit_logs FROM temuunair`.
   All 6 tests pass; `db:check: ok` (0 drift).

3. **Seeds**: Created `packages/db/seeds/seed.ts` (data) + `run.ts` (runner):
   - 40 locations across 4 campuses (KAMPUS_A 12, KAMPUS_B 10, KAMPUS_C 10, BANYUWANGI 8)
   - 6 drop points (2 Kampus A, 2 Kampus B, 1 Kampus C, 1 Banyuwangi)
   - 12 users (1 admin, 4 moderators by campus, 7 regular users) — all `@example.test`
   - 30 reports (15 LOST + 15 FOUND, 3 sensitive) — deterministic UUIDs, idempotent ON CONFLICT
   - DEC-022 not yet filed; drop point names are synthetic placeholders

4. **Gate**: `pnpm gate` green — 168/168 tests pass (21 test files), db:check ok, contracts:check OK (v1.1.0), ML 7/7.

### Evidence

- Red evidence: `npx vitest run tests/db/ops-seeds.test.ts` → 6 failed (42P01 table not found)
- Green evidence: 6/6 pass; `db:check: ok`; `pnpm gate` → `OK gate(quick) passed` (168/168)
- Review: `docs/08-project/reviews/TMU-DB-005.md`
