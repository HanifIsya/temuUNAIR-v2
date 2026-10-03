---
id: TMU-ARC-006
title: Review and approve ML Service Design (06-ml-service-design.md)
status: DONE
lane: arch
slug: review-ml-service-design
milestone: M2
priority: P2
owner: ml-dev
deps: [TMU-DOC-020]
refs: [ML-DESIGN, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-006 — Review and approve ML Service Design (06-ml-service-design.md)

## Goal

Review `docs/03-architecture/06-ml-service-design.md` against Blueprint §4.4 (model choices, preprocessing,
batching, CPU budget, model registry, lockfile, warm-up), fix findings, and advance status to `approved`.

## Acceptance criteria

- [x] CPU-only ViT-B/32 and YOLO-n resource budgets and warm-up procedures are documented.
- [x] Front-matter `status` is `approved`, with `updated:` bumped.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `docs/03-architecture/06-ml-service-design.md`
- `docs/08-project/tasks/TMU-ARC-006.md`
- `docs/08-project/reviews/TMU-ARC-006.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | ml-dev | 1 PICK | branch `agent/arch/TMU-ARC-006-review-ml-service-design` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020` DONE |
| 2026-10-03 | ml-dev | 3 PLAN | 1) Audit 06-ml-service-design.md against Blueprint §4.4 (CPU-only ViT-B/32, YOLO-n, lockfiles, warm-up, SSRF guards); 2) Advance status to approved and updated to 2026-10-03; 3) Run pnpm gate:quick; 4) Write review REV-TMU-ARC-006; 5) Ship |
| 2026-10-03 | ml-dev | 5 GREEN | Verified CPU-only ViT-B/32 and YOLO-n resource budgets, warm-up procedure, models.lock.json registry, and SSRF allowlist; advanced status to approved and updated to 2026-10-03 |
| 2026-10-03 | ml-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-006.md` |
| 2026-10-03 | ml-dev | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — architecture documentation review/approval task
- Green: `pnpm gate:quick` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-006.md`

## Blockers

(none)
