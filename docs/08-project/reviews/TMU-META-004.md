---
id: REV-TMU-META-004
task: TMU-META-004
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 2
---

# TMU-META-004 — Review cycle 2

Diff reviewed: `origin/main...HEAD` — `origin/main` = `0a26eff`, HEAD = `caf6ad1`, two commits,
25 files, +1,608/−2: `328e277 docs(project): file M1 task breakdown (TMU-DOC-002..020,
TMU-OPS-033)` (23 files, +1,387/−2 — reviewed as cycle 1 with verdict `CHANGES`, preserved
verbatim below) and the cycle-1 fix commit `caf6ad1 docs(project): fix TMU-META-004 review cycle 1
findings` (12 files, +263/−42). All 25 paths are under `docs/08-project/**` (lane `meta` +
`_common`), `git diff --check` is clean, the worktree is clean at `caf6ad1`, and the gate's lane
check passes. PR #32 is Draft with the `documentation` label, head `caf6ad1` == base `0a26eff`,
`mergeable_state: clean`, 2 commits / 25 files / +1,608/−2; its 12 CI check runs on `caf6ad1` are
11 `success` + `docker-build` `skipped` (verified via the GitHub REST API — `gh` is
sandbox-denied).

## Summary

**APPROVE — cycle 2 of 2.** 0 BLOCKER / 0 MAJOR / 5 MINOR. All three cycle-1 MAJORs are fixed,
and I re-verified each against the committed bytes rather than trusting the fix commit's message.
M1: `backlog.md` now carries 48 rows with `TMU-META-004` = `REVIEW` (`backlog.md:50`) and
`status.md:35` = `TODO: 21 · … · REVIEW: 1 · DONE: 1` with `## M1 — 4%` (= round(1/23)); I
re-derived both generated files field-by-field from all 48 front-matters against the generator
source and they equal what a run would write — no drift (execution still sandbox-denied, see
Checks run). M2: every `proposal.pdf` presence claim is now scoped to the main checkout
(`TMU-OPS-033.md:31-36`, `TMU-DOC-002.md:27-30`, `TMU-META-004.md:36-42`), DOC-002 AC1 copies by
SHA-256 (`:45-48`) and the live probe moved to DOC-002 (`TMU-OPS-033.md:53-58`). M3: the three
docs-lane tasks now declare read-only handoffs (`TMU-DOC-003.md:44-47,56-57`,
`TMU-DOC-008.md:30-32,39-41`, `TMU-DOC-019.md:32-34,45-47`), the meta-only files are gone from
their Files lists, `TMU-META-005` is filed (lane `meta`, owner `docs-keeper`, deps
`DOC-003/008/019`) and `TMU-DOC-020` now depends on it (`:10`) with the exit table extended
(`:70-71`) — no `lane: docs` task declares a meta-only path any more. MINOR 4–7 of cycle 1 are
fixed (filed-by table `:59`, "nine" at `TMU-DOC-014.md:36`, Evidence/Progress rows
`TMU-META-004.md:106-107,115-116`, README re-attribution `:36-42`).

Cycle-1 finding 8 (MINOR) is **not fixed**: the PR #32 body still claims the dep chain is
"acyclic, verified by the scaffold tests" (no such test exists), still says "(47 tasks)" and
"23 files", still omits `TMU-META-005` from the chain, and still says the review file is "added
once cycle 1 completes" although `caf6ad1` committed it. That plus four small new MINORs (a
one-sided probe handoff, an AC/Files inconsistency in the newly filed `TMU-META-005`, the review
file missing from this task's own Files list, and the non-allowed commit scope `project`) are the
whole remaining surface. None touches merged content: MINOR 1 is PR metadata fixed by one
`gh pr edit` before ready-for-review, and MINOR 2–5 are one-line wording fixes that may land in a
final commit or be filed as follow-ups per the DoD's MINOR rule. `pnpm gate` green on a fresh
reviewer run (139/139, 16 files); CI green; privacy clean; no test, contract, migration, config or
generated source is touched.

## Cycle-1 resolution

| # | Cycle-1 finding | Status | Evidence |
|---|---|---|---|
| 1 | **MAJOR** — committed `backlog.md:50` / `status.md:35` stale vs `TMU-META-004.md:4` (`REVIEW`) | **FIXED** | `caf6ad1` regenerates both indexes: 48 rows, `TMU-META-004` row = `REVIEW`, M1 counts `TODO: 21 · IN_PROGRESS: 0 · BLOCKED: 0 · REVIEW: 1 · DONE: 1 · CANCELLED: 0` = round(1/23·100) = 4%; full field-by-field re-derivation of both files from all 48 front-matters (sort key, row template, counters, percentages, checklist ticks) matches the committed bytes → regeneration would be a no-op |
| 2 | **MAJOR** — `proposal.pdf` asserted present where no worktree can see it; probe/intake ACs infeasible | **FIXED** | `TMU-OPS-033.md:31-36` ("main checkout … untracked … not in any agent worktree"), `TMU-DOC-002.md:27-30` ("absent here until you copy it in"), `TMU-META-004.md:36-42`; DOC-002 AC1 `:45-48` = copy from `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` (or git), SHA-256 compare, `git add` only, blocker if neither source exists; OPS-033 AC4 `:53-58` keeps the static glob proof and moves the live probe to DOC-002. No claim remains that the PDF is present in a worktree |
| 3 | **MAJOR** — `TMU-DOC-003/008/019` (`lane: docs`) declared meta-only files, failing the lane check when executed | **FIXED** | Handoff Context bullets + rewritten ACs + Files cleaned in all three (`TMU-DOC-003.md:44-47,56-57,63-65`; `TMU-DOC-008.md:30-32,39-41,49-51`; `TMU-DOC-019.md:32-34,45-47,53-55`); new `TMU-META-005.md` (72 lines: `lane: meta` `:5`, owner `docs-keeper` `:9`, deps `:10`, handoff ACs `:47-51`, meta-reachable Files `:58-62`); `TMU-DOC-020.md:10,28-30,70-71` gains the dep, rationale and exit row 7 (human gate renumbered to row 8). Sweep of every task's Files list: the only `docs/08-project/**` non-`tasks/` entries left in docs-lane tasks are `backlog.md`/`status.md` in `TMU-DOC-020.md:57-58` — both `_common` |
| 4 | MINOR — filed-by table gave `TMU-DOC-008` the dep `TMU-DOC-002` | **FIXED** | `TMU-META-004.md:59` = `TMU-DOC-003`, matching `TMU-DOC-008.md:10` and `backlog.md:37`; all 21 table rows re-checked against the filed files' `deps:` |
| 5 | MINOR — `TMU-DOC-014.md:36` said "eight" sections, listed nine | **FIXED** | `TMU-DOC-014.md:36` now "nine Blueprint-required sections (purpose, …, a11y notes)"; `\beight\b` across `docs/` → 0 hits |
| 6 | MINOR — Evidence/Progress behind reality (no `9 REVIEW` row, no PR/review links) | **FIXED** | `TMU-META-004.md:106-107` (review row + fix row), `:115` PR #32 URL (draft, label `documentation` — matches the API), `:116` review path |
| 7 | MINOR — Context over-credited `_source/README.md` with the M1 PDF deadline | **FIXED** | `TMU-META-004.md:36-42`: README quoted only for "must be added by a human" / extract "to be written in M1"; the M1 deadline is attributed to the roadmap M1 exit row |
| 8 | MINOR — PR body claims the dep chain is "verified by the scaffold tests" | **NOT FIXED** | PR #32 body (API, head `caf6ad1`) still says "Dependency chain (acyclic, verified by the scaffold tests)", "(47 tasks)", "23 files", chain `OPS-033 → … → DOC-020` without `TMU-META-005`, and "Review file … (added once cycle 1 completes)"; `scaffold.test.mjs:163` still only checks required front-matter keys, `:183-203` only ID/filename uniqueness — no deps-existence or cycle test. Carried forward as MINOR 1 below |

### How the index MAJOR (1) was verified without `node`

`node scripts/backlog-index.mjs` / `node scripts/next-task.mjs` remain sandbox-denied (only
`git status|diff|log|show*`, `pnpm gate*`, `pnpm test*` execute; edits are allowed only under
`docs/08-project/reviews/**`, so no scratch runner could be written either). I therefore
re-derived both outputs completely instead of simulating partially, as in cycle 1:

- **Statuses**: grep of `^status:` over `docs/08-project/tasks/` → 48 files; every value matches
  its backlog row (`DONE` ×25, `REVIEW` ×1 (`TMU-META-004`), `TODO` ×22), including the row that
  was stale in cycle 1 (`backlog.md:50`).
- **Row set/order**: 48 rows at `backlog.md:6-53`, sorted by `(milestone, id)` exactly as
  `backlog-index.mjs:44` does (M0: META-001..003 + OPS-001..021; M1: DOC-001..020, META-004,
  META-005, OPS-033; M2: CTR-006), row template `:49-52`, quote-stripping `:26` (cf. the quoted
  title at `TMU-DOC-002.md:3` rendering unquoted at `backlog.md:31`), header `:49`.
- **Dashboard**: `milestoneOrder` `:46` → M0/M1/M2; M0 24/24 = 100% (`status.md:4-6`), M1 1/23 =
  4% with `TODO: 21 … REVIEW: 1 … DONE: 1` (`:33-35`), M2 0% (`:61-63`); checklist ticks `:65-66`
  = only `DONE` tasks get `[x]` (`:37`), trailing blank line per `:67` (file ends at line 66).
- **Scheduler**: `next-task.mjs:98-119` without `--check-remote` gives `branches = []` (no
  branch/db exclusions), runnable = TODO ∩ all-deps-DONE = {`TMU-OPS-033` (deps `DOC-001` ✓),
  `TMU-CTR-006` (deps `OPS-005` ✓)}; sort `(milestone, priority, id)` → first = `TMU-OPS-033`,
  so AC 4's `next-task` expectation holds; `--all` would print 48 rows.

## BLOCKER

(none)

## MAJOR

(none)

## MINOR

- [ ] **1** (cycle-1 finding 8, still open) PR #32 body (repo metadata) — "Dependency chain
      (acyclic, **verified by the scaffold tests**)" is a claim no test makes
      (`scripts/checks/scaffold.test.mjs:163` = required front-matter keys, `:183-203` = ID/
      filename uniqueness; no deps-existence or cycle check exists anywhere in `scripts/`), and
      the body has now drifted from the branch it describes: "(47 tasks)" → 48, "23 files" → 25,
      the chain omits `TMU-META-005` (`TMU-DOC-020.md:10`), and "Review file … (added once cycle
      1 completes)" is stale — `caf6ad1` committed
      `docs/08-project/reviews/TMU-META-004.md`. Direction (pre-merge action, no repo file):
      `gh pr edit 32` — reword to "verified by reviewer inspection (cycle-1 review, AC 3)", bump
      the counts, add `→ TMU-META-005 → TMU-DOC-020`, and drop the review-file parenthetical.
- [ ] **2** `docs/08-project/tasks/TMU-META-004.md:90-97` — "Files expected to change" still
      omits `docs/08-project/reviews/TMU-META-004.md` although `caf6ad1` added it; cycle-1 note 2
      asked for exactly this once the fix landed, and sibling tasks list their review files
      (`TMU-DOC-001.md:41`, `TMU-META-001.md:56`, `TMU-META-002.md:57`, `TMU-OPS-011.md:63`).
      The new `TMU-META-005.md` got the analogous "(filed at review cycle 1)" treatment at
      `:95`, so the omission is inconsistent even within this file. Direction: add
      "- `docs/08-project/reviews/TMU-META-004.md`".
- [ ] **3** `docs/08-project/tasks/TMU-OPS-033.md:56-57` vs
      `docs/08-project/tasks/TMU-DOC-002.md:43-56` — OPS-033 AC4 requires the live probe to be
      "performed by `TMU-DOC-002` and cross-referenced back into this task's Progress log", but
      DOC-002's ACs only stage the PDF (`:45-48`) and run the lane check (`:56`); nothing tells
      its executor to append that cross-reference, and OPS-033 is already `DONE` by then (DOC-002
      depends on it, `TMU-DOC-002.md:10`). The handoff is one-sided, so the promised evidence
      link will silently never be written. Direction: add "record the probe result in
      `TMU-OPS-033`'s Progress log" to DOC-002's AC5, or drop the cross-reference requirement
      from OPS-033 AC4 (its static proof at `:57-58` already suffices).
- [ ] **4** `docs/08-project/tasks/TMU-META-005.md:52-54` vs `:55` and `:58-62` — AC3 says the
      branch "only edits … its own task file, `decisions-log.md`, `traceability-matrix.md`", yet
      AC4 mandates regenerating `backlog.md`/`status.md` when statuses change (META-005's own
      `TODO → … → DONE` flips guarantee that), and the Files list omits both indexes. A literal
      reading of AC3 either forbids AC4 or ships the exact index-drift class this cycle fixed —
      which nothing in the gate can catch (`scaffold.test.mjs` has no index↔front-matter check).
      Direction: scope AC3 to "…plus the two regenerated indexes when AC4 applies" and add
      `backlog.md`/`status.md` (regenerated) to Files, as `TMU-DOC-020.md:57-58` and
      `TMU-META-004.md:96-97` already do.
- [ ] **5** commits `328e277` and `caf6ad1` use scope `project`
      (`docs(project): …`), which is not in the allowed scope list
      `docs/05-workflow/07-commit-and-pr-conventions.md:28`
      (`web api worker ml db contracts ui i18n e2e docs ops agents tasks meta`). Subject shape,
      ≤72-char imperative and `Task:`/`Refs:`/`Agent:` trailers are otherwise correct. Same class
      as the cycle-1 scope finding on `TMU-META-002` (`reviews/TMU-META-002.md:43`, MINOR,
      precedent kept it MINOR). Direction: use `docs(meta)` or `docs(tasks)` for any further
      commits on this branch (history need not be rewritten), or add `project` to the list via a
      workflow-doc task — out of lane here.

## Checks run

- `git log origin/main..HEAD --oneline` → `caf6ad1` (fix) + `328e277` (filing). `git diff
  origin/main...HEAD --stat` → 25 files, +1,608/−2, every path under `docs/08-project/**`.
  `git diff --check origin/main...HEAD` → clean. `git status --short` in the worktree → empty
  before and after the gate.
- `git show caf6ad1 --stat` → 12 files, +263/−42; subject `docs(project): fix TMU-META-004 review
  cycle 1 findings`; body itemises M1/M2/M3/m4–m7 + the review file; trailers `Task:
  TMU-META-004`, `Refs: ROADMAP, BLUEPRINT`, `Agent: orchestrator` (scope `project` → MINOR 5).
- `pnpm gate` **run by me** in the worktree at `caf6ad1` → `OK gate(quick) passed`: lane check
  (step 1 = `scripts/check-lane.sh`, exit 0), prettier, lint, typecheck, i18n (70 keys/locale),
  **139 tests / 16 files** (including the live `db:check` suite), `contracts:check OK (version
  1.0.0)`, `contracts:lint OK`, `db:check: ok`, ml ruff + 7 pytest. Tail:

  ```
  > migrations check
  db:check: ok

  > ml lint+tests
  All checks passed!
  7 passed, 1 warning in 0.65s

  OK gate(quick) passed
  ```
- Index freshness (cycle-1 MAJOR 1): re-derivation described above — statuses 48/48, row order,
  template, counters, percentages and ticks all equal the committed bytes; a regeneration would
  produce no diff. `node scripts/backlog-index.mjs` could not be executed (sandbox denies `node`
  outside `pnpm gate`/`pnpm test`, and denies writing scratch files outside
  `docs/08-project/reviews/**`); this does not change the conclusion because the generator's
  output is a pure function of the 48 front-matters, all of which I read.
- Scheduler (AC 4): source-level derivation from `next-task.mjs:98-119` → runnable set
  {`TMU-OPS-033`, `TMU-CTR-006`}, first pick `TMU-OPS-033`; `--all` = 48. Not executed (same
  sandbox limit).
- Filed-by/deps sweep: all 21 rows of `TMU-META-004.md:52-72` match the filed files' `deps:`;
  every `deps:` ID across all 48 files resolves; graph with the two new edges (`DOC-020 →
  META-005`, `META-005 → DOC-003/008/019`) is acyclic — nothing reaches `META-005`/`DOC-020`
  except their dependents. Slug `sync-meta-registers-m1` (`TMU-META-005.md:6`) unique; owner
  `docs-keeper` exists in `.opencode/agents/`; lane `meta` ∈ the eleven lanes.
- Lane audit: grepped every task's `Files expected to change` for `docs/08-project/` entries —
  no `lane: docs` task declares a meta-only path (finding 3 closed). `TMU-META-005`'s Files
  (`:58-62`) are all meta-reachable, which is why filing it (rather than widening `_common`) was
  the right fix.
- Text sweeps: `\beight\b` in `docs/` → 0 hits (m5); "47 tasks" appears only in this review's
  historical cycle-1 section and in Progress row `TMU-META-004.md:105` (correct at the time it
  was written; the `TMU-META-002` precedent is that historical rows are not rewritten);
  `proposal.pdf` presence claims are all main-checkout-scoped; exit-table renumber has no other
  referents (`TMU-DOC-020.md:71` is the only "Human gate" row).
- PR + CI via GitHub REST API (no `gh`): `pulls/32` → Draft, label `documentation`, head
  `caf6ad1` == worktree HEAD, base `0a26eff`, 2 commits / 25 files / +1,608/−2, body quoted in
  MINOR 1; `commits/caf6ad1/check-runs` → 12 runs: `audit`, `migrations`, `build`, `integration`,
  `ml`, `secret-scan`, `contracts`, `e2e`, `unit`, `contract-fuzz`, `lint-typecheck` =
  `success`, `docker-build` = `skipped`.
- Not executable here: `node scripts/*`, writing scratch files (edits allowed only under
  `docs/08-project/reviews/**`), `gh`, `git fetch`, direct `bash scripts/check-lane.sh` (covered
  by gate step 1), `gate:full`/e2e (docs-only diff; quick gate is what AC 6 asks). No test file
  was added, changed or weakened by this diff (25/25 paths are task/index/review markdown).

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first, failed for the right reason | Met (caveat, as cycle 1) | Docs-filing task; no product code or test changed; cycle-1 recorded this as accepted for comparable filing tasks (`TMU-DOC-001`) — not re-raised |
| 2 | New/updated tests pass; `pnpm gate` green | Met | My own fresh run (above), 139/139 |
| 3 | Contract tests for touched `API-*` | N/A | No endpoint, contract or generated file touched (`contracts:check` green) |
| 4 | Auth/RBAC; state transitions | N/A | Docs-only; no routes, services or state machines |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | See Privacy |
| 6 | i18n keys for `id` + `en` | N/A | No user-facing text; `i18n:check` green (70 keys) |
| 7 | A11y (UI tasks) | N/A | No UI |
| 8 | Docs updated: status, Progress log, traceability, CHANGELOG | Met | `TMU-META-004.md:106-107` Progress rows, `:115-116` Evidence; index rows match front-matter; traceability matrix intentionally deferred to `TMU-META-005` (Tasks column is still all `—`, so no orphan rows); no contract change ⇒ no CHANGELOG entry |
| 9 | Generated files in sync, no hand edits | **Met** | Cycle-1 MAJOR fixed: full re-derivation shows `backlog.md`/`status.md` equal generator output (48 rows, `REVIEW`, counts, 4%); no hand-edit signature in either file (header comment intact, format matches `backlog-index.mjs:49-52,55-67`) |
| 10 | Reviewer verdict in `reviews/<ID>.md` | **Met** | This file, cycle 2 = `APPROVE` |
| 11 | Security review for sensitive tasks | N/A | No auth, claims, uploads or privacy-sensitive code; privacy scan performed (below) |
| 12 | PR ready, CI green, labels correct | Met (step 12 pending) | CI green on `caf6ad1` (11 success + 1 skipped), label `documentation` present; PR still Draft by design — loop step 12 flips it; PR body stale (MINOR 1) |

## Privacy

Clean. The diff is markdown only: task files, two generated indexes, one review file. It records
the path of an untracked local file (`E:\TemuUNAIR-v2\docs\_source\proposal.pdf`) — a filesystem
path, not a secret — and no file content. No emails, hint answers, embeddings, raw image URLs,
tokens or `.env`; no logging, analytics or response surface is touched; fixtures are absent by
construction. DoD 5 satisfied.

## Notes for the human

1. **Verdict `APPROVE` — cycle 2 of 2, 0 BLOCKER / 0 MAJOR / 5 MINOR.** Justification for
   approving with open MINORs: none of the five changes merged content — cycle-1 findings 1–7 are
   fixed and re-verified; MINOR 1 is PR-description metadata; MINOR 2–4 are one-line wording fixes
   in task files; MINOR 5 is a commit-scope token on already-pushed commits. Per the DoD, MINORs
   may be fixed opportunistically before merge or filed as follow-up tasks (they must be filed,
   not silently dropped) — no third review cycle is needed either way.
2. **Before ready-for-review (orchestrator):** run `gh pr edit 32` for MINOR 1 (the body is now
   factually wrong about counts, the dep chain and the review file), and decide for MINOR 2–5
   fix-now vs follow-up. When this file lands, `TMU-META-004.md:116` ("cycle 2 pending") and the
   step-13 close-out (`status: DONE`, PR/review URLs) still need updating — the standard
   post-APPROVE bookkeeping, not a finding.
3. **Recommendation (repeated from cycle 1; orchestrator decides, reviewer files nothing):** this
   is the second time an index↔front-matter drift escaped into a commit (TMU-META-002 cycle 1,
   this task cycle 1), and MINOR 4 above plants the same class prospectively in `TMU-META-005`.
   Consider the small ops/meta task that adds a compare-regenerate-and-diff check to
   `scripts/checks/scaffold.test.mjs` so the gate can fail on stale indexes.
4. **Could not verify by execution:** `node scripts/backlog-index.mjs`, `node
   scripts/next-task.mjs`, `bash scripts/check-lane.sh` directly, `git fetch`, and `gh` — the
   sandbox executes only `git status|diff|log|show*`, `pnpm gate*`, `pnpm test*` and permits edits
   only under `docs/08-project/reviews/**` (so not even a temporary probe file could be written).
   Both generators were instead re-derived field-by-field from all 48 front-matters, the
   scheduler from its source, and PR/CI state from the GitHub REST API. The task's own Evidence
   (`TMU-META-004.md:114`: "backlog-index → 48 tasks; next-task → TMU-OPS-033") records the
   author's runs and is consistent with my derivation; a future agent with a wider sandbox can
   paste real command output over it.
5. **Correction to my cycle-1 record (no impact):** cycle-1 AC 1 evidence said "slugs unique" —
   that was wrong: `TMU-META-001.md:6` and `TMU-META-002.md:6` both use
   `post-merge-bookkeeping`. It is pre-existing, outside this diff, and nothing requires slug
   uniqueness (`scaffold.test.mjs:163` only requires the key to be present); unique **IDs**
   matching filenames hold for all 48 files, which is what the AC actually asks.
6. **Out of scope, not filed by me:** `TMU-OPS-016.md:75` (a `lane: ops` task) lists
   `docs/08-project/decisions-log.md`, a meta-only path — pre-existing and `DONE`, untouched by
   this diff; noting it only because the same lane rule drove finding 3.

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
  `decisions-log.md:39-40` DEC-019/DEC-020 (the condition behind finding 3);
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
