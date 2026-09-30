---
id: TMU-OPS-011
title: Loop runnability — ops executor, step dispatcher and merge authority
status: IN_PROGRESS
lane: ops
slug: ci-guard-and-merge-authority
milestone: M0
priority: P0
owner: ops-dev
deps: [TMU-OPS-001]
refs: [WF-LOOP, WF-LANES, WF-GIT, DEC-019]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-OPS-011 — Loop runnability: ops executor, step dispatcher and merge authority

## Goal

Remove the three structural blockers that stopped the M0 loop after TMU-OPS-001, so every
remaining M0 task is runnable in order: (1) create the missing `ops-dev` executor agent, (2)
route package gate steps through a dispatcher so package tasks never edit root files, (3) guard
the `docker-build` CI job so `main` is not permanently red, and (4) codify DEC-019 (orchestrator
holds merge authority at loop step 12).

## Context

- After TMU-OPS-001 merged, `main`'s CI was red: `docker-build` runs only on `main` and failed on
  a missing `infra/docker/web.Dockerfile` (created in TMU-OPS-003). Step 0 of the loop ("green
  main") could never pass.
- No subagent had edit rights for the `ops` lane (`scripts/**`, `package.json`, `.github/**`,
  `.opencode/**`), so OPS-002/008/009/010 could not be executed by anyone.
- Package tasks (OPS-004/005/006/007) required root `package.json` script edits, which are
  ops-lane, so their acceptance criteria were unsatisfiable on their own branches.
- User decision (2026-09-30): the orchestrator holds merge authority; recorded as DEC-019.

## Acceptance criteria

- [ ] `.opencode/agents/ops-dev.md` exists with edit rights for the ops lane, and the repo has an
      agent that can execute every task's `owner:` field.
- [ ] `scripts/checks/step.mjs` routes `contracts:*`, `db:*`, `seed`, `test:integration`,
      `test:contract`, `test:e2e` to the owning package when present, else the named placeholder.
- [ ] `docker-build` in `ci.yml` skips with a named notice until `infra/docker/web.Dockerfile`
      exists; `main` CI is green after merge.
- [ ] `AGENTS.md`, the agent-loop and git workflow docs describe the MERGE GATE (DEC-019); the
      two decision tables are `meta` lane and are updated by TMU-META-001 in the same PR series.
- [ ] All M0 task files name an existing owner agent and have in-lane, satisfiable criteria.
- [ ] `.agent/lanes.json` covers every file this task adds (`.gitignore`, `.gitleaks.toml`,
      `lefthook.yml`, `tests/tooling/**`).
- [ ] `pnpm gate` green.

## Files expected to change

- `.opencode/agents/ops-dev.md` (new)
- `scripts/checks/step.mjs` (new), `scripts/checks/scaffold.test.mjs`, `scripts/checks/pending.mjs`
- `package.json`, `.agent/lanes.json`
- `.github/workflows/ci.yml`
- `opencode.json`, `AGENTS.md`
- `docs/05-workflow/01-git-workflow.md`, `02-agent-loop.md`, `10-parallel-lanes-and-ownership.md`
- `docs/08-project/decisions-log.md`, `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-OPS-002..010.md` (rewrites), `docs/08-project/tasks/TMU-OPS-011.md`

## Out of scope

- Changing the remote or GitHub account.
- Applying branch protection (TMU-OPS-009).
- Implementing the contracts/db/ml/worker packages (their own tasks).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | user approved merge-authority change; loop blocked at step 0 |
| 2026-09-30 | orchestrator | 4 RED | `pnpm test:unit` → 3 failed / 18 passed (docker-build guard, ops-dev agent, merge-gate docs, owner-agent check) |
| 2026-09-30 | ops-dev | 5 GREEN | ops-dev agent, `step.mjs` dispatcher, CI guard, DEC-019 docs, lane map |
| 2026-09-30 | ops-dev | 6 REFACTOR | OPS-002..010 rewritten to name existing owners and in-lane criteria; DEC-019 table rows moved to TMU-META-001 (meta lane, caught by the lane check) |

### Plan

1. Write red tests for the four fixes (guard, agent, dispatcher, DEC-019 + owner check).
2. Add `ops-dev` agent and `scripts/checks/step.mjs`; rewire the root scripts.
3. Guard `docker-build`; record DEC-019 in the two decision tables and the three workflow docs.
4. Rewrite OPS-002..010 so each is executable by its owner in its lane.
5. `pnpm gate`.

## Evidence

- Red: `pnpm test:unit` → 3 failed / 18 passed; failures: "guards the docker-build CI job until
  the web Dockerfile exists", "ships an ops-dev agent that can edit the ops lane", "codifies the
  orchestrator merge gate (DEC-019)".
- Green: `pnpm gate` → OK gate(quick) passed (see PR body).
- PR: (pending)
- Review: (pending)

## Blockers

(none)