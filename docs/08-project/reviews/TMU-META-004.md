---
id: REV-TMU-META-004
task: TMU-META-004
reviewer: reviewer
verdict: CHANGES
date: 2026-10-02
cycle: 1
---

# TMU-META-004 — Review cycle 1

Diff reviewed: `origin/main...328e277` (one commit, `328e277 docs(project): file M1 task
breakdown (TMU-DOC-002..020, TMU-OPS-033)`; 23 files, +1,387/−2). Every changed path is under
`docs/08-project/**` and the set matches the task's declared file list exactly
(`TMU-META-004.md:87-93`: this file, `TMU-OPS-033`, `TMU-DOC-002..020`, the two generated
indexes), so scope, lane (meta + `_common`, `.agent/lanes.json:3-8,101-104`) and checklist §0 are
clean; no product doc, contract, migration, config or test file is touched, and the commit is
Conventional with the required `Task: TMU-META-004` / `Refs:` trailers. The decomposition itself
is faithful: I spot-checked `TMU-DOC-004..018` against their Blueprint §4 rows
(`docs/00-BLUEPRINT.md:224-258`), confirmed all 30 M1 documents (15 product + 15 design) are
covered, `SCR-001..023` exist, and the dep graph of all 47 task files is acyclic with every
referenced ID on disk. I re-ran `pnpm gate` myself: green. Three MAJOR findings — stale generated
indexes (the same defect class as the TMU-META-002 cycle-1 MAJOR), an input file the enabler and
intake tasks cannot reach from any worktree, and out-of-lane files declared inside three
docs-lane tasks — block APPROVE.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | 20 filed files exist with the required front-matter, unique IDs matching filenames, single-line `deps` | **PASS** | All 20 (+ this task) carry the nine scheduler keys (`scaffold.test.mjs:163`); `id` = filename, slugs unique, `deps: [...]` single-line in every file |
| 2 | Every `owner` an agent file; every `lane` one of the eleven | **PASS** | Owners {`orchestrator`, `spec-writer`, `ops-dev`} ∈ `.opencode/agents/`; lanes {`meta`, `ops`, `docs`} ⊂ the 11 keys of `.agent/lanes.json` |
| 3 | Every `deps` entry references an existing task ID; chain acyclic | **PASS (derived)** | Sweep of all 47 task files: every referenced ID exists; new edges only point to `TMU-DOC-001/002/003` or lower-numbered DOC ids → acyclic. `node` is sandbox-denied for me (see Checks run), so this is a manual sweep, not `next-task.mjs` output |
| 4 | `backlog-index` regenerates (47 rows); `next-task` returns `TMU-OPS-033` | **FAIL (through finding 1)** | Rows are 47, but the committed bytes are *not* what regeneration produces (`backlog.md:50` `IN_PROGRESS` vs front-matter `REVIEW`); `next-task` simulation (runnable set = {`TMU-OPS-033` M1/P1, `TMU-CTR-006` M2}) yields `TMU-OPS-033`, but the command itself could not be executed in this sandbox |
| 5 | Only `docs/08-project/**` changes | **PASS** | `git diff --stat` → 23/23 paths under `docs/08-project/**` |
| 6 | `pnpm gate` green | **PASS (reviewer-run)** | Fresh run in the worktree: `OK gate(quick) passed` (details below) |

## Findings

| # | Severity | File:line | Finding | Evidence / direction |
|---|---|---|---|---|
| 1 | **MAJOR** | `docs/08-project/backlog.md:50`, `docs/08-project/status.md:35` vs `docs/08-project/tasks/TMU-META-004.md:4` | The generated indexes shipped in this commit are stale against the front-matter shipped in the same commit: the backlog row still reads `IN_PROGRESS` and M1 counts read `IN_PROGRESS: 1 · REVIEW: 0`, while the task file says `status: REVIEW`. AC 4 ("`backlog-index` regenerates …") therefore does not hold for the committed tree, and DoD 9 (generated files in sync) fails. | `scripts/backlog-index.mjs:51` emits `t.status` verbatim and `:59` counts by exact status, so a re-run rewrites exactly those two places to `REVIEW` / `REVIEW: 1 · IN_PROGRESS: 0`. The Progress log records the `IN_PROGRESS` flip (`:100`) and claims `backlog-index → 47 tasks` (`:101`, `:108`) but no run followed the flip to `REVIEW`. Same class as the cycle-1 MAJOR on `TMU-META-002` (`reviews/TMU-META-002.md:40`); the gate cannot catch it because `scaffold.test.mjs:159-204` checks front-matter keys/IDs only — no index↔front-matter comparison exists. Direction: re-run `node scripts/backlog-index.mjs` and fold the regenerated files into the fix commit (two-line diff). |
| 2 | **MAJOR** | `docs/08-project/tasks/TMU-OPS-033.md:31-33` (+ probe AC `:50-52`), `docs/08-project/tasks/TMU-DOC-002.md:27` (+ intake AC `:43`), `docs/08-project/tasks/TMU-META-004.md:37-38` | The source-lane enabler asserts "The human has dropped the real `proposal.pdf` into `docs/_source/` (present, untracked)" and "the human's drop is done" — but that file exists only untracked in the main checkout `E:\TemuUNAIR-v2\docs\_source\`. The input for OPS-033's probe AC ("staging `docs/_source/proposal.pdf` from a docs-lane branch passes the lane check") and DOC-002's byte-identical intake is unreachable from any worktree, so both ACs are infeasible as written and DOC-003's OQ-1 answer (`:47`, `:54`) inherits the stall. | Verified: this worktree's `docs/_source/` contains only `README.md` + `logo.png`; `git status --short --untracked-files=all` in the worktree is empty; `git show origin/main:docs/_source/proposal.pdf` → path does not exist. Worktrees are created `git worktree add … origin/main` (`docs/05-workflow/01-git-workflow.md:26`), which never carries untracked files — so no future worktree sees the drop either. Nothing in either task records where the bytes live. Direction: correct the Contexts to "present only untracked in the main checkout; worktrees do not see it", and add one explicit instruction to OPS-033 + DOC-002: copy `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` into the worktree before the probe/intake (or ask the human to commit it first). |
| 3 | **MAJOR** | `docs/08-project/tasks/TMU-DOC-019.md:49`, `docs/08-project/tasks/TMU-DOC-003.md:61` (AC `:52-53`), `docs/08-project/tasks/TMU-DOC-008.md:49` (AC `:38-39`, Context `:30-31`) | Three `lane: docs` tasks declare edits to files only the `meta` lane covers, violating task-template rule 6 ("a task may not touch files outside its lane", `docs/08-project/README.md:86`) and DoR #6. When the declared edit happens on an `agent/docs/…` branch, `scripts/check-lane.sh` (gate step 1) fails — so these tasks' own "`pnpm gate` green" ACs become unreachable exactly when the work needs doing. | `_common` (`lanes.json:2-8`) holds tasks/reviews/blockers/backlog/status only; the `docs` lane (`:10-17`) has no `08-project` glob; `meta` (`:101-104`) owns `docs/08-project/**`. The DOC-003/DOC-008 hedges are not hypothetical: `decisions-log.md:39-40` record DEC-019/DEC-020, so "if the existing DEC entries do so" / "if that is the established convention" resolve TRUE today. Precedent that this fails in practice: `TMU-OPS-011.md:79` — "table rows moved to TMU-META-001 (meta lane, caught by the lane check)". Notably DOC-008 *was* lane-aware elsewhere (`:32-33`, meta's `12-*.md` exception) — the oversight is only the project-level log. Direction: keep the intent but declare it out-of-lane — "read-only from this branch; record the needed log/matrix update here and hand it to a meta-lane follow-up (README rule 5: traceability rows are the docs-keeper's after merge)" — or drop the entries from "Files expected to change". Same for DOC-019's `traceability-matrix.md` (its AC `:42` can be verified read-only). |
| 4 | MINOR | `docs/08-project/tasks/TMU-META-004.md:57` | The "Filed by this task" table gives `TMU-DOC-008` the dep `TMU-DOC-002`, but the filed file and the backlog both say `TMU-DOC-003`. | `TMU-DOC-008.md:10` `deps: [TMU-DOC-003]`, `backlog.md:37` same; the dep is intentional (`TMU-DOC-008.md:22` "which is why this task runs after it" — it needs the OQ deferral DECs). Direction: correct the table row to `TMU-DOC-003`. |
| 5 | MINOR | `docs/08-project/tasks/TMU-DOC-014.md:36-37` | "Every screen spec contains the **eight** Blueprint-required sections" — the parenthetical that follows lists nine (purpose, entry points, layout regions, data, components, states, copy keys, analytics events, a11y notes). | Nine is right: `docs/00-BLUEPRINT.md:250` and the task's own Context (`:27-28`) both enumerate nine. An executing agent could drop one section believing seven/eight suffice. Direction: "nine". |
| 6 | MINOR | `docs/08-project/tasks/TMU-META-004.md:109-110` | Task bookkeeping is behind reality at review time: Evidence still reads `PR: (pending)` / `Review: (pending)` although PR #32 exists, and the Progress log stops at `2 GREEN` — no row for the `REVIEW` status flip or the PR (checklist §7 "Progress log current; status correct"). | PR #32: Draft, 1 commit, label `documentation`, head `agent/meta/TMU-META-004-file-m1-backlog`, base `main`. Same class as `reviews/TMU-OPS-003.md:22` (F2, MINOR). Direction: when recording this verdict, add the `9 REVIEW`-style Progress row (status flip + PR #32) and the Evidence URLs — "required before merge, not before this review" (precedent `reviews/TMU-DOC-001.md:44`). |
| 7 | MINOR | `docs/08-project/tasks/TMU-META-004.md:36` | Context credits `docs/_source/README.md` with "records that `proposal.pdf` must be committed in M1" — the README says no such thing for the PDF. | `docs/_source/README.md:17` reads "**must be added by a human** — not in the repo yet"; only the extract is marked "to be written in M1" (`:19`). The M1 deadline comes from the roadmap row the same task already cites at `:31-33` (`docs/01-product/10-roadmap.md:20`). Direction: re-attribute ("roadmap M1 exit requires the PDF; `_source/README.md` records it must be added by a human"). |
| 8 | MINOR | PR #32 body (repo metadata) | The PR description claims the dependency chain is "acyclic, verified by the scaffold tests", but no such test exists. | `scaffold.test.mjs:162-181` asserts front-matter key presence (deps *shape* only, `:179`) and `:183-203` asserts ID/filename uniqueness — there is no deps-existence or cycle check anywhere in `scripts/` or `tests/`. The claim currently rests on my manual sweep (AC 3). Direction: reword the PR body to "verified by reviewer inspection (cycle-1 review, AC 3)". |

No BLOCKER.

## Checks run

- `git status` in the worktree (`E:\wt\TMU-META-004`) → clean; HEAD = `328e277`, synced with `origin`.
- `git log origin/main..HEAD --oneline` → the single commit above; `git diff origin/main...HEAD --stat` → 23 files, +1,387/−2, all `docs/08-project/**`.
- Full diff read line-by-line (all 1,387 insertions): scope vs declared file list, Blueprint/roadmap
  cross-references, dep consistency, privacy scan.
- `pnpm gate` **run by me** in the worktree → `OK gate(quick) passed`: lane check (step 1 =
  `scripts/check-lane.sh`, exit 0), prettier, lint, typecheck, i18n (70 keys/locale),
  139 tests / 16 files (incl. `scaffold.test.mjs` 30), `contracts:check OK (version 1.0.0)`,
  `contracts:lint OK`, `db:check: ok`, ml ruff + 7 pytest.
- Front-matter sweep of all 21 new/changed task files: nine scheduler keys, `id` = filename,
  unique slugs, owner ∈ `.opencode/agents/`, lane ∈ the eleven lanes.
- Deps sweep across all 47 task files: every `deps:` ID resolves to a file on disk; new subgraph
  acyclic (all new edges point to `TMU-DOC-001/002/003` or lower-numbered DOC ids).
- Content cross-checks: Blueprint §4 rows 224-258 ↔ `TMU-DOC-004..018` Goals/Contexts (no invented
  requirements found); `SCR-001..023` present; `scripts/check-contrast.mjs` present (DOC-016);
  BE-08 NotificationType present (DOC-017); `10-roadmap.md:20` M1 exit ↔ `TMU-DOC-020` ACs;
  `decisions-log.md:39-40` DEC-019/DEC-020 (the condition behind findings 3);
  traceability matrix Tasks column is all `—` → no orphan rows created by this filing.
- PR #32 fetched: Draft, label `documentation`, 1 commit.
- Not executable in this sandbox (only `git status|diff|log|show*`, `pnpm gate*`, `pnpm test*` are
  allowed): `node scripts/backlog-index.mjs` and `node scripts/next-task.mjs` — both were simulated
  by reading their sources (`backlog-index.mjs:38-71`, `next-task.mjs` runnable-set logic); the
  simulation is what finding 1 rests on. `bash scripts/check-lane.sh` directly (covered by gate
  step 1), `git fetch` (`origin/main` assumed `0a26eff` per `:100`), and `gate:full`/e2e (AC asks
  for the quick gate; docs-only diff). PR CI status not checked (`gh` denied).

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first, failed for the right reason | Met (caveat) | No RED row; the red state is described in Context (`:28-30`: `next-task` → `TMU-CTR-006` while `status.md` showed `M1 — 100%`) but no probe command is recorded. Precedent: `TMU-DOC-001` (comparable docs filing) also had no RED row and passed cycle 1 — not raised as a finding |
| 2 | New/updated tests pass; `pnpm gate` green | Met | My own run (above) |
| 3 | Contract tests for touched `API-*` | N/A | No endpoint, contract or generated file touched (`contracts:check` green) |
| 4 | Auth/RBAC; state transitions | N/A | Docs-only; no routes, services or state machines |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | Full-diff scan below; no response shapes or logs in scope |
| 6 | i18n keys for `id` + `en` | N/A | No user-facing text or error codes; `i18n:check` green (70 keys) |
| 7 | A11y (UI tasks) | N/A | No UI |
| 8 | Docs updated: status, Progress log, traceability, CHANGELOG | **Not met (finding 1)** | Front-matter `REVIEW` ✓ and Progress log present, but the generated indexes contradict the status; no contract change ⇒ no CHANGELOG entry required; traceability rows: matrix untouched, all `—` (consistent) |
| 9 | Generated files in sync, no hand edits | **Not met (finding 1)** | `backlog.md`/`status.md` are generator output but stale; neither was hand-edited in the drifting lines — a re-run fixes it |
| 10 | Reviewer verdict in `reviews/<ID>.md` | This file | Cycle 1 = `CHANGES` |
| 11 | Security review for sensitive tasks | N/A | No auth, claims, uploads or privacy-sensitive code paths; privacy scan performed (below) |
| 12 | PR ready, CI green, labels correct | Partial | PR #32 open as Draft with `documentation` label; Evidence line stale (finding 6); CI status unverified (`gh` denied) |

## Privacy

Diff contains only task/index markdown: no secrets or credentials, no emails, no hint answers, no
embeddings, no raw image URLs, no PII beyond public project references already on `main`. Nothing
in this diff changes logging or responses. DoD 5 satisfied.

## Notes for the human

1. **Verdict `CHANGES` — cycle 1 of 2.** All three MAJORs are small, in-lane text fixes (one is a
   single re-run of an existing script); no contract change, no `TMU-CTR-*` task, no CHANGELOG entry
   is needed. Fix commit + re-gate → I re-review as cycle 2; per the DoD, a second failing cycle
   sends the PR to `needs-human`.
2. **When the fix commit lands**, add `docs/08-project/reviews/TMU-META-004.md` to the task's
   "Files expected to change" list and record the PR + review URLs in Evidence (finding 6;
   precedent `reviews/TMU-DOC-001.md:156` flagged exactly this omission on cycle 2).
3. **Recommendation (orchestrator decides; reviewer files nothing):** this is the second escape of
   the index↔front-matter drift class (TMU-META-002 cycle 1, this task cycle 1). Consider filing a
   small ops/meta task to add that comparison to `scripts/checks/scaffold.test.mjs` — the gate
   currently cannot fail on stale indexes.
4. **Could not verify:** execution of `node scripts/backlog-index.mjs` / `node scripts/next-task.mjs`
   (sandbox allows only `git status|diff|log|show*`, `pnpm gate*`, `pnpm test*`), `git fetch`, PR CI
   status. Findings 1 and AC 3/4 rest on source-level simulation plus my manual sweep; a cycle-2
   agent with a wider sandbox should paste the real command output into Evidence.
