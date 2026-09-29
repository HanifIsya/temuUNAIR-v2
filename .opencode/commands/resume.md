---
description: Recover after a crash or new session and continue the current task
agent: orchestrator
---
Recovery context:
!`git branch --show-current`
!`git status -sb`
!`git log --oneline -10`
!`git diff --stat origin/main...HEAD`

Identify the task from the branch name (`agent/<lane>/<TASK>-slug`), read its task file Progress
log, compare it with the diff, and continue from the first unfinished loop step. Do not redo
completed steps.

If the tree contains changes you cannot explain, stop and write a blocker.
