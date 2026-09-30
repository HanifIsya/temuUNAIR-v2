---
id: TMU-OPS-004
title: Contracts package skeleton and real contracts checks
status: IN_PROGRESS
lane: contracts
slug: contracts-package-skeleton
milestone: M0
priority: P1
owner: architect
deps: [TMU-OPS-002]
refs: [CONTRACTS-README, BE-01, FE-01]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-004 — Contracts package skeleton and real `contracts:*` checks

## Goal

Create `packages/contracts` as the single source of truth workspace package (Zod schemas +
route registry) with a generator that emits `BE-02-openapi.yaml`, `generated/types.ts`,
`generated/client.ts` and `generated/msw-handlers.ts`, so `contracts:check` and
`contracts:lint` are real from M0 instead of placeholders.

## Context

- `docs/04-contracts/README.md` governance: `packages/contracts` is the single source; every
  generated artefact is derived; `CONTRACT_VERSION` follows semver.
- `docs/04-contracts/backend/BE-02-openapi.md` and `docs/04-contracts/frontend/FE-01-route-map.md`
  describe the intended outputs.
- The root gate scripts already route here: `scripts/checks/step.mjs` (TMU-OPS-011) runs
  `pnpm --filter @temuunair/contracts run <build|check|lint|breaking>` as soon as
  `packages/contracts/package.json` exists, and falls back to the named placeholder until then.
  **No root file needs to change in this task.**
- The real endpoint catalogue is authored in M2 (`TMU-CTR-001..005`); this task only builds the
  pipeline and a minimal registry so the checks can run.

## Acceptance criteria

- [ ] `pnpm contracts:build` regenerates all four artefacts deterministically; running it twice
      produces no diff.
- [ ] `pnpm contracts:check` fails when a generated file is hand-edited (red evidence) and passes
      when regenerated.
- [ ] `pnpm contracts:lint` validates the emitted OpenAPI against the rules in BE-01.
- [ ] `pnpm contracts:breaking` compares against the last released `CONTRACT_VERSION` and exits 0
      on a non-breaking change (red evidence for a breaking one).
- [ ] `docs/04-contracts/CONTRACT_VERSION` is read by the build and stamped into the artefacts.
- [ ] `pnpm gate` green (the `contracts:*` steps now run the real package).

## Files expected to change

- `packages/contracts/**` (package.json, src/, scripts/)
- `docs/04-contracts/CONTRACT_VERSION` (only if the build needs it machine-readable)

## Out of scope

- Authoring the real endpoint schemas (M2, `TMU-CTR-001..005`).
- ML OpenAPI export (`services/ml`, TMU-OPS-006 / M5).
- Schemathesis fuzzing (TMU-OPS-008).
- Root `package.json`/`scripts/**` edits: the dispatcher already routes this step; if a change is
  needed, file a follow-up `ops` task.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | root-script dependency removed (dispatcher exists from TMU-OPS-011) |
| 2026-09-30 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-004`, branch `agent/contracts/TMU-OPS-004-contracts-package-skeleton` @ `b9d6ba6` (= `origin/main`); `pnpm i --frozen-lockfile` OK; baseline `pnpm gate` green (36/36 tests) |
| 2026-09-30 | orchestrator | 1 PICK | `node scripts/next-task.mjs` → `TMU-OPS-004`; status → `IN_PROGRESS` |
| 2026-09-30 | orchestrator | 2 READ | BE-01/02/03/04, Blueprint §5C, FE-01, step.mjs, lanes read. Files to touch all in `contracts` lane (`packages/contracts/**`, `docs/04-contracts/**`) + `pnpm-lock.yaml` (`_common`). Deviation noted: BE-02 names Spectral/oasdiff; both are unavailable offline (oasdiff is a Go binary), so lint/breaking are implemented as deterministic TS checks over the same BE-01/oasdiff rule semantics and BE-02's command table is updated in the same PR |
| 2026-09-30 | orchestrator | 3 PLAN | plan + frozen RED interface below |
| 2026-09-30 | qa-engineer | 4 RED | 5 test files created (`packages/contracts/src/{registry,generate,contract-lint,breaking,check}.test.ts`); `pnpm test:unit` exit 1: `5 failed | 2 passed (7)` test files, `Cannot find module './errors.ts'` / `'./generate.ts'` / `'./lint.ts'` / `'./breaking.ts'` / `'./check.ts'`; 36 pre-existing tests still pass. Failing for the right reason (implementation absent) |
| 2026-10-01 | architect | 5 GREEN | `packages/contracts` implemented (package.json, tsconfig, src/{enums,errors,common,registry,examples,testing,generate,lint,breaking,check}.ts, scripts/{build,check,lint,breaking}.ts, README); `pnpm test:unit` 91/91; `contracts:check`/`lint`/`breaking` real and green; generated artefacts committed; two builds byte-identical |
| 2026-10-01 | orchestrator | 6 REFACTOR | BE-02 status + command table updated to real behaviour (Spectral/oasdiff deviation documented), CHANGELOG `[Unreleased]`, package README added, unused `openapi-typescript` dep dropped; `pnpm gate` green |

### Plan (orchestrator, 2026-09-30)

1. Scaffold `packages/contracts`: package.json (deps zod, zod-to-json-schema, yaml, openapi-fetch, openapi-typescript, msw, vitest), tsconfig, README.
2. Author `src/`: `common.ts` (envelope, page, ids), `enums.ts`, `registry.ts` (minimal 3 endpoints: API-SYS-01/02, API-META-01), `errors.ts`, `examples.ts`, `testing.ts` (`expectMatchesContract`).
3. Write `scripts/generate.ts` (pure, deterministic) emitting all four artefacts; `build` writes, `check` diffs, `lint` validates OpenAPI vs BE-01, `breaking` diffs against `origin/main`.
4. RED (qa-engineer): tests for determinism, drift detection, lint rules, breaking classifier, contract helpers, BE-01 conventions.
5. GREEN (architect): minimal implementation to pass; then red evidence runs (hand-edit → check fails; remove endpoint → breaking fails) and restore.
6. `pnpm gate`; commit/push/PR via @git-steward; review via @reviewer.

**Frozen interface for RED** (from BE-02-openapi.md + Blueprint 5C):

- `packages/contracts/src/registry.ts` exports `registry: readonly RouteDef[]` and `registryById: ReadonlyMap<string, RouteDef>`; `RouteDef = { id, method: "get"|"post"|"put"|"patch"|"delete", path, auth: "public"|"user"|"owner"|"moderator"|"admin", request: z.ZodTypeAny|null, response: z.ZodTypeAny, errors: ErrorCode[], rateLimit?: string, deprecated?: boolean }`. Minimal set: `API-SYS-01` (`GET /healthz`), `API-SYS-02` (`GET /readyz`), `API-META-01` (`GET /api/v1/meta/categories`), `API-META-03` (`GET /api/v1/meta/locations`, errors `[VALIDATION_FAILED]`). Paths are emitted as full paths; `/healthz`/`/readyz` are the only paths outside `/api/v1` (BE-03).
- `packages/contracts/src/common.ts`: `Uuid`, `IsoDateTime`, `ErrorEnvelope`, `PageMeta`, `paged()`, `HealthResponse`, `ReadyResponse`, `CategoryMeta` (+ `Category` in `enums.ts`).
- `packages/contracts/src/enums.ts`: `ReportType`, `ReportStatus`, `Category`, `Campus`, `Custody`, `MatchBand` (verbatim from Blueprint §5A.4).
- `packages/contracts/src/errors.ts`: `ERROR_CODES` (18 BE-04 codes) + `ERROR_STATUS: Record<ErrorCode, number>`; `type ErrorCode`.
- `packages/contracts/src/examples.ts`: `examples: Record<ApiId, unknown>` — one valid example per registry id.
- `packages/contracts/src/testing.ts`: `expectMatchesContract(apiId, payload, schema)`.
- `packages/contracts/src/generate.ts`: `type GeneratedFile = { path: string; content: string }`; `generateAll(version: string): GeneratedFile[]` returns exactly 4 files, deterministic (two calls deep-equal), version-stamped, no timestamps: `docs/04-contracts/backend/BE-02-openapi.yaml` (openapi 3.1.0, full paths, `operationId` = API id, `X-Request-Id` on every response, error responses `$ref` `ErrorEnvelope`, `cookieAuth` scheme), `packages/contracts/generated/types.ts` (openapi-typescript), `packages/contracts/generated/client.ts` (openapi-fetch factory), `packages/contracts/generated/msw-handlers.ts` (one msw handler per endpoint, response from `examples.ts`).
- `packages/contracts/src/lint.ts`: `lintOpenApi(doc, registry?): Finding[]` (`{ rule, path, message }`), rule ids frozen: `base-path` (`/api/v1/*` or `/healthz`/`/readyz`), `operation-id` (= API id + unique), `camel-case-fields`, `enum-values` (SCREAMING_SNAKE), `request-id-header` (`X-Request-Id` on every response), `error-envelope` (error responses `$ref` `ErrorEnvelope` + known code), `page-meta`, `security-scheme` (non-public ⇒ `cookieAuth`), `contract-version` (semver + matches CONTRACT_VERSION).
- `packages/contracts/src/breaking.ts`: `classifyBreaking(baselineDoc, currentDoc, { baselineVersion, currentVersion }): Finding[]`; rule ids frozen: `breaking/removed-path`, `breaking/removed-response-property`, `breaking/added-required-request-property`, `breaking/removed-enum-value`, `breaking/version-bump` (breaking without a major bump). Additive optional changes ⇒ no findings.
- `packages/contracts/src/check.ts`: `diffGenerated(expected: GeneratedFile[], read: (path) => string | null): Drift[]` — byte comparison, reports `{ path, reason }`.
- Package scripts: `build|check|lint|breaking` (node scripts/*.ts) + `test` (vitest run). `check`/`lint`/`breaking` exit non-zero with a readable report. `scripts/breaking.ts` takes the baseline from `origin/main` (`git show`), overridable with `CONTRACTS_BASELINE_DIR` (dir holding `BE-02-openapi.yaml` + `CONTRACT_VERSION`) for tests/red evidence.
- Tests (qa, all under `packages/contracts/src/*.test.ts`): `registry.test.ts`, `generate.test.ts`, `contract-lint.test.ts`, `breaking.test.ts`, `check.test.ts`.

## Evidence

### Red — tests before implementation (step 4)

```
$ pnpm test:unit        (before packages/contracts/src/*.ts implementation existed)
 Test Files  5 failed | 2 passed (7)
      Tests  36 passed (36)
  Error: Cannot find module './errors.ts' imported from .../registry.test.ts
  Error: Cannot find module './generate.ts' imported from .../generate.test.ts
  Error: Cannot find module './lint.ts' imported from .../contract-lint.test.ts
  Error: Cannot find module './breaking.ts' imported from .../breaking.test.ts
  Error: Cannot find module './check.ts' imported from .../check.test.ts
```

### Red — acceptance criteria (step 4/6, deliberate failures, restored)

Hand-edit a generated file → `contracts:check` fails (exit 1):

```
$ Add-Content packages/contracts/generated/client.ts "// hand-edit"
$ pnpm contracts:check
drift packages/contracts/generated/client.ts: out of sync (hand-edited or stale)
contracts:check failed: 1 file(s) out of sync. Run `pnpm contracts:build`.
 Exit status 1
$ pnpm contracts:build      # restored; check green again
```

Breaking change vs baseline → `contracts:breaking` fails (exit 1):

```
$ # baseline dir = committed BE-02-openapi.yaml + one extra path /api/v1/legacy-removed
$ $env:CONTRACTS_BASELINE_DIR = <baseline dir>; pnpm contracts:breaking
breaking/removed-path paths./api/v1/legacy-removed.get: GET /api/v1/legacy-removed was removed
breaking/version-bump info.version: breaking changes require a major bump: 1.0.0 -> 1.0.0
contracts:breaking failed: 2 breaking finding(s) vs 1.0.0
 Exit status 1
```

### Green — tests and checks (steps 5-6)

```
$ pnpm test:unit
 Test Files  7 passed (7)
      Tests  91 passed (91)          # 55 contracts + 36 pre-existing

$ pnpm contracts:build              # writes the four artefacts
$ pnpm contracts:check              # contracts:check OK (version 1.0.0)
$ pnpm contracts:lint               # contracts:lint OK
$ pnpm contracts:breaking           # no baseline released yet (origin/main has no BE-02-openapi.yaml)
```

Determinism: two consecutive `pnpm contracts:build` runs produce byte-identical files
(SHA-256 equal; no `x-generated-at`, no ISO timestamps).

### Gate (step 7)

```
$ pnpm gate
> lane check
> format             All matched files use Prettier code style!
> lint
> typecheck
> i18n keys          skipped (message files not created yet — M3)
> unit tests         91 passed (91)
> contracts in sync  contracts:check OK (version 1.0.0)
> openapi lint       contracts:lint OK
> migrations check   pending (TMU-OPS-005)

OK gate(quick) passed
```

### Deviations recorded

- `contracts:lint` implemented as deterministic TS rules (`src/lint.ts`) instead of Spectral, and
  `contracts:breaking` as a TS classifier (`src/breaking.ts`) instead of `oasdiff` — both binaries
  unavailable offline; BE-02-openapi.md documents this and keeps the command surface swappable.
- `generated/types.ts` is emitted by the package's deterministic emitter; the async
  `openapi-typescript` API cannot run inside the synchronous `generateAll` (recorded in BE-02).
- `pnpm gate:full`'s `gitleaks` step is unavailable in this environment (pre-existing, not this
  task; the quick gate is the task's DoD gate).

- Red: captured above (tests + both acceptance reds).
- Green: captured above.
- PR: (pending)
- Review: (pending)

## Blockers

(none)
