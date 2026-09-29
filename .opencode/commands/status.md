---
description: Regenerate and show the project status dashboard
agent: docs-keeper
---
Run:
!`node scripts/backlog-index.mjs`

Then show `docs/08-project/status.md` and summarise:
- per-milestone progress,
- blocked tasks and their blockers,
- tasks in REVIEW awaiting a human,
- tasks with unmet dependencies.
Do not edit the generated files by hand.
