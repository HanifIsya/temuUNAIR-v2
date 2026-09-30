---
id: TMU-OPS-009
title: Repo hygiene — branch protection, Dependabot and worktree notes
status: TODO
lane: ops
slug: repo-hygiene
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-001]
refs: [WF-CICD, WF-GIT, BLUEPRINT]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-009 — Repo hygiene: branch protection, Dependabot and worktree notes

## Goal

Close the M0 human gate: document and verify the GitHub-side settings (branch protection on
`main`, squash-only merges, secret scanning, Dependabot) and commit the Dependabot config plus
the worktree/remote notes so every later task inherits a protected trunk.

## Context

- M0 exit criteria: "Repo protected; remote = `HanifIsya/temuUNAIR-v2`".
- `docs/05-workflow/08-ci-cd.md` §Branch protection lists the exact settings.
- Blueprint §7.10 requires Dependabot for npm/pip/actions.
- The repo currently has **no** branch protection ("Branch not protected", checked 2026-09-30).
  Applying it needs repo-admin API access, which the agent has via `gh api`; the checks list must
  only name jobs that are green on `main` (lint-typecheck, unit, contracts, migrations, ml,
  integration, contract-fuzz, e2e, secret-scan), not advisory ones (audit, docker-build).
- CODEOWNERS still carries placeholder handles for the lane owners; this task records which ones
  remain and who owns resolving them.

## Acceptance criteria

- [ ] `.github/dependabot.yml` exists and covers npm, pip (services/ml) and github-actions.
- [ ] Branch protection on `main` is applied (PR required, required checks above, linear history,
      no force-push, no direct push) and the `gh api` output is captured in the task evidence.
      **No approval count is required**: DEC-020 lets any agent merge at step 12 and no
      agent can post a GitHub approval, so requiring one would deadlock the loop. If the human
      wants a review gate anyway, keep 1 approval and reword DEC-020 accordingly (recorded as an
      open question in this task).
- [ ] Secret scanning and push protection are confirmed on (evidence pasted).
- [ ] Remaining placeholder CODEOWNERS handles are listed in the task file with an owner and a
      milestone by which they must be replaced.
- [ ] `pnpm gate` green.

## Files expected to change

- `.github/dependabot.yml`
- `.github/CODEOWNERS` (only comments/placeholders that are now resolved)
- `docs/05-workflow/01-git-workflow.md` or `docs/07-ops/01-local-dev-setup.md` (worktree note)

## Out of scope

- Changing the remote or the GitHub account.
- Adding required status checks that do not exist yet (they must be green on `main` first).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev`; branch-protection state confirmed unprotected; checks list pinned to green jobs |

### Plan

1. Add `.github/dependabot.yml` for npm, pip and actions.
2. Apply branch protection via `gh api` and capture the result.
3. Verify secret scanning and push protection; record the state.
4. Record unresolved CODEOWNERS placeholders with owners and due milestone.
5. Add the worktree note; `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Open questions

- Branch-protection approval count: DEC-020 lets any agent merge at step 12 and no agent
  can post a GitHub approval, so this task applies protection **without** a required approval
  count. If the human wants a review gate anyway, keep 1 approval and reword DEC-020 accordingly
  (see the acceptance criterion above).

## Blockers

(none)
