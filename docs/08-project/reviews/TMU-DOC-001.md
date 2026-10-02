---
id: REV-TMU-DOC-001
task: TMU-DOC-001
reviewer: reviewer
verdict: CHANGES
date: 2026-10-02
cycle: 1
---

# TMU-DOC-001 — Review cycle 1

Diff reviewed: `origin/main...0424059` (1 commit, 5 files, +27/−14). Docs-only: no code,
contract, migration, generated-source or config file touched; no test added, weakened or
deleted (nothing in the diff is executable). Lane check clean — `docs/01-product/10-roadmap.md`
is the `docs` lane (`.agent/lanes.json:11`); `docs/08-project/{tasks,reviews,backlog.md,status.md}`
are in `_common` (`.agent/lanes.json:3-8`). Single commit is a Conventional Commit with the
required `Task: TMU-DOC-001` trailer.

All four acceptance criteria were re-verified by me, not taken from the Progress log: AC1, AC2,
AC3 and AC4 all **PASS**. However, the M0 range rewrite in the roadmap table left the table
internally self-contradictory: the same table now assigns `TMU-OPS-011..016` to **both** M0 and
M8, and those six IDs already exist on disk as completed M0 task files. That is a MAJOR and
blocks APPROVE.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `docs/01-product/10-roadmap.md` reflects M0 as complete / tagged `m0-bootstrap` | **PASS (with note)** | `10-roadmap.md:19` carries `TMU-OPS-001..021, TMU-META-001..003 (**DONE**)` and human gate `Tag m0-bootstrap`. Note: `git show-ref --tags` returns nothing — the tag does not exist yet, and the cell reads as an instruction rather than a status (finding 4). |
| 2 | M0 (`TMU-OPS-001..021`, `TMU-META-001..003`) and M9 reservations (`TMU-OPS-022..026`) updated | **PASS for M0/M9; scope gap elsewhere** | `10-roadmap.md:19` and `:28` match the AC verbatim. M9 range is a reservation only (no `TMU-OPS-022..026` task files) — consistent with how `TMU-QA-023..026` / `TMU-DOC-021..024` are already reserved, so not a defect. The M8 row inside the same table was not renumbered (finding 1). |
| 3 | `status.md` shows M0 at 100% DONE | **PASS** | `status.md:4` `## M0 — 100%`, `:6` `DONE: 24`, all 24 checkboxes ticked (`:8-31`), 0 TODO/IN_PROGRESS/BLOCKED/REVIEW. Arithmetic reconciles with `backlog.md` (3 META + 21 OPS, all `DONE`). |
| 4 | `pnpm gate` green | **PASS (reviewer-run)** | Ran myself in `E:\wt\TMU-DOC-001`: `OK gate(quick) passed`, unit **139/139** (16 files), `contracts:check OK (version 1.0.0)`, `contracts:lint OK`, `db:check: ok`, ruff clean + `7 passed`, `i18n:check passed (70 keys per locale)`, lane check clean. |

## Findings

| # | Severity | File:line | Finding | Evidence |
|---|---|---|---|---|
| 1 | **MAJOR** | `docs/01-product/10-roadmap.md:19` vs `:27` | After widening M0 to `TMU-OPS-001..021`, the roadmap now assigns `TMU-OPS-011..016` to **two milestones at once**: M0 (line 19, `(**DONE**)`) and M8 Hardening (line 27, unchanged). The six IDs are not free reservations — they already exist as task files. | `docs/08-project/backlog.md:19-24` lists `TMU-OPS-011..016` all with `milestone: M0`, `status: DONE` (loop runnability, web Docker, test packages, workspace glob, gh PR perms, merge perms); files `docs/08-project/tasks/TMU-OPS-011..016.md` exist. Before this diff M0 read `001..010` and M8 `011..016` did not collide *inside the table*; line 19 changed to `001..021` and line 27 was left stale, so the table now contradicts itself. When M8 is planned, `TMU-OPS-011..016` cannot be filed (IDs taken) and task-ID allocation will collide. **Suggested direction:** renumber the M8 ops reservation past M9 (e.g. `TMU-OPS-027..032`), or write it as `TMU-OPS-### (reserved — TBS)` until M8 is planned. This is precisely the "task range" hygiene AC2 exists for; fixing it is a one-cell edit. |
| 2 | MINOR | `docs/01-product/10-roadmap.md:21` | The M2 row was changed from `TMU-CTR-001..005` to `TMU-CTR-001..006` — a change no AC asks for and no Progress-log row mentions (the log at `TMU-DOC-001.md:49` records only M0 and M9). The change is factually right (`backlog.md:31` has `TMU-CTR-006` in M2), but it silently invalidates a quoted reference: `docs/08-project/tasks/TMU-CTR-006.md:19` still says the roadmap "reserves `TMU-CTR-001..005`". | Diff hunk 1 of `10-roadmap.md`; `TMU-DOC-001.md:49` (Progress log) and `:35-40` (Files expected to change) never mention M2. Suggested direction: log the extra edit in the Progress log and update the stale quote in `TMU-CTR-006.md:19`, or drop the M2 change from this PR. |
| 3 | MINOR | `docs/01-product/10-roadmap.md:6` | Front-matter still reads `updated: 2026-09-29` although the content changed on 2026-10-02. | Doc governance: every manifest doc carries an `updated` field; this PR edits the body and leaves the date stale, so readers cannot tell the M0 row is current. Suggested direction: bump to `2026-10-02`. |
| 4 | MINOR | `docs/01-product/10-roadmap.md:19` | Two accuracy nits in the human-gate cell: (a) the condition `remote = HanifIsya/temuUNAIR-v2` was dropped from the M0 gate (it was there on `origin/main`), and (b) the row claims M0 `(**DONE**)` while the gate is phrased as a pending instruction and the tag does not exist yet. | `git show-ref --tags` → empty output in this clone; `m0-bootstrap` is not applied. The remote condition still matters (`TMU-OPS-010.md:79` verifies it; `TMU-OPS-009.md:26` quotes it as an M0 exit criterion). Suggested direction: keep both conditions, e.g. `Tag m0-bootstrap (pending human); repo protected; remote = HanifIsya/temuUNAIR-v2`. |
| 5 | MINOR | `docs/01-product/10-roadmap.md:19` | The M0 *goal* criterion was rewritten from "`pnpm gate` runs (even if mostly no-op)" to "`pnpm gate:full` runs clean". That strengthens the exit bar, is not covered by any AC, and is not recorded in the Progress log — while two other documents still quote the old sentence. | Stale cross-references: `docs/08-project/tasks/TMU-OPS-001.md:27` ("M0 exit criteria: `pnpm gate` runs (even if mostly no-op)") and `scripts/checks/pending.mjs:4` (same quote). The new wording is defensible (`TMU-OPS-010.md:85,133` pastes a green `gate(full)` tail and carries a cycle-2 `APPROVE`), but an unlogged criterion change in a "reflect completion" task is what the checklist's *no drive-by edits* rule targets. Suggested direction: log it in the Progress log and align/annotate the two quoters, or revert to the original sentence. |
| 6 | MINOR | `docs/08-project/tasks/TMU-DOC-001.md:35-40` | "Files expected to change" omits `docs/08-project/tasks/TMU-OPS-010.md`, which this diff modifies (`status: REVIEW` → `DONE` at `TMU-OPS-010.md:4`). | The Progress log (`TMU-DOC-001.md:49`) does disclose it, and the flip is legitimate — `docs/08-project/reviews/TMU-OPS-010.md` is cycle-2 `APPROVE` and `TMU-OPS-010.md:37-38` explicitly anticipates reaching 100% after merge — but a declared file list that does not match the diff breaks §0 of the review checklist for the next reader. Suggested direction: add the line to the file list. |
| 7 | MINOR | `docs/08-project/tasks/TMU-DOC-001.md:55-56` | `Evidence` still reads `PR: (pending)` / `Review: (pending)` — DoD item 12 (PR ready, CI green, labels correct) cannot be evaluated yet. | `git status` shows the branch pushed to `origin/agent/docs/TMU-DOC-001-m0-exit-roadmap-update`, but no PR URL/CI evidence is recorded. Required before merge, not before this review. |

No BLOCKER.

## Checks run

- `git diff --stat origin/main...HEAD` → 5 files: `docs/01-product/10-roadmap.md`,
  `docs/08-project/backlog.md`, `docs/08-project/status.md`,
  `docs/08-project/tasks/TMU-DOC-001.md`, `docs/08-project/tasks/TMU-OPS-010.md` (+27/−14).
  Docs-only; no `packages/**`, `apps/**`, `services/**`, `.github/**`, `scripts/**`, migration,
  contract or generated-source file touched.
- `git diff origin/main...HEAD` → read in full; no secrets, no PII, no hint answers/emails/
  embeddings/image URLs in any added line (privacy rule 5 checked, not assumed).
- `git log origin/main..HEAD --oneline` → 1 commit `0424059 docs(roadmap): update roadmap with
  M0 completion and M1 kickoff`; `%B` = Conventional Commits header + `Task: TMU-DOC-001` +
  `Refs: ROADMAP, BLUEPRINT`.
- `pnpm gate` (workdir `E:\wt\TMU-DOC-001`, reviewer-run, not copied from the agent's log) →
  **`OK gate(quick) passed`**: lane check clean; Prettier clean; lint; typecheck;
  `i18n:check passed (70 keys per locale)`; unit **139 passed / 16 files**; `contracts:check OK
  (version 1.0.0)`; `contracts:lint OK`; `db:check: ok`; ML `ruff` clean + `7 passed`.
- `git show-ref --tags` → no output (no `m0-bootstrap` tag present in this clone).
- Generated-file sync (DoD 9): my sandbox permits only `git *` / `pnpm gate|test` commands, so
  I could **not** execute `node scripts/backlog-index.mjs`. I reconciled `backlog.md` and
  `status.md` by hand against the generator's rules (`scripts/backlog-index.mjs:44-69`): sort by
  milestone then id → `META-001..003`, `OPS-001..021`, `DOC-001`, `CTR-006` = exactly the row
  order in `backlog.md:6-31`; status counts `24 DONE → Math.round(24/24*100) = 100` =
  `status.md:4-6`; non-`DONE` renders as `- [ ]` = `status.md:37`. Every changed row (OPS-010
  `REVIEW→DONE`, DOC-001 `TODO→REVIEW`) matches the task front-matter. **Verdict: generated
  files are in sync** (verified by inspection, not by execution).
- Lane/scope: all 5 paths inside the `docs` lane or `_common` (`.agent/lanes.json:3-16`). No
  out-of-lane edits; both generated files still carry the `<!-- GENERATED ... -->` header and
  match generator output; no merged migration, no contract, no `CONTRACT_VERSION` change (so no
  CHANGELOG obligation).
- Review artifacts consulted: `docs/05-workflow/06-code-review-checklist.md`,
  `docs/05-workflow/05-definition-of-ready-done.md`,
  `docs/08-project/reviews/TMU-OPS-010.md` (cycle-2 `APPROVE` — what legitimises the OPS-010
  `DONE` flip), and the open follow-up `n11` at `docs/08-project/tasks/TMU-OPS-021.md:72` /
  `docs/08-project/reviews/TMU-OPS-005.md:648` (stale M0/M9 ranges — the M0 half is fixed by
  this diff; the M8 half was never in `n11` and is now finding 1).
- Not run: `pnpm gate:full` (AC4 asks only for `pnpm gate`). The M0-row claim "`pnpm gate:full`
  runs clean" rests on `TMU-OPS-010.md:87-134` + its cycle-2 APPROVE, not on this review.

## Notes for the human

1. Finding 1 is the only thing standing between this PR and APPROVE: `10-roadmap.md:27` must
   stop reserving IDs that line 19 already owns. One cell — please fix it in this branch rather
   than filing a follow-up; the roadmap is the ID-allocation source of truth and will be read by
   the next scheduler session.
2. Before tagging `m0-bootstrap`, run `pnpm gate:full` yourself if you want an independent
   confirmation beyond `TMU-OPS-010`'s pasted tail; this review deliberately ran only the quick
   gate.
3. Process gap outside this task's scope (recorded so it is not lost): `scripts/gate.sh` runs
   `contracts:check` but has **no drift check for the two generated docs** (`backlog.md` /
   `status.md`) — they can be hand-edited and CI stays green. Worth an `ops` backlog row:
   regenerate then `git diff --exit-code`.
4. No security/privacy/auth/RBAC/i18n/a11y surface in this diff — those checklist sections are
   n/a, not skipped.
