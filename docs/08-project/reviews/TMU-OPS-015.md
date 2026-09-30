---
id: REV-TMU-OPS-015
task: TMU-OPS-015
reviewer: reviewer
verdict: APPROVE
date: 2026-09-30
cycle: 2
---

# TMU-OPS-015 — Review cycle 2

Diff reviewed: `origin/main...eda2bf6` (two commits, `7c5ca14` + `eda2bf6`; seven files,
+282/−3). Scope matches the task's file list plus the cycle-1 review artefact; every path is
ops-lane or `_common`. Cycle-1 fix commit: `eda2bf6` (playbook, review, task file, test).

## Summary

The cycle-1 MAJOR is fixed and I reproduced it independently: `agentRules` now slices only the
`bash:` map, so the orchestrator's `task: "*": allow` no longer leaks in. Deleting the
orchestrator `"gh pr edit*"` grant (in memory) resolves `gh pr edit 2 --add-label ops` to `ask`
(catch-all) and fails `scaffold.test.mjs:395` — the mutation check the commit message claims.
The new non-grantee assertions are meaningful (backend-dev → `ask`, docs-keeper → `deny`), the
`?` wildcard is translated, and the playbook is current. Gate green, unit 26/26. The two deferred
MINORs are accepted with rationale (blueprint is out of every lane; indexes are TMU-META-001's
acceptance criterion). Verdict **APPROVE**, with three non-blocking open MINORs recorded below.

## Cycle-1 resolution

| # | Cycle-1 finding | Status | Evidence |
|---|---|---|---|
| MAJOR | `agentRules` scanned the whole front-matter; orchestrator assertions were vacuous | **FIXED** | `scripts/checks/scaffold.test.mjs:367-382` slices the `^ {2}bash:` map only; mutation reproduction below |
| MINOR 1 | `?` wildcard left as a regex quantifier | **FIXED** | `scaffold.test.mjs:355` — `.replace(/\?/g, ".")` after escaping (`?` is not in the escape class) |
| MINOR 2 | no negative assertion for a non-grantee agent | **FIXED** | `scaffold.test.mjs:398` backend-dev → `ask` (its `*: ask`, `backend-dev.md:15`); `:399` docs-keeper → `deny` (`docs-keeper.md:12`) |
| MINOR 3 | playbook stale on the `gh pr` allows | **FIXED** | `docs/05-workflow/04-opencode-playbook.md:47-50` now names `view*`/`checks*`/`edit*` and orchestrator-only `merge*` |
| MINOR 4 | `docs/00-BLUEPRINT.md` reference configs drift further | **DEFERRED (accepted)** | File matches no lane (`.agent/lanes.json:10-17` docs lane excludes `00-BLUEPRINT.md`); needs a follow-up task or DEC — see MINOR below |
| MINOR 5 | generated indexes stale on the branch | **DEFERRED (accepted)** | `backlog.md`/`status.md` regeneration is explicitly TMU-META-001's acceptance criterion — see MINOR below |

### MAJOR reproduction (read-only, no repo mutation)

Using the new helper and the documented last-match-wins engine against the current tree:

- Parsed orchestrator `bash:` rules: `*:ask`, `git status*`, `git log*`, `git diff*`,
  `node scripts/*`, `pnpm gate*`, `gh pr view*`, `gh pr checks*`, `gh pr edit*`, `gh pr merge*` —
  the `edit:`/`task:` mappings no longer appear.
- `resolve(orchestrator, "gh pr edit 2 --add-label ops")` → `allow` (line 395 passes).
- Mutation (remove `"gh pr edit*": allow` from `.opencode/agents/orchestrator.md:18`) →
  the same resolve returns `ask` → line 395 would fail. Merge stays `allow` (independent grant).
- The old helper on the same file returned `allow` for a destructive probe (`rm -rf /`); the
  new helper returns `ask` for an unmatched command — the vacuity is gone.
- `git-steward` edit → `allow`, merge → `deny`; global edit/view/checks → `allow`,
  merge → `deny` (`opencode.json:40-43`).

## BLOCKER

(none)

## MAJOR

(none)

## MINOR

- [ ] (open, carried from cycle 1) The helper evaluates agent rules standalone; opencode
      documents agent permissions as *merged with the global config, agent rules take
      precedence*. The new `backend-dev` → `ask` / `docs-keeper` → `deny` assertions encode the
      standalone interpretation. The docs example (each agent block carries its own `*` rule)
      supports it, so this is expected to hold, but one live-session check after restart is still
      worth doing (the task file already notes the restart requirement).
- [ ] (open, deferred) `docs/00-BLUEPRINT.md:1164-1165`, `:1202-1208`, `:1467-1470` still carry
      reference configs without `gh pr view*`/`checks*`/`edit*`. Accepted as deferred because no
      lane covers the file, but a follow-up task (ops lane-map + blueprint edit) or an explicit
      "blueprint frozen" decision must be filed before M0 exit so the drift is not lost.
- [ ] (open, deferred) `docs/08-project/backlog.md` / `docs/08-project/status.md` are stale on the
      branch (15 rows / `TODO: 13 · REVIEW: 2` for 16 task files). Accepted: regenerating is
      TMU-META-001's acceptance criterion (`node scripts/backlog-index.mjs`); never hand-edit.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-015`) → **OK gate(quick) passed**; lane check clean,
  format/lint/typecheck green, i18n skipped (M3), unit **26/26**, contracts/db placeholders exit 0.
  Tail:

  ```
  > migrations check
  pending: db:check — not implemented until TMU-OPS-005
           applies migrations to an empty pgvector database and diffs the result
           M0 exit criteria allow this step to be a no-op; it exits 0.

  OK gate(quick) passed
  ```

- `pnpm test:unit --reporter=verbose` → 26 passed (1 file), including the three
  `gh pr permissions (TMU-OPS-015)` tests.
- Mutation reproduction above (read-only; no file in the worktree was modified except this
  review). `git status --porcelain` clean at HEAD `eda2bf6` before the review edit.
- Scope/lane: the four paths changed by `eda2bf6` are ops-lane (`scripts/**`,
  `docs/05-workflow/**`) or `_common` (task/review); the cycle-1 playbook MINOR is the only
  doc change and was explicitly recommended. No drive-by edits, no generated file edits, no
  secrets; both commits are Conventional with `Task:` trailers; `git diff --check` clean.
- Ordering audit: catch-all first, narrow allows after, in `opencode.json:40-43`,
  `git-steward.md:9-23`, `orchestrator.md:10-19`; the new parser preserves file order and the
  last-match-wins engine, so no ordering regression.
- Tests: no assertion weakened or removed; the fix only tightens the helper and adds assertions
  (`?` translation, non-grantees). No `skip`/`only`.
- Contract / DB / privacy / i18n / a11y / N+1 / unbounded lists: not applicable (repo-tooling
  change; no runtime code, no user data).

## Notes for the human

- DoD 12 (PR ready) is still pending: the task file says `PR: (pending)`. That is the
  git-steward/orchestrator step, not a code finding; the PR body should paste the gate tail and
  link this review.
- The shipped behaviour is exactly the owner's grant: `gh pr edit` allowed to git-steward and the
  orchestrator only, merge still orchestrator-only per DEC-019.
- Deferred MINOR 4 needs a filed follow-up (or a DEC) so the blueprint drift is tracked; MINOR 5
  is covered by TMU-META-001.
- `deps: [TMU-OPS-011]` is merged (`c066330`) but its task status is still `REVIEW`; the manual
  start is documented and follows the accepted TMU-META-001 deferral pattern.
- I ran the gate and read every hunk; I modified no file except this review.