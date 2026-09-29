---
id: CONTRACTS-README
title: Contracts — governance and how to change them
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BLUEPRINT", "ARCH-OVERVIEW"]
source_refs: ["Blueprint §5, §5C"]
---

# Contracts

Two contracts, one shared source of truth:

- **Backend contract** (`backend/BE-01..13`) — what the server promises: HTTP API, database,
  jobs, ML service, notifications, auth, config, rate limits, tests.
- **Frontend contract** (`frontend/FE-01..12`) — what the UI promises: routes, page data,
  components, state, forms, states, tokens, i18n, a11y, analytics, errors, tests.
- **Cross-boundary rules** — Blueprint §5C: `packages/contracts` is the single source; OpenAPI,
  TS client and MSW handlers are generated from it.

## Governance (Blueprint §5.0, restated)

1. **Contract-first.** A feature task may not change behaviour that is not already described in
   a merged contract. Missing/wrong → stop, create a `TMU-CTR-*` task.
2. **Single source:** `packages/contracts` (Zod schemas + route registry). Everything else —
   `BE-02-openapi.yaml`, `generated/types.ts`, `generated/client.ts`, `generated/msw-handlers.ts`
   — is generated. Never hand-edit generated files.
3. **Versioning:** `CONTRACT_VERSION` follows semver. Additive optional fields/endpoints = minor.
   Renames/removals/semantic changes = major (needs `/api/v2` or a migration plan) + an ADR.
4. **Change protocol:** the contract PR (label `contract`) merges **first**; dependent FE/BE
   branches rebase afterwards. Both a backend-lane and a frontend-lane human reviewer approve.
5. **Never-break rule:** a merged contract cannot be edited in place by a feature PR; only
   `TMU-CTR-*` PRs touch `packages/contracts/**` and `docs/04-contracts/**`.
6. **Tag** each accepted contract set: `contract-v<semver>`.

## How to change a contract

Use the `contract-change` skill. Summary:

1. Confirm you are on a `TMU-CTR-*` branch (lane `contracts`).
2. Edit Zod schemas/registry in `packages/contracts`.
3. Run `pnpm contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking`.
4. Bump `CONTRACT_VERSION` (minor/major) and add an ADR for breaking changes.
5. Update affected docs (BE-03 examples, FE-02/FE-03) and `CHANGELOG.md`.
6. Regenerate MSW handlers; frontend tests must still pass.
7. Open the PR with label `contract`; request both reviewers.

## Index

### Backend
| Doc | Contents |
|---|---|
| `BE-01-api-conventions.md` | base path, IDs, time, pagination, errors, idempotency, concurrency |
| `BE-02-openapi.yaml` | **generated** OpenAPI 3.1 |
| `BE-03-endpoint-catalog.md` | every endpoint with request/response examples |
| `BE-04-error-catalog.md` | error codes, HTTP status, user-facing keys |
| `BE-05-database-contract.md` | DDL, constraints, indexes, migration rules |
| `BE-06-ml-service-contract.md` + `ml-openapi.json` | ML service endpoints and behaviours |
| `BE-07-job-and-event-contract.md` | queues, payloads, retries, idempotency |
| `BE-08-notification-contract.md` | notification types, payloads, channels, dedupe |
| `BE-09-auth-session-contract.md` | cookies, CSRF, session shape, RBAC matrix |
| `BE-10-storage-contract.md` | upload handshake, limits, keys, TTLs |
| `BE-11-env-config-contract.md` | every env var |
| `BE-12-rate-limits-and-quotas.md` | per-endpoint limits |
| `BE-13-backend-test-contract.md` | what every endpoint test must assert |

### Frontend
| Doc | Contents |
|---|---|
| `FE-01-route-map.md` | every route, access, APIs used, rendering |
| `FE-02-page-data-requirements.md` | per page: APIs, params, query keys, staleTime, SSR/CSR |
| `FE-03-component-contract.md` | props/events/states per `CMP-###` |
| `FE-04-state-and-data-fetching.md` | query keys, invalidation, polling, optimistic rules |
| `FE-05-forms-and-validation.md` | wizard steps, shared schemas, error mapping |
| `FE-06-ui-state-matrix.md` | loading/empty/error/forbidden/offline per page |
| `FE-07-design-token-usage.md` | token → purpose map, forbidden raw values |
| `FE-08-i18n-keys.md` | key naming, namespaces, plurals, CI checks |
| `FE-09-a11y-contract.md` | per-component accessibility requirements |
| `FE-10-analytics-events.md` | event names and properties (no PII) |
| `FE-11-error-handling-ux.md` | error code → message/action mapping |
| `FE-12-frontend-test-contract.md` | testids, component tests, E2E list |
