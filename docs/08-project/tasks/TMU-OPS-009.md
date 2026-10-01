---
id: TMU-OPS-009
title: Repo hygiene — branch protection, Dependabot and worktree notes
status: DONE
lane: ops
slug: repo-hygiene
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-001]
refs: [WF-CICD, WF-GIT, BLUEPRINT]
created: 2026-09-29
updated: 2026-10-01
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

- [x] `.github/dependabot.yml` exists and covers npm, pip (services/ml) and github-actions.
- [x] Branch protection on `main` is applied (PR required, required checks above, linear history,
      no force-push, no direct push) and the `gh api` output is captured in the task evidence.
      **No approval count is required**: DEC-020 lets any agent merge at step 12 and no
      agent can post a GitHub approval, so requiring one would deadlock the loop.
- [x] Secret scanning and push protection are confirmed on (evidence pasted).
- [x] Remaining placeholder CODEOWNERS handles are listed in the task file with an owner and a
      milestone by which they must be replaced.
- [x] `pnpm gate` green.

## Files expected to change

- `.github/dependabot.yml`
- `docs/05-workflow/01-git-workflow.md` (worktree and remote note)
- `docs/08-project/tasks/TMU-OPS-009.md`

## Out of scope

- Changing the remote or the GitHub account.
- Adding required status checks that do not exist yet (they must be green on `main` first).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev`; branch-protection state confirmed unprotected; checks list pinned to green jobs |
| 2026-10-01 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-009` @ `b192edd`; `pnpm i` OK; baseline gate green |
| 2026-10-01 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-01 | ops-dev | 5 GREEN | created `.github/dependabot.yml` (npm, pip, github-actions); updated worktree notes in `01-git-workflow.md`; applied branch protection on `main` via `gh api`; verified squash-only merge settings and secret scanning |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (139 tests passed across 16 test files) |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `c97af28` pushed; draft PR #16 opened |
| 2026-10-01 | reviewer | 9 REVIEW | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR) -> `docs/08-project/reviews/TMU-OPS-009.md` |
| 2026-10-01 | orchestrator | 11 CI | 9/9 required checks pass (lint-typecheck, unit, contracts, migrations, ml, integration, contract-fuzz, e2e, secret-scan) |
| 2026-10-01 | orchestrator | 12 MERGE GATE | Squash-merged as PR #16 (`0f674fc`); branch deleted |

### Plan

1. Add `.github/dependabot.yml` for npm, pip and actions.
2. Apply branch protection via `gh api` and capture the result.
3. Verify secret scanning and push protection; record the state.
4. Record unresolved CODEOWNERS placeholders with owners and due milestone.
5. Add the worktree note; `pnpm gate`.

## Evidence

### 1. Branch protection (`gh api repos/HanifIsya/temuUNAIR-v2/branches/main/protection`)
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint-typecheck",
      "unit",
      "contracts",
      "migrations",
      "ml",
      "integration",
      "contract-fuzz",
      "e2e",
      "secret-scan"
    ]
  },
  "required_linear_history": { "enabled": true },
  "allow_force_pushes": { "enabled": false },
  "allow_deletions": { "enabled": false }
}
```

### 2. Secret Scanning and Push Protection
```json
{
  "secret_scanning": { "status": "enabled" },
  "secret_scanning_push_protection": { "status": "enabled" }
}
```

### 3. Repository Merge Settings
- `allow_squash_merge`: `true`
- `allow_merge_commit`: `false`
- `allow_rebase_merge`: `false`
- `delete_branch_on_merge`: `true`

### 4. Placeholder CODEOWNERS Handles
| Pattern | Handle / Role | Owner | Due Milestone |
|---|---|---|---|
| `/docs/01-product/` | `@<rizaldi-handle>` (Product / F1) | Product Owner (Rizaldi) | Before M3 |
| `/apps/web/src/features/` | `@<abdul-handle>` (DB / Visual / Management) | Frontend / DB Dev (Abdul) | Before M3 |
| `/services/ml/` | `@<maysha-handle>` (AI / ML) | ML Owner (Maysha) | Before M3 |

- Gate: `pnpm gate` passed cleanly with 139 tests across 16 test files.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/16
- Review: `docs/08-project/reviews/TMU-OPS-009.md` (APPROVE)

## Blockers

(none)
