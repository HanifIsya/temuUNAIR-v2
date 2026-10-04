---
id: TMU-OPS-034
title: M3 compose bring-up — web + worker + postgres + minio up green for the walking skeleton
status: TODO
lane: ops
slug: compose-m3-bringup
milestone: M3
priority: P1
owner: ops-dev
deps: [TMU-DB-005, TMU-BE-008]
refs: [ROADMAP, BE-11]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-OPS-034 — M3 compose bring-up — web + worker + postgres + minio up green for the walking skeleton

## Goal

Turn the roadmap's M3 exit line "docker compose up" into a verified deliverable: extend the
M0 compose file so `docker compose up` brings web, worker, Postgres (pgvector) and MinIO to
healthy together, applies migrations + seeds on first boot, and exposes the health probes
(`GET /healthz`, `GET /readyz`) used by the E2E gate. Env wiring follows BE-11; the worker
runs with `ML_MODE=stub` so no models download.

## Acceptance criteria

- [ ] `docker compose up` from a clean checkout reaches all-healthy without manual steps; documented in `docs/07-ops/`.
- [ ] Migrations apply and seeds load automatically on first boot; second boot is idempotent.
- [ ] `/readyz` reflects DB + storage connectivity (NFR-012); compose down/up leaves no orphan volumes.
- [ ] CI job or documented runbook step proves it once per merge to main while M3 is in flight.

## Files expected to change

- `infra/docker-compose.yml`, `infra/docker/*`
- `docs/07-ops/**` (runbook)
- `package.json` (script wiring only if needed)
- `docs/08-project/tasks/TMU-OPS-034.md`
