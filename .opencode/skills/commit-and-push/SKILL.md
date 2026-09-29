---
name: commit-and-push
description: Commit at a green checkpoint, rebase, gate, push the agent branch and refresh the PR. Use when finishing a checkpoint or the task DoD.
---

1. Verify the branch matches `agent/<lane>/<TASK-ID>-<slug>` and is not main. Verify
   `.agent/STOP` does not exist.
2. `git status`: only files of this task; nothing secret; no generated drift
   (`pnpm contracts:check`).
3. `pnpm gate` must be green. If red, do not commit — return to the fix loop.
4. Commit: `type(scope): imperative subject` (≤72 chars) + body (why) + trailers `Task: <ID>`,
   `Refs: FR-…`, `Agent: <name>`.
5. `git fetch origin && git rebase origin/main` (if behind). Conflict in contracts/migrations →
   abort and write a blocker. Otherwise re-run `pnpm gate`.
6. `git push -u origin HEAD` (first push doubles as the claim); later pushes
   `git push origin HEAD`.
7. Draft PR on first push; mark ready only when the DoD is met. Report commit SHAs, PR URL, CI
   state.

Push target is always **origin = https://github.com/HanifIsya/temuUNAIR-v2** with the
**HanifIsya** account. Never push to another remote; never `--no-verify`; force only with
`--force-with-lease` on this branch after a rebase.
