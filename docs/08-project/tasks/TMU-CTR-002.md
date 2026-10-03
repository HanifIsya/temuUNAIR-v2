---
id: TMU-CTR-002
title: Author contract schemas for reports (API-REP-01..08)
status: TODO
lane: contracts
slug: contract-reports
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-001, TMU-ARC-004]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-002 — Author contract schemas for reports (API-REP-01..08)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-REP-01..08`
per `BE-03` and `BE-05` specifications.

## Acceptance criteria

- [ ] All 8 report endpoints are defined in the route registry with typed Zod schemas.
- [ ] Cross-field rules (custody, hints, sensitive masking) are reflected in contract types.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [ ] `pnpm gate:quick` green.
