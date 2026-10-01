---
id: REV-TMU-OPS-005
task: TMU-OPS-005
reviewer: reviewer
verdict: REQUEST CHANGES
date: 2026-10-01
cycle: 1
---

# TMU-OPS-005 — Review cycle 1

Diff reviewed: `origin/main...6572380` in worktree `E:\wt\TMU-OPS-005` (2 commits: `fe1d586`
claim, `6572380` feat), 18 files — `packages/db/**` (13), `tests/db/**` (4),
`docs/08-project/tasks/TMU-OPS-005.md`, `pnpm-lock.yaml`. Working tree clean at review time.

**Verdict: `REQUEST CHANGES`** — no BLOCKER, but three MAJORs (M1–M3) must be fixed in-lane and the
cycle rerun. Nothing needs a human decision beyond MINOR `m1` (BE-05 wording, contracts lane).

## Summary

The substance of the task is good and independently verifiable: `0001_init.sql` really is
extensions-only, `src/schema.ts` is `export {}`, the skip notice is the exact named string the frozen
test greps for, the lane is clean, no secrets are in the diff, the frozen tests contain no
`testTimeout` / `.only` / weakened assertions, and I re-ran `pnpm gate` myself (green, printing
`db:check: skipped (DATABASE_URL is not set)`). Three things stop an approve: (M1) `new URL()` sits
outside `runCheck`'s `try`, so a malformed `DATABASE_URL` becomes an unhandled rejection whose Node
dump prints the raw URL — contradicting the file's own "never logs the URL" claim; (M2) there is no
`connectionTimeoutMillis` and no watchdog anywhere, so `db:check` can hang the gate forever and never
reach `worker.terminate()`; (M3) the RED-evidence record names a failure cause that cannot have
occurred in the run it describes.

## BLOCKER

_None._

## MAJOR

- [ ] **M1** — `packages/db/src/check.ts:77-78` — `const scratchUrl = new URL(databaseUrl)` runs
      **before** the `try` at `:83`. When `DATABASE_URL` is present but malformed (missing scheme,
      unencoded `#` / space / `@` in the password — the ordinary copy-paste case): (a) `runCheck`
      **rejects** instead of returning `1`, breaking its `Promise<number>` contract and the CLI path
      at `:159` (the process exits via an unhandled top-level-await rejection instead of
      `process.exitCode = 1`, and `check-live.test.ts:41` would receive a rejected promise instead of
      an exit code); (b) Node's default rejection dump `util.inspect`s the error, and `ERR_INVALID_URL`
      carries the offending URL in its own enumerable `input` property, so the **full `DATABASE_URL`
      including the password is printed to stderr** — directly contradicting `check.ts:9` and
      `check-worker.ts:15` ("neither the URL nor its contents are ever logged"), DoD #5 and
      AGENTS.md hard rule 5. **Fix:** move `:77-78` inside the `try` (the worker's own `new URL` at
      `check-worker.ts:81` is already inside its `try`, and its `cause.message` is the harmless
      `"Invalid URL"` without `input`), and never interpolate `cause.message` for URL parse failures —
      emit a fixed `db:check: failed: DATABASE_URL is not a valid URL`.

- [ ] **M2** — `packages/db/src/check.ts:104`, `:108`, `:148` + `packages/db/src/check-worker.ts:76`,
      `:83` — **no timeout anywhere in the package** (grep for
      `connectionTimeoutMillis|setTimeout|deadline|race(` across `packages/db` → 0 hits). `pg`
      defaults `connectionTimeoutMillis` to `0` (wait forever), so a stalled/black-holed endpoint
      hangs `await admin.connect()` (`check-worker.ts:77`) or `await pool.connect()` (`check.ts:109`);
      the main thread then blocks forever in `await inbox.next()` (`check.ts:104`), the `finally`
      block never runs, `worker.terminate()` (`check.ts:151`) is never reached, the scratch database
      created at `check-worker.ts:78` is never dropped, and `pnpm gate` / the CI `migrations` job hang
      with no output until an external timeout (GitHub's default job timeout is 6 h). This is the
      same class of problem the two-thread design exists to solve (fitting a budget) — just never
      bounded. **Fix:** set `connectionTimeoutMillis: 10_000` on the admin `Client`
      (`check-worker.ts:76`), the worker `Pool` (`:83`) and the main `Pool` (`check.ts:108`), **and**
      put an overall deadline around the message loop and the `finally` wait (e.g. `Promise.race`
      with a timer that posts `finish`, `terminate()`s the worker and returns `1`) so the guarantee
      "worker always terminated" holds under failure and not only on the happy path. While there:
      `db:check` prints nothing until it finishes (`check.ts:131`) — one progress line per phase
      would make a slow or hung run diagnosable.

- [ ] **M3** — `docs/08-project/tasks/TMU-OPS-005.md:75` (RED row) and `:96-98` (Evidence) — the RED
      failure list includes **"`runCheck` module absent"**, which cannot have happened in the run those
      lines record. The only importer is `tests/db/check-live.test.ts:40`, and that file is the
      "1 skipped" / "3 skipped" in the very same line: `describe.skipIf(!process.env.DATABASE_URL)`
      (`check-live.test.ts:26`) skips all three tests together when `DATABASE_URL` is unset — which it
      must have been, because with it set the counts would be `10 failed | 2 passed | 0 skipped`, not
      `7 failed | 2 passed | 3 skipped`. The rest of the arithmetic checks out exactly
      (`package.test.ts` = 6 ENOENT failures + `check-skip.test.ts` = 1 "skip notice missing" = 7;
      `dispatcher.test.ts` = 2 passes because `scripts/checks/step.mjs` already exists on
      `origin/main`), and `scripts/checks/pending.mjs` indeed contains neither `skip` nor
      `DATABASE_URL`, so the failures that did occur were "for the right reason". DoD #1 requires the
      failure summary to describe what actually failed; if a second RED invocation (with
      `DATABASE_URL` set) produced the `runCheck` failure, record it as its own row with its own
      counts. **Fix (in-lane):** correct the RED row and the Evidence bullet and disclose the
      mis-recording, as TMU-OPS-011 review M2 did. Context that makes this load-bearing:
      `git log --all --oneline -- tests/db` shows the tests were committed exactly once (`6572380`,
      together with the implementation), so the RED state exists on no ref — the Progress log is the
      only evidence that tests came first.

## MINOR

- [ ] **m1** — `docs/04-contracts/backend/BE-05-database-contract.md:126` still says the additions
      (`needs_reprocess` column, 5 indexes, tsv trigger) are "to be included in `0001_init.sql`", but
      this PR freezes `0001_init.sql` as extensions-only and BE-05 rule 2 forbids editing a merged
      migration — the contract's own instruction becomes unfulfillable at merge. Extensions-only is
      the intended scope (task AC3), so the **doc** is stale: file a contracts-lane `TMU-CTR-*` (or
      docs) follow-up to re-point `0001_init` → `0002+`, and add a pointer line to the task file now.
- [ ] **m2** — `tsconfig.json:9` (root) includes only `scripts/**` + `eslint.config.mjs`, so CI's
      `pnpm -s typecheck` (`.github/workflows/ci.yml:30`) never type-checks `packages/db/**` (its own
      `packages/db/tsconfig.json` is invoked by nothing) nor `tests/db/**`; vitest transpiles without
      checking. ESLint does cover them (`packages/config/eslint.config.mjs` — `no-explicit-any`,
      `no-console`; gate lint green), but type errors in the new package are invisible to CI. Root
      `tsconfig*.json` is the ops lane ⇒ **must be filed as an ops follow-up**, and the task file
      should point at it. (I could not run `tsc -p packages/db` myself — this sandbox permits only
      `git diff/log/show/status` and `pnpm gate*` / `pnpm test*` — so the DoD claim `tsc -p packages/db`
      → 0 at `TMU-OPS-005.md:77` is accepted as author-reported, not re-verified.)
- [ ] **m3** — `packages/db/README.md:3` and `packages/db/migrations/0001_init.sql:4` have **no final
      newline** (`\ No newline at end of file`). The gate cannot catch it: `.prettierignore`'s
      `README.md` pattern matches every README (gitignore semantics) and Prettier does not process
      `.sql`. Precedent: TMU-OPS-011 review m10.
- [ ] **m4** — `tests/db/package.test.ts:15-22` asserts only that the four script values are
      non-empty strings (`"false"` would pass); there is no behaviour test for `generate` / `migrate` /
      `seed` — their working-ness rests on the manual runs recorded at `TMU-OPS-005.md:77`. `check`'s
      behaviour *is* covered (`check-skip`, `check-live`). Precedent: TMU-OPS-011 review M1
      (existence-only assertions).
- [ ] **m5** — `tests/db/check-live.test.ts:45` and `:59` assert only `code !== 0`, so **any** failure
      (including an unrelated crash) satisfies "broken migration" and "drift". Stronger: assert the
      injected error sink received `db:check: drift:` / `db:check: failed:`. Tests are frozen — raise
      with qa-engineer, do not edit here.
- [ ] **m6** — `tests/db/check-live.test.ts:26` + `.github/workflows/ci.yml:33-41`: CI's `unit` job
      sets no `DATABASE_URL`, so the three live cases (including AC #1's non-zero case) **never run in
      CI**; only the `migrations` job's happy path does (`ci.yml:75`). AC #1's non-zero evidence is
      therefore local-only (recorded at `TMU-OPS-005.md:78`). Ops follow-up: give `unit` the same
      pgvector service, or run the live cases under the `migrations` job.
- [ ] **m7** — `packages/db/src/check-worker.ts:78,103` creates and drops `tmu_check_*` databases on
      the target server (needs `CREATEDB`; a hard kill leaves one behind — `:103` is explicitly
      best-effort and there is no sweeper). Undocumented in `packages/db/README.md`, `BE-11` and
      `.env.example` (docs/contracts lane follow-ups).
- [ ] **m8** — `docs/08-project/tasks/TMU-OPS-005.md:104` — Evidence still reads `PR: (pending)`
      although PR #12 exists; DoD #12 wants the PR URL recorded (in-lane, one line).
- [ ] **m9** — `packages/db/src/check.ts:92` — `migrationsDir ?? "./migrations"` is cwd-relative for
      the **exported** `runCheck`; calling it from the repo root (the obvious programmatic use) points
      at a folder that does not exist there. Default from `import.meta.url`, or make the option
      required.
- [ ] **m10** — `tests/db/package.test.ts:38` is a deny-list (`CREATE TABLE|CREATE INDEX|ALTER
      TABLE`): `CREATE TYPE` / `SCHEMA` / `VIEW` / `FUNCTION` / `TRIGGER` / `SEQUENCE` would sail
      through even though AC3 says "only what M0 needs". An allow-list assertion (only comments plus
      the two `CREATE EXTENSION` lines) matches the criterion and rots slower. Frozen test ⇒ qa
      follow-up.

## Acceptance criteria (5/5 ticked — verified)

| # | AC | Verdict | Evidence |
|---|---|---|---|
| 1 | `db:check` exit 0 on empty pgvector; non-zero on broken migration | **Verified (split)** | exit 0: CI `migrations` job green (given) + `db:check: ok` at `TMU-OPS-005.md:77`. non-zero: `check-live.test.ts:37-49`, local only — CI's unit job has no `DATABASE_URL` (`ci.yml:33-41`) so it skips → m6. |
| 2 | `db:generate` / `db:migrate` implemented and documented | **Verified** | `packages/db/package.json:5-10` scripts match the dispatcher routes `scripts/checks/step.mjs:15-27` (`planStep` `:31`); README contains all three commands (`tests/db/package.test.ts:48-54`, green); manual exit-0 runs at `:77`. Behaviour of generate/migrate/seed untested → m4. |
| 3 | Initial migration = only what M0 needs | **Verified** | `migrations/0001_init.sql` = 2 comment lines + 2 `CREATE EXTENSION`; `src/schema.ts:1` = `export {}`; `meta/0001_snapshot.json` has `"tables": {}`, `"enums": {}`. |
| 4 | No table/column/index BE-05 does not specify | **Verified** | Nothing created; enforced by `tests/db/package.test.ts:38` (scope of that assertion → m10). Rollback note present (`0001_init.sql:2`, BE-05 rule 4). |
| 5 | `pnpm gate` green with a named skip notice | **Verified by me** | `pnpm gate` → `OK gate(quick) passed`; `migrations check` printed exactly `db:check: skipped (DATABASE_URL is not set)`, matching `check-skip.test.ts:19-21` (`/db:check/`, `/skip/i`, `/DATABASE_URL/`) and `check.ts:72`. |

## DoD 1-12

| # | Item | Result |
|---|---|---|
| 1 | Red tests first, failed for the right reason | **Partially — M3.** Counts and the causes that did fire are self-consistent and corroborated by `git log --all` (tests committed once, with the implementation), except the impossible "`runCheck` module absent" cause. |
| 2 | Tests pass; full `pnpm gate` green | **Pass** — I ran it: unit **45 passed / 3 skipped**, lane/format/lint/typecheck green. |
| 3 | Contract tests per touched `API-*` | **N/A** — no endpoints; the contract surface here is BE-05, checked above. `contracts:check` is still a placeholder (TMU-OPS-004) so "generated files in sync" is vacuous; no generated file touched. |
| 4 | Auth/RBAC asserted; transitions covered | **N/A** — no routes, no state machine. |
| 5 | Privacy: no hint answers/emails/embeddings/sensitive URLs logged or returned | **Fail — M1** (raw `DATABASE_URL` can reach stderr). No hint answers, emails, embeddings or raw image URLs appear anywhere in this diff; no secrets committed (scan below). |
| 6 | i18n `id` + `en` incl. `error.<code>` | **N/A** — no UI strings; CLI/gate notices are not i18n-governed (precedent: `pending.mjs`). |
| 7 | a11y states/keyboard/axe | **N/A** — no UI. |
| 8 | Docs: task status, Progress log, traceability, CHANGELOG | **Mostly** — status `IN_PROGRESS` is correct at review stage (loop step 1 sets it, step 13 sets `DONE`); Progress log current; the traceability row is docs-keeper's post-merge step (`traceability-matrix.md` "How to update" §1); no contract change ⇒ no CHANGELOG. Evidence `PR: (pending)` → m8. `backlog.md` still shows `TODO`, which is correct (regenerated at POST-MERGE, `02-agent-loop.md:56`). |
| 9 | Generated files in sync, no hand edits | **Pass** — none touched; `0001_init` + `meta/*` accepted by drizzle's migrator in CI (author also reports `db:generate` → "No schema changes", meta unchanged — I could not rerun it here). |
| 10 | Reviewer verdict `APPROVE` in a fresh-context review | This file (cycle 1) — `REQUEST CHANGES`. |
| 11 | Security review for sensitive tasks | Done — this task handles `DATABASE_URL`; finding M1 plus the scan below. |
| 12 | PR ready, CI green, labels correct | CI green given (run 36810827530); `gh` is not callable in this sandbox, so **PR labels and the run were not re-inspected by me**; PR URL not recorded in the task file (m8). |

## BE-05 compliance

- Migration rules: forward-only `NNNN_description.sql` ✓; this is the first migration, nothing merged
  before it ✓; rollback note present (`0001_init.sql:2` — `DROP EXTENSION IF EXISTS citext/vector`,
  reversible precisely because M0 ships no tables) ✓; seeds separate (seed is a no-op script, no seed
  files) ✓; no schema change without a task — the task file carries `refs: [BE-05]` and AC3
  authorises the extensions-only scope ✓.
- DDL: `0001_init.sql` creates **only** `vector` + `citext`, the two extensions BE-05:28-29
  specifies. No tables, columns, indexes, types, functions or triggers. `src/schema.ts` is empty, so
  `db:generate` cannot emit anything. ✓
- One doc/contract mismatch: BE-05:126 → m1.

## Lane compliance

- `git diff origin/main...HEAD --name-only` = 18 files: `packages/db/**`, `tests/db/**`,
  `docs/08-project/tasks/TMU-OPS-005.md`, `pnpm-lock.yaml` — all matched by `.agent/lanes.json` `db` +
  `_common`. No root `package.json`, `scripts/**`, `.prettierignore`, `vitest.config.ts`,
  `tsconfig*.json`, `.github/**`. Note `packages/db/tsconfig.json` and `packages/db/drizzle.config.ts`
  are **not** caught by the ops globs `tsconfig*.json` / `*.config.*` — `check-lane.sh`'s translation
  anchors both to the repo root — so they are in-lane ✓.
- `scripts/check-lane.sh` runs inside `pnpm gate` and exited 0 in my run ✓.
- Commits: `feat(db): …` and `chore(tasks): …`, both with `Task:` trailers ✓.

## Frozen tests / red evidence

- `git diff origin/main...HEAD -- tests/db` → 4 **new** files, 12 tests, assertions intact:
  `package.test.ts` (6: manifest, script wiring, `NNNN_` naming, rollback note + extensions-only,
  journal tag, README), `dispatcher.test.ts` (2: route to `pnpm --filter @temuunair/db run check`,
  fallback to `pending.mjs`), `check-skip.test.ts` (1: exit 0 + three regexes + no `Error` on stderr),
  `check-live.test.ts` (3: exit 0 / non-zero broken / non-zero drift).
- **No post-RED weakening found:** no `testTimeout` anywhere in `tests/db` or in any config
  (`vitest.config.ts` unchanged; `packages/config/vitest.base.ts` sets no timeout ⇒ the frozen 5000 ms
  default is intact). No `.only`, no `it.skip`; the single conditional skip is `check-live.test.ts:26`,
  the by-design live-DB gate. The `--testTimeout 60000` claim (`TMU-OPS-005.md:78`) is consistent with
  the tree: a CLI flag leaves no trace and nothing in the diff could have raised the timeout. Caveat:
  because RED was never committed (M3), "unchanged after RED" is unverifiable from git — what I can
  attest is "not weakened relative to the branch".
- No sleeps; fixtures synthetic (temp dirs + generated `_journal.json`); deterministic.

## Security & privacy

- Secret scan over the whole worktree for the hosted-DB credentials (password fragment and role
  name), the Render API-key env var, the credentialed connection-URL form and the instance id
  → **0 matches**. No `.env` added. The scan terms are deliberately not reproduced here so this
  file itself carries no credential material.
- Credentialed URLs in the tree (`postgres://<dev-role>:<dev-password>@…`) exist only in
  pre-existing, untouched files (`.env.example:9`, `ci.yml:77`, `07-ops/01-local-dev-setup.md:48`,
  `BE-11:19`) — repo-local dev defaults, not introduced by this diff.
- `check.ts` never writes the URL on any path I could reach **except** M1. The scratch name is
  server-generated (`tmu_check_<millis>_<hex>`, `check.ts:76`), so the identifier interpolation at
  `check-worker.ts:78,103` is safe and documented. The credentials used are exactly the ones handed
  in; no new env var (BE-11 / `.env.example` unchanged; `DATABASE_URL` already documented).

## Design assessment: worker-thread `check.ts` + `check-worker.ts`

**Correct, but heavier than the task needs, and its justification is narrower than the comments
claim.**

- *Correctness — passes.* No message loss: both inboxes buffer FIFO and listeners are attached before
  any `await` (`check-worker.ts:64` precedes the first `await` at `:77`; the main thread attaches at
  `check.ts:95` before entering the loop). Worker `error`/`exit` are normalised into the same queue
  (`check.ts:42-49`), so a dead worker unblocks the loop instead of hanging it. `finish` is posted
  from `finally` **after** `pool.end()` (`check.ts:137-143`), so the `DROP DATABASE … WITH (FORCE)` at
  `check-worker.ts:103` cannot race the main thread's connection. The worker's `run()` rejection is
  swallowed at `check-worker.ts:112` but surfaces as `exit` on the main thread (`check.ts:114`), and
  `terminate()` always runs once `finally` is reached. I looked for an interleaving that loses `finish`
  or double-consumes `done` and could not find one — the `inbox.exited` short-circuit at
  `check.ts:147` correctly covers "worker finished before we looked". The design fails only under the
  unbounded-wait class filed as M2.
- *Justification — thin.* The 5 s vitest budget only binds `check-live` tests #2/#3, which run **only**
  when `DATABASE_URL` is set: CI's `unit` job never sets it (`ci.yml:33-41`), and CI's `migrations`
  job runs `pnpm db:check` **outside** vitest (`ci.yml:75`), with no 5 s bound at all. So the
  two-thread split buys headroom for *local evidence runs only* — where the author still needed
  `--testTimeout 60000` (`TMU-OPS-005.md:78`) and reports ~4.5–5.0 s, i.e. the margin is thin even
  with the worker. ~275 lines of concurrency (`check.ts` 163 + `check-worker.ts` 112) for that is at
  the edge of over-engineering for a skeleton task, and it is the source of M2's hang surface.
- *Recommendation.* Record the measured single-threaded baseline in the task file so the complexity is
  demonstrably load-bearing; if a single-threaded version that starts `await import("drizzle-kit/api")`
  before the DB work fits in 5 s locally, prefer it. Either way, land M2's timeouts first — they are
  required regardless of which shape survives.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-005`) → **OK gate(quick) passed**, exit 0: lane check OK;
  prettier "All matched files use Prettier code style!"; eslint 0; root typecheck 0; i18n skipped
  (M3); unit **45 passed / 3 skipped (6 files)** with `tests/db/{package,dispatcher,check-skip}` green
  and `tests/db/check-live` **3 skipped**; contracts placeholders exit 0; `migrations check` printed
  `db:check: skipped (DATABASE_URL is not set)` — the exact named notice.
- `git diff origin/main...HEAD` (full), `--name-only`, `--stat`; `git log origin/main..HEAD --oneline`;
  `git show` of both commits plus of `ci.yml`, `.agent/lanes.json`, `scripts/checks/step.mjs`,
  `scripts/checks/pending.mjs`, `scripts/gate.sh`, `scripts/check-lane.sh`,
  `packages/config/{vitest.base.ts,eslint.config.mjs}`, `.prettierignore`, root `tsconfig.json`.
- `git log --all --oneline -- tests/db` → only `6572380` (RED never committed on any ref).
- Greps: the five named secret strings (0 hits); `testTimeout|.only|skip` in `tests/db` (only the
  live-DB `skipIf`); `console.*|any|@ts-ignore` in `packages/db` (0); timeouts in `packages/db` (0).
- Not run here (sandbox allows only `git diff/log/show/status` + `pnpm gate*` / `pnpm test*`):
  `tsc -p packages/db --noEmit`, `pnpm db:check` against a live database, `pnpm db:generate`, and any
  `gh` inspection of run 36810827530 or PR #12 labels. Those rest on the task's evidence plus the
  given CI green, and are called out where they matter (m2, DoD #9, DoD #12).

## Notes for the human

- Merge is blocked by M1–M3 under the DoD review rules; all three are small, in-lane fixes (a moved
  `try`, timeouts + watchdog, a corrected evidence row), so one fix cycle should clear them.
- `m1` (BE-05 "to be included in `0001_init.sql`") is the only item needing a cross-lane decision:
  extensions-only is right for M0, but the contract sentence must be re-pointed by a `TMU-CTR-*`/docs
  task — file it before M3 (`TMU-DB-001..005`) starts.
- MINORs `m4`, `m5`, `m6`, `m7`, `m10` should be filed as follow-up tasks (qa/ops/docs lanes), not
  silently dropped; `m8` is a one-line in-lane edit worth folding into the fix cycle.
- I ran the gate and read the whole diff; I modified no product code, and I did not commit, push or
  merge.
