---
id: TMU-DB-005
title: Ops migration — notifications, prefs, flags, audit_logs (+BE-05 indexes) and M3 seeds
status: TODO
lane: db
slug: db-ops-seeds
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-004]
refs: [BE-05, BE-08, DEC-005, DEC-022]
created: 2026-10-03
updated: 2026-10-03
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

- [ ] Migration includes all four tables, the dedupe unique constraint, audit REVOKEs and BE-05 §TMU-DB-005 indexes.
- [ ] Seeds idempotent, deterministic, PII-free (AGENTS.md rule 5); `pnpm db:check` and seed run green.
- [ ] Red tests: duplicate dedupe_key rejected; audit UPDATE denied for app role.
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0006_ops.sql`, meta snapshot
- `packages/db/src/schema.ts`, `packages/db/seeds/*`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-005.md`
