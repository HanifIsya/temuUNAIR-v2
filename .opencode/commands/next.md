---
description: Print the next runnable task and propose the worktree/branch to create
agent: orchestrator
---
Run the scheduler and report the result:

!`node scripts/next-task.mjs $ARGUMENTS`

Then:
1. Show the task's front-matter (`node scripts/next-task.mjs --show <ID>`).
2. Propose the branch `agent/<lane>/<ID>-<slug>` and worktree `../wt/<ID>`.
3. List the files the task expects to touch and confirm they are inside the lane
   (`.agent/lanes.json`).
4. Do not start the task — wait for the human to create the worktree.
