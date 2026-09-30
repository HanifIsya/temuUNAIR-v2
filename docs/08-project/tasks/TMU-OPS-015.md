---
id: TMU-OPS-015
title: Grant gh PR-refresh permissions to the ship agents
status: REVIEW
lane: ops
slug: gh-pr-permissions
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-011]
refs: [WF-GIT, DEC-019]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-OPS-015 — Grant gh PR-refresh permissions to the ship agents

## Goal

After PR #2 shipped, the PR body could not be refreshed: `gh pr edit` was allowed for no agent
and fell through to the global `gh pr*: deny`. The repo owner grants `gh pr edit` to the agents
that maintain PRs — git-steward (refresh the body from the template after each push) and the
orchestrator (merge-gate labels/evidence). Read-only `view`/`checks` stay as in TMU-OPS-011;
`gh pr merge` stays orchestrator-only per DEC-019, asserted by a test so review cycle 1 M4 is
not reopened.

## Context

- TMU-OPS-011 review M4 fixed the permission split: global `gh pr*: deny` + read-only allows,
  `gh pr merge*` only in `.opencode/agents/orchestrator.md`.
- Owner grant recorded 2026-09-30 (session note: "i grant for gh, change the rules").
- Dependency TMU-OPS-011 is merged on `main` (`c066330`); its status flips to DONE via
  TMU-META-001 in this series, so this task starts on the merged config, not the merged status
  file.
- opencode reads config at startup: the grant applies to sessions started after this merges
  (and after local stale copies of `opencode.json` are refreshed).

## Acceptance criteria

- [ ] Red first: scaffold tests assert `gh pr edit` is allowed (git-steward + global after the
      catch-all) and fail before the change.
- [ ] `opencode.json` adds `"gh pr edit*": "allow"` after the `"gh pr*": "deny"` catch-all;
      `view`/`checks` unchanged.
- [ ] `.opencode/agents/git-steward.md` and `.opencode/agents/orchestrator.md` allow `gh pr edit*`.
- [ ] A test asserts merge authority stays orchestrator-only (global deny, orchestrator allow).
- [ ] `pnpm gate` green.

## Files expected to change

- `opencode.json`
- `.opencode/agents/git-steward.md`, `.opencode/agents/orchestrator.md`
- `scripts/checks/scaffold.test.mjs`
- `docs/08-project/tasks/TMU-OPS-015.md`, `docs/08-project/reviews/TMU-OPS-015.md`

## Out of scope

- `gh pr merge`, `gh pr review`, or push permissions for any agent.
- The owner's local (uncommitted) `opencode.json` copy in the main checkout.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | owner grant; PR #2 body refresh was blocked (`gh pr edit` denied for every agent) |
| 2026-09-30 | ops-dev | 0 SYNC | worktree `E:\wt\TMU-OPS-015` from `origin/main` @ `c066330`; `pnpm i --frozen-lockfile` ok |
| 2026-09-30 | ops-dev | 4 RED | `pnpm vitest run scripts/checks/scaffold.test.mjs` → **2 failed / 24 passed** of 26; failing: "allows gh pr edit globally without reopening the merge gate", "lets git-steward refresh the PR body and the orchestrator edit PR metadata" |
| 2026-09-30 | ops-dev | 5 GREEN | `gh pr edit*: allow` added after the global deny and to git-steward/orchestrator; same run → **26 passed** |
| 2026-09-30 | reviewer | 9 REVIEW c1 | verdict **CHANGES** — 1 MAJOR (test helper scanned the whole front-matter, so orchestrator assertions were vacuous), 5 MINOR → `docs/08-project/reviews/TMU-OPS-015.md` |
| 2026-09-30 | ops-dev | 9 REVIEW c1 fix | `agentRules` now slices the `bash:` block only; added non-grantee assertions (backend-dev → `ask`, docs-keeper → `deny`); `?` translation; playbook updated. Mutation check: removing the orchestrator grant now fails the test (was vacuous) |

### Plan

1. Add the three red assertions to `scripts/checks/scaffold.test.mjs`.
2. Allow `gh pr edit*` globally (after the deny) and in git-steward + orchestrator.
3. `pnpm gate`; update this file; review; ship.

## Evidence

- Red: `pnpm vitest run scripts/checks/scaffold.test.mjs` on the pre-change tree → **2 failed /
  24 passed** of 26; failing: "allows gh pr edit globally without reopening the merge gate",
  "lets git-steward refresh the PR body and the orchestrator edit PR metadata".
- Green: same run after the change → **26 passed**; `pnpm gate` → `OK gate(quick) passed`.
- Cycle-1 fix: the reviewer reproduced that the helper made orchestrator assertions vacuous
  (last rule extracted was `task: "*": allow`). After scoping `agentRules` to the `bash:` block,
  removing the orchestrator grant fails the suite (mutation check), restoring it passes.
- PR: (pending)
- Review: cycle 1 **CHANGES** (1 MAJOR, 5 MINOR) → fixed; cycle 2 pending.

## Blockers

(none)
