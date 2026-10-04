---
id: TMU-QA-001
title: M3 walking-skeleton E2E demo — login, create report, read it back
status: TODO
lane: qa
slug: e2e-walking-skeleton
milestone: M3
priority: P1
owner: qa-engineer
deps: [TMU-FE-006, TMU-OPS-034]
refs: [E2E-01..03, FE-12, NFR, ROADMAP]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-QA-001 — M3 walking-skeleton E2E demo — login, create report, read it back

## Goal

Prove the M3 demo scenario on a real stack: Playwright spec `E2E-01..03` boots the compose
environment (web + worker + postgres + minio), signs in with the dev magic-link account,
creates a LOST report with a photo, and finds it on browse and at its detail URL. This is
the M3 exit gate's test artefact.

## Acceptance criteria

- [ ] `pnpm test:e2e` green in CI against compose; screenshots + trace artefacts retained.
- [ ] Scenario asserts contract-visible facts only (no private fields in the DOM).
- [ ] Deterministic: seeded DB fixture, frozen clock, no network to ML models (`ML_MODE=stub`).
- [ ] Mobile viewport (390×844) and desktop both pass.

## Files expected to change

- `tests/e2e/src/walking-skeleton.spec.ts`
- `tests/e2e/src/fixtures/*`
- `docs/08-project/tasks/TMU-QA-001.md`
