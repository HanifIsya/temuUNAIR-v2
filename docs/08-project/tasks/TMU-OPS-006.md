---
id: TMU-OPS-006
title: ML service skeleton with uv, FastAPI health and pytest
status: TODO
lane: ml
slug: ml-service-skeleton
milestone: M0
priority: P1
owner: ml-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-06, DEC-011]
created: 2026-09-29
updated: 2026-09-29
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
- `services/ml/models.lock.json` is a placeholder pinned in TMU-ML-001; `/ready` must report
  `degraded` while checksums are `TODO`.

## Acceptance criteria

- [ ] `uv sync --frozen` succeeds and commits `uv.lock`.
- [ ] `uv run ruff check .` and `uv run pytest -q -m "not slow"` exit 0.
- [ ] `GET /health` returns 200; `GET /ready` returns 200 with `degraded` while the model
      checksums are unpinned.
- [ ] No image bytes, text bodies, or embeddings are logged (asserted by a test).
- [ ] `pnpm gate` green, including the ML step.

## Files expected to change

- `services/ml/**` (pyproject.toml, uv.lock, app/, tests/)
- `docs/07-ops/07-model-management.md` (only if the readiness contract needs clarifying)

## Out of scope

- Real model loading and inference (M5, `TMU-ML-001..012`).
- The Dockerfile for the `ml` compose service (M5; compose block stays commented until then).
- `ml-openapi.json` generation (TMU-OPS-008 wires the export step).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| | | | |

### Plan

1. Scaffold `services/ml` with pyproject, ruff config and pytest config.
2. Add the FastAPI app with `/health` and `/ready` reading `models.lock.json`.
3. Add tests for both endpoints plus a no-logging assertion.
4. `uv sync --frozen`, `uv run ruff check .`, `uv run pytest -q`, then `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
