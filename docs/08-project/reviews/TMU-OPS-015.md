---
id: REV-TMU-OPS-015
task: TMU-OPS-015
reviewer: reviewer
verdict: CHANGES
date: 2026-09-30
cycle: 1
---

# TMU-OPS-015 — Review cycle 1

Diff reviewed: `origin/main...7c5ca14` (one commit, `7c5ca14`; five files, +134/−1). Scope matches
the task's file list exactly.

## Summary

The permission change is correct: `gh pr edit*: allow` is appended after the global `gh pr*: deny`
catch-all (`opencode.json:40-43`), git-steward and orchestrator each allow it after their own
catch-alls, `view`/`checks` are untouched, and merge stays orchestrator-only. Lane check, gate and
all 26 unit tests are green. However, the new guard is only partly real: the test helper reads
every quoted rule in the agent front-matter, so the orchestrator's `task: "*": allow` (and its
`edit` map) leak into the bash rule list and make the two orchestrator assertions pass for any
command. One MAJOR; verdict CHANGES.

## BLOCKER

(none)

## MAJOR

- [ ] `scripts/checks/scaffold.test.mjs:360-365` — `agentRules` matches
      `/^\s+"([^"]+)":\s*(allow|deny|ask)\s*$/gm` over the whole front-matter, so the `edit` and
      `task` mappings are concatenated with `bash` in file order. For `orchestrator.md` the last
      extracted rule is the task map's `"*": allow` (`.opencode/agents/orchestrator.md:20-21`);
      `resolve()` then returns `"allow"` for *any* command. Verified with a standalone reproduction
      of the helper:
      - `resolve(agentRules("orchestrator"), "rm -rf /")` → `"allow"` (opencode would ask/deny);
      - removing `"gh pr edit*"` / `"gh pr merge*"` from the orchestrator front-matter still yields
        `"allow"` for both — i.e. `scaffold.test.mjs:378` and `:384` cannot fail, and both already
        pass on the pre-change tree.
      Consequence: acceptance criterion 4 ("a test asserts merge authority stays orchestrator-only
      (… orchestrator allow)") is not actually tested, and the M4 regression guard is only half
      effective (the global and git-steward deny assertions at `:373` and `:382-383` are faithful).
      Fix: extract only the `bash:` block before matching (indentation-aware slice or a YAML
      parse), then re-run the red check — with a bash-scoped helper the pre-change orchestrator
      `gh pr edit` resolves to `ask` (catch-all) and test 2 fails for the right reason.

## MINOR

- [ ] `scripts/checks/scaffold.test.mjs:347-356` — the wildcard translation handles `*` but not
      `?`; opencode documents `?` as "exactly one character" while the helper leaves it as a regex
      quantifier. No current pattern uses `?`, so no wrong result today; translate it or state that
      the helper supports `*` only.
- [ ] `scripts/checks/scaffold.test.mjs:367-385` — no negative assertion for a non-grantee agent.
      With `gh pr edit*` now allowed globally, containment of the grant to git-steward/orchestrator
      rests on each agent's own catch-all; add e.g.
      `expect(resolve(agentRules("reviewer"), "gh pr edit 2")).toBe("deny")`. Related: the helper
      evaluates agent rules standalone, while opencode documents agent permissions as *merged with
      the global config*; the two models agree only if agent catch-alls override merged global
      allows. Worth one live-session check after restart (the task file already notes the restart
      requirement).
- [ ] `docs/05-workflow/04-opencode-playbook.md:47` — still says the global config "denies
      `gh pr*`" without the `view`/`checks`/`edit` allows (stale since TMU-OPS-011 for
      view/checks). This file is in the ops lane, so the update could have shipped in this task.
- [ ] `docs/00-BLUEPRINT.md:1164-1165`, `:1202-1208`, `:1467-1470` — the embedded reference configs
      drift further (no `gh pr view*`/`checks*`/`edit*`). Not editable here: `docs/00-BLUEPRINT.md`
      matches no lane in `.agent/lanes.json` (the docs lane `:10-17` covers `docs/01|02|06|07|09`),
      so this needs an ops lane-map change or an explicit "blueprint frozen" decision.
- [ ] `docs/08-project/backlog.md:6-20` / `docs/08-project/status.md:4-22` — generated indexes are
      stale on the branch (15 rows / `TODO: 13 · REVIEW: 2` for 16 task files; OPS-015 missing).
      Regenerate with `node scripts/backlog-index.mjs` or let TMU-META-001 pick it up after merge;
      never hand-edit.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-015`) → **OK gate(quick) passed**; lane check clean, format /
  lint / typecheck green, i18n skipped (M3), unit **26/26**, contracts/db placeholders exit 0. Tail:

  ```
  > migrations check
  pending: db:check — not implemented until TMU-OPS-005
           applies migrations to an empty pgvector database and diffs the result
           M0 exit criteria allow this step to be a no-op; it exits 0.

  OK gate(quick) passed
  ```

- `pnpm test:unit --reporter=verbose` → 26 passed, including the three new tests ("allows gh pr
  edit globally without reopening the merge gate", "lets git-steward refresh the PR body and the
  orchestrator edit PR metadata", "keeps gh pr merge orchestrator-only (DEC-019)").
- Red evidence reproduced (read-only probe over `origin/main` config + the new helper): pre-change
  test 1 fails on `gh pr edit` (deny), test 2 fails on the git-steward assertion, test 3 passes →
  2 failed / 24 passed of 26, exactly as recorded in `TMU-OPS-015.md:66,77-79`. The record is
  truthful; the MAJOR is that test 2/3's orchestrator halves are vacuous, not that the count is
  wrong.
- Ordering audit: catch-alls first, allows after, in `opencode.json:40-43`,
  `.opencode/agents/git-steward.md:8-24` and `.opencode/agents/orchestrator.md:10-19`; last-match
  semantics match the documented engine (opencode permissions docs; `04-opencode-playbook.md:50-51`).
  Global `gh pr merge`/`review`/`close`/`create` remain denied; merge allow only in
  `orchestrator.md:19`.
- Lane/scope: the five changed paths are ops-lane or `_common` (`.agent/lanes.json:69-94`);
  `git diff --check` clean; no secrets, no generated file edits, no drive-by changes; commit
  `7c5ca14` is a Conventional Commit with `Task:` / `Refs:` / `Agent:` trailers.
- Contract / DB / privacy / i18n / a11y: not applicable (repo-tooling change; no runtime code).

## Notes for the human

- The shipped behaviour is exactly the owner's grant and I found no security regression in it; only
  the guard test needs tightening. After the fix, re-run the red check and expect test 2 to fail
  pre-change on the orchestrator `ask`.
- `deps: [TMU-OPS-011]` is merged (`c066330`) but its task status is still `REVIEW`, so the
  scheduler (`scripts/next-task.mjs:104-107`) would not pick OPS-015 yet; the manual start is
  documented and follows the accepted TMU-META-001 deferral pattern.
- `gh pr edit` also permits retitle/base-branch changes, not just body/labels; that is inside the
  owner's grant and bounded to the two ship agents by their catch-alls.
- The PR body should paste the gate tail and the review link (DoD 2/12); the task file records the
  result but not the tail.
- I ran the gate and read every hunk; I modified no file except this review.
