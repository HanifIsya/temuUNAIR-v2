---
id: TMU-CTR-003
title: Author contract schemas for search and matching (API-SRC-01, API-MAT-01..04)
status: TODO
lane: contracts
slug: contract-search-matching
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-002, TMU-ARC-005]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-003 — Author contract schemas for search and matching (API-SRC-01, API-MAT-01..04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-SRC-01` and
`API-MAT-01..04` per `BE-03` and `MATCH-SPEC`.

## Acceptance criteria

- [ ] Search and match endpoints defined with bands, reasons, and no raw score leakage.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [ ] `pnpm gate:quick` green.
