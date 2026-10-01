---
id: REV-TMU-OPS-005
task: TMU-OPS-005
reviewer: reviewer
verdict: REQUEST CHANGES
date: 2026-10-01
cycle: 2
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
- Credentialed URLs in the tree (`postgres://<dev-role>:<dev-password>@…`) exist only in pre-existing,
  untouched files (`.env.example:9`, `ci.yml:77`, `07-ops/01-local-dev-setup.md:48`, `BE-11:19`) —
  repo-local dev defaults, not introduced by this diff.
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

---
---

# TMU-OPS-005 — Review cycle 2

Diff reviewed: `origin/main...64331e3` in worktree `E:\wt\TMU-OPS-005`, working tree clean at review
time. 3 commits — `ab2c63d` (claim), `4638413` (feat), `64331e3` (fix). The branch was **rebased**
since cycle 1 (`fe1d586` → `ab2c63d`, `6572380` → `4638413`); `git diff 6572380 4638413 -- tests/db
packages/db/src/schema.ts packages/db/migrations` is **empty**, so no test, schema or migration content
changed in the rebase. 23 files — `packages/db/**` (13), `tests/db/**` (4),
`docs/08-project/{backlog,status}.md`, `docs/08-project/reviews/TMU-OPS-005.md`,
`docs/08-project/tasks/{TMU-OPS-005,TMU-CTR-001,TMU-OPS-016}.md`, `pnpm-lock.yaml`.

**Verdict: `REQUEST CHANGES`** — 0 BLOCKER, **2 MAJOR (both new in this cycle, both caused by the two
follow-up task files the fix commit added)**, 8 new MINOR. The three cycle-1 MAJORs are **fixed** and
all ten cycle-1 MINORs are **filed or fixed**. **What blocks merging: only C2-M1 and C2-M2** — both
are in-lane, ten-minute renumber-and-regenerate fixes; nothing else here blocks.

## BLOCKER

_None._

## MAJOR (new in cycle 2)

- [ ] **C2-M1** — `docs/08-project/tasks/TMU-CTR-001.md:2` (`id: TMU-CTR-001`), mirrored at
      `docs/08-project/backlog.md:6`, `docs/08-project/status.md:8` and
      `docs/08-project/tasks/TMU-OPS-005.md:85` — the follow-up filed for MINOR `m1` **reuses an ID
      that merged docs already bind to a different task** (the contracts-package implementation):
      - `docs/04-contracts/CHANGELOG.md:16` — "`packages/contracts` layout defined (Zod + registry) —
        **implementation lands in TMU-CTR-001**";
      - `docs/04-contracts/backend/BE-02-openapi.md:20` — "`packages/contracts` is not implemented
        yet (**TMU-CTR-001**)";
      - `docs/01-product/10-roadmap.md:21` — M2 Contracts work is **`TMU-CTR-001..005`**;
      - `docs/08-project/tasks/TMU-OPS-004.md:35,57` — "the real endpoint catalogue is authored in M2
        (`TMU-CTR-001..005`)".

      The new file is an **M0** BE-05-wording task, not that work — and this diff now makes the
      contradiction visible in-repo: `status.md:8` lists `TMU-CTR-001` under `## M0 — 32%` while
      `10-roadmap.md:21` puts `TMU-CTR-001..005` under **M2**. Once both tasks exist, `next-task.mjs
      --show TMU-CTR-001` (`scripts/next-task.mjs:76` — first match wins) and every `deps: [TMU-CTR-001]`
      reference (e.g. `docs/08-project/README.md:35`) become ambiguous. Nothing detects this: the gate's
      only task-file test is `scripts/checks/scaffold.test.mjs:328-341` (`owner:` must be an agent file).
      **Fix (in-lane):** renumber to an ID outside the reserved `TMU-CTR-001..005` range and free on
      `origin/main` *and* on sibling branches (verify with `git branch -a` and `E:\wt\*`, as C2-M2 shows
      that checking `main` alone is not enough), rename the file, update `id:`/`title`/H1/`slug`, the
      `TMU-CTR-001` mentions at `TMU-OPS-005.md:85` and `TMU-OPS-016.md:36,50,59`, then re-run
      `node scripts/backlog-index.mjs`.

- [ ] **C2-M2** — `docs/08-project/tasks/TMU-OPS-016.md:2` (`id: TMU-OPS-016`) — the MINOR bucket task
      collides with a **different** task that already carries that ID and is already in flight:
      - worktree `E:\wt\TMU-OPS-016`, branch `agent/ops/TMU-OPS-016-merge-push-permissions`, worktree
        clean ⇒ the file is committed there;
      - its front-matter: `id: TMU-OPS-016`, title **"Merge and push permission fix — any session may
        merge, pushes survive redirects"**, `lane: ops`, `owner: ops-dev`, `created: 2026-09-30`
        (three days **before** ours, `created: 2026-10-01`), `status: IN_PROGRESS`;
      - it is **open as PR #8** — `docs/08-project/reviews/TMU-OPS-016.cycle2.md:100,229` in the
        primary checkout reads "PR #8 is still draft" and "CI green, 10/10", and that review's finding 6
        cites `docs/08-project/tasks/TMU-OPS-016.md:105-106` as part of PR #8's diff;
      - PR #12 (this one) adds the same path with unrelated content ⇒ add/add conflict, and both sides
        regenerate `backlog.md` + `status.md` with a row keyed by the same ID — in files marked
        "**GENERATED** … do not edit by hand" (`backlog.md:1`), so the second merger is forced to
        renumber under conflict pressure.

      No inbound `deps:` reference to `TMU-OPS-016` exists yet, so nothing would be silently corrupted —
      but the registry cannot hold two definitions of one ID, and the earlier claimant (PR #8) should not
      be the one moved. **Fix (in-lane):** renumber this follow-up to the next genuinely free ID, update
      `id:`/H1/`title`/`slug` + `TMU-OPS-005.md:85`, re-run `node scripts/backlog-index.mjs`; or, if the
      orchestrator decides PR #8 renumbers instead, record that decision in the task file so the collision
      is not left implicit.

## Cycle-1 MAJORs — re-verified

- [x] **M1 — URL parse leak: FIXED.** `packages/db/src/check.ts:99-105` now parses inside an explicit
      `try`/`catch` whose handler emits the fixed string `db:check: failed: DATABASE_URL is not a valid
      URL` (`:103`) and `return 1` (`:104`) — no interpolation, no `cause`. Reject audit of the whole
      function: the only statements left outside the `try` at `:113` are `randomBytes(6)` (`:107`) and
      the `URL.pathname` setter (`:108`), neither of which throws for a URL that already parsed;
      `enableCompileCache()` (`:114`), `new Worker` (`:119`), the module loads (`:128-132`), the message
      loop (`:134-151`) and `pushSchema` (`:154`) are all inside the `try`, whose `catch (cause)` at
      `:170-172` returns `1`; and the `finally` (`:173-195`) cannot reject — `withDeadline(…).catch(() =>
      undefined)` (`:191`), `pool.end().catch` (`:179`), `postMessage` in its own `try` (`:182-186`),
      `WorkerInbox.next()` only ever resolves (`:81-85`), `worker.terminate().catch` (`:193`). **No path
      remains where `runCheck` rejects** except a caller-supplied `deps.*` throwing (the CLI deps are
      `process.stdout/stderr.write`, `:203`). Credential echo: the five emission sites are `:91` (fixed
      skip text), `:103` (fixed parse text), `:160` (count + `scratchName` only), `:166`
      (`db:check: ok`), `:171` (`cause.message`). `ERR_INVALID_URL` — the only error carrying the URL in
      an enumerable property — is swallowed at `:102` and can no longer reach `:171`; the worker's own
      `new URL(config.sourceUrl)` (`check-worker.ts:87`) cannot throw for a string the main thread has
      already parsed at `:101`, and even if it did, the posted `cause.message` is the bare `"Invalid
      URL"`. The URL and its **password cannot reach stderr on any path I could construct**, which backs
      the end-to-end result you recorded (exit 1 + the fixed message + no credential text). What *can*
      still surface is a **fragment** (role/host) of the URL via pg's own messages → n2.
- [x] **M2 — timeouts: FIXED.** `connectionTimeoutMillis: 10_000` on all three connections — main pool
      (`check.ts:26,142`), worker admin client (`check-worker.ts:31,81`), worker scratch pool
      (`check-worker.ts:92`) — plus `CHECK_DEADLINE_MS = 60_000` over the entire check body
      (`check.ts:23,116`) and a separate `FINISH_MS = 10_000` over the `finally` cleanup
      (`check.ts:25,177`), i.e. the `inbox.next()` hang you hit live is covered. Unbounded-await audit:
      **`withDeadline` itself** — the timer is armed before the race and cleared in `.finally`
      (`:36-38`) on both outcomes, so there is no timer leak; `pending.catch(() => undefined)` (`:32`)
      means **a deadline win leaves no unhandled rejection** (and `Promise.race` attaches handlers
      regardless); both call sites pass an `async` arrow, so `withDeadline` cannot throw synchronously
      and the `finally`'s `.catch(() => undefined)` (`:191`) covers its only rejection path. **`pool.end()`
      (`:179`) and `inbox.next()` (`:188`)** — both inside the 10 s budget ✓. **`worker.terminate()`
      (`:193`)** — not deadline-wrapped (`.catch` is): the one remaining unbounded await, theoretical
      because Node interrupts the worker's JS and this worker only awaits libuv-async work → n3.
      **The worker's own `await inbox.next()` (`check-worker.ts:106`)** — unbounded *inside* the worker,
      but the main thread always posts `finish` (`check.ts:183`) and then terminates (`:193`), so it
      cannot hold the process; the worker's post-`finish` cleanup (`check-worker.ts:108-119`) is likewise
      bounded by `FINISH_MS` + terminate. Worst case `runCheck` now returns in ≈ 70 s instead of never ✓.
      **Is 10 s reasonable for a remote Postgres?** Yes — pg's `connectionTimeoutMillis` bounds the whole
      establishment (TCP + TLS + auth, not just SYN); a hosted instance typically connects in 0.1–0.5 s,
      10 s < the 60 s ceiling so a black-holed endpoint fails fast with a diagnosable message instead of
      consuming the budget, and any path slow enough to exceed 10 s would already blow the frozen 5 s
      vitest budget. It does **not** bound a query on an *established* connection (no
      `statement_timeout`/`query_timeout` anywhere) — inside `db:check` the 60 s deadline covers that, but
      `migrate.ts` has neither → n1. One narrow residual in the new "abandon the body" semantics → n4.
- [x] **M3 — RED evidence: FIXED.** `docs/08-project/tasks/TMU-OPS-005.md:75` (Progress `4 RED`) and
      `:102-107` (Evidence `Red:`) now record only things that could have happened: 6 ENOENT in
      `package.test.ts` + 1 skip-notice in `check-skip.test.ts` = 7, 2 dispatcher passes, 3 `check-live`
      skips. Corroborated by this cycle's gate run, which prints exactly `package.test.ts (6 tests)`,
      `check-skip.test.ts (1)`, `dispatcher.test.ts (2)`, `check-live.test.ts (3 tests | 3 skipped)`. The
      load-bearing sentence — "the `runCheck` import never executed" — is now true by construction:
      `check-live.test.ts:40` and `:54` are **dynamic** `await import("../../packages/db/src/check.ts")`
      *inside* the `it` bodies, the whole `describe` is `skipIf(!DATABASE_URL)` (`:26`), and test #1
      (`:28`) is a `spawnSync` inside the same block — so with `DATABASE_URL` unset nothing in that file
      runs, `check.ts` is never loaded, and no RED failure can be attributed to it. The mis-recording is
      disclosed rather than silently overwritten (`TMU-OPS-005.md:82`: "RED evidence corrected … that
      failure was impossible"). DoD #1 → **Pass**.

## Cycle-1 MINORs — disposition (all handled)

| # | Status in this cycle | Where |
|---|---|---|
| m1 | Filed → `TMU-CTR-001` + pointer row in the task file; **but the chosen ID is wrong → C2-M1** | `tasks/TMU-CTR-001.md`, `TMU-OPS-005.md:85` |
| m2 | Filed (ops row) | `tasks/TMU-OPS-016.md:37` |
| m3 | **Fixed** — `packages/db/README.md` and `migrations/0001_init.sql` both end `0x0A` now (verified byte-wise; the fix commit's diff is a pure newline addition) + listed | `64331e3`, `tasks/TMU-OPS-016.md:38` |
| m4 | Filed (db row) | `tasks/TMU-OPS-016.md:39` |
| m5 | Filed (qa row) | `tasks/TMU-OPS-016.md:40` |
| m6 | Filed (ops row) | `tasks/TMU-OPS-016.md:41` |
| m7 | Filed (db row) — covers the `CREATEDB`/undocumented half; the "no sweeper for leftovers" half is only implied (worth one clause when worked) | `tasks/TMU-OPS-016.md:42` |
| m8 | **Fixed** — Evidence now carries the PR link + run (`TMU-OPS-005.md:113-115`), and is listed | `TMU-OPS-005.md:113`, `tasks/TMU-OPS-016.md:43` |
| m9 | Filed (db row) | `tasks/TMU-OPS-016.md:44` |
| m10 | Filed (qa row) | `tasks/TMU-OPS-016.md:45` |

Both new task files are well-formed and pass the gate's own test: full front-matter (`id`, `title`,
`status`, `lane`, `slug`, `milestone`, `priority`, `owner`, `deps`, `refs`, `created`, `updated`) per
`docs/08-project/README.md:27-39`; `owner: architect` and `owner: backend-dev` both exist as
`.opencode/agents/*.md` (12 agent files), which `scripts/checks/scaffold.test.mjs:328-341` asserts —
that test was green in my run (26 passed). `TMU-CTR-001` is `lane: contracts` (correct for a contract
doc fix, and its "Why this is a contract task" section correctly cites governance rule 5);
`TMU-OPS-016` is `lane: db`. Both are in `_common` (`lanes.json:4-5`) so filing them is in-lane.

## MINOR (new in cycle 2)

- [ ] **n1** — `packages/db/src/migrate.ts:10` — `new pg.Pool({ connectionString: databaseUrl })` has
      no `connectionTimeoutMillis` and no deadline, so `pnpm db:migrate` can still block indefinitely on
      an unresponsive endpoint (pg default `0`). Not in the gate/CI path — `ci.yml:75` runs only
      `pnpm -s db:check` — so this does not re-open M2's blast radius; add the same `10_000` (file into
      `TMU-OPS-016`).
- [ ] **n2** — `packages/db/src/check.ts:171` (+ `check-worker.ts:101`) — `cause.message` still reaches
      stderr, and pg's own messages can embed the **DB role and host:port** (`password authentication
      failed for user "…"`, `connect ECONNREFUSED host:port`). The password and the full URL never
      appear (M1 verified), so the "never logs the URL" contract holds for the URL itself; recording the
      role/host fragment so the privacy note in the task file/README is accurate.
- [ ] **n3** — `packages/db/src/check.ts:193` — `await worker.terminate()` is the only await left
      outside a deadline (theoretical; `.catch` is attached). If you want the "always returns" guarantee
      unconditional, wrap it in `withDeadline(…)` too.
- [ ] **n4** — `packages/db/src/check.ts:177-190` — the deadline *abandons* the body, so an abandoned
      continuation can still open the scratch pool **after** the `if (pool)` check at `:178`: the worker
      only needs to deliver a late `scratch-ready` during the ≤10 s cleanup window (`:188` accepts any
      message, not just `done`), and a successful `pool.connect()` after `:192` would leave a live socket
      that is never `end()`ed — `runCheck` would return, but the CLI process could outlive it. Reachable
      only if a stalled session recovers inside that window; `allowExitOnIdle: true` on that pool (or a
      `tornDown` flag checked before `new pg.Pool` at `:139`) closes it. Flagging rather than blocking:
      `runCheck` itself always returns ✓.
- [ ] **n5** — `packages/db/src/check.ts:34` + `:171` — the timeout error already starts with
      `db:check:`, so the output reads `db:check: failed: db:check: timed out after 60000 ms`. Cosmetic:
      drop the prefix from the error (or from the wrapper).
- [ ] **n6** — `docs/08-project/tasks/TMU-OPS-005.md:85` — "backlog index regenerated (**18 tasks**)";
      the generator prints `tasks.length` (`scripts/backlog-index.mjs:71`) and the committed output says
      **19** (`backlog.md:6-24` = 19 rows; `status.md` = `12 + 1 + 6` = 19; and `6/19 = 31.6 % → 32 %`
      matches `status.md:5`, whereas 18 rows would give 33 %). Either the generator ran before the second
      task file existed or the cell is simply wrong — evidence cells should match the artefact.
- [ ] **n7** — `docs/08-project/tasks/TMU-OPS-005.md:113-115` (and `:80`) — Evidence still cites commit
      `6572380` and CI run `36810827530`. HEAD is `64331e3`; `6572380`/`fe1d586` are no longer on the
      branch (rebased to `4638413`/`ab2c63d`), and the current green run is **`36825588392`** (given by
      you; `gh` is not callable in this sandbox). DoD #12 evidence should name the fix cycle's commit and
      run.
- [ ] **n8** — `docs/08-project/tasks/TMU-OPS-005.md:13` — `updated: 2026-09-30` is stale; the file
      changed on 2026-10-01 in both `4638413` and `64331e3`.

## Regression checks (nothing broke since cycle 1)

- **Frozen tests untouched.** `git diff origin/main...HEAD -- tests/db` → 4 **new** files, +159/−0,
  same 12 tests as cycle 1; `git diff 6572380 4638413 -- tests/db` → empty (rebase faithful);
  `64331e3` touches no file under `tests/`. Greps over `tests/db`: no `testTimeout`, no `.only(`, no
  `it.skip`, no `describe.skip` other than the live-DB `skipIf`; `vitest.config.ts` and
  `packages/config/vitest.base.ts` are not in the diff (5000 ms default intact).
- **No secrets in the diff.** Whole-worktree greps for the hosted-DB password fragment, the instance id,
  the DB role, the Render API-key env-var name and the credentialed dev connection-URL form (the same
  five terms this file's cycle-1 scan used) → **0 matches**; the only credentialed URLs in the tree are the repo-local dev defaults in
  `.env.example:9`, `ci.yml:77`, `07-ops/01-local-dev-setup.md:48`, `BE-11:19` — all untouched. The
  committed copy of this review file (`64331e3`) is the **redacted** wording (`:209-212`), so no
  credential material enters the repo with it.
- **Lane clean.** All 23 files match `db` (`packages/db/**`, `tests/db/**`) or `_common`
  (`docs/08-project/tasks/**`, `reviews/**`, `backlog.md`, `status.md`, `pnpm-lock.yaml`); no root
  config, `.github/**`, `scripts/**`, `packages/config/**` or contract doc touched. `pnpm gate`'s lane
  check exited 0 in my run. Commits: all three carry Conventional subjects and `Task: TMU-OPS-005`
  trailers (verified with `git log --format=%B`).
- **Dead code / drift:** no `console.*`, `any` or `@ts-ignore` in `packages/db` (grep → 0);
  `drizzle.config.ts:7` only forwards `DATABASE_URL ?? ""` to drizzle-kit `generate` (offline); no
  generated file hand-edited (`meta/*` unchanged since `4638413`; `contracts:check` still the
  TMU-OPS-004 placeholder).

## DoD deltas since cycle 1

| # | Item | Cycle 2 |
|---|---|---|
| 1 | Red tests first, failed for the right reason | **Pass** — M3 fixed (see above). |
| 2 | Tests pass; full `pnpm gate` green | **Pass** — re-run by me this cycle: `OK gate(quick) passed`, unit **45 passed / 3 skipped (6 files)**. |
| 3 | Contract tests per touched `API-*` | **N/A** (unchanged) — no endpoints; no contract doc touched (m1's BE-05 fix is filed as C2-M1's sibling task). |
| 4 | Auth/RBAC, transitions | **N/A** (unchanged). |
| 5 | Privacy | **Pass** — M1 fixed; residual role/host fragment → n2. |
| 6 | i18n `id` + `en` | **N/A** (unchanged) — no UI strings. |
| 7 | a11y | **N/A** (unchanged). |
| 8 | Docs updated | **Mostly** — Progress log + Evidence current except n6/n7/n8; two new task files filed ✓ (but see C2-M1/C2-M2). |
| 9 | Generated files in sync, no hand edits | **Pass with note** — `backlog.md`/`status.md` are new in this diff and their content is exactly what `scripts/backlog-index.mjs` would emit for 19 tasks (counts, sort order, 32 %); I could not run the generator here without writing, so "regenerated, not hand-written" is inferred from that consistency. |
| 10 | Reviewer verdict `APPROVE` in a fresh-context review | This file (cycle 2) — **`REQUEST CHANGES`** (2 new MAJOR). |
| 11 | Security review | Done — M1 re-verified end-to-end in code; secret scan re-run (0 hits). |
| 12 | PR ready, CI green, labels correct | CI green given (run `36825588392`, all 10 checks incl. `migrations` + `unit`; PR MERGEABLE/CLEAN) — **not re-inspected by me** (`gh` unavailable, as in cycle 1); recorded evidence still names the pre-fix run → n7. |

## Checks run (cycle 2)

- `pnpm gate` (workdir `E:\wt\TMU-OPS-005`) → **`OK gate(quick) passed`**, exit 0: lane check OK;
  prettier "All matched files use Prettier code style!"; eslint 0; root typecheck 0; i18n skipped;
  unit **45 passed / 3 skipped (6 files)** — `package.test.ts` 6, `check-skip.test.ts` 1,
  `dispatcher.test.ts` 2, `check-live.test.ts` 3 skipped, `scaffold.test.mjs` 26 (includes the
  `owner:`-is-an-agent test), `config-presets.test.mjs` 10; contracts placeholders exit 0;
  `migrations check` printed `db:check: skipped (DATABASE_URL is not set)`.
- `git log --oneline origin/main..HEAD`, `git log --format=%B origin/main..HEAD`,
  `git show 64331e3 --stat` and the full `git show 64331e3` for `check.ts` / `check-worker.ts` /
  `TMU-OPS-005.md` / `README.md` / `0001_init.sql`; `git diff origin/main...HEAD` (`--name-only`,
  `--stat`, `-- tests/db`, `-- backlog/status`); `git diff 6572380 4638413 -- tests/db schema
  migrations`; `git status --porcelain` in both `E:\wt\TMU-OPS-005` and `E:\TemuUNAIR-v2`.
- Full reads: `packages/db/src/check.ts` (205 lines), `check-worker.ts` (122), `migrate.ts`,
  `seed.ts`, `drizzle.config.ts`, `package.json`, all four `tests/db/*.test.ts`,
  `docs/08-project/tasks/{TMU-OPS-005,TMU-CTR-001,TMU-OPS-016}.md`, `scripts/backlog-index.mjs`,
  `scripts/next-task.mjs`, `scripts/checks/scaffold.test.mjs:300-341`, `.agent/lanes.json`,
  `docs/08-project/README.md`.
- Cross-worktree evidence for C2-M2: `E:\wt\TMU-OPS-016\docs\08-project\tasks\TMU-OPS-016.md`
  (front-matter + `git status --porcelain` → clean) and the primary checkout's
  `docs/08-project/reviews/TMU-OPS-016.cycle2.md` (PR #8).
- Greps: the five credential/instance terms (0 hits); `postgres(ql)?://` (4 hits, all pre-existing
  dev defaults); `connectionTimeoutMillis|setTimeout|deadline` in `packages/db` (9 hits, all in
  `check*.ts`); `testTimeout|.only(|it.skip` in `tests/db` (0); `console.|@ts-ignore|: any` in
  `packages/db` (0); `TMU-CTR-001`/`TMU-OPS-016` across the repo (to enumerate both collisions).
- Not run here (sandbox permits only `git diff/log/show/status` + `pnpm gate*` / `pnpm test*`):
  `tsc -p packages/db --noEmit`, `pnpm db:check` against a live database, `node
  scripts/backlog-index.mjs` (would write), and any `gh` inspection of run `36825588392`, PR #12 labels
  or PR #8. Those rest on your report and are labelled as such above.

## Notes for the human

- **Merge is blocked by C2-M1 and C2-M2 only.** Both are the same shape of fix — renumber the two
  follow-up task files, update the two cross-references, re-run `node scripts/backlog-index.mjs` — and
  both are in `_common` lane. The product code (`packages/db/**`) needs **no further change**: M1, M2 and
  M3 are verified fixed and I would approve the code as it stands.
- `TMU-CTR-001` is the unambiguous one (proved from merged docs alone). For `TMU-OPS-016` you may prefer
  to let **PR #8 keep the ID** (it is the earlier claimant, `created: 2026-09-30`, and is itself at
  review cycle 2) and move ours — but either way the decision should be recorded, not left to whoever
  merges second.
- Per `05-definition-of-ready-done.md` ("max 2 review cycles"), this is cycle 2: if you would rather
  accept the ID collisions as coordination items and merge, say so and I will record an `APPROVE` with
  them as conditional MINORs — I am flagging them as MAJOR because both are provable defects in this
  diff, not because the fix is expensive.
- **Write path:** the worktree path `E:\wt\TMU-OPS-005\docs\08-project\reviews\TMU-OPS-005.md` is
  outside my write permissions (only `docs/08-project/reviews/**` under the primary workspace is
  allowed), so **this cycle-2 section was written to
  `E:\TemuUNAIR-v2\docs\08-project\reviews\TMU-OPS-005.md`** — copy it across to the worktree. Note that
  the primary copy was still the **unredacted** cycle-1 text (`:209-210` carried the real scan terms)
  while the committed worktree copy is redacted; I re-applied your redaction wording to the primary copy
  as part of this write, so the file you copy over now contains neither the scan terms nor anything else
  changed from the committed version except `cycle: 1` → `cycle: 2` and this section.
- As in cycle 1: I modified no product code, did not commit, push or merge, and re-ran the gate myself.
