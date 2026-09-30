---
id: TMU-OPS-011
title: Loop runnability — ops executor, step dispatcher and merge authority
status: DONE
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
      `lefthook.yml`, `apps/web/eslint.config.mjs`).
- [ ] `pnpm gate` green.

## Files expected to change

- `.opencode/agents/ops-dev.md` (new), `backend-dev.md`, `frontend-dev.md`, `orchestrator.md`
- `scripts/checks/step.mjs` (new), `scripts/checks/scaffold.test.mjs`, `scripts/checks/pending.mjs`
- `package.json`, `.agent/lanes.json`
- `.github/workflows/ci.yml`
- `opencode.json`, `AGENTS.md`
- `docs/05-workflow/01-git-workflow.md`, `02-agent-loop.md`, `08-ci-cd.md`,
  `10-parallel-lanes-and-ownership.md`
- `docs/08-project/tasks/TMU-OPS-002..011.md` (rewrites), `TMU-OPS-012..014.md` (new),
  `TMU-META-001.md` (new)
- `docs/08-project/reviews/TMU-OPS-011.md`, `docs/08-project/backlog.md`,
  `docs/08-project/status.md`

## Out of scope

- Changing the remote or GitHub account.
- Applying branch protection (TMU-OPS-009).
- Implementing the contracts/db/ml/worker packages (their own tasks).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | user approved merge-authority change; loop blocked at step 0 |
| 2026-09-30 | orchestrator | 4 RED | `pnpm test:unit` → 4 failed / 17 passed (corrected at review cycle 1; the original "3 failed / 18 passed" was mis-recorded — see Evidence) |
| 2026-09-30 | ops-dev | 5 GREEN | ops-dev agent, `step.mjs` dispatcher, CI guard, DEC-019 docs, lane map |
| 2026-09-30 | ops-dev | 6 REFACTOR | OPS-002..010 rewritten to name existing owners and in-lane criteria; DEC-019 table rows moved to TMU-META-001 (meta lane, caught by the lane check) |
| 2026-09-30 | ops-dev | 9 REVIEW c1 fix | OPS-012 (Dockerfile, ops) + OPS-013 (test packages, qa) + OPS-014 (workspace glob, ops) split out; agent allowlists widened; dispatcher behaviour tests added; `gh pr merge*` moved to orchestrator agent; red evidence re-run (see Evidence) |
| 2026-09-30 | ops-dev | 9 REVIEW c1 fix 2 | Remaining c1 findings: global `gh pr*` deny restored (was `ask`), owner-agent test now asserts path coverage, lane-table + blank-line, OPS-002 typecheck include note, OPS-013 TC path alignment, review-file CRLF→LF |
| 2026-09-30 | reviewer | 9 REVIEW c2 | verdict **APPROVE** (cycle 2) — all c1 BLOCKERs/MAJORs verified fixed; remaining findings are MINOR follow-ups. `pnpm gate` green 23/23. See `docs/08-project/reviews/TMU-OPS-011.md` |
| 2026-09-30 | git-steward | 10 SHIP | pushed `3553585..5a77105`; PR [#2](https://github.com/HanifIsya/temuUNAIR-v2/pull/2) opened with the full template body; CI all green |
| 2026-09-30 | orchestrator | 12 MERGE GATE | squash-merged as `c066330` (DEC-019; review verdict + CI green on record) |
| 2026-09-30 | docs-keeper | 13 POST-MERGE | status → `DONE`; backlog/status regenerated (TMU-META-001) |

### Plan

1. Write red tests for the four fixes (guard, agent, dispatcher, DEC-019 + owner check).
2. Add `ops-dev` agent and `scripts/checks/step.mjs`; rewire the root scripts. The two decision
   tables are `meta` lane and land in TMU-META-001.
3. Guard `docker-build`; record DEC-019 in the three workflow docs (the two decision tables are
   `meta` lane and land in TMU-META-001).
4. Rewrite OPS-002..010 so each is executable by its owner in its lane.
5. `pnpm gate`.

## Evidence

- Red (re-run, review cycle 1 MAJOR 2): `pnpm test:unit` on a pre-implementation tree
  (`origin/main` + this branch's final test file) → **6 failed / 17 passed** of 23; failing:
  "guards the docker-build CI job until the web Dockerfile exists", "gives every M0 owner agent
  the paths its tasks need", "routes package gate steps through the dispatcher", "dispatches to
  the package when it exists and to the placeholder when it does not", "runs the real command and
  propagates a failing child exit", "codifies the orchestrator merge gate (DEC-019)". The earlier
  "3 failed / 18 passed" was mis-recorded.
- Green: `pnpm gate` → OK gate(quick) passed, 23/23 unit tests (see PR body).
- PR: [#2](https://github.com/HanifIsya/temuUNAIR-v2/pull/2) — merged to `main` as `c066330`
  (squash, 2026-09-30T08:25Z); CI all green on `5a77105` (10 pass, `docker-build` skipped by
  design); main CI green after merge (TMU-OPS-015 records the same for `b7137d3`).
- Review: **APPROVE** — cycle 2, `docs/08-project/reviews/TMU-OPS-011.md` (2026-09-30). No
  BLOCKER/MAJOR open; MINOR follow-ups tracked in the review file.

## Open questions

- Branch protection approval count (review MAJOR 3): DEC-019 grants the orchestrator merge
  authority, but `docs/05-workflow/08-ci-cd.md:51` still says ">=1 approval". TMU-OPS-009 resolves
  this; until then the orchestrator merges on review verdict + CI green.

## Blockers

(none)
