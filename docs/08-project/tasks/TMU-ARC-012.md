---
id: TMU-ARC-012
title: Review and approve Chat Design (12-chat-design.md)
status: DONE
lane: arch
slug: review-chat-design
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-CHAT, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-012 — Review and approve Chat Design (12-chat-design.md)

## Goal

Review `docs/03-architecture/12-chat-design.md` against Blueprint §4.4 (scope, moderation, rate limits,
retention, SSE upgrade path), fix findings, and advance status to `approved`.

## Acceptance criteria

- [x] Chat thread scoping to claims, polling intervals, rate limits, and phase-2 SSE upgrade paths are documented.
- [x] Front-matter `status` is `approved`, with `updated:` bumped.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `docs/03-architecture/12-chat-design.md`
- `docs/08-project/tasks/TMU-ARC-012.md`
- `docs/08-project/reviews/TMU-ARC-012.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | architect | 1 PICK | branch `agent/arch/TMU-ARC-012-review-chat-design` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020` DONE |
| 2026-10-03 | architect | 3 PLAN | 1) Audit 12-chat-design.md against Blueprint §4.4 (claim scoping, 5s polling, 20 msg/min rate limit, SSE upgrade path, moderation visibility); 2) Advance status to approved and updated to 2026-10-03; 3) Run pnpm gate:quick; 4) Write review REV-TMU-ARC-012; 5) Ship |
| 2026-10-03 | architect | 5 GREEN | Verified claim thread scoping, 5s polling with background tab pause, 20 msg/min rate limits, SSE upgrade path, and message indexing; advanced status to approved and updated to 2026-10-03 |
| 2026-10-03 | architect | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-012.md` |
| 2026-10-03 | architect | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — architecture documentation review/approval task
- Green: `pnpm gate:quick` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-012.md`

## Blockers

(none)
