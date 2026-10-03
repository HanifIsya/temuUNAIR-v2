---
id: TMU-CTR-005
title: Author contract schemas for notifications and admin operations (API-NTF-01..04, API-ADM-01..17)
status: TODO
lane: contracts
slug: contract-notif-admin
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-004, TMU-ARC-010]
refs: [BE-03, BE-04, BE-08, FE-01, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-CTR-005 — Author contract schemas for notifications and admin operations (API-NTF-01..04, API-ADM-01..17)

## Goal

Implement the Zod schemas and route definitions in `packages/contracts/src/` for `API-NTF-01..04` and
`API-ADM-01..17` per `BE-03`, `BE-08`, and admin RBAC specifications.

## Acceptance criteria

- [ ] All notification endpoints and 17 admin endpoints defined with strict role authorization tags.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint` all green.
- [ ] `pnpm gate:quick` green.
