---
id: TMU-OPS-006
title: ML service skeleton with uv, FastAPI health and pytest
status: REVIEW
lane: ml
slug: ml-service-skeleton
milestone: M0
priority: P1
owner: ml-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-06, DEC-011]
created: 2026-09-29
updated: 2026-10-01
---

# TMU-OPS-006 — ML service skeleton with uv, FastAPI health and pytest

## Goal

Make `services/ml` an installable, testable Python package so the `ml` step in `scripts/gate.sh`
(`uv sync --frozen`, `ruff check`, `pytest`) actually runs, with `/health` and `/ready` stubs
that report model state from `models.lock.json`.

## Context

- `docs/04-contracts/backend/BE-06-ml-service-contract.md` — endpoints, schemas, status codes.
- `docs/03-architecture/06-ml-service-design.md` — models, preprocessing, latency budget.
- `services/ml/README.md` documents the planned layout and non-negotiables.
- `services/ml/models.lock.json` is a placeholder; `/ready` must report `degraded` while
  checksums are `TODO`.
- The gate step and the CI `ml` job both guard on `services/ml/pyproject.toml`, so they turn real
  as soon as this task lands. **No root or CI file needs to change.**

## Acceptance criteria

- [x] `uv sync --frozen` succeeds and commits `uv.lock`.
- [x] `uv run ruff check .` and `uv run pytest -q -m "not slow"` exit 0.
- [x] `GET /health` returns 200; `GET /ready` returns 200 with `degraded` while the model
      checksums are unpinned.
- [x] No image bytes, text bodies, or embeddings are logged (asserted by a test).
- [x] `pnpm gate` green, including the ML step.

## Files expected to change

- `services/ml/**` (pyproject.toml, uv.lock, app/, tests/)

## Out of scope

- Real model loading and inference (M5, `TMU-ML-001..012`).
- The Dockerfile for the `ml` compose service (M5; compose block stays commented until then).
- `ml-openapi.json` generation (TMU-OPS-008 wires the export step).
- Root `package.json`/`scripts/**`/`ci.yml` edits (the guards already exist).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | removed the setup-doc edit (docs lane); CI/gate guards confirmed already present |
| 2026-09-30 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-006`, branch `agent/ml/TMU-OPS-006-ml-service-skeleton` from `origin/main` @ `b9d6ba6`; `pnpm i --frozen-lockfile` OK; baseline `pnpm gate` green (36/36 unit); `uv 0.12.21` installed locally (was missing) |
| 2026-09-30 | orchestrator | 1 PICK | human-assigned task; dep `TMU-OPS-002` merged to `main` (`b9d6ba6`, PR #5); status → `IN_PROGRESS`; no remote `agent/ml/TMU-OPS-006-*` branch (claim valid). Note: OPS-002's task-file flip to `DONE` rides in draft PR #6 (META-002); code dependency is on `main` |
| 2026-09-30 | orchestrator | 2 READ | BE-06 (`/health` → `{status:"ok"}`; `/ready` → `{status, models:[{name,version,loaded}]}`, degraded while checksums unpinned; 503 only on `/v1/*`), ARCH-ML, `services/ml/README.md`, `models.lock.json` placeholder; lane `ml` covers `services/ml/**`; no contract change needed |
| 2026-09-30 | orchestrator | 3 PLAN | plan below |
| 2026-09-30 | qa-engineer | 4 RED | wrote 5 tests in `services/ml/tests/` (4 health + 1 privacy); `uv run pytest -q -m "not slow"` and `python -m pytest -q -m "not slow"` both → `ModuleNotFoundError: No module named 'app'` (2 collection errors, exit 2) — no `pyproject.toml`/`app/` yet, as expected |
| 2026-09-30 | ml-dev | 5 GREEN | `uv lock` + `uv sync --frozen` OK (25 packages); `uv run ruff check .` → "All checks passed!" (exit 0); `uv run pytest -q -m "not slow"` → 5 passed (privacy test included, no sentinel leakage); files: `pyproject.toml`, `uv.lock`, `app/__init__.py`, `app/main.py` |
| 2026-09-30 | ml-dev | 6 REFACTOR | `services/ml/README.md` status line → "skeleton (TMU-OPS-006)"; no other changes; minimal diff (6 new files: `pyproject.toml`, `uv.lock`, `app/__init__.py`, `app/main.py`, `tests/test_health.py`, `tests/test_logging_privacy.py`; 2 modified) |
| 2026-09-30 | orchestrator | 7 GATE | verified independently: `uv sync --frozen` exit 0; `uv run ruff check .` → "All checks passed!"; `uv run pytest -q -m "not slow"` → 5 passed; `bash scripts/gate.sh quick` → `OK gate(quick) passed` (36/36 unit, real `ml lint+tests` step now active) |
| 2026-09-30 | qa-engineer | 5b RED (review fix) | M1/m2/m4/m1 tests strengthened; new empty-registry test fails: `tests/test_health.py:77 assert payload["status"] == "degraded"` -> `AssertionError: assert 'ok' == 'degraded'` |
| 2026-09-30 | ml-dev | 5c GREEN (review fix) | empty-registry guard; .python-version 3.11; status → REVIEW |
| 2026-10-01 | reviewer | 9 REVIEW | cycle 2 verdict **APPROVE** (0 BLOCKER / 0 MAJOR; 5 MINOR deferred: m3 uvicorn logging coverage → first `/v1/*` task, m6 httpx deprecation → TMU-OPS-008, m8 mixed-state predicate test + m9 capsys control → M5, m10 bookkeeping fixed here); gate re-run green (`7 passed`) |
| 2026-10-01 | orchestrator | 9 REVIEW (sec) | `security-reviewer` verdict **APPROVE** (0 BLOCKER / 0 MAJOR; F1 uvicorn coverage → M5, F2 python advisory job + F4 dependency bounds → TMU-OPS-008, F3 hatchling lock gap → M5) |
| 2026-10-01 | orchestrator | 10 SHIP | gate tail updated below; commit/push/PR-ready via `git-steward` |
| 2026-10-01 | orchestrator | 11 CI | PR #9 @ `cb2002a`: all 10 required checks pass (incl. `ml`), `docker-build` skips by design; `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN` |
| 2026-10-01 | orchestrator | 12 MERGE GATE | **BLOCKED — needs human**: `gh pr merge 9 --squash` denied by the session permission layer (`gh pr*: deny` except view/checks/edit). CI green + both reviews APPROVE; diff verified in-lane (12 files: `services/ml/**` + `_common`). Human runs: `gh pr merge 9 --squash --delete-branch`, then step 13 bookkeeping (`docs-keeper`) |

### Plan

1. RED (`qa-engineer`): `services/ml/tests/` — `/health` 200 `{status:"ok"}`; `/ready` 200 `degraded` with per-model rows from `models.lock.json`; log-capture assertion that no image bytes/text bodies/embeddings are ever logged. Capture red evidence (no app/pyproject yet).
2. GREEN (`ml-dev`): scaffold `pyproject.toml` (uv, ruff, pytest, `slow` marker) + `uv.lock`; FastAPI `app/main.py` with `/health` and `/ready` reading the lockfile; commit `uv.lock`.
3. REFACTOR (`ml-dev`): README status line, task file evidence, minimal diff check.
4. GATE: `uv sync --frozen`; `uv run ruff check .`; `uv run pytest -q -m "not slow"`; `pnpm gate` tail.
5. SHIP: commit/push/PR via `git-steward`; `reviewer` (+ `security-reviewer` for the privacy/logging claim); CI green; step 12 merge gate.

## Evidence

- Red: tests written first in `services/ml/tests/` (`test_health.py`: 4 tests; `test_logging_privacy.py`: 1 test). Both commands run from `services/ml` fail at collection because the skeleton does not exist yet:

  ```
  $ uv run pytest -q -m "not slow"
  tests/test_health.py:15: in <module>
      from app.main import app
  E   ModuleNotFoundError: No module named 'app'
  ERROR tests/test_health.py
  ERROR tests/test_logging_privacy.py
  !!! Interrupted: 2 errors during collection !!!
  2 errors in 1.11s   (exit 2)

  $ python -m pytest -q -m "not slow"
  E   ModuleNotFoundError: No module named 'app'
  2 errors in 0.82s   (exit 2)

  # Note: uv 0.12.21 has no pyproject.toml to sync yet, so it falls back to the
  # system Python and still collects the tests; the failure signature is the import.
  ```
- Red (review fix for M1/m2/m4/m1, 2026-09-30): `uv run pytest -q -m "not slow"` from `services/ml` -> exactly one failure, the new empty-registry unit test; the other 6 tests pass:

  ```
  $ uv run pytest -q -m "not slow"
  ....F..                                                                  [100%]
  ================================== FAILURES ===================================
  __________ test_readiness_payload_empty_registry_is_degraded_not_ok ___________

      def test_readiness_payload_empty_registry_is_degraded_not_ok():
          # m1: `all([])` is True, so an empty registry must be guarded explicitly;
          # a service with zero registered models can never be ready.
          payload = readiness_payload([])

  >       assert payload["status"] == "degraded"
  E       AssertionError: assert 'ok' == 'degraded'
  E
  E         - degraded
  E         + ok

  tests\test_health.py:77: AssertionError
  =========================== short test summary info ===========================
  FAILED tests/test_health.py::test_readiness_payload_empty_registry_is_degraded_not_ok
  1 failed, 6 passed, 1 warning in 1.00s
  ```

  M5 obligation (from M1): when `/v1/*` lands (TMU-ML-*), `test_logging_privacy.py` must replace its two `status_code == 404` assertions with the authenticated happy path (bearer token from env, assert 2xx) so the payload actually flows through a handler.
- Green: all commands run from `services/ml`:

  ```
  $ uv lock
  Resolved 25 packages in 1.75s

  $ uv sync --frozen
  Downloaded 3 packages
  Installed 25 packages in 5.13s

  $ uv run ruff check .
  All checks passed!

  $ uv run pytest -q -m "not slow"
  .....                                                                    [100%]
  5 passed, 1 warning in 6.61s

  # Privacy test run separately (no sentinel leakage in caplog/stdout/stderr):
  $ uv run pytest -q tests/test_logging_privacy.py
  1 passed, 1 warning in 1.81s
  ```
- Gate tail (`bash scripts/gate.sh quick`, worktree `E:\wt\TMU-OPS-006`, post review-fix):

  ```
  > ml lint+tests
  All checks passed!
  .......                                                                  [100%]
  7 passed, 1 warning in 0.86s

  OK gate(quick) passed
  ```
- PR: (pending)
- Review: [docs/08-project/reviews/TMU-OPS-006.md](../reviews/TMU-OPS-006.md) — cycle 1 CHANGES (M1 test vacuity, M2 security artifact), cycle 2 **APPROVE**; security review [TMU-OPS-006-security.md](../reviews/TMU-OPS-006-security.md) **APPROVE**

## Blockers

(none)
