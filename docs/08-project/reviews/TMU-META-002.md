---
id: REV-TMU-META-002
task: TMU-META-002
reviewer: reviewer
verdict: CHANGES
date: 2026-09-30
cycle: 1
---

# TMU-META-002 — Review cycle 1

Diff reviewed: `origin/main...25234ef` (single commit `25234ef`, 5 files, +155/−11). Scope matches
the task's declared file list exactly: the two status flips (`TMU-OPS-002`, `TMU-META-001`), this
task's own file, and the two regenerated indexes. Every changed path is `meta` or `_common`
(`.agent/lanes.json:2-9`, `:100-104`); no runtime, contract, config or test file is touched.

## Summary

**CHANGES.** The bookkeeping content itself is correct and verified: `b9d6ba6` (PR #5) and
`5d1f9e1` (PR #4) are real single-parent squashes on `origin/main` with matching timestamps;
`TMU-OPS-002.md` and `TMU-META-001.md` now read `DONE` with accurate PR/commit/review evidence and
no `(draft)`/`(pending)` leftovers; `pnpm gate` is green (36/36). One MAJOR, however, defeats the
purpose of this task: the committed `backlog.md`/`status.md` were generated **before** this task
flipped its own status to `REVIEW`, so they are stale relative to the committed task file — a
regeneration produces a diff, failing DoD #9 ("generated files in sync") and the task's own
"generated files are authentic" check. The probe's six checks do not include index freshness,
which is why this slipped through. Fix is one command (re-run the generator, commit both files);
the verdict returns to the author for that, plus three MINORs.

## BLOCKER

(none)

## MAJOR

- [ ] `docs/08-project/backlog.md:7`, `docs/08-project/status.md:6` — the committed generated
      indexes are stale: they show `TMU-META-002` as `IN_PROGRESS` (`IN_PROGRESS: 1 · REVIEW: 0`),
      while the committed task file says `status: REVIEW`
      (`docs/08-project/tasks/TMU-META-002.md:4`). `scripts/backlog-index.mjs:51` writes `t.status`
      verbatim from the front-matter and `:59-66` derives the counters, so regenerating at
      `25234ef` would rewrite `backlog.md:7` (`IN_PROGRESS` → `REVIEW`) and `status.md:6`
      (`IN_PROGRESS: 0 · REVIEW: 1`); `status.md:9` stays `- [ ]`. The generator was evidently run
      at step 5 GREEN (`TMU-META-002.md:71`) and not re-run after the step-6 status flip
      (`TMU-META-002.md:72`). Every earlier merge (`b9d6ba6`, `5d1f9e1`) shipped indexes consistent
      with its task files, so this is a regression against the established pattern. **Direction:**
      re-run `node scripts/backlog-index.mjs` after the status flip, commit both files, and prove
      sync with `git diff --exit-code docs/08-project/backlog.md docs/08-project/status.md`;
      consider adding that self-check to the inlined probe so future bookkeeping tasks cannot ship
      a stale index.

## MINOR

- [ ] `docs/08-project/tasks/TMU-META-002.md:83-85`, `:99-100` — the red evidence cites
      `node scripts/tooling/meta002-probe.mjs --head`, which reads `HEAD:` blobs via `git show`. At
      the reviewed commit `25234ef` HEAD already contains the edits, so `--head` now yields
      **6/6 PASS**, not FAIL; the 6/6 FAIL list is reproducible only against the pre-edit commit
      `b9d6ba6`. Same class as TMU-OPS-002 review F2 — cite `b9d6ba6:` (or `origin/main:`) in the
      red command so it stays reproducible after merge.
- [ ] `docs/08-project/tasks/TMU-META-002.md:36-39`, `:62` — the cold-start Vitest 5 s timeout in
      `scripts/checks/config-presets.test.mjs` is recorded and deferred but not filed as a
      follow-up task or blocker. CI runners are cold by construction; a 5409 ms run against the
      default 5000 ms timeout is a latent flake. File it (TMU-OPS-008 covers gate/CI parity) or
      raise the timeout for that guard.
- [ ] `docs/05-workflow/07-commit-and-pr-conventions.md:28` — commit `25234ef` uses scope `meta`
      (`docs(meta): close OPS-002 and META-001 after merge`), which is not in the allowed scope
      list (`web api worker ml db contracts ui i18n e2e docs ops agents tasks`). Pre-existing for
      meta commits (`5d1f9e1`, `e4fc457`), but by the TMU-OPS-002 F7 precedent add `meta` to the
      list (or use an allowed scope).

## Checks run

- `git diff origin/main...HEAD --stat` → 5 files, +155/−11: `docs/08-project/backlog.md`,
  `docs/08-project/status.md`, `tasks/TMU-META-001.md`, `tasks/TMU-META-002.md`,
  `tasks/TMU-OPS-002.md`. All `meta`/`_common` per `.agent/lanes.json:2-9,100-104`; the gate's
  lane check passed.
- `git log origin/main -4 --oneline` → `b9d6ba6` (PR #5), `5d1f9e1` (PR #4), `b7137d3`, `c066330`.
  Both merges are real single-parent squashes (`b9d6ba6` parent = `5d1f9e1`); commit times
  `2026-09-30T21:02:51+07:00` / `17:51:11+07:00` match the task's claimed merge times. The cited
  pre-merge CI heads `9cbefaf` (OPS-002) and `e4fc457` (META-001) exist as real commits.
- `node scripts/backlog-index.mjs` then `git status --short docs/08-project/backlog.md
  docs/08-project/status.md` → **could not run** (sandbox permission layer denies `node` outside
  `pnpm gate`/`pnpm test`). Resolved statically: the generator copies front-matter status verbatim
  (`scripts/backlog-index.mjs:51`), so the committed output is stale and a run would produce a
  diff — see MAJOR 1. This does not depend on executing the script.
- `pnpm gate` → **OK gate(quick) passed**: lane check clean, format/lint/typecheck green,
  `i18n:check` skipped (M3), unit 36/36 (scaffold 26 + config-presets 10), contracts/openapi/db
  pending by design (M0). Tail:

  ```
  > migrations check
  pending: db:check — not implemented until TMU-OPS-005
           applies migrations to an empty pgvector database and diffs the result
           M0 exit criteria allow this step to be a no-op; it exits 0.

  OK gate(quick) passed
  ```

- Probe (`--head` and default) → **could not run**: writing outside `docs/08-project/reviews/**`
  and executing `node` are both denied by the sandbox. Static determination: at `25234ef` all six
  predicates hold in both `HEAD:` and the worktree (no local modifications), so both modes yield
  **6/6 PASS**; the FAIL list is reproducible only against `b9d6ba6` (MINOR 1). No probe file is
  left behind: `git status --short` shows only the untracked review file, and no
  `meta002-probe.mjs` exists anywhere in the tree.
- `git diff --check origin/main...HEAD` → clean (no whitespace errors).
- `gh` (PR pages / CI runs) → blocked by the sandbox; the "10 pass, `docker-build` skipped"
  claims are unverified here. Commit existence/ancestry was verified locally instead.
- TMU-OPS-002.md / TMU-META-001.md diff inspection → statuses flip to `DONE`; evidence now cites
  PR #5/#4, `b9d6ba6`/`5d1f9e1`, and CI heads `9cbefaf`/`e4fc457`; no `(draft)`/`(pending)`
  remains in either file. META-001's six review MINORs are visibly fixed (OPS-001 PR line `:160`,
  OPS-015 PR line `:90`, criteria ticked, decision-table `updated: 2026-09-30`, META-001 file list
  includes OPS-015, red-evidence one-liner present). No stale evidence or inaccuracy found in
  these two diffs.

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first and failed for the right reason | Met (MINOR 1) | Probe 6/6 FAIL against the pre-edit tree, script inlined (`TMU-META-002.md:83-129`); the `--head` citation is not reproducible at `25234ef` (MINOR 1). |
| 2 | All new/updated tests pass; full `pnpm gate` green | Met | Reviewer ran `pnpm gate` → `OK gate(quick) passed`, 36/36 unit. |
| 3 | Contract tests for every touched `API-*` | n/a | No endpoint, contract or generated artefact touched. |
| 4 | Auth/RBAC asserted; state transitions covered | n/a | Docs-only change; no routes, services or state machines. |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | See Privacy. |
| 6 | i18n keys for `id` and `en`; `error.<code>` keys | n/a | No user-facing string added; `i18n:check` intentionally skips until M3. |
| 7 | A11y: states + keyboard path + zero axe violations | n/a | No UI component added. |
| 8 | Docs updated: task status, Progress log, traceability, CHANGELOG | Met | OPS-002/META-001 flipped with PR/commit/review evidence; META-002 Progress log current; traceability rows and contract CHANGELOG correctly out of scope (no FR/API/contract change). |
| 9 | Generated files in sync; no hand edits | **Not met** | MAJOR 1 — committed `backlog.md`/`status.md` are stale versus `TMU-META-002.md:4`; regeneration produces a diff. No evidence of hand editing. |
| 10 | Reviewer verdict `APPROVE` in `reviews/<ID>.md` | **CHANGES** | This file; MAJOR 1 must be fixed first. |
| 11 | Security review for sensitive tasks | n/a | No auth, claims, uploads or privacy code; supply chain unchanged. |
| 12 | PR ready, CI green, labels correct | Not yet | No PR opened (`TMU-META-002.md:131`); step 12. `gh` blocked in this sandbox, so CI cannot be re-verified here. |

## Privacy

Clean. The diff is markdown only: status flips, Progress-log rows, PR URLs and commit SHAs. No
emails, hint answers, embeddings, raw image URLs, secrets or `.env`; no logging, analytics or
response surface. The inlined probe uses only synthetic repo paths.

## Notes for the human

- MAJOR 1 is a one-command fix: re-run `node scripts/backlog-index.mjs` after the status flip and
  include both index files in the fix commit; `git diff --exit-code` afterwards proves sync.
- The review brief expected `--head` → 6 FAIL; at `25234ef` it yields 6/6 PASS because HEAD
  contains the edits. The red state is reproducible against `b9d6ba6` — see MINOR 1. The probe's
  six predicates do not include index freshness, which is how MAJOR 1 escaped; adding a
  regenerate-and-diff check would close that gap.
- The standard step-13 close-out for this task itself (`status: DONE`, PR/Review links, Progress
  log rows) is still pending; by the META-001 review precedent that is not a finding.
- `node` and `gh` were denied by the sandbox permission layer, so checks 3 and 5 were resolved by
  static analysis instead of execution; the MAJOR finding does not depend on running anything.
