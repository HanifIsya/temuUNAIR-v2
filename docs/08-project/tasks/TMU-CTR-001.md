---
id: TMU-CTR-001
title: Author contract schemas for ME, preferences and uploads (API-ME-*, API-UPL-*, API-META-02/04)
status: TODO
lane: contracts
slug: contract-me-uploads
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-ARC-001]
refs: [BE-03, BE-04, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-001 — Author contract schemas for ME, preferences and uploads (API-ME-*, API-UPL-*, API-META-02/04)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-ME-01..05`,
`API-UPL-01..03`, `API-META-02`, and `API-META-04` per `BE-03` specifications.

## Acceptance criteria

- [ ] All ME, UPL, and remaining META endpoints are defined in the route registry with typed Zod schemas.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [ ] `pnpm gate:quick` green.
