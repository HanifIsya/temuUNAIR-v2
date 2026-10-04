---
id: TMU-BE-008
title: Ops hardening — idempotency + rate-limit middleware (BE-01, BE-12)
status: TODO
lane: be
slug: be-ops-hardening
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-007]
refs: [BE-01, BE-12, BE-13, NFR]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-008 — Ops hardening — idempotency + rate-limit middleware (BE-01, BE-12)

## Goal

Close the M2-exit handoff items in the API surface: `Idempotency-Key` + fingerprint
middleware per BE-01 (replay-safe mutations — create-report today, claim mutations when
they land), and `BE-12` per-endpoint rate limiters returning `RATE_LIMITED` with
`Retry-After`, wired across the implemented routes.

Scope note: the Schemathesis/`run-contract.mjs` half of the original goal moved to the
qa-lane follow-up **TMU-QA-001** (BLK-003 split — `tests/contract/**` is qa-owned).

## Acceptance criteria

- [ ] Replay of a stored idempotent success returns the original payload; conflicting fingerprint → 409.
- [ ] Rate-limit middleware returns 429 + `Retry-After` per BE-12 tiers; limiter keyed per contract.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/server/middleware/*`, `apps/web/src/app/api/v1/**` (wiring only, no behaviour change)
- matching tests
- `docs/08-project/tasks/TMU-BE-008.md`

## Progress log

- 2026-10-04 — DoR check #6 failed: AC "run-contract.mjs boots the real app" needed
  `tests/contract/run-contract.mjs`, a **qa-lane** file → stopped, filed **BLK-003**
  (task was briefly marked BLOCKED). Resolution (both options executed on human
  instruction): split — this task trimmed to the be-lane half, `TMU-QA-001` filed for
  the contract-runner half; plus an ops lane-map change granting `be` access to
  `tests/contract/**` for future tasks. Status back to TODO; ready to start.
