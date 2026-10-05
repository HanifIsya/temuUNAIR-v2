---
id: TMU-ARC-008
title: Review and approve Async Jobs and Queues (08-async-jobs-and-queues.md)
status: DONE
lane: arch
slug: review-async-jobs-queues
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-JOBS, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-008 — Review and approve Async Jobs and Queues (08-async-jobs-and-queues.md)

## Goal

Review `docs/03-architecture/08-async-jobs-and-queues.md` against Blueprint §4.4 (queues, retries,
idempotency, dead-letter, cron jobs, pg-boss), fix findings, and advance status to `approved`.

## Acceptance criteria

- [x] All pg-boss queues, job payloads, backoff policies, and dead-letter handling are documented.
- [x] Front-matter `status` is `approved`, with `updated:` bumped.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `docs/03-architecture/08-async-jobs-and-queues.md`
- `docs/08-project/tasks/TMU-ARC-008.md`
- `docs/08-project/reviews/TMU-ARC-008.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/arch/TMU-ARC-008-review-async-jobs-queues` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Audit 08-async-jobs-and-queues.md against Blueprint §4.4 (8 pg-boss queues, retries, idempotency, dead-letter with needs_reprocess, cron sweeps); 2) Advance status to approved and updated to 2026-10-03; 3) Run pnpm gate:quick; 4) Write review REV-TMU-ARC-008; 5) Ship |
| 2026-10-03 | architect | 5 GREEN | Verified 8 pg-boss queues, idempotency rules, retry backoff, dead-letter handling with needs_reprocess, and WIB scheduling; advanced status to approved and updated to 2026-10-03 |
| 2026-10-03 | architect | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-008.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — architecture documentation review/approval task
- Green: `pnpm gate:quick` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-008.md`

## Blockers

(none)
