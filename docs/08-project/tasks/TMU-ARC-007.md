---
id: TMU-ARC-007
title: Review and approve ML Evaluation Plan (07-ml-evaluation-plan.md)
status: DONE
lane: arch
slug: review-ml-eval-plan
milestone: M2
priority: P2
owner: ml-dev
deps: [TMU-DOC-020]
refs: [ML-EVAL, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-007 — Review and approve ML Evaluation Plan (07-ml-evaluation-plan.md)

## Goal

Review `docs/03-architecture/07-ml-evaluation-plan.md` against Blueprint §4.4 (dataset spec, Recall@k,
MRR, precision at threshold, acceptance targets, error analysis), fix findings, and advance status to `approved`.

## Acceptance criteria

- [x] Eval dataset requirements and metrics targets (Recall@5, MRR) are documented.
- [x] Front-matter `status` is `approved`, with `updated:` bumped.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `docs/03-architecture/07-ml-evaluation-plan.md`
- `docs/08-project/tasks/TMU-ARC-007.md`
- `docs/08-project/reviews/TMU-ARC-007.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | ml-dev | 1 PICK | branch `agent/arch/TMU-ARC-007-review-ml-eval-plan` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020` DONE |
| 2026-10-03 | ml-dev | 3 PLAN | 1) Audit 07-ml-evaluation-plan.md against Blueprint §4.4 (dataset specs, evaluation metrics Recall@k, MRR, Precision, harness run protocol, threshold policies); 2) Advance status to approved and updated to 2026-10-03; 3) Run pnpm gate:quick; 4) Write review REV-TMU-ARC-007; 5) Ship |
| 2026-10-03 | ml-dev | 5 GREEN | Verified dataset split rules, 7 testable metrics, harness procedure, and error analysis taxonomy; advanced status to approved and updated to 2026-10-03 |
| 2026-10-03 | ml-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-007.md` |
| 2026-10-03 | ml-dev | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — architecture documentation review/approval task
- Green: `pnpm gate:quick` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-007.md`

## Blockers

(none)
