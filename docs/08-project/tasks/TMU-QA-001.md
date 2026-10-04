---
id: TMU-QA-001
title: Contract runner boots the real Next handlers; clear Schemathesis warnings (REV-TMU-CTR-007/008)
status: TODO
lane: qa
slug: qa-contract-real-handlers
milestone: M3
priority: P1
owner: qa-engineer
deps: [TMU-BE-008]
refs: [BE-13, NFR, TMU-CTR-007, TMU-CTR-008]
created: 2026-10-04
updated: 2026-10-04
---

# TMU-QA-001 — Contract runner boots the real Next handlers; clear Schemathesis warnings

## Goal

Replace the four-route mock in `tests/contract/run-contract.mjs` with the real Next
handlers for every route implemented so far (API-SYS/ME/UPL/META/REP), clearing the
Schemathesis 404/405/`422` warnings recorded in `REV-TMU-CTR-007` and
`REV-TMU-CTR-008`. Split out of TMU-BE-008 by BLK-003 (`tests/contract/**` is qa-lane).

## Acceptance criteria

- [ ] `run-contract.mjs` boots the real app; Schemathesis coverage/fuzz phases report zero warnings for wired routes.
- [ ] Red tests first; `pnpm gate:full` green (this task re-runs the fuzz phase).

## Files expected to change

- `tests/contract/run-contract.mjs`
- matching tests
- `docs/08-project/tasks/TMU-QA-001.md`
