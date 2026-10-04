# Contract changelog

All notable changes to the TemuUNAIR contracts (backend + frontend). Format: Keep a Changelog.
Every entry links the PR. Versioning rules: `README.md` §Governance.

## [Unreleased]

### Added
- `packages/contracts` implemented (TMU-OPS-004): Zod registry + deterministic generator for
  `BE-02-openapi.yaml`, `generated/types.ts`, `generated/client.ts`,
  `generated/msw-handlers.ts`; real `contracts:build|check|lint|breaking`. ([#11](https://github.com/HanifIsya/temuUNAIR-v2/pull/11))

### Changed
- `BE-05` database contract (TMU-CTR-006): relocated the post-init DDL additions (needs_reprocess column, full-text search trigger, retention indexes) to their respective domain migration tasks (TMU-DB-003..005) instead of instructing their inclusion in the extensions-only 0001_init.sql.

### Added
- `BE-03` + registry (TMU-CTR-001..005): full route catalogue implemented — 62 operations (ME/UPL/META-02/04, reports, search, matches, claims, chat, notifications, admin) with Zod schemas and synthetic examples; `packages/contracts/src/generate.ts` now emits request bodies and path parameters.
- `BE-03` + registry (TMU-CTR-008): split the former combined rows `GET/POST/PATCH /admin/locations[/{id}]` and `…/drop-points[/{id}]` into per-method IDs `API-ADM-18..21` (locations list/update, drop-points list/update); `API-ADM-12/13` restate the create surfaces only. Additive contract minor — `CONTRACT_VERSION` 1.0.0 → 1.1.0.

## [1.0.0] — 2026-09-29

### Added
- Initial contract set derived from the blueprint (Blueprint §5A, §5B):
  - Backend: conventions, endpoint catalog (API-SYS/META/ME/UPL/REP/SRC/MAT/CLM/CHT/NTF/ADM),
    error catalog, database contract, ML service contract, job contract, notification contract,
    auth/session contract, storage contract, env contract, rate limits, backend test contract.
  - Frontend: route map, page data requirements, component contract, state/data fetching,
    forms, UI state matrix, token usage, i18n keys, a11y contract, analytics events,
    error-handling UX, frontend test contract.
- `packages/contracts` layout defined (Zod + registry) — implementation lands in TMU-CTR-001.

### Notes
- No PR link yet: this is the initial import (M0/M2 bootstrap).
- `BE-02-openapi.yaml` is generated; regenerate with `pnpm contracts:build`.
