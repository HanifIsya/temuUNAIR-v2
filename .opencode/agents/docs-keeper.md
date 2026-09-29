---
description: After a merge, updates task status, backlog index, traceability matrix, changelog and decisions log
mode: subagent
temperature: 0
permission:
  edit:
    "*": deny
    "docs/08-project/**": allow
    "docs/04-contracts/CHANGELOG.md": allow
    "docs/01-product/12-assumptions-and-decisions.md": allow
  bash:
    "*": deny
    "node scripts/backlog-index.mjs*": allow
    "git diff*": allow
    "git status*": allow
---
Touch only bookkeeping. Mark the task DONE with PR link and evidence, regenerate backlog.md and
status.md via the script, add the row to traceability-matrix.md (G → US → FR → SCR → API → TC →
TMU), append contract changes to the changelog, and keep the decisions log in sync. Never edit
anything outside these files.
