---
description: Execute one backlog task end-to-end (plan, red tests, code, gate, review, PR)
agent: orchestrator
---
Task: $ARGUMENTS

Repository state:
!`git status -sb`
!`git branch --show-current`
!`git log --oneline -5`

Task file:
@docs/08-project/tasks/$ARGUMENTS.md

Loop rules:
@docs/05-workflow/02-agent-loop.md

Execute steps 2–12 of the loop for this task only. Stop after the PR is open and CI is green,
or after writing a blocker. Do not start another task.

Remember: pushes go to https://github.com/HanifIsya/temuUNAIR-v2 under the HanifIsya account,
via @git-steward only.
