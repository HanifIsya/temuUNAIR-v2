---
id: TMU-DB-004
title: Claims and chat migration — claims, claim_answers, messages (+BE-05 indexes)
status: TODO
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

- [ ] Migration reproduces the two partial unique indexes and both BE-05 §TMU-DB-004 indexes.
- [ ] Drizzle schema mirrors BE-05; `pnpm db:check` green.
- [ ] Red tests: second active claim per claimant rejected; message length CHECK enforced.
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0005_claims_chat.sql`, meta snapshot
- `packages/db/src/schema.ts`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-004.md`
