---
id: WF-LANES
title: Parallel lanes and ownership
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["WF-GIT", "WF-ORCA"]
source_refs: ["Blueprint §7.5"]
---

# Parallel lanes and ownership

`.agent/lanes.json` (committed; edit only via an `ops` task) maps each lane to the paths it may
touch. `scripts/check-lane.sh` fails the gate when a branch touches anything else.

## Lane table

| Lane | Orca worktree | Agent | Human reviewer (PDF roles) | Can run parallel with | Serialization constraint |
|---|---|---|---|---|---|
| `docs` / `arch` | `wt/TMU-DOC-…` | spec-writer / architect | Rizaldi (product, F1) | each other, after parents merged | — |
| `contracts` | `wt/TMU-CTR-…` | architect | **BE + FE reviewers** | docs only | one contract PR at a time; merges first |
| `db` | `wt/TMU-DB-…` | backend-dev | Abdul (DB, management) | fe, ml | **one migration PR open at a time** |
| `be` | `wt/TMU-BE-…` | backend-dev | Hanif (API, comms) | fe, ml, qa | needs contract + migration merged |
| `fe` | `wt/TMU-FE-…` | frontend-dev | Abdul (visual) / Rizaldi (report UI) | be, ml | needs contract + MSW merged |
| `ml` | `wt/TMU-ML-…` | ml-dev | Maysha (AI/ML) | be, fe | — |
| `qa` | `wt/TMU-QA-…` | qa-engineer | any | all | red tests for a task go **inside that task's branch** unless it is a QA task |
| `ops` | `wt/TMU-OPS-…` | ops-dev | Hanif | docs | touches CI/hooks: merge alone |
| `sec` / `meta` | `wt/TMU-SEC-…` / post-merge | security-reviewer / docs-keeper | any | all | bookkeeping PRs are tiny and merge fast |

Suggested concurrency: **3–5 worktrees at once**; more multiplies review load and merge
conflicts.

## Cross-lane execution rules (TMU-OPS-011)

Three rules keep every task runnable by its own lane (added after M0 stalled on them):

1. **Root workspace files are ops-only.** `package.json`, `pnpm-workspace.yaml`, `turbo.json`,
   `tsconfig*.json`, `*.config.*`, `scripts/**`, `.github/**`, `.opencode/**` and `.agent/**`
   belong to the `ops` lane. A package task must never need to edit them: it ships its own
   `package.json` scripts and the root dispatcher (`scripts/checks/step.mjs`) routes to it.
2. **Every task names an owner agent that exists** in `.opencode/agents/`. If no agent can edit
   the task's files, the task is not runnable - file it against a lane that has an agent, or
   create the agent first.
3. **Acceptance criteria must be satisfiable inside the task's lane.** If a criterion needs
   another lane's file, it is a `deps` entry or an explicit follow-up task, never a hidden
   requirement on the branch.
## Lane semantics

1. `_common` paths (task files, reviews, blockers, lockfile) are allowed for every lane.
2. A lane may not edit another lane's paths — even a one-line fix becomes a task in that lane.
3. `packages/contracts/**` and `docs/04-contracts/**` are **contracts-lane only**.
4. `packages/db/migrations/**` is **db-lane only** and serialized globally.
5. If a task genuinely needs a file outside its lane, stop and file a blocker (the lane map may
   need an `ops` change, or the task must be split).

## CODEOWNERS

`.github/CODEOWNERS` maps paths to the human reviewers above. Replace the placeholder handles
with real GitHub logins before M3. Contracts, migrations, security docs and agent config have
explicit owners.

## Scheduler interaction

`scripts/next-task.mjs`:

- skips tasks whose `deps` are not `DONE`;
- skips tasks that already have a remote `agent/*/<ID>-*` branch (the branch is the lock);
- skips `db` tasks while another remote `agent/db/*` branch exists;
- respects `--lane` and `--milestone` filters;
- sorts by milestone, then priority, then id.

## Conflict prevention

| Risk | Mitigation |
|---|---|
| Two agents editing `pnpm-lock.yaml` | only dependency changes touch it; rebase and regenerate |
| Contract drift | contract PR merges first; dependents rebase after |
| Migration number collisions | global migration lock (one open PR) |
| Same file in two lanes | lane map prevents it; blockers resolve edge cases |
| Review overload | concurrency cap; tiny bookkeeping PRs (`meta`) |
