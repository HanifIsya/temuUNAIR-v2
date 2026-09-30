---
id: REV-TMU-OPS-016
task: TMU-OPS-016
reviewer: reviewer
verdict: CHANGES
date: 2026-10-01
cycle: 1
---

# TMU-OPS-016 — Review cycle 1

Diff reviewed: `origin/main...e6da814` (two commits `f5465f3` + `e6da814`; 10 files, +236/−18).
Scope matches the task's file list exactly: ops lane (`scripts/**`, `.opencode/**`,
`opencode.json`, `AGENTS.md`, `docs/05-workflow/**`, `packages/config/**`) plus `_common` task
files. No generated file, secret, contract or migration touched; both commits are Conventional
Commits with `Task:` trailers. DoD items 1–9 are otherwise met: red evidence is recorded and
verified plausible against `origin/main` (all five flipped/added expectations fail there),
`pnpm gate` is green, and the DEC-020 wording is updated in the four named docs. One MAJOR
permission regression in the widened push patterns blocks APPROVE.

## Findings

| # | Severity | File:line | Finding | Evidence |
|---|---|---|---|---|
| 1 | **MAJOR** | `.opencode/agents/git-steward.md:16-17` | `git push origin HEAD*` / `git push -u origin HEAD*` are over-broad: they allow protected-branch push, plain force push and hook bypass, all of which were denied before this change. | Pattern translates to `^git push origin HEAD.*$`, so it matches `git push origin HEAD:main`, `git push origin HEAD --force` and `git push origin HEAD --no-verify`. The `ask` rule for force-with-lease (`:18`) only matches the exact `git push --force-with-lease origin HEAD` form and is ordered after the allows, so `git push origin HEAD --force` / `--force-with-lease` resolve `allow`, not `ask`. Before the widening all of these fell through to `*: deny`. The only remaining barrier is `scripts/hooks/no-protected-push.sh:17-24` (blocks `refs/heads/main`), which is **not installed**: `E:\TemuUNAIR-v2\.git\hooks` contains only `*.sample` files, no active `pre-push`, and branch protection is still TODO (`TMU-OPS-009.md:39-44`). Suggested direction: keep the AC's `HEAD*` patterns but append explicit deny rules after them (e.g. `*:main*`, `*--force*`, `*--no-verify*`) ordered before the force-with-lease `ask`, or narrow the allows to the literal redirect forms `git push origin HEAD 2>&1` / `git push -u origin HEAD 2>&1`. |
| 2 | MINOR | `.opencode/agents/git-steward.md:18` | The redirect-suffix fix is incomplete for the force-with-lease path: `git push --force-with-lease origin HEAD 2>&1` falls through the exact `ask` rule to `*: deny`. | `^git push --force-with-lease origin HEAD$` does not match the suffixed command and neither `HEAD*` allow pattern matches the `--force-with-lease` prefix, so the catch-all denies. Safe direction (deny, not allow), but the stated goal "push patterns accept the redirect suffix" is met only for the two allow rules. Mutation E confirms the gap: widening the `ask` rule to `HEAD*` leaves the suite **green** (29 passed, exit 0), i.e. no test covers the suffixed force-with-lease form. |
| 3 | MINOR | `scripts/checks/scaffold.test.mjs:321` | The test name still reads "codifies the orchestrator merge gate (DEC-020)" although DEC-020 removes the orchestrator-only authority; the assertion itself is correct. | Rename to "codifies the merge gate (DEC-020)" so the suite does not carry a stale contradiction. |
| 4 | MINOR | `AGENTS.md:24` | Rule 4 drops the explicit "a human may still merge" clause from the agreed wording. | The AC sentence and the three workflow docs (`01-git-workflow.md:57`, `02-agent-loop.md:55`, `04-opencode-playbook.md:50`) all keep it; the always-loaded `AGENTS.md` rule now reads only "(any agent may merge; DEC-020) - breaking/irreversible … stop for a human". |
| 5 | MINOR | `docs/08-project/tasks/TMU-OPS-009.md:41-43,85-87` | Live TODO task still says "DEC-019 gives merge authority to the orchestrator", which DEC-020 supersedes. | The no-approval-count rationale ("no agent can post a GitHub approval") survives, but the authority claim is stale in an ops-lane file. TMU-META-003 covers only the two decision tables, so this needs a sweep or follow-up rather than a silent carry. |
| 6 | MINOR | `docs/08-project/tasks/TMU-OPS-016.md:105-106` | The task's own Plan step 7 still says "orchestrator attempts the squash-merge" (pre-DEC-020 wording). | The Progress log and docs were updated but the Plan was not; a fresh session resuming from the Plan would expect orchestrator-only merge. |
| 7 | MINOR | `docs/05-workflow/04-opencode-playbook.md:47-48` | The permission bullet calls the allowlist "read-only `gh pr view*`/`checks*`, `gh pr edit*` and `gh pr merge*`" — `edit` and `merge` are mutating commands, not read-only. | Wording nit on a line touched by this diff; suggest "read-only `view*`/`checks*` plus `edit*` and `merge*`". |
| 8 | MINOR | `scripts/checks/scaffold.test.mjs:408-413` | The discrimination test's name ("keeps merge out of the agents that must not merge") overstates the assertion: it evaluates the docs-keeper/reviewer rulesets standalone, so it also passes when the *global* merge grant is missing. | Not a false guard: mutation D (adding `gh pr merge*: allow` to `docs-keeper.md`) fails exactly this test (1 failed / 28 passed), so privilege creep is caught. The naming issue is that it does not verify the global/git-steward grants — those are covered by `:402-406` (mutations B and C fail there). |

No BLOCKER.

## Falsification notes (executed, not by construction)

Five mutations were applied to the real worktree files and the real `scripts/checks/scaffold.test.mjs`
was run each time (`pnpm test:unit --config <bridge>`, JSON reporter); each run restored the file
and the tree was verified clean afterwards (`git status --short` shows only the two review files).

| Mutation | Applied to | Result | Failing tests |
|---|---|---|---|
| A — revert `git push origin HEAD*` → `git push origin HEAD` | `.opencode/agents/git-steward.md` | exit 1, 1 failed / 28 passed | `accepts the redirect suffix agents append to push commands (TMU-OPS-016)` |
| B — remove `"gh pr merge*": "allow"` | `opencode.json` | exit 1, 2 failed / 27 passed | `allows gh pr edit globally without reopening the merge gate`; `lets any session merge at step 12 (DEC-020)` |
| C — remove `"gh pr merge*": allow` | `.opencode/agents/git-steward.md` | exit 1, 1 failed / 28 passed | `lets any session merge at step 12 (DEC-020)` |
| D — add `"gh pr merge*": allow` | `.opencode/agents/docs-keeper.md` | exit 1, 1 failed / 28 passed | `keeps merge out of the agents that must not merge (DEC-020)` |
| E — widen `ask` rule to `git push --force-with-lease origin HEAD*` | `.opencode/agents/git-steward.md` | **exit 0, 29 passed** | none — the suffixed force-with-lease path is untested (finding 2) |

All five runs reported `applied=true` and `restored=true`; the bridge deleted itself and no
implementation file was left modified. Mutation E is the coverage hole: a test that flipped
`:420-422` to the suffixed form would close it.

Regex probe (finding 1): `^git push origin HEAD.*$` matches `HEAD:main`, `HEAD --force` and
`HEAD --no-verify`; `^git push --force-with-lease origin HEAD$` matches only the exact form, so
the suffixed force-with-lease and the `HEAD --force` variants do not reach the `ask` rule.

The working tree already contained an uncommitted task-file update at review start (`M
docs/08-project/tasks/TMU-OPS-016.md`, the step-8 row and PR link); this review appends the step-9
row to the same file.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-016`) → **OK gate(quick) passed**; lane check clean,
  format/lint/typecheck green, i18n skipped (M3), unit **39/39** (scaffold 29 + config-presets 10),
  contracts/db placeholders exit 0. Tail:

  ```
  > migrations check
  pending: db:check — not implemented until TMU-OPS-005
           applies migrations to an empty pgvector database and diffs the result
           M0 exit criteria allow this step to be a no-op; it exits 0.

  OK gate(quick) passed
  ```

- `pnpm test:unit --reporter=verbose` → 39 passed (2 files); cold ESLint test 2467 ms under the
  15 s preset.
- DoD audit: red evidence (5 failed / 24 passed of 29) matches `origin/main` (`opencode.json`
  merge deny, git-steward merge deny, exact push patterns, no `testTimeout`, docs say
  "Orchestrator squash-merges"). `gh pr view*`/`checks*`/`edit*` unchanged; merge allow is after
  the `gh pr*` catch-all; `testTimeout: 15000` present; all four docs updated;
  `TMU-META-003` filed for the meta-lane DEC-020 rows. `pnpm gate` verified independently.
- Lane/privacy/generated-files: every changed path is ops-lane or `_common`; no PII, secrets or
  generated artefacts; `git diff --check` clean; minimal functional diff (~14 lines excluding task
  files).
- Consistency: `03-orca-playbook.md:44-46,66` ("read the review, then merge"; "never merge from
  the CLI without reading the review file"), `07-commit-and-pr-conventions.md:84` (human-merger
  checklist) and `02-agent-loop.md:99` (headless loop never merges) do **not** contradict DEC-020.
  DEC-019 references in historical tasks/reviews, the two decision tables (meta lane) and
  `08-ci-cd.md:51` (no-approval-count half) are genuinely out of scope.

## Notes for the human

- DEC-020's wording "any agent may merge" overstates the effective matrix: only
  `git-steward`/`orchestrator` resolve `allow`; the dev agents resolve `ask` (their `*: ask`) and
  docs-keeper/reviewer/spec-writer/security-reviewer resolve `deny`. That is what the task AC
  demands (the discrimination test), but TMU-META-003 should word the recorded decision
  accordingly so the tables do not promise more than the rulesets grant.
- PR [#8](https://github.com/HanifIsya/temuUNAIR-v2/pull/8) is still draft; DoD 12 (PR ready) is
  pending. CI job statuses could not be read reliably from the HTML page; the task log reports
  green except `migrations` at report time.
- Finding 1 is a one-line-class fix but changes an AC-mandated pattern; if the fix is to narrow
  the patterns instead of adding deny rules, amend the AC in the same commit.

Verdict: CHANGES
