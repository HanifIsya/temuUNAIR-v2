---
id: REV-TMU-OPS-011
task: TMU-OPS-011
reviewer: reviewer
verdict: APPROVE
date: 2026-09-30
cycle: 2
---

# TMU-OPS-011 — Review cycle 2

Diff reviewed: `origin/main...558e3ba` (fix commits `3553585`, `558e3ba`). The cycle-1 report is
overwritten by this file; closed items are recorded and still-open findings are carried forward.

## Cycle-1 finding resolution

| # | Finding | Status |
|---|---|---|
| B1 | OPS-003 owned `infra/docker/web.Dockerfile` (ops lane) | **Resolved.** Dockerfile split to TMU-OPS-012 (`ops-dev`); OPS-003:33-35 now explicitly excludes `infra/**`; `.agent/lanes.json:56` adds `apps/web/eslint.config.mjs` to `fe`. Lane probe: Dockerfile → ops only, web ESLint → fe only. |
| B2 | OPS-008 owned `tests/**` (qa lane) | **Resolved.** Test packages split to TMU-OPS-013 (`qa-engineer`); workspace glob to TMU-OPS-014 (`ops-dev`); OPS-008:10 now deps on OPS-012/013 and owns only wiring. OPS-013:10 deps on OPS-003/005/007; OPS-014:10 deps on OPS-013. |
| M1 | Owner-agent test asserted existence, not path coverage | **Resolved.** `scaffold.test.mjs:235-252` now asserts the allowlists contain `infra/**`, `tests/db/**`, `apps/web/**`, `tests/**`, `services/ml/**`, `packages/contracts/**`; `backend-dev:12` and `frontend-dev:8` widened accordingly. |
| M2 | Red evidence arithmetically impossible | **Resolved.** `TMU-OPS-011.md:95-101` records 6 failed/17 passed of 23 on `origin/main` + final test file, names all six, and discloses the earlier mis-recording. Verified: origin/main scaffold test has 16 it(), HEAD 23 (+7); the six named tests fail pre-change, the 7th owner-existence test passes because every origin/main owner exists (including orchestrator). 6+17=23 is consistent. |
| M3 | DEC-019 vs "1 approval" deadlock | **Resolved.** `08-ci-cd.md:51-52` now "review verdict on record (DEC-019; no approval count…)"; `TMU-OPS-009.md:39-44` drops the count and records the human choice; `TMU-OPS-011.md:106-110` keeps it as an open question. |
| M4 | global `gh pr merge*: allow`, `gh pr*: ask` | **Resolved.** `opencode.json:40-42` is back to `"gh pr*": "deny"` + read-only `view*`/`checks*`; `"gh pr merge*": "allow"` now lives only in `.opencode/agents/orchestrator.md:18`. `git-steward`/`reviewer` inherit the global deny. |
| m1 | OPS-005 criterion named a docs-lane file | Resolved (`TMU-OPS-005.md:41-42,58-62`). |
| m2 | OPS-002 typecheck include | Resolved (`TMU-OPS-002.md:43-45`; `tsconfig.json:9` confirmed to omit the fixture path). |
| m3 | OPS-008 missing `tests/*` glob | Resolved via TMU-OPS-014 (`pnpm-workspace.yaml`, `scaffold.test.mjs:210-214`). |
| m4 | Docker guard test never asserted the build step | Resolved (`scaffold.test.mjs:232`). |
| m5 | Dispatcher behaviour untested | Resolved (`scaffold.test.mjs:274-319`; fail-closed verified: bogus step exits 1, `test:integration` placeholder exits 0). |
| m6 | `tests/tooling/**` overlap | Carried (see MINOR). |
| m7 | MERGE GATE caveat wording | Resolved (`AGENTS.md:24`, `01-git-workflow.md:57`). |
| m8 | DEC-019 dangling references | Accepted; deferral to TMU-META-001 is explicit and that task is filed (`TMU-META-001.md:39-42`). |
| m9 | lane table / blank line | Resolved (`10-parallel-lanes-and-ownership.md:27,47`). |
| m10 | missing final newlines | Resolved (all task files and `ops-dev.md` end with LF; review file CRLF→LF, no CRLF remain). |
| m11 | TC-ADM path vs `tests/contract` | Resolved as an OPS-013 criterion (`TMU-OPS-013.md:48-49`). |

## Still-open findings (carried forward)

- [ ] MINOR — `.agent/lanes.json:53` `qa: ["tests/**"]` still overlaps `db: ["tests/db/**"]`
      (`:28`) and `ml: ["tests/fixtures/ml/**"]` (`:60`); two lanes can edit the same path and
      the lane-map test does not detect overlaps. Pre-existing, now the only instance.
- [ ] MINOR — `docs/08-project/tasks/TMU-OPS-005.md:51` — `tests/db/**` is listed directly
      under `## Files expected to change` with no blank line before `## Out of scope` (`:52`).
- [ ] MINOR — `docs/08-project/tasks/TMU-OPS-002.md:76` — plan step says the fixture goes under
      `tests/tooling/` while criterion `:43` and file list `:57` say `scripts/tooling/**` (ops
      lane). Pick one.
- [ ] MINOR — `docs/08-project/tasks/TMU-OPS-009.md:39-44` refers to "an open question in this
      task" but the file has no `## Open questions` section (only OPS-011 has one).
- [ ] MINOR — `docs/08-project/tasks/TMU-OPS-008.md:70` — Progress-log cell contains a stray
      backslash (`` `\tests/**` ``); cosmetic.

## New findings (commits 3553585, 558e3ba)

- [ ] MINOR — `docs/08-project/tasks/TMU-OPS-013.md:31-34` offers "or have this task's reviewer
      accept a one-line `ops` hunk", which contradicts the lane rules (`10-parallel-lanes-and-
      ownership.md:44-46,54-55`) and the split it was created by. Reword to "TMU-OPS-014 adds
      the glob" only.
- [ ] MINOR — `TMU-OPS-013`/`TMU-OPS-014` deps are circular in time: OPS-013:10 deps on
      OPS-003/005/007 while OPS-014:10 deps on OPS-013, yet OPS-013:33 declares "this task
      depends on it" (OPS-014). Neither can be marked DONE before the other. Keep the filed
      order (013 then 014) or state that 013's packages are not workspace members until 014.
- [ ] MINOR — `scripts/checks/scaffold.test.mjs:239` pins `infra/**` as a required `ops-dev`
      allow (fine, and `ops-dev.md:28` has it), but the test is a fixed literal list: a future
      task whose owner needs a new path must edit this test, not the agent. Consider deriving
      the required paths from the task files (the mechanism M1 asked for); the current form
      still catches the cycle-1 gaps.
- [ ] MINOR — `docs/08-project/reviews/TMU-OPS-011.md` is added by commit `3553585` and not
      updated by `558e3ba`; the reviewer-owned file is being committed by the implementer. Not a
      correctness issue (the cycle-1 verdict stays on record in git), but the next reviewer file
      should be committed by the reviewer step.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-011`) → **OK gate(quick) passed**; lane check, format,
  lint, typecheck, i18n (skip), unit **23/23**, contracts/db placeholders exit 0.
- `node scripts/checks/step.mjs bogus-step` → exit 1 "Unknown dispatched step"; `test:integration`
  → placeholder exit 0.
- Lane probe (same glob translation as `scripts/check-lane.sh`): `infra/docker/web.Dockerfile`
  → ops; `apps/web/eslint.config.mjs` → fe; `tests/{integration,contract,e2e}/package.json` → qa;
  `.gitignore`/`.gitleaks.toml`/`lefthook.yml` → ops. No uncovered path among the task-set files.
- Red-evidence reproduction: origin/main scaffold test 16 it() → HEAD 23; the six named tests
  fail pre-implementation, the owner-existence test passes; arithmetic 6+17=23 holds.
- Generated indexes: re-rendered `backlog.md`/`status.md` from front-matter → structurally
  identical; `backlog.md:18-20`, `status.md:20-22` include OPS-012/013/014, `META-001` at 100% TODO.
- `git diff origin/main...HEAD` touches only `ops`/`meta` paths plus the new task files; no
  runtime code, no auth/PII/upload surface. Privacy review: N/A.

## Notes for the human

- All cycle-1 BLOCKERs/MAJORs are fixed with evidence; the remaining items are MINOR and can be
  follow-up tasks (`TMU-OPS-014`/`TMU-META-001` are already filed). The merge gate is now
  consistent across `AGENTS.md`, `01-git-workflow.md`, `02-agent-loop.md`, `08-ci-cd.md` and
  `opencode.json`.
- One process point before OPS-009: the branch-protection "review verdict on record" is only
  enforced by convention; DEC-019's merge authority still rests on the orchestrator reading the
  review file. Consider requiring the review file path as a required check artifact when OPS-009
  runs.
- I ran the gate and read the diff; I did not modify any file except this review.
