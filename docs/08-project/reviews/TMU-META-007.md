---
id: REV-TMU-META-007
task: TMU-META-007
title: "File the M3 task breakdown (TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-META-007 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/meta/TMU-META-007-file-m3-backlog`.
Files reviewed: 22 new task files under `docs/08-project/tasks/` (DB×5, BE×8, FE×6,
META-008, OPS-034, QA-001) + `TMU-META-007.md` itself + regenerated `backlog.md`/`status.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 1 MINOR (fixed during review, no re-cycle).
The M3 "Walking skeleton" roadmap row is decomposed into 22 task files covering the named
ranges (TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006) plus the three gaps the M2 exit
handoff identified (contract-doc governance sweep, compose bring-up, walking-skeleton E2E).
Every filed task inherits the loop's DoR/DoD structure and references merged contracts
(BE-01..13, FE-01..12, ARCH-*, DEC-*, ADR-*). The dependency chain is acyclic and starts at
`TMU-DB-001`, which `scripts/next-task.mjs` now returns — M3 is deterministically schedulable.

## Checks run

- `node scripts/backlog-index.mjs` — 94 tasks indexed, M3 rows present, statuses consistent.
- `node scripts/next-task.mjs` — returns `TMU-DB-001` (was "No runnable task" before this branch).
- `node task-fm-audit.cjs` — 22 filed files: IDs match filenames, all 8 scheduler fields present,
  every `deps` entry resolves to an existing file, DFS finds no cycles.
- `bash scripts/check-lane.sh` — green against local `main`.
- `pnpm gate:quick` — `OK gate(quick) passed` (140/140 unit, contracts, i18n 70×2).

## Content verification against merged sources

- **BE-05 §"Domain additions"**: DB-003/004/005 carry the `needs_reprocess`/FTS trigger,
  `claims_status_idx`/`messages_claim_created_idx` and notifications/audit/flags index
  statements *at the IDs BE-05 assigns them* — the earlier draft misassignment (DB-002
  claiming BE-05 §TMU-DB-003 content) was corrected before commit; verified by grep of the
  merged BE-05 (lines 127–172).
- **Roadmap IDs**: `TMU-QA-001..009` are unreserved (only QA-010..026 appear in
  `10-roadmap.md`); the file was renamed from the draft QA-006 to QA-001. QA-001 refs the
  correct E2E-01..03 demo scenarios (`docs/06-quality/03-e2e-scenarios.md`).
- **Lanes** (`.agent/lanes.json`, the `REV-TMU-META-004` MAJOR class): BE-001 dropped its
  `.env.example` edit (ops lane → handoff row), BE-002's route path corrected to
  `app/api/auth/[...nextauth]` + `lib/auth.ts`/`middleware.ts` handed to FE-001,
  FE-001 references `/auth/error` (FE-01's route, not the invented `/login/error`),
  OPS-034 owns `infra/docker-compose.yml` (qa lane cannot touch it), META-008's traceability
  path corrected to `docs/08-project/traceability-matrix.md`. All declared file lists now
  match their lane's globs; out-of-lane work is declared as handoffs instead.
- **DEC cross-refs**: DEC-001/021 (magic-link dev fallback) → BE-002; DEC-004 (AES-GCM at
  app level) → DB-002; DEC-022 + synthetic "contoh" drop points → DB-005/BE-005 — consistent
  with the merged decisions log.

## MINOR findings

| ID | Finding | Disposition |
|---|---|---|
| N1 | `TMU-META-007` context bullet 4 read like an internal note-to-self ("per the roadmap's M9 reservation? No —") and the BE-007 H2 carried a wrong ID short-form. | Both corrected in-branch before commit (verified in the final diff). No action needed at execution time. |

## Verdict

**APPROVE.** M2→M3 handoff is complete; the scheduler has a runnable chain again. Next pick
is `TMU-DB-001` (db lane). Reminder for the executor: the db lane serialises migrations —
one open `agent/db/*` branch at a time per `scripts/next-task.mjs`'s rule.
