---
id: TMU-DOC-020
title: M1 exit checklist, docs-approval evidence and M2 handoff
status: DONE
lane: docs
slug: m1-exit-checklist
milestone: M1
priority: P1
owner: orchestrator
deps: [TMU-DOC-019, TMU-META-005]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-020 — M1 exit checklist, docs-approval evidence and M2 handoff

## Goal

Prove the M1 exit criteria from the roadmap row are met, compile the evidence in this task file,
run the full gate, and hand M2 off cleanly — the mirror image of what `TMU-OPS-010` did for M0.

## Context

- Roadmap M1 row: every `docs/01-product/**` and `docs/02-design/**` doc merged and approved;
  PDF + logo added; OQ-1..OQ-5 answered or deferred with DEC; key tasks `TMU-DOC-001..020`
  (+ `TMU-OPS-033`); human gate "**Docs approved** — no code before this".
- `TMU-META-005` (meta lane) is a dependency: it applies the `TMU-DOC-003`/`008`/`019` handoffs
  to `decisions-log.md` and `traceability-matrix.md` — both meta-lane-only, unreachable from
  this task's docs branch — so the exit evidence can honestly claim the registers are current.
- Human gate: the tag `m1-docs` on `main` is applied by the human (milestone tagging rule) —
  this task records the gate as pending human, it does not tag.
- Known caveats to report honestly, not hide: `logo.png` may still be the placeholder
  (`TMU-DSG-001` unfiled); `docs/_source/README.md` verification of the extract is outstanding
  if not done; OQ-2..5 are deferred under DEC (that satisfies the exit clause).
- `pnpm gate:full` is the M-level evidence standard set by `TMU-OPS-010`; run it here too.

## Acceptance criteria

- [x] Every document under `docs/01-product/**` and `docs/02-design/**` has `status: approved`,
      or an explicitly recorded exception (filed follow-up + DEC) named in the Exit Criteria
      Verification table below.
- [x] `docs/_source/proposal.pdf` is tracked; `proposal-extract.md` exists; logo status recorded
      (placeholder caveat OK if the real logo is still with the human).
- [x] OQ-1 answered; OQ-2..OQ-5 deferred with DEC entries — the PRD OQ table shows no
      unanswered row without a DEC.
- [x] `pnpm gate:full` runs green; the tail is pasted into Evidence.
- [x] `docs/08-project/status.md` shows `M1 — 100%` after `node scripts/backlog-index.mjs`
      re-runs with every M1 task `DONE`.
- [x] M2 handoff note written: next runnable task is `TMU-CTR-006` (verify with
      `node scripts/next-task.mjs`).
- [x] Human gate recorded as pending: tag `m1-docs` + "Docs approved" are human actions.

## Files expected to change

- `docs/08-project/tasks/TMU-DOC-020.md`
- `docs/08-project/reviews/TMU-DOC-020.md` (review record, `_common`)
- `docs/08-project/backlog.md` (regenerated)
- `docs/08-project/status.md` (regenerated)

## M1 Exit Criteria Verification Table

| # | Criterion | Evidence | Status |
|---|---|---|---|
| 1 | Every `01-product/**` doc approved | 14/15 approved, 1 review (`13-legal-privacy-drafts.md` with explicit DEC-025 deferral to UNAIR legal/DPO before launch) | ☑ PASS |
| 2 | Every `02-design/**` doc approved | 38/38 approved (including all 23 SCR specs, tokens, brand, wireframes, IA, flows) | ☑ PASS |
| 3 | PDF + logo added (`docs/_source/`) | `proposal.pdf` committed (SHA-256 verified in `TMU-DOC-002`); `proposal-extract.md` drafted; `logo.png` placeholder tracked (`SRC-README` / `TMU-DSG-001`) | ☑ PASS |
| 4 | OQ-1 answered; OQ-2..5 deferred with DEC | OQ-1 answered verbatim in PRD §2.1; OQ-2..5 deferred by DEC-021..024; OQ-6 registered for source fidelity | ☑ PASS |
| 5 | `pnpm gate:full` green | Full gate passed: lane check, prettier, lint, typecheck, i18n, 140/140 unit, contracts, db, ml, breaking, build, integration, contract fuzz, e2e, secret scan, audit | ☑ PASS |
| 6 | Roadmap M1 row matches filed tasks | Aligned in `10-roadmap.md` (`TMU-DOC-001..020, TMU-OPS-033`) | ☑ PASS |
| 7 | Meta registers current | `TMU-META-005` DONE: `decisions-log.md` has DEC-021..025; `traceability-matrix.md` synchronized across all goals | ☑ PASS |
| 8 | Human gate `m1-docs` / Docs approved | Pending human action: tag `m1-docs` on `main` | ⏳ PENDING HUMAN |

## M2 Handoff Note

- **Milestone status:** M1 is 100% complete (24/24 tasks DONE).
- **Next milestone:** M2 (Contracts & Architecture).
- **First runnable task in M2:** `TMU-CTR-006` (author/verify contract package baseline). Verified via `node scripts/next-task.mjs`.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-020-m1-exit-checklist` created from `main` (`2c82300`); status → `IN_PROGRESS`; deps `TMU-DOC-019, TMU-META-005` DONE |
| 2026-10-03 | orchestrator | 5 GREEN | Compiled M1 exit verification table (criteria 1-7 PASS, criterion 8 pending human); verified pnpm gate:full exits 0; documented M2 handoff |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate:full` → `OK gate(full) passed` (lane check, format, lint, typecheck, i18n 70 keys, 140/140 unit, contracts, db, ml, breaking, build, integration, contract fuzz, e2e, secret scan, audit) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-020.md`; M1 exit criteria 100% verified |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated (M1 24/24 DONE, 100%) |

## Evidence

- Red: N/A — milestone exit checklist and verification task; ACs are milestone exit criteria, full gate execution, and handoff verification recorded in Progress log
- Green: `pnpm gate:full` → `OK gate(full) passed`:
```
API Operations:
  Selected: 4/4
  Tested: 4

Test Phases:
  ⏭  Examples
  ✅ Coverage
  ✅ Fuzzing
  ⏭  Stateful (not applicable)

Test cases:
  42 generated, 42 passed

Schemathesis contract fuzz phase: OK

> e2e
  1 passed (7.3s)

> secret scan
no leaks found

> dependency audit
3 vulnerabilities found (Severity: 3 moderate)

OK gate(full) passed
```
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-020.md`

## Blockers

(none)
