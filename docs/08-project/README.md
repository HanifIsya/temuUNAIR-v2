---
id: TASKS-INDEX
title: Tasks and project bookkeeping
status: approved
owner: DK
updated: 2026-09-29
depends_on: ["BLUEPRINT", "DOR-DOD"]
source_refs: ["Blueprint §4.9"]
---

# `docs/08-project/` — tasks and bookkeeping

| Path | Purpose |
|---|---|
| `tasks/TMU-<LANE>-###.md` | One file per task (template below); the scheduler reads its front-matter |
| `backlog.md` | Generated index (`scripts/backlog-index.mjs`) — never hand-edited |
| `status.md` | Generated dashboard: per milestone done/in-progress/blocked |
| `traceability-matrix.md` | G → US → FR → SCR → API → TC → TMU |
| `decisions-log.md` | Chronological DEC/ADR index |
| `blockers/BLK-###.md` | Blocker files |
| `reviews/TMU-###.md` | Reviewer reports |
| `changelog.md` | Keep-a-Changelog format, updated per release |

## Task file template

```markdown
---
id: TMU-BE-010
title: Implement POST /reports
status: TODO            # TODO | IN_PROGRESS | BLOCKED | REVIEW | DONE | CANCELLED
lane: be                # docs | arch | contracts | db | be | fe | ml | qa | ops | sec | meta
milestone: M3
priority: P1            # P0 | P1 | P2 | P3
owner: backend-dev
deps: [TMU-DB-001, TMU-CTR-001]
refs: [FR-REP-001, FR-REP-002, API-REP-01]
created: 2026-09-29
updated: 2026-09-29
---

# TMU-BE-010 — Implement POST /reports

## Goal
One paragraph: the outcome this task delivers.

## Context
Links to FR/US/SCR/contract docs. Any DEC/ADR that constrains it.

## Acceptance criteria
- [ ] Gherkin-derived checks (or links to the AC blocks)
- [ ] ...

## Files expected to change
- `apps/web/src/server/services/reports.ts`
- `apps/web/src/app/api/v1/reports/route.ts`

## Out of scope
Explicitly list adjacent work that is NOT part of this task.

## Progress log
| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 10:00 | orchestrator | plan (≤15 lines) | plan below |
| | | | |

### Plan
1. …

## Evidence
- Red: `pnpm test:unit -- reports` → 4 failing (paste summary)
- Green: `pnpm gate` → passed
- PR: <link>
- Review: docs/08-project/reviews/TMU-BE-010.md

## Blockers
(none)
```

## Rules

1. One task = one branch = one worktree = one PR (P3).
2. Status changes are written to the task file immediately (resumability, P7).
3. `deps` must be `DONE` before start; the scheduler enforces it.
4. `backlog.md` and `status.md` are generated — never edited by hand.
5. Traceability rows are added by the docs-keeper after merge.
6. Lane ids map to `.agent/lanes.json`; a task may not touch files outside its lane.
