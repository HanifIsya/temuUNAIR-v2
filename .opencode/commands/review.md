---
description: Adversarial review of the current branch
agent: reviewer
subtask: true
---
Branch diff summary:
!`git diff --stat origin/main...HEAD`

Review against the task file for this branch (@docs/08-project/tasks) and write
docs/08-project/reviews/<TASK-ID>.md.

Follow docs/05-workflow/06-code-review-checklist.md. Findings labelled BLOCKER / MAJOR / MINOR
with file:line evidence; verdict APPROVE or CHANGES. Run `pnpm gate` yourself.
