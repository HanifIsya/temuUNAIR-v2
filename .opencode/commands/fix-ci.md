---
description: Read failing CI logs, fix in the lane, re-gate and ship
agent: orchestrator
---
CI context:
!`gh pr checks 2>&1`
!`gh run list --limit 3 2>&1`

1. Identify the failing job and read its logs: `gh run view --log-failed`.
2. Confirm the failure is inside this task's lane; if not, write a blocker instead of fixing.
3. Delegate the fix to the lane dev, re-run `pnpm gate`, then `/ship`.
4. Maximum 3 fix attempts; after that label the PR `needs-human` and stop.
