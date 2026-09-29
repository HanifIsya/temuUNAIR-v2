---
id: BE-02
title: OpenAPI document (generated)
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-01", "BE-03"]
source_refs: ["Blueprint §5C"]
---

# BE-02 — `openapi.yaml`

> **GENERATED FILE.** This document is produced by `pnpm contracts:build` from
> `packages/contracts` (Zod schemas + route registry) and written to
> `docs/04-contracts/backend/BE-02-openapi.yaml`. **Never hand-edit it.** CI (`contracts:check`)
> rebuilds it and fails on drift.

## Status

`packages/contracts` is not implemented yet (TMU-CTR-001). Until then this folder contains
`openapi.placeholder.yaml` describing the generation contract so tooling and reviewers know the
shape; the real file replaces it and is committed by the architect task.

## Generation contract

| Input | Output |
|---|---|
| `packages/contracts/src/registry.ts` (`id`, `method`, `path`, `auth`, `request`, `response`, `errors`, `rateLimit`) | paths + operations + components |
| `packages/contracts/src/*.ts` Zod schemas | `components.schemas` via `zod-to-json-schema` |
| `packages/contracts/src/enums.ts` | shared enums as components |

Commands:

| Command | Purpose |
|---|---|
| `pnpm contracts:build` | writes `BE-02-openapi.yaml`, `generated/types.ts`, `generated/client.ts`, `generated/msw-handlers.ts` |
| `pnpm contracts:check` | rebuilds to a temp dir and diffs against committed files (fails on drift) |
| `pnpm contracts:lint` | Spectral lint (ruleset in `packages/contracts/spectral.yaml`) |
| `pnpm contracts:breaking` | `oasdiff` against `origin/main` (breaking = major + ADR + label) |

## Conventions baked into the generator

1. Operation IDs = `API-*` IDs (e.g. `API-REP-01`) so tests can look them up by ID.
2. Every error response references `components.schemas.ErrorEnvelope` and lists the exact codes
   from `BE-04`.
3. Pagination responses reference the shared `PageMeta` schema.
4. `auth` values map to OpenAPI security schemes: `cookieAuth` (session) and `bearerMl`
   (ML service only, in `ml-openapi.json`).
5. Examples come from `packages/contracts/src/examples.ts` (kept honest by contract tests).

## Reviewer checklist

- [ ] `pnpm contracts:check` green (no drift)
- [ ] `contracts:lint` green (Spectral)
- [ ] `contracts:breaking` clean or labelled `breaking` with an ADR
- [ ] `CONTRACT_VERSION` bumped correctly
- [ ] `CHANGELOG.md` entry with reason and PR link
- [ ] MSW handlers regenerated; frontend tests pass
