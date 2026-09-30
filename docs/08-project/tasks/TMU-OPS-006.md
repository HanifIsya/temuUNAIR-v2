---
id: TMU-OPS-006
title: ML service skeleton with uv, FastAPI health and pytest
status: IN_PROGRESS
lane: ml
slug: ml-service-skeleton
milestone: M0
priority: P1
owner: ml-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-06, DEC-011]
created: 2026-09-29
updated: 2026-09-30
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

- [ ] `uv sync --frozen` succeeds and commits `uv.lock`.
- [ ] `uv run ruff check .` and `uv run pytest -q -m "not slow"` exit 0.
- [ ] `GET /health` returns 200; `GET /ready` returns 200 with `degraded` while the model
      checksums are unpinned.
- [ ] No image bytes, text bodies, or embeddings are logged (asserted by a test).
- [ ] `pnpm gate` green, including the ML step.

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

### Plan

1. RED (`qa-engineer`): `services/ml/tests/` — `/health` 200 `{status:"ok"}`; `/ready` 200 `degraded` with per-model rows from `models.lock.json`; log-capture assertion that no image bytes/text bodies/embeddings are ever logged. Capture red evidence (no app/pyproject yet).
2. GREEN (`ml-dev`): scaffold `pyproject.toml` (uv, ruff, pytest, `slow` marker) + `uv.lock`; FastAPI `app/main.py` with `/health` and `/ready` reading the lockfile; commit `uv.lock`.
3. REFACTOR (`ml-dev`): README status line, task file evidence, minimal diff check.
4. GATE: `uv sync --frozen`; `uv run ruff check .`; `uv run pytest -q -m "not slow"`; `pnpm gate` tail.
5. SHIP: commit/push/PR via `git-steward`; `reviewer` (+ `security-reviewer` for the privacy/logging claim); CI green; step 12 merge gate.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
