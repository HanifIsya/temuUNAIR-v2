---
id: TMU-OPS-002
title: Shared config presets in packages/config
status: REVIEW
lane: ops
slug: shared-config-presets
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-001]
refs: [ARCH-STACK, WF-STANDARDS]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-002 — Shared config presets in `packages/config`

## Goal

Give every workspace package one place to import its TypeScript, ESLint, Prettier and Vitest
settings from, so `lint`/`typecheck`/`test:unit` are real (not placeholders) and the coding
standards in `docs/05-workflow/13-coding-standards.md` are enforced by tooling.

## Context

- `docs/03-architecture/02-tech-stack-and-versions.md` pins ESLint (flat) + Prettier, TS 5.x
  `strict: true`, Vitest + Testing Library + jest-axe.
- `docs/05-workflow/13-coding-standards.md` forbids `any`, `@ts-ignore`, `console.log`, raw
  `fetch("/api/v1/…")` and raw hex/px — the presets are where those become lint rules.
- Blueprint §3 lists `packages/config/` as "tsconfig, eslint, prettier presets".
- `packages/config/**` is ops-lane (`.agent/lanes.json`), so this task runs on an `ops` branch;
  consuming packages extend the presets from their own lane in later tasks.

## Acceptance criteria

- [x] `packages/config/tsconfig.base.json` sets `strict`, `noUncheckedIndexedAccess`,
      `noImplicitOverride`; the root `tsconfig.base.json` re-exports it (no behaviour change).
- [x] `packages/config/eslint.config.mjs` exports a flat config erroring on
      `@typescript-eslint/no-explicit-any`, `@typescript-eslint/ban-ts-comment` and `no-console`
      in app code; the root `eslint.config.mjs` consumes it.
- [x] `packages/config/vitest.base.ts` exports the shared Vitest defaults; the root
      `vitest.config.ts` consumes it.
- [x] A deliberately bad fixture under `scripts/tooling/**` fails `pnpm lint` and `pnpm typecheck`
      (extend `tsconfig.json`'s `include` to cover the fixture first — `ops-dev` owns
      `tsconfig*.json`; red evidence), then is removed.
- [x] `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` still exit 0 on the clean tree.
- [x] No dependency is added outside `packages/config`'s own `package.json` (root devDependencies
      keep only what the root configs themselves import).
- [x] `pnpm gate` green.

## Files expected to change

- `packages/config/**` (package.json, tsconfig.base.json, eslint.config.mjs, prettier.json,
  vitest.base.ts)
- root `tsconfig.base.json`, `eslint.config.mjs`, `vitest.config.ts` (delegate to the presets)
- root `package.json`, `pnpm-lock.yaml` (workspace dependency on `@temuunair/config`)
- `scripts/tooling/**` (temporary bad fixture; removed before commit)

## Out of scope

- App/package-specific overrides (added by the owning package in later tasks).
- CI changes (TMU-OPS-008).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev` (created in TMU-OPS-011); criteria made satisfiable in-lane |
| 2026-09-30 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-002`, branch `agent/ops/TMU-OPS-002-shared-config-presets` from `origin/main` @ 5d1f9e1; `pnpm i --frozen-lockfile` OK; baseline `pnpm gate` green (26/26 tests) |
| 2026-09-30 | orchestrator | 1 PICK | `node scripts/next-task.mjs` → `TMU-OPS-002`; status → `IN_PROGRESS` |
| 2026-09-30 | orchestrator | 2 READ | contracts/configs read; noted: ESLint 9.39.5 has no `basePath` (v10-only) so preset `files` patterns resolve relative to the consuming root config; Prettier shares configs only via a package string reference; `qa-engineer` cannot edit `scripts/**` (`.test.mjs`/fixture are ops-lane) so red fixture + guard tests are written by `ops-dev` — deviation noted in Evidence |
| 2026-09-30 | orchestrator | 3 PLAN | plan below |
| 2026-09-30 | ops-dev | 4 RED | `tsconfig.json` include + `scripts/tooling/bad-fixture.ts`; `pnpm lint` 3 errors (no-explicit-any, ban-ts-comment, no-console), `pnpm typecheck` TS2322; `pnpm test:unit` 8 failed / 28 passed (packages/config absent); tails in Evidence |
| 2026-09-30 | ops-dev | 5 GREEN | presets + delegation implemented; `pnpm install` OK (lockfile updated); `pnpm test:unit` 36/36; fixture still fails lint+typecheck through the delegated presets; fixture removed; lint/typecheck/test:unit exit 0; `pnpm gate` → `OK gate(quick) passed` |
| 2026-09-30 | orchestrator | 6 REFACTOR | verified independently: `pnpm install --frozen-lockfile` OK; fixture re-created → lint exit 1 (same 3 errors) / typecheck exit 2 (TS2322), removed → both exit 0; preset blobs byte-identical to `HEAD` (`git hash-object`); `pnpm gate` re-run green (36/36); backlog/status regenerated; status → `REVIEW` |

### Plan

1. Extend root `tsconfig.json` `include` with `scripts/**/*.ts` (covers the fixture and future
   tooling TS).
2. Add `scripts/tooling/bad-fixture.ts`; capture red `pnpm lint` + `pnpm typecheck`; delete it.
3. Create `packages/config`: `package.json` (exports: tsconfig/eslint/prettier/vitest; deps
   `@eslint/js`, `globals`, `typescript-eslint`), `tsconfig.base.json` (strict trio),
   `eslint.config.mjs` (root config moved verbatim), `prettier.json`, `vitest.base.ts`.
4. Delegate the root configs: `tsconfig.base.json` extends the preset; `eslint.config.mjs`
   re-exports it; `vitest.config.ts` spreads `testDefaults`; `.prettierrc.json` string-references
   `@temuunair/config/prettier`.
5. Move preset-only devDeps root → `packages/config`; add `@temuunair/config` workspace dep to
   root; `pnpm install` to update the lockfile.
6. Add `scripts/checks/config-presets.test.mjs` guard tests (red first, then green).
7. `pnpm gate`; update task file evidence; commit + PR via git-steward; reviewer + CI; merge gate.

## Evidence

### Red — bad fixture, before delegation (step A)

```
$ pnpm lint
E:\wt\TMU-OPS-002\scripts\tooling\bad-fixture.ts
  1:35  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any
  2:3   error  Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment
  3:3   error  Unexpected console statement                                                                                         no-console

3 problems (3 errors, 0 warnings)
ELIFECYCLE Command failed with exit code 1.
```

```
$ pnpm typecheck
scripts/tooling/bad-fixture.ts(7,14): error TS2322: Type 'number' is not assignable to type 'string'.
ELIFECYCLE Command failed with exit code 2.
```

### Red — guard tests, packages/config absent (step B)

```
$ pnpm test:unit
scripts/checks/scaffold.test.mjs (26 tests) 132ms
scripts/checks/config-presets.test.mjs (10 tests | 8 failed) 2399ms
  x packages/config manifest > exists with the required name, visibility and module type
    -> expected false to be true
  x packages/config manifest > exports the four presets and every target file exists
    -> ENOENT: no such file or directory, open '...\packages\config\package.json'
  x packages/config manifest > declares the preset dependencies and keeps vitest for the type-only import
    -> ENOENT: no such file or directory, open '...\packages\config\package.json'
  x preset contents > enables the strict trio in the shared tsconfig
    -> ENOENT: ... packages\config\tsconfig.base.json
  x preset contents > keeps the Prettier options in the preset
    -> ENOENT: ... packages\config\prettier.json
  x root delegation > extends the shared tsconfig without duplicating options
    -> expected undefined to be '@temuunair/config/tsconfig.base.json'
  x root delegation > moves preset-only dependencies out of the root manifest
    -> expected undefined to be 'workspace:*'
  x root delegation > imports the ESLint, Vitest and Prettier presets from the workspace package
    -> expected '// ESLint flat config (TMU-OPS-001). …' to contain '@temuunair/config/eslint'

Test Files  1 failed | 1 passed (2)
     Tests  8 failed | 28 passed (36)
ELIFECYCLE Command failed with exit code 1.
```

### Green — guard tests, delegation in place (step C)

```
$ pnpm test:unit
scripts/checks/scaffold.test.mjs (26 tests) 82ms
scripts/checks/config-presets.test.mjs (10 tests) 1991ms
Test Files  2 passed (2)
     Tests  36 passed (36)
```

### Delegated presets still enforce — fixture present, after delegation (step C)

```
$ pnpm lint
E:\wt\TMU-OPS-002\scripts\tooling\bad-fixture.ts
  1:35  error  Unexpected any. Specify a different type                                                                             @typescript-eslint/no-explicit-any
  2:3   error  Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free  @typescript-eslint/ban-ts-comment
  3:3   error  Unexpected console statement                                                                                         no-console

3 problems (3 errors, 0 warnings)
ELIFECYCLE Command failed with exit code 1.

$ pnpm typecheck
scripts/tooling/bad-fixture.ts(7,14): error TS2322: Type 'number' is not assignable to type 'string'.
ELIFECYCLE Command failed with exit code 2.
```

### Clean tree after fixture removal

```
$ pnpm lint       -> exit 0
$ pnpm typecheck  -> exit 0
$ pnpm test:unit  -> Test Files 2 passed (2), Tests 36 passed (36)
```

### Gate (step C)

```
$ pnpm gate
> lane check
> format             All matched files use Prettier code style!
> lint
> typecheck
> i18n keys          skipped (message files not created yet — M3)
> unit tests         36 passed (36)
> contracts in sync  pending (TMU-OPS-004)
> openapi lint       pending (TMU-OPS-004)
> migrations check   pending (TMU-OPS-005)

OK gate(quick) passed
```

### Move fidelity (verbatim preset moves)

`git hash-object` of each preset equals the original committed blob:

- `packages/config/tsconfig.base.json` = `HEAD:tsconfig.base.json` → `5324e425a56855d85c41e1ecd9fb215af26cf59a`
- `packages/config/eslint.config.mjs` = `HEAD:eslint.config.mjs` → `d638015bb5ba369d65205f3b9bbf673fbfc34674`
- `packages/config/prettier.json` = `HEAD:.prettierrc.json` → `1770cecfe394fa59cf1e3a8db110cdfbec43086a`

### Deviation note (from orchestrator 2 READ)

`qa-engineer` cannot edit `scripts/**`, so the red fixture and the guard test
(`scripts/checks/config-presets.test.mjs`) were authored by `ops-dev`; both were written before
the implementation and captured red first.

- Red: captured above.
- Green: captured above.
- PR: (pending — orchestrator commits via git-steward)
- Review: (pending)

## Blockers

(none)