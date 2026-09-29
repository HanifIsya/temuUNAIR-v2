---
id: WF-GIT
title: Git workflow
status: draft
owner: GS
updated: 2026-09-29
depends_on: ["BLUEPRINT"]
source_refs: ["Blueprint §7.1–7.3"]
---

# Git workflow

Trunk-based, one branch per task. Remote is always `origin` =
**`https://github.com/HanifIsya/temuUNAIR-v2`**, pushed with the **HanifIsya** GitHub account.
The `no-protected-push.sh` hook refuses any other remote.

## Branching model

| Item | Rule |
|---|---|
| `main` | Always releasable. Protected: PR required, ≥1 human approval, required checks green, linear history, no force-push, no direct push (agents included) |
| Task branches | `agent/<lane>/<TASK-ID>-<slug>` e.g. `agent/be/TMU-BE-010-create-report`. Lanes: `docs`, `arch`, `contracts`, `db`, `be`, `fe`, `ml`, `qa`, `ops`, `sec`, `meta` |
| Human branches | `feat/…`, `fix/…`, `docs/…` (same PR rules) |
| Lifetime | Short: aim for < 1 day / < 400 changed lines. Split tasks that grow |
| Merge | **Squash merge**; PR title = the Conventional Commit; the human clicks merge |
| Worktrees | One Orca worktree per active task at `../wt/<TASK-ID>` (fallback: `git worktree add ../wt/<TASK-ID> -b <branch> origin/main`). Remove after merge |
| Tags | `contract-v<semver>` per accepted contract set; `m<N>-<name>` per milestone gate; `v<semver>` for releases |

## Commit conventions

```
<type>(<scope>)<!>: <imperative subject ≤72 chars>

<why, not what — wrap at 100>

Task: TMU-BE-010
Refs: FR-REP-003, API-REP-01
Agent: backend-dev
```

- **Types:** `feat` `fix` `docs` `test` `refactor` `perf` `build` `ci` `chore` `revert`.
- **Scopes:** `web` `api` `worker` `ml` `db` `contracts` `ui` `i18n` `e2e` `docs` `ops` `agents`.
- Breaking contract change: `feat(contracts)!:` + `BREAKING CHANGE:` footer.
- Commits are small logical units (a red-test commit followed by a green commit is fine; squash
  hides it later).

## Push policy — when do agents commit, push, PR, merge?

| Moment | Action | Who | Conditions |
|---|---|---|---|
| **P0 – Claim** | Create branch, empty commit `chore(tasks): claim TMU-XXX`, `git push -u origin HEAD` | git-steward | Task is `TODO`, deps `DONE`, no remote branch already contains the task ID. The remote branch **is the lock** |
| **Commit** | After each green checkpoint (tests + lint + typecheck pass) | dev agents via git-steward | `pnpm gate:quick` green; no secrets; only task files |
| **P1 – First green checkpoint** | Push; open **draft PR** | git-steward | Backs up work, makes progress visible |
| **P2 – Periodic backup** | Push every ~30 min of active work **if** there are unpushed green commits | git-steward | Never push red commits |
| **P3 – Ready** | Rebase on `origin/main`, re-run gate, push, mark PR ready | git-steward | DoD met, reviewer APPROVE, gate green |
| **Before ending a session** | Push green work + write the Progress log; if red, write a WIP note instead of pushing red | orchestrator | Keeps the next session resumable |
| **Merge to `main`** | Human squash-merges | human | CI green, review done, labels correct, contract PRs merged first |
| **Post-merge** | docs-keeper updates status/traceability/changelog in its own small PR | docs-keeper | Task file marked DONE |
| **Milestone gate** | Human tags `m<N>-<name>` on `main` after `gate:full` + E2E + demo | human | §8 exit criteria |

**Never push:** to `main` or any protected branch · with failing tests/lint/typecheck · with
`--no-verify` · secrets or `.env` · force (except `--force-with-lease` to your own agent branch
after a rebase) · out-of-lane files · generated-file drift.

## Rebase rules

`git fetch` → if behind, `git rebase origin/main`. Conflicts in `packages/contracts`,
`docs/04-contracts`, or `packages/db/migrations` ⇒ **abort and write a blocker** (humans
resolve). Other conflicts: resolve, re-run the gate.

- Contract-change PRs (label `contract`) merge before any dependent PR; dependents rebase after.
- Migration PRs (label `migration`): only one open at a time; the scheduler skips `db` tasks
  while another remote `agent/db/*` branch exists.

## Recovery

| Situation | Action |
|---|---|
| Committed on the wrong branch | `git cherry-pick` to the right branch, reset the wrong one (only if unpushed) |
| Pushed a red commit | Push a fix commit; never force-push to shared branches |
| Accidental secret commit | Rotate the secret immediately, write a blocker, then clean history with the human's help |
| Lost work | Check `git reflog`, the remote branch, and the task Progress log |
