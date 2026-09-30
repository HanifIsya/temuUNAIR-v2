---
id: TMU-OPS-016
title: Merge and push permission fix — any session may merge, pushes survive redirects
status: IN_PROGRESS
lane: ops
slug: merge-push-permissions
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-002]
refs: [WF-LOOP, WF-GIT, WF-OPENCODE, DEC-019, DEC-020]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-OPS-016 — Merge and push permission fix

## Goal

Make the loop completable by any session: (1) `gh pr merge*` is allowed globally so the step-12
MERGE GATE is not tied to one agent's config; (2) git-steward's push rules accept the redirect
suffix agents append (`2>&1`), which the exact-match patterns reject today; (3) the shared Vitest
preset raises `testTimeout` to 15000 ms so the cold ESLint load in
`scripts/checks/config-presets.test.mjs` no longer fails the pre-push gate on a fresh worktree.

## Context

- Owner decision 2026-09-30 (session note): **any agent may merge at loop step 12; a human may
  still merge; breaking/irreversible contract or migration PRs still stop for a human.** Recorded
  as **DEC-020** by TMU-META-003; this task must not edit the two decision tables (meta lane).
- DEC-019 (orchestrator-only merge) is superseded on the merge-authority half by DEC-020; its
  "no approval count" half stands, so `docs/05-workflow/08-ci-cd.md` is untouched.
- `packages/config/vitest.base.ts` (TMU-OPS-002) owns the shared Vitest defaults; the cold ESLint
  load measured ~5.4 s in TMU-META-002 against Vitest's 5 s default.
- opencode loads config at session start: the permission changes apply to sessions started after
  this merges (and after stale local copies of `opencode.json` are refreshed).
- TMU-OPS-002 is merged on `main` as `b9d6ba6`; its status flip to DONE is in flight in
  TMU-META-002 (PR open), so the dependency file may still read `REVIEW` on this branch.
- Worktree `E:\wt\TMU-OPS-016` on `agent/ops/TMU-OPS-016-merge-push-permissions`; `pnpm i` and the
  baseline `pnpm gate` are green (36 tests).

## Acceptance criteria

- [ ] Red first (ops-dev writes them — `scripts/**` is the ops lane and qa-engineer cannot edit
      it): `scripts/checks/scaffold.test.mjs` asserts the new policy and fails before the change.
- [ ] `opencode.json`: `"gh pr merge*": "allow"` after the `"gh pr*": "deny"` catch-all;
      `gh pr view*`/`checks*`/`edit*` unchanged.
- [ ] `.opencode/agents/git-steward.md`: `"gh pr merge*": allow`; push patterns widened to
      `"git push origin HEAD*"` and `"git push -u origin HEAD*"`; force-with-lease stays `ask`.
- [ ] `packages/config/vitest.base.ts`: `testTimeout: 15000`.
- [ ] `scaffold.test.mjs` merge-policy assertions flipped to DEC-020 (global, git-steward and
      orchestrator resolve merge to `allow`); a discrimination test keeps docs-keeper/reviewer
      resolving merge to `deny` through their own rulesets; a push-with-redirect regression test
      (`git push origin HEAD 2>&1` and `git push -u origin HEAD 2>&1` allow for git-steward; the
      global rules still `deny` every `git push*`).
- [ ] Wording updated in `docs/05-workflow/04-opencode-playbook.md`,
      `docs/05-workflow/01-git-workflow.md` (table), `docs/05-workflow/02-agent-loop.md` (mermaid
      + table) and `AGENTS.md` rule 4: any agent may merge at step 12; a human may still merge;
      breaking/irreversible contract or migration PRs stop for a human.
- [ ] `pnpm gate` green.

## Files expected to change

- `opencode.json`
- `.opencode/agents/git-steward.md`
- `packages/config/vitest.base.ts`
- `scripts/checks/scaffold.test.mjs`
- `docs/05-workflow/04-opencode-playbook.md`, `docs/05-workflow/01-git-workflow.md`,
  `docs/05-workflow/02-agent-loop.md`, `AGENTS.md`
- `docs/08-project/tasks/TMU-OPS-016.md`, `docs/08-project/tasks/TMU-META-003.md`,
  `docs/08-project/reviews/TMU-OPS-016.md`

## Out of scope

- `docs/08-project/decisions-log.md` and `docs/01-product/12-assumptions-and-decisions.md`
  (meta lane) — the DEC-020 row is TMU-META-003.
- `.opencode/agents/orchestrator.md` (already allows merge) and the other agents' rulesets.
- `docs/05-workflow/08-ci-cd.md` (its DEC-019 reference is the no-approval-count rule, unchanged).
- The owner's local uncommitted `opencode.json` copy in the main checkout.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | owner decision 2026-09-30; DEC-020 row deferred to TMU-META-003 |
| 2026-09-30 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-016` @ `b9d6ba6` (= `origin/main`); `pnpm i --frozen-lockfile` ok; baseline `pnpm gate` green (36 tests) |

### Plan

1. (RED) ops-dev adds/flips scaffold tests: merge allow (global, git-steward, orchestrator),
   docs-keeper/reviewer deny, push-with-redirect allow, `testTimeout: 15000`, docs wording;
   capture the failing run.
2. (GREEN) ops-dev: `opencode.json` merge allow; `git-steward.md` merge allow + `HEAD*` push
   patterns; `vitest.base.ts` `testTimeout: 15000`.
3. (GREEN) ops-dev: flip the three merge-policy assertions and update the wording in
   `01-git-workflow.md`, `02-agent-loop.md`, `04-opencode-playbook.md` and `AGENTS.md` rule 4.
4. (REFACTOR) task file Progress log/Evidence updated; diffs stay minimal.
5. (GATE) `pnpm gate`; fix loop if red.
6. (SHIP) git-steward commits/pushes/opens the PR; reviewer verdict; CI green.
7. (MERGE GATE) orchestrator attempts the squash-merge; if `gh pr merge` is denied in this
   session (config applies to later sessions), stop and report.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
