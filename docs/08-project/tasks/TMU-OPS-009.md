---
id: TMU-OPS-009
title: Repo hygiene — branch protection, Dependabot and worktree notes
status: TODO
lane: ops
slug: repo-hygiene
milestone: M0
priority: P2
owner: orchestrator
deps: [TMU-OPS-001]
refs: [WF-CICD, WF-GIT, BLUEPRINT]
created: 2026-09-29
updated: 2026-09-29
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
- CODEOWNERS still carries placeholder handles for the lane owners; this task records which ones
  remain and who owns resolving them.

## Acceptance criteria

- [ ] `.github/dependabot.yml` exists and covers npm, pip (services/ml) and github-actions.
- [ ] `gh api repos/HanifIsya/temuUNAIR-v2/branches/main/protection` output is captured in the
      task evidence showing: PR required, ≥1 approval, required checks, linear history,
      no force-push, no direct push.
- [ ] Secret scanning and push protection are confirmed on (evidence pasted).
- [ ] Remaining placeholder CODEOWNERS handles are listed in the task file with an owner and a
      milestone by which they must be replaced.
- [ ] `pnpm gate` green.

## Files expected to change

- `.github/dependabot.yml`
- `.github/CODEOWNERS` (only comments/placeholders that are now resolved)
- `docs/07-ops/01-local-dev-setup.md` or `docs/05-workflow/03-orca-playbook.md` (worktree note)

## Out of scope

- Changing the remote or the GitHub account.
- Adding required status checks that do not exist yet (they must be green on `main` first).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| | | | |

### Plan

1. Add `.github/dependabot.yml` for npm, pip and actions.
2. Verify and capture branch protection, secret scanning and push protection state.
3. Record unresolved CODEOWNERS placeholders with owners and due milestone.
4. Add the worktree note if missing.
5. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
