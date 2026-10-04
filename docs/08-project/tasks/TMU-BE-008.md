---
id: TMU-BE-008
title: Ops hardening — idempotency + rate-limit middleware, Schemathesis mock to real handlers
status: BLOCKED
lane: be
slug: be-ops-hardening
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-007]
refs: [BE-01, BE-12, BE-13, NFR, TMU-CTR-007]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-008 — Ops hardening — idempotency + rate-limit middleware, Schemathesis mock to real handlers

## Goal

Close the M2-exit handoff items in the API surface: `Idempotency-Key` + fingerprint middleware
per BE-01 (replay on create-report and claim mutations), `BE-12` per-endpoint rate limiters
(`RATE_LIMITED` with `Retry-After`), and replace the four-route mock in
`tests/contract/run-contract.mjs` with the real Next handlers for every route implemented so
far (API-SYS/ME/UPL/META/REP), clearing the Schemathesis 404/405/`422` warnings recorded in
`REV-TMU-CTR-007` and `REV-TMU-CTR-008`.

## Acceptance criteria

- [ ] Replay of a stored idempotent success returns the original payload; conflicting fingerprint → 409.
- [ ] Rate-limit middleware returns 429 + `Retry-After` per BE-12 tiers; limiter keyed per contract.
- [ ] `run-contract.mjs` boots the real app; Schemathesis coverage/fuzz phases report zero warnings for wired routes.
- [ ] `pnpm gate:full` green (this task re-runs the fuzz phase).

## Files expected to change

- `apps/web/src/server/middleware/*`, `apps/web/src/app/api/v1/**` (wiring only, no behaviour change)
- `tests/contract/run-contract.mjs`
- matching tests
- `docs/08-project/tasks/TMU-BE-008.md`

## Blocked

DoR check #6 fails: `tests/contract/run-contract.mjs` belongs to the `qa` lane
(`tests/**` in `.agent/lanes.json`), so a `be` branch touching it would fail
`scripts/check-lane.sh` (and therefore the gate — AC #4). Per WF-LANES cross-lane rule 5,
stopping and filing **BLK-003** (split into a `qa` follow-up task vs. an `ops` lane-map
change). Not started.
