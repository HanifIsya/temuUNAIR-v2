---
id: REV-TMU-OPS-011
task: TMU-OPS-011
reviewer: reviewer
verdict: CHANGES
date: 2026-09-30
---

# TMU-OPS-011 — Review

## Summary

The four headline fixes are present and mostly sound:

- `.opencode/agents/ops-dev.md` exists with ops-lane edit rights (`:6-31`) and the owner-agent
  test reads real files (`scripts/checks/scaffold.test.mjs:271-284`).
- `scripts/checks/step.mjs` is a fail-closed dispatcher: unknown steps exit 1 (`:31-34`), the
  placeholder is only taken when the owning `package.json` is absent (`:38-42`), and a failing
  package script propagates a non-zero exit through `execSync` (`:44`, verified empirically).
- The `docker-build` job is presence-guarded correctly (`.github/workflows/ci.yml:167-179`) and
  still builds when the Dockerfile is present (`:176-177`).
- The MERGE GATE is written into `AGENTS.md:24`, `docs/05-workflow/02-agent-loop.md:55` and
  `docs/05-workflow/01-git-workflow.md:21,25,57`, and the deferral of the two decision tables to
  TMU-META-001 is stated (`TMU-OPS-011.md:45-46`, `TMU-META-001.md:28-32,39-42`).

However the task's central promise — "All M0 task files name an existing owner agent and have
in-lane, satisfiable criteria" (`TMU-OPS-011.md:47`) — is not met. Two rewritten task files
require files owned by another lane (or by no lane at all), so the first `fe`/`ops` task that
follows them stalls at `scripts/check-lane.sh`, which is gate step 0 of the very loop this task
exists to unblock. The recorded red evidence also does not reconcile with the final test count.

Verdict: **CHANGES**.

## BLOCKER

- [ ] `docs/08-project/tasks/TMU-OPS-003.md:33-35,43-44,50-52` — the task claims
      `infra/docker/web.Dockerfile` "stays in the `fe` lane", but `infra/**` is `ops`-only
      (`.agent/lanes.json:56`) and the `fe` list (`.agent/lanes.json:27-47`) does not include it.
      The same file list also includes `apps/web/eslint.config.mjs`, which matches no lane at all
      (`ops`'s `*.config.*` only matches single-segment names like the root `eslint.config.mjs`,
      `.agent/lanes.json:67`; `fe` lists `apps/web/vitest.config.ts` but not the ESLint config).
      A branch `agent/fe/TMU-OPS-003-*` adding either file fails `scripts/check-lane.sh`
      (gate step 0), so the task is not runnable as written — exactly the failure mode OPS-011
      claims to have removed. Fix direction: move the Dockerfile into a small `ops` task (or add
      it to the `fe` lane deliberately), and add `apps/web/eslint.config.mjs` to a lane; do not
      restate a lane fact that the map contradicts.

- [ ] `docs/08-project/tasks/TMU-OPS-008.md:52-55` — the file list requires
      `tests/integration/**`, `tests/contract/**`, `tests/e2e/**`, but `tests/**` is the `qa`
      lane (`.agent/lanes.json:53`); the `ops` lane only gained `tests/tooling/**` (`:76`). The
      dispatcher's routes are hard-coded to those directories
      (`scripts/checks/step.mjs:23-25`), so an `ops` branch cannot make `test:*` real without
      either a lane-map change (unmentioned in the task file) or a split into a `qa` task. As
      written the task is out-of-lane.

## MAJOR

- [ ] **Owner-agent permissions are not covered by the test that claims to cover them.**
      `scripts/checks/scaffold.test.mjs:271-284` only asserts the owner's agent file *exists*;
      it does not assert the agent's edit allowlist covers the task's files, so it cannot catch
      the gaps this task set out to fix. Concrete mismatches:
      `ops-dev` (`.opencode/agents/ops-dev.md:7-31`) has no `tests/**`, but OPS-008 needs
      `tests/**` and OPS-002 needs `tests/tooling/**` (`TMU-OPS-002.md:43,56`);
      `backend-dev` (`.opencode/agents/backend-dev.md:7-13`) has no `tests/db/**`, needed by
      OPS-005 (`TMU-OPS-005.md:50`); `frontend-dev` (`.opencode/agents/frontend-dev.md:7-15`)
      cannot edit `apps/web/package.json`, `apps/web/next.config.ts`,
      `apps/web/postcss.config.mjs` or `apps/web/src/styles/**`, all listed by OPS-003
      (`TMU-OPS-003.md:50-51`). Acceptance criteria 1 and 5 of `TMU-OPS-011.md:39-47` are
      therefore only partly true. Direction: widen the agent allowlists (ops-lane change),
      re-owner/split the tasks, and extend the test to assert path coverage, not just existence.

- [ ] **Red evidence is inconsistent and not reproducible.**
      `docs/08-project/tasks/TMU-OPS-011.md:74` records "3 failed / 18 passed" but names four
      failing tests; `:90` lists three names and omits the dispatcher test. The suite went from
      16 `it(` on `origin/main` to 21 here (5 new tests). Four of the five fail on a
      pre-implementation tree (docker guard, ops-dev agent, dispatcher, merge-gate); the
      owner-agent test passes pre-change because all old owners existed. A truthful red run is
      4 failed/17 passed (pre-rewrite) or 5/16 (post-rewrite) — 3/18 is arithmetically impossible.
      DoD #1 (`docs/05-workflow/05-definition-of-ready-done.md`) requires red evidence that
      failed for the right reason; re-run and record it accurately.

- [ ] **DEC-019 conflicts with the branch-protection approval requirement.**
      `docs/08-project/tasks/TMU-OPS-009.md:39` (rewritten here) requires branch protection with
      "1 approval", and `docs/05-workflow/08-ci-cd.md:51` still says "≥1 approval", while
      `docs/05-workflow/01-git-workflow.md:21` was changed to "review verdict + CI green" and
      `:57` says the orchestrator merges. No agent can approve a PR, so with "1 approval"
      required the orchestrator cannot actually exercise the merge authority DEC-019 grants —
      the rule is not operational. Needs a human decision: drop the approval requirement for
      agent PRs, or keep it and reword DEC-019 to "orchestrator merges after human approval".

- [ ] **`opencode.json` widens merge/PR permissions globally, not just for the orchestrator.**
      `opencode.json:42` adds `"gh pr merge*": "allow"` to the *global* `permission.bash` map;
      `git-steward` (`.opencode/agents/git-steward.md:7-24`) and `reviewer`
      (`.opencode/agents/reviewer.md:9-16`) deny `*` but do not deny `gh pr merge*`, and opencode
      merges agent rules with global rules ("last matching rule winning"), so the global allow
      can win. `:43` also downgrades `"gh pr*": "deny"` to `"ask"`, so every other `gh pr`
      subcommand (create/close/edit/review) moves from blocked to promptable for all agents.
      That is broader than DEC-019's intent. Direction: move `gh pr merge*: allow` into
      `.opencode/agents/orchestrator.md` (currently only `"*": ask`, `:9-15`), keep the read-only
      `view`/`checks` allows, and leave `"gh pr*": "deny"` or add explicit denies to the other
      agents. (Nothing else in the diff widens permissions; `ops-dev`'s `gh api*`/`gh run*`
      allows are consistent with OPS-009's stated `gh api` use.)

## MINOR

- [ ] `docs/08-project/tasks/TMU-OPS-005.md:40-41,51-52` — the criterion still names
      `docs/07-ops/01-local-dev-setup.md` (docs lane) and the file list still says to add it "in
      the same PR as a `docs`-tagged hunk"; there is no such mechanism and `check-lane.sh` will
      reject it. The Notes at `:60-64` offer a README alternative, but the acceptance criterion
      is not reworded to match.
- [ ] `docs/08-project/tasks/TMU-OPS-002.md:43` — the criterion says a `tests/tooling/**`
      fixture must fail `pnpm typecheck`, but `tsconfig.json:9` includes only
      `scripts/**/*.mjs` and `eslint.config.mjs`, so typecheck never sees the fixture. The task
      must extend the include (in-lane, `ops-dev` may edit `tsconfig*.json`) or reword.
- [ ] `docs/08-project/tasks/TMU-OPS-008.md:52-57` — the dispatcher resolves `test:*` via
      `pnpm --filter` (`scripts/checks/step.mjs:23-25`), which only works for pnpm workspace
      projects; `pnpm-workspace.yaml:2-4` globs only `apps/*` and `packages/*`, and
      `scripts/checks/scaffold.test.mjs:210-214` asserts exactly that. OPS-008 must add a
      `tests/*` glob and update that test; neither file is in its list.
- [ ] `scripts/checks/scaffold.test.mjs:228-230` — the docker guard test asserts the path
      string, `exists == 'no'` and `TMU-OPS-003`, but never asserts the `docker build` step
      exists, so a guard that always skips would still pass. Add an assertion for
      `docker build -f infra/docker/web.Dockerfile`.
- [ ] `scripts/checks/scaffold.test.mjs:240-262` — the dispatcher test asserts wiring only;
      nothing covers "real script when the package exists" or "non-zero propagates". The code is
      correct (`step.mjs:38-44`) but the behaviour is untested.
- [ ] `.agent/lanes.json:76` — `tests/tooling/**` overlaps the broad `qa: ["tests/**"]` (`:53`),
      so two lanes can edit the same path. Pre-existing precedent (`tests/db/**` vs `tests/**`)
      but the new entry adds another instance; the lane-map test does not detect overlaps.
- [ ] `docs/05-workflow/01-git-workflow.md:57` and `AGENTS.md:24` — the
      "contract/migration PRs stop for a human when breaking or irreversible" caveat exists only
      in `docs/05-workflow/02-agent-loop.md:55`; the other two state unconditional orchestrator
      merges. Align the wording.
- [ ] `AGENTS.md:24`, `docs/05-workflow/01-git-workflow.md:21,57` cite DEC-019, but no DEC-019
      row exists yet (`docs/08-project/decisions-log.md` ends at DEC-018;
      `docs/01-product/12-assumptions-and-decisions.md` ends at DEC-018). The deferral to
      TMU-META-001 is stated, but until it lands the references are dangling. Relatedly,
      `TMU-OPS-011.md:60,82` still list the two decision tables / plan step as if this task edits
      them — stale after the deferral.
- [ ] `docs/05-workflow/10-parallel-lanes-and-ownership.md:27` — the lane table still lists the
      ops agent as "orchestrator/backend-dev"; the new `ops-dev` agent is not added. `:46-47` is
      also missing the blank line before `## Lane semantics`.
- [ ] `.opencode/agents/ops-dev.md:51` and all rewritten task files lack a final newline
      (`.editorconfig:6` sets `insert_final_newline = true`; last byte is `)` on
      `TMU-OPS-002..011.md`).
- [ ] `docs/06-quality/02-test-cases/TC-ADM.md:53` references
      `tests/contracts/i18n-keys.spec.ts` while the dispatcher routes `test:contract` to
      `tests/contract` (`step.mjs:24`); pick one name when OPS-008 lands.

## Checks run

- `pnpm gate` → **OK gate(quick) passed** (lane check, format, lint, typecheck, i18n keys, unit
  tests 21/21, contracts:check, contracts:lint, db:check placeholders exit 0).
- `node scripts/checks/step.mjs bogus-step` → `Unknown dispatched step: bogus-step`, exit 1.
- `node scripts/checks/step.mjs test:integration` → pending notice (TMU-OPS-008), exit 0.
- Failure propagation: `execSync` throws on a non-zero child (verified with
  `node -e` + `cmd /c exit 3` → node exit 1), so `step.mjs:44` cannot silently pass a failing
  package script; the placeholder at `:38-42` is only reachable when `dir/package.json` is
  absent. If the package exists but is not a workspace member, `pnpm --filter` fails loudly.
- Lane overlap probe (same glob translation as `scripts/check-lane.sh`):
  `infra/docker/web.Dockerfile` → ops only; `apps/web/eslint.config.mjs` → **no lane**;
  `tests/integration|contract|e2e/package.json` → qa only; `.gitignore`, `.gitleaks.toml`,
  `lefthook.yml`, `tests/tooling/**` → ops only.
- Generated indexes: re-rendered in memory from task front-matter → `backlog.md`/`status.md`
  byte-identical (in sync, not hand-edited).
- Test count: `origin/main` `scaffold.test.mjs` has 16 `it(`; HEAD has 21 (5 new).
- Root scripts: no `pending.mjs` reference remains except `step.mjs:40` and the tests; the
  `contracts:*`/`db:*`/`seed`/`test:*` routes match OPS-004's (`build/check/lint/breaking`) and
  OPS-005's (`check/generate/migrate/seed`) planned package scripts.

Gate tail:

```
> contracts in sync
pending: contracts:check — not implemented until TMU-OPS-004
         fails when a generated contract artefact is out of sync or hand-edited
         contract set in docs: v1.0.0
         M0 exit criteria allow this step to be a no-op; it exits 0.

> openapi lint
pending: contracts:lint — not implemented until TMU-OPS-004
         validates the emitted OpenAPI against the BE-01 conventions
         contract set in docs: v1.0.0
         M0 exit criteria allow this step to be a no-op; it exits 0.

> migrations check
pending: db:check — not implemented until TMU-OPS-005
         applies migrations to an empty pgvector database and diffs the result
         M0 exit criteria allow this step to be a no-op; it exits 0.

OK gate(quick) passed
```

## Notes for the human

- Both BLOCKERs are the same pattern: a rewritten task claims in-lane execution but the lane map
  disagrees. The cheapest fix is a small ops follow-up (or an amendment to this PR): decide the
  owner of `infra/docker/web.Dockerfile` and of `tests/integration|contract|e2e`, and give
  `apps/web/eslint.config.mjs` a lane.
- Nothing in the diff touches runtime code, PII, auth, uploads or analytics; privacy review is
  N/A. `gh pr view*`/`gh pr checks*` allows are read-only; the merge allow is the only
  permission concern (see MAJOR).
- The merge-gate change is a process decision (DEC-019); reconcile it with the OPS-009
  branch-protection "1 approval" requirement before OPS-009 runs, or the orchestrator will not be
  able to merge.
- I ran the gate and read the diff; I did not modify any file except this review.
