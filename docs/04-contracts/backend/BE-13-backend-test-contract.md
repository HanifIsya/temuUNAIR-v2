---
id: BE-13
title: Backend test contract
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["BE-01", "BE-03", "BE-04", "TEST-STRATEGY"]
source_refs: ["Blueprint §5C.3", "P4"]
---

# BE-13 — Backend test contract

Every endpoint implementation ships with tests that assert the following. A PR that adds or
changes an endpoint without these is incomplete regardless of coverage numbers.

## Required assertions per endpoint

| # | Assertion | How |
|---|---|---|
| 1 | **Contract shape** | `expectMatchesContract(apiId, response)` — Zod `parse` of the registry response schema |
| 2 | **Auth** | unauthenticated → `401 AUTH_REQUIRED`; wrong role → `403 FORBIDDEN` or `404 NOT_FOUND` per visibility rules |
| 3 | **Validation** | invalid body/params → `422 VALIDATION_FAILED` with `details.fields[]` paths |
| 4 | **Happy path** | success status + exact response fields (no extra private fields) |
| 5 | **Privacy** | response never contains hint answers (to non-owners), other emails, embeddings, raw scores |
| 6 | **State machine** | every transition the endpoint can trigger: legal transition succeeds, illegal returns `409 CONFLICT_STATE` |
| 7 | **Side effects** | audit row for mutations; notification/job enqueued where `BE-07`/`BE-08` require |
| 8 | **Idempotency** | for the 3 idempotent POSTs: same key + body → identical response; different body → `IDEMPOTENCY_CONFLICT` |
| 9 | **Rate limit** | at least one test hitting the limit → `429` with `Retry-After` (or a unit test of the limiter) |
| 10 | **Concurrency** | `PATCH /reports/{id}` with stale `If-Match` → `409` |

## Test layers

| Layer | Scope | Tools |
|---|---|---|
| Unit | service rules, state machine transitions, mappers, validators | Vitest, faked repositories |
| Route | handler wiring, auth, status codes, contract shape | Vitest + test app (real Postgres via testcontainers) |
| Integration | jobs, notifications, storage pipeline, sweeps | Vitest + testcontainers + MinIO + Mailpit |
| Contract fuzz | OpenAPI conformance | Schemathesis in `gate:full` |
| ML | ML service schemas + determinism | pytest + Schemathesis (`ml-openapi.json`) |

## Fixtures and determinism

- Fixtures are synthetic; no real people or real UNAIR data (`AGENTS.md` rule 5).
- Time is injectable (`clock` dependency) so expiry/reminder tests are deterministic.
- `ML_MODE=stub` returns fixed vectors; tests never download models.
- Seeded ids are stable (UUIDv7 with a fixed clock in tests) so snapshots are meaningful.

## Contract test helpers

```ts
// packages/contracts/src/testing.ts
export function expectMatchesContract<T extends z.ZodTypeAny>(
  apiId: ApiId,
  payload: unknown,
  schema: T,
): asserts payload is z.infer<T> { schema.parse(payload); }
```

Every route test imports the registry entry for its `API-*` id — never a hand-written schema.

## Coverage expectations

| Area | Minimum |
|---|---|
| `server/services/**` | 90% lines, 100% of state-machine branches |
| `server/repositories/**` | covered through integration tests |
| Route handlers | one contract test per endpoint per auth class |
| Jobs | idempotency test per queue |

Coverage numbers are a floor, not a goal; a well-reasoned untested branch must be commented in
the review file with the reason.

## What "red evidence" means

The qa-engineer runs the new tests **before** implementation and records the failing output in
the task file's Progress log (command + failure summary). PRs without red evidence for new
behaviour are sent back (`docs/05-workflow/05-definition-of-ready-done.md`).

## Forbidden test practices

1. Weakening or deleting assertions to make the gate pass.
2. `skip`/`only` left in committed tests (lint fails).
3. Sleep-based waits; use fake clocks or event-based waits.
4. Retry-until-green for flaky tests — quarantine with a blocker instead.
5. Snapshot tests of entire response bodies (they hide privacy regressions); assert fields.
