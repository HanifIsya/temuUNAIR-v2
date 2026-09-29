---
id: WF-ORCA
title: Orca playbook
status: draft
owner: GS
updated: 2026-09-29
depends_on: ["WF-LOOP", "WF-GIT"]
source_refs: ["Blueprint §7.5, §7.7"]
---

# Orca playbook

Orca (the ADE by `stablyai/orca`) runs CLI agents side-by-side, one git worktree per task, with
built-in diff review and GitHub PR/checks integration. Verify flags with `orca --help` for your
installed version; everything here has a plain-git fallback.

## One-time setup

1. Open `E:\TemuUNAIR-v2` (or the clone path) in Orca.
2. Confirm the remote: `git remote -v` → `origin https://github.com/HanifIsya/temuUNAIR-v2`.
3. Install the Orca CLI skill so agents can post progress to worktree comments (optional):
   `npx skills add https://github.com/stablyai/orca --skill orca-cli`.
4. If Orca keeps worktrees inside the repo, ensure `.orca/` is gitignored (it is).
5. Optional per-worktree setup hook → `scripts/worktree-setup.sh` (`pnpm i --frozen-lockfile`,
   copy `.env.example` → `.env`, start compose services).

## Worktree naming and lifecycle

| Item | Rule |
|---|---|
| Path | `../wt/<TASK-ID>` (siblings of the repo, not nested) |
| Branch | `agent/<lane>/<TASK-ID>-<slug>` from `origin/main` |
| Creation | Orca UI, or `git worktree add ../wt/<TASK-ID> -b <branch> origin/main` |
| Teardown | After merge: remove the worktree in Orca, then `git worktree prune` and delete the local branch |
| Concurrency | 3–5 worktrees at once; more multiplies review load and conflicts |

## Per-task flow

1. `/next` (or `node scripts/next-task.mjs --lane be`) → get the task ID.
2. Create the worktree; open a terminal pane.
3. Launch OpenCode in the worktree: `opencode`.
4. Run `/task TMU-XXX`.
5. Watch the diff in Orca's review view; answer blockers via the task file or terminal.
6. When the agent says the PR is ready: read `docs/08-project/reviews/<ID>.md`, then merge in
   GitHub (squash). Orca's checks view shows CI status.
7. Teardown the worktree.

## Reading agent progress

- The **task file** is the source of truth: `status`, `Progress log`, evidence.
- `git diff --stat origin/main...HEAD` inside the worktree shows scope.
- `pnpm gate` output is pasted into the Progress log at each checkpoint.
- If Orca worktree comments are enabled, the agent appends short checkpoint notes; treat them as
  hints, verify in git.

## Reviewing a diff (human)

Use Orca's review view or GitHub; checklist: `docs/05-workflow/06-code-review-checklist.md`.
Red flags to catch fast: out-of-lane files, contract edits in a feature PR, generated-file
drift, weakened tests, secrets, private fields in responses, missing i18n keys.

## GitHub integration

- Orca shows PR checks; the same is available with `gh pr checks --watch`.
- Labels (`contract`, `migration`, `breaking`, `docs-only`, `needs-human`) drive merge order.
- Never merge from the CLI without reading the review file.

## Fallback (no Orca)

```bash
git worktree add ../wt/TMU-BE-010 -b agent/be/TMU-BE-010-create-report origin/main
cd ../wt/TMU-BE-010 && pnpm i --frozen-lockfile && opencode
# ... work ...
git worktree remove ../wt/TMU-BE-010
```

Everything else (loop, gates, PRs) is identical — Orca is a convenience, not a dependency.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Worktree missing node_modules | `pnpm i --frozen-lockfile` in the worktree |
| Ports clash between worktrees | use the per-worktree `PORT`/compose project name; only one compose stack per host is assumed for dev |
| Stale branch after a contract merge | `git fetch && git rebase origin/main` inside the worktree |
| Agent started in the main repo | stop it, recreate the worktree, relaunch |
| Orca not picking up `.opencode` config | restart OpenCode after config changes (config is loaded once) |
