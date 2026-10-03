---
id: TMU-CTR-004
title: Author contract schemas for claims, chat and handover (API-CLM-01..10, API-CHT-01..04)
status: TODO
lane: contracts
slug: contract-claims-chat
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-002, TMU-ARC-004]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-004 — Author contract schemas for claims, chat and handover (API-CLM-01..10, API-CHT-01..04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-CLM-01..10` and
`API-CHT-01..04` per `BE-03` and state machine specifications.

## Acceptance criteria

- [ ] All claim, handover, and chat endpoints defined with prompt masking and two-sided confirmation states.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [ ] `pnpm gate:quick` green.
