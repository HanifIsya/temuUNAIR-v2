---
id: REV-TMU-OPS-006
task: TMU-OPS-006
reviewer: reviewer
verdict: APPROVE
date: 2026-10-01
cycle: 2
---

# TMU-OPS-006 — Review (cycle 2)

Reviewed: branch `agent/ml/TMU-OPS-006-ml-service-skeleton` @ `54e6bc1` **plus the uncommitted
cycle-1 fix in the working tree** (`services/ml/app/main.py`, `services/ml/tests/test_health.py`,
`services/ml/tests/test_logging_privacy.py`, `docs/08-project/tasks/TMU-OPS-006.md`, new
`services/ml/.python-version`, and the two untracked review artefacts). The fixes are real but not
yet committed: `54e6bc1` alone still contains the CHANGES-state code, so this verdict is for the
working tree exactly as inspected — the author must commit it before the merge gate.
`origin/main...HEAD` is 8 paths (+725/−9), all in lane `ml` (`services/ml/**`) or `_common`
(`docs/08-project/**`) per `.agent/lanes.json:2-9,58-62`; the fix adds only `ml` paths and
`_common` docs.

## Verdict

**APPROVE.** Both cycle-1 MAJORs are genuinely resolved, not cosmetically:

- **M1 (vacuous privacy test)** — `test_logging_privacy.py:42-48` now asserts the lifespan line
  `"ml service starting"` is in `caplog.text` before the sentinel checks (positive control for the
  capture pipeline), and `:57-58` assert `status_code == 404` on both `/v1/*` POSTs, so the test
  fails loudly the moment a route is added without upgrading it. The M5 obligation is recorded in
  the test (`:50-56`) **and** the task file (`TMU-OPS-006.md:125`).
- **M2 (missing security artifact)** — `docs/08-project/reviews/TMU-OPS-006-security.md` exists,
  verdict APPROVE, 0 BLOCKER / 0 MAJOR (4 MINOR / 4 INFO, all deferred with named owners).

The cycle-1 m1/m4/m5/m7 fixes are also verified below. No new BLOCKER or MAJOR. Five MINORs remain
open (two carried, three new) and are listed with owners; none blocks merge.

## Cycle 1

Cycle-1 verdict was **CHANGES**: MAJOR M1 (privacy test exercised only 404s, no status assertion,
no positive control) and MAJOR M2 (no security-review artifact); MINOR m1–m7 as below. The cycle-1
report was untracked, so this section preserves the essential history. Resolution:

| # | Cycle-1 finding (gist) | Status | Evidence (this cycle) |
|---|---|---|---|
| M1 | `/v1/*` privacy test vacuous; no status assertion; M5 obligation unrecorded | **FIXED** | `tests/test_logging_privacy.py:42-48` positive control; `:57-58` 404 assertions; `:50-56` + `TMU-OPS-006.md:125` M5 obligation |
| M2 | No security-review artifact (loop step 9 / DoD 11) | **FIXED** | `reviews/TMU-OPS-006-security.md` (verdict APPROVE, `:12`) |
| m1 | `all([])` made an empty registry report `ok`; `ok` branch untested | **FIXED** | `app/main.py:65` `bool(states) and all(...)`; tests `test_health.py:72-78` (empty→degraded) and `:81-96` (all loaded+pinned→ok) |
| m2 | Privacy test had no positive control | **FIXED (caplog)** | `test_logging_privacy.py:45`; residual `capsys` note in m9 below |
| m3 | Uvicorn logging stack not covered | **DEFERRED (accepted)** | Recorded in security review F1 (`TMU-OPS-006-security.md:64-85`), owner `ml-dev`, first `/v1/*` task — see open MINOR m3 |
| m4 | `/ready` versions never compared to lockfile | **FIXED** | `test_health.py:52,59` exact `{name: version}` mapping |
| m5 | Interpreter not pinned | **FIXED** | `services/ml/.python-version:1` = `3.11` (untracked — must be committed) |
| m6 | Starlette/httpx deprecation warning | **DEFERRED (accepted)** | Gate still warns; owner `ops-dev`/TMU-OPS-008 — not yet written into that task file, see open MINOR m6 |
| m7 | Task bookkeeping stale | **FIXED** | `TMU-OPS-006.md:4` `status: REVIEW`; `:36-41` boxes ticked; `:66` file count corrected; `:158` review links; residual green-tail/date in m10 |

No assertion was weakened in this cycle. `test_health.py:52-59` replaces name/count checks with the
same checks **plus** the exact version mapping; the privacy test only gains assertions; two new
tests are added. The only deleted lines are the two old `client.post(...)` calls, now bound to
`embed_response`/`image_response` (`test_logging_privacy.py:39-40`).

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-006`) → **`OK gate(quick) passed`**; lane/format/lint/
  typecheck green; i18n skipped (M3); unit **36/36** (2 files); ML step `All checks passed!` then
  **`7 passed, 1 warning in 0.81s`** (the warning is the m6 Starlette/httpx deprecation). This is
  the same script as `bash scripts/gate.sh quick`; the ML step (`scripts/gate.sh:17`) is exactly
  `uv run ruff check . && uv run pytest -q -m "not slow"` from `services/ml`, so the strengthened
  privacy test and the two new readiness tests executed in my run. Direct invocation of
  `bash scripts/gate.sh` / `uv run pytest` is denied by this sandbox's permission layer;
  `pnpm gate` is the equivalent wrapper and its ML output is the executed evidence.
- Red evidence for the m1 fix is consistent with the pre-fix code: `readiness_payload([])` on the
  old `all(...)` returned `ok`; the recorded transcript (`TMU-OPS-006.md:100-123`) shows exactly
  that failure (`1 failed, 6 passed`) and the fix makes all 7 pass.
- `git status --short` / `git diff` / `git diff origin/main...HEAD`: 4 modified + 3 untracked paths
  (the two reviews and `.python-version`); no out-of-lane edits; `git diff --check` clean.
- Contract cross-check (unchanged by the fix): `/health` → `{status:"ok"}` and `/ready` →
  `{status, models:[{name,version,loaded}]}` still match BE-06:21-22; the empty-registry guard only
  makes `degraded` more conservative (no new response field, no new status code). BE-06 reserves
  `503` for `/v1/*`, which still do not exist.
- Security artifact delta check: the artifact reviewed `54e6bc1`; the working-tree delta since is
  three test-assertion blocks, one `bool(states)` guard, and a one-line `.python-version` — no new
  endpoint, no new logging, no new dependency, so the APPROVE still covers the effective revision.

## Findings

### BLOCKER

None.

### MAJOR

None.

### MINOR (open)

- **m3 (carried) — uvicorn's logging stack is still not covered.**
  `TestClient` drives in-process ASGI (`test_logging_privacy.py:12,36`), so uvicorn's access logger
  and any production `log_config` never execute. Genuinely deferred: the security review records it
  as F1 (`TMU-OPS-006-security.md:64-85`) with a concrete M5 test plan (boot a real `uvicorn.Server`
  with the production config, assert sentinels absent including a query-string sentinel, and never
  log pydantic validation errors). **Owner:** `ml-dev`, attached to the first task that adds
  `/v1/*`. Note: the security artifact labels it `TMU-ML-001` ("M5"), but the roadmap puts
  `TMU-ML-001..003` in **M4** and `TMU-ML-004..012` in M5 (`docs/01-product/10-roadmap.md:23-24`);
  the obligation should be attached to whichever task first lands `/v1/*`, which may be M4.
- **m6 (carried) — Starlette/httpx deprecation is deferred but not filed.**
  The gate still prints `StarletteDeprecationWarning: Using httpx with starlette.testclient is
  deprecated; install httpx2 instead` (observed in my run). It is green and non-blocking, and the
  natural home is `TMU-OPS-008` (owner `ops-dev`), but that task file contains no row for it and
  `docs/08-project/backlog.md` has none either — the only record is this review. Per the DoD rule
  that MINOR findings are filed, not silently ignored, add a follow-up row to
  `docs/08-project/tasks/TMU-OPS-008.md` (or a dedicated task) when this branch is committed.
- **m8 (new) — the readiness predicate's `all`/`checksum_pinned` semantics are not mutation-pinned.**
  The new tests use only all-true (`test_health.py:85-88`) and all-false (the real registry) states,
  so a mutation of `readiness_payload` (`main.py:65`) to `any(...)` — or dropping the
  `checksum_pinned` conjunct — would still pass all 7 tests. The empty-registry guard itself is
  pinned (m1 is fixed); this is only about the conjunction. **Suggested follow-up:** add one
  mixed-state unit test, e.g. `[loaded=True, pinned=True] + [loaded=True, pinned=False]` →
  `degraded`, which distinguishes `all` from `any` and exercises both conjuncts. **Owner:** `ml-dev`
  (small follow-up; does not block this merge because the shipped predicate is correct).
- **m9 (new) — the `capsys` half of the privacy test still has no positive control.**
  The m2 fix proves `caplog` capture works, but stdout/stderr capture is still trusted implicitly
  (`test_logging_privacy.py:60-68`): if `capsys` returned empty streams, both sentinel-absence
  assertions on `stdout`/`stderr` would pass vacuously. Low risk (pytest core), but a one-line
  control — `print()` a known token in the test and assert it appears in `captured.out` — closes it.
  **Owner:** `ml-dev`, optional follow-up.
- **m10 (new, bookkeeping) — post-fix evidence not yet updated.**
  The Evidence section still ends with the pre-fix green tail (`TMU-OPS-006.md:139-141,152-153`,
  `5 passed`) while the tree now runs 7 tests; the 5c row (`:69`) has no command/result; the
  front-matter `updated:` is still `2026-09-30` (`:13`); and the review link (`:158`) will need to
  say cycle 2 APPROVE once this file is committed. Do this in the same commit that lands the fixes.
  **Owner:** `ml-dev`.

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first and failed for the right reason | Met | Cycle-1 transcript `TMU-OPS-006.md:81-99`; m1-fix red transcript `:100-123` (empty-registry test failed on the old code). |
| 2 | All new/updated tests pass; full `pnpm gate` green | Met | Reviewer run: `OK gate(quick) passed`, 36/36 unit, **7/7** ML. |
| 3 | Contract tests for every touched `API-*` | N/A | ML service is BE-06, not an `API-*` registry id; shapes asserted inline. |
| 4 | Auth/RBAC asserted; state transitions covered | N/A | `/health` and `/ready` are public by BE-06:13/21-22; no state machine in the diff. |
| 5 | Privacy: nothing sensitive logged or returned | Met (skeleton scope) | No payload path exists; capture pipeline now positively controlled (`test_logging_privacy.py:45`); 404 assertions keep the test honest; residual coverage gaps are m3/m9, recorded and owned. |
| 6 | i18n keys `id` + `en` | N/A | No UI strings or error codes; `i18n:check` skips until M3 by design. |
| 7 | A11y | N/A | No UI. |
| 8 | Docs updated: status, Progress log, traceability, CHANGELOG | Met | `status: REVIEW`, boxes ticked, file count fixed, review links; residual post-fix tail is m10. No contract change → no CHANGELOG. |
| 9 | Generated files in sync; no hand edits | Met | `uv.lock` generated by `uv lock`, committed; `contracts:check` is an M0 no-op by design. |
| 10 | Reviewer verdict in `reviews/<ID>.md` | Met | This file (cycle 2, APPROVE). |
| 11 | Security review for sensitive tasks | Met | `reviews/TMU-OPS-006-security.md` (APPROVE). |
| 12 | PR ready, CI green, labels correct | Not verifiable | `PR: (pending)`; CI runs on the committed SHA only — commit the working tree first. |

## Privacy

The fix diff adds no logging, no request handling, no dependencies. `main.py:65` only changes a
boolean; `.python-version` is a version string; the test changes are synthetic sentinels
(`test_logging_privacy.py:16-19`, `.invalid` host) and assertions. No secrets, emails, embeddings,
hint answers or sensitive URLs are introduced, returned or logged; the only runtime log line is
still metadata-only (`main.py:80-84`). The privacy claim is now non-vacuous in the sense this
skeleton permits: the capture pipeline is positively controlled, the 404 state is asserted (so the
test cannot silently rot when routes arrive), and the authenticated happy-path upgrade is recorded
in two durable places (`test_logging_privacy.py:50-56`, `TMU-OPS-006.md:125`). The untested
payload path itself is the accepted M5/M4 obligation (m3).

## Notes for the human

- **Commit the working tree exactly as reviewed**, including `services/ml/.python-version` and both
  review artefacts. The branch HEAD `54e6bc1` does not contain any of the cycle-1 fixes, so CI on
  that SHA proves nothing about this verdict. Add the post-fix gate tail (`7 passed`) and bump the
  task file's `updated:` date in that commit (m10).
- The m3 attribution to `TMU-ML-001`/M5 in the security artifact is inconsistent with the roadmap
  (M4 = `TMU-ML-001..003`, M5 = `TMU-ML-004..012`); the code/test/task records correctly say
  "the task that lands `/v1/*`", so no action is needed beyond attaching the follow-up there.
- m6 should be filed into TMU-OPS-008 before this branch is forgotten; it currently lives only in
  review prose.
- Cycle budget: this is review cycle 2 of a max 2 (`02-agent-loop.md:52`). No BLOCKER/MAJOR remain,
  so the task can proceed to step 10 SHIP with the open MINORs filed as follow-ups.
