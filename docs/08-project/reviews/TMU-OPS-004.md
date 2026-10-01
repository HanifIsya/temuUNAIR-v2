---
id: REV-TMU-OPS-004
task: TMU-OPS-004
reviewer: reviewer
verdict: CHANGES
date: 2026-10-01
cycle: 1
---

# TMU-OPS-004 — Review cycle 1

Diff reviewed: `origin/main...1133ce9` (one commit `1133ce9`; 30 files, +2728/−20). Scope =
`packages/contracts/**`, `docs/04-contracts/**`, `docs/08-project/tasks/TMU-OPS-004.md`,
`pnpm-lock.yaml` — every path is `contracts`-lane or `_common` per `.agent/lanes.json`; no root
`package.json`/`scripts/**` edits (task's own constraint, `TMU-OPS-004.md:34,60`). Commit is
Conventional (`feat(contracts): …`) with `Task: TMU-OPS-004` + `Refs` + `Agent` trailers.

## Summary

The package itself is well built: deterministic generator, pure check/lint/breaking cores with
strong mutation-based tests (all 9 lint rules and all 5 breaking rules exercised; red-first
evidence recorded and corroborated by deliberate import-order comments in
`contract-lint.test.ts:6-8` and `breaking.test.ts:7-9`), no weakened or skipped tests, gate green
(91/91). The deviations (Spectral/oasdiff/openapi-typescript unavailable offline) are documented
in BE-02 and the task file rather than smuggled.

However, the central deliverable — the committed `BE-02-openapi.yaml` — is **structurally invalid
against the spec version it declares**: it says `openapi: 3.1.0` but omits the `description`
field that OAS 3.1 marks ***REQUIRED*** on every Response Object, and no check in the new
pipeline can catch that (nor the related 3.0-vs-3.1 `nullable` defect that the first paginated
endpoint will hit). For a repository whose governance is "the contract is law", shipping an
invalid contract document is a BLOCKER. Verdict **CHANGES**: 1 BLOCKER, 1 MAJOR, 8 MINOR.

## BLOCKER

- [ ] **The generated contract document is invalid OpenAPI 3.1 — Response Objects omit the
      REQUIRED `description`.** `docs/04-contracts/backend/BE-02-openapi.yaml:3` declares
      `openapi: 3.1.0` (`packages/contracts/src/generate.ts:131`), yet none of the five Response
      Objects (`BE-02-openapi.yaml:13`, `:27`, `:42`, `:57`, `:66`) carries a `description`; the
      generator builds them from `headers`/`content`/`x-error-codes` only
      (`generate.ts:91-98` for 200s, `generate.ts:107-111` for errors). OpenAPI 3.1.1 §4.8.17.1
      (spec.openapis.org/oas/v3.1.1.html#response-object) states: "`description | string |
      ***REQUIRED***. A description of the response." — verified against the published spec text
      during this review. Nothing catches it: the nine frozen lint rules
      (`TMU-OPS-004.md:95`, `src/lint.ts`) contain no response-shape/meta-schema rule, and
      `contracts:check` only diffs bytes — so `pnpm gate` is green on an invalid contract.
      The repo's own hand-written `services/ml` document does this correctly
      (`docs/04-contracts/backend/ml-openapi.json:175,182,189,205,222,239`), so the new generator
      regresses the standard the rest of the repo follows. Every downstream consumer (Swagger
      UI/Redoc, the planned Schemathesis runs, the eventual oasdiff/Spectral swap, a re-enabled
      `openapi-typescript`) will reject or flag the single source of truth. Fix direction (red
      test first): emit `description` for both response branches in `generate.ts`, regenerate the
      four artefacts, and add a lint rule asserting REQUIRED response fields so this class of
      defect cannot pass the gate again.

## MAJOR

- [ ] **Nullable and union schemas are emitted incorrectly by the pinned converter — silent
      contract + type unsoundness at first use.** `generate.ts:34` pins
      `zod-to-json-schema` `target: "openApi3"` (a 3.0-flavoured target — the code comment at
      `generate.ts:30-31` acknowledges it) while emitting `openapi: 3.1.0`. Verified from the
      installed library source (`.pnpm/zod-to-json-schema@3.25.2…/dist/esm/parsers/nullable.js:6-10`):
      under `openApi3`, `.nullable()` produces `{ type: …, nullable: true }`, and unions produce
      `anyOf` (`parsers/union.js:10-11,68-80`). Consequences in *this* pipeline:
      (a) in an OAS 3.1 document `nullable` is not a JSON Schema 2020-12 keyword, so a nullable
      value (e.g. `PageMeta.nextCursor: z.string().nullable()`, `common.ts:19`) would silently
      *fail* validation instead of being allowed; (b) `tsTypeOf` (`generate.ts:178-204`) has no
      `nullable`/`anyOf` branch, so `nextCursor` is typed `string` — dropping `| null` — and any
      union degrades to `unknown` via the fall-through at `generate.ts:203`; (c) the test suite's
      own fixtures already model nulls the correct 3.1 way (`type: ["string","null"]`,
      `contract-lint.test.ts:258,266`), i.e. the tests assume semantics the generator will not
      produce. No test or lint rule covers this. Nothing manifests today only because the frozen
      M0 registry (`registry.ts:24-61`) happens to use no nullable/union response — but the
      frozen interface already ships `paged()`/`PageMeta` (`common.ts:18-24`) and the first
      paginated M2 endpoint will trigger it, producing an invalid document *and* unsound
      generated types that pass the whole gate. Fix while the pipeline is young: emit 3.1-style
      type-arrays (`tsTypeOf` already handles them at `generate.ts:185-187`) or post-process,
      teach `tsTypeOf` `nullable`/`anyOf`, add a lint rule rejecting `nullable` in the 3.1
      document — red test first.

## MINOR

- [ ] **`CONTRACTS_BASELINE_DIR` fails open.** If the override dir is set but lacks either
      `BE-02-openapi.yaml` or `CONTRACT_VERSION`, `scripts/breaking.ts:24-27,52-61` returns
      `null`, prints `no baseline released yet` and exits 0 — and the `if/else` means it also
      suppresses the `origin/main` fallback. A typo'd env var in CI silently disables the
      never-break gate. Suggest erroring (or at least warning loudly) when the override is set
      but unreadable instead of downgrading to "no baseline".
- [ ] **Coverage limits of `contracts:breaking`/`contracts:lint` are under-documented relative
      to BE-02's wording.** BE-02-openapi.md:46 calls the TS checks "equivalent" to oasdiff, but
      `breaking.ts:187-245` implements only the five frozen rules: response property *type*
      changes, required→optional response changes, auth/status-code changes and removed
      *request-side* enum values all pass silently (request schemas are only walked for
      `required` — `breaking.ts:78-96,148-152`). On the lint side, `x-error-codes` is validated
      only *when present* (`lint.ts:147-158`) although BE-02-openapi.md:55-56 promises "every
      error response … lists the exact codes", and lint never cross-checks registry `errors`
      against emitted response statuses (`lint.ts:125-160`). Document the limits in BE-02 (or
      narrow "equivalent") so nobody trusts green as "full oasdiff parity".
- [ ] **`scripts/lint.ts` can crash with a raw stack.** `parse(readFileSync(…))` at
      `scripts/lint.ts:12` is uncaught, so a malformed YAML hand-edit produces a Node stack
      trace rather than a readable finding — contradicting the promise at `src/lint.ts:2-4`
      ("never throws … fails readably instead of crashing"). `contracts:check` normally runs
      first and fails closed (`scripts/check.ts:13-19`), so this is a standalone-invocation
      polish item; wrap the parse and emit `contracts:lint failed: …`.
- [ ] **BE-02's "Generation contract" table overstates what the generator reads.**
      BE-02-openapi.md:29 lists `request` and `rateLimit` as inputs, but `generate.ts:116-120`
      emits neither a `requestBody` (every `route.request` is silently ignored) nor any
      rate-limit extension; BE-02-openapi.md:31 claims "enums.ts → shared enums as components",
      but `$refStrategy: "none"` (`generate.ts:35`) inlines everything and only ErrorEnvelope +
      per-route response components ever reach `components.schemas` (`generate.ts:124-127`);
      BE-02-openapi.md:57's "Pagination responses reference the shared `PageMeta` schema" is
      likewise unimplementable today (no `PageMeta` component is emitted). The table became live
      in this PR — align it with the code (or implement the inputs when they first matter).
- [ ] **Frozen-interface deviations in exports/tests.** (a) `registryById` is a mutable
      `new Map(…)` (`registry.ts:63`) while the frozen interface says
      `ReadonlyMap<string, RouteDef>` (`TMU-OPS-004.md:88`) — consumers can mutate the index of
      the single source of truth; type it `ReadonlyMap`. (b) The MSW test only counts
      `http.get(` occurrences and never asserts handler bodies come from `examples.ts`
      (`generate.test.ts:167-172`) although the frozen interface requires "response from
      examples.ts" (`TMU-OPS-004.md:94`) — and the counter goes **red at the first non-GET
      route** (5 routes with 2 POSTs ⇒ 3 `< 5`). (c) The test name "types.ts is an
      openapi-typescript module" (`generate.test.ts:157`) is stale after the documented emitter
      deviation (BE-02-openapi.md:47-49).
- [ ] **CHANGELOG entry still says "(PR pending)".** `docs/04-contracts/CHANGELOG.md:11` —
      governance at `CHANGELOG.md:4` says "Every entry links the PR", and PR #11 exists; paste
      the link before merge. (Task-file bookkeeping to fold into finalization: front-matter
      `updated: 2026-09-30` at `TMU-OPS-004.md:13` vs 2026-10-01 progress rows at `:74-75`, and
      the six acceptance checkboxes at `:40-48` are unticked despite the recorded evidence.)
- [ ] **The Spectral/oasdiff/openapi-typescript deviation has no owner.** BE-02-openapi.md:49-50
      says "A later toolchain task (e.g. TMU-OPS-008) may swap in Spectral, oasdiff or
      openapi-typescript", but TMU-OPS-008's scope (`backlog.md:15`, "Full gate wiring, CI parity
      and toolchain prerequisites") never mentions them and no backlog row tracks this
      deviation. "e.g." is not a link — file the follow-up (or amend TMU-OPS-008's refs) so the
      deviation cannot be lost at M0 exit.
- [ ] **Session cookie name is hard-coded in two emitter branches.** `__Secure-temuunair.session`
      appears at `generate.ts:136` (OpenAPI `securitySchemes`) and again at `generate.ts:229`
      (types.ts emitter), with no lint rule tying it to BE-09's cookie contract. Extract one
      constant and/or assert it in `security-scheme`/`contract-version`-style lint so a BE-09
      cookie rename cannot drift half the artefacts.

## Checks run

- `git diff origin/main...HEAD --stat` → 30 files, +2728/−20; all in `contracts` lane or
  `_common`; generated files (`BE-02-openapi.yaml`, `generated/*`) produced by the committed
  generator, not hand-edited (regeneration verified via gate below).
- `git log origin/main..HEAD` → single commit `1133ce9`, Conventional + `Task: TMU-OPS-004`
  trailer ✓ (`docs/05-workflow/07-commit-and-pr-conventions.md`).
- `pnpm gate` (fresh run this session, HEAD `1133ce9`, worktree clean) → **OK gate(quick)
  passed**: lane check clean, format/lint/typecheck green, i18n skipped (M3), unit **91/91**
  (55 new contracts tests + 36 pre-existing), then:

  ```
  > contracts in sync
  contracts:check OK (version 1.0.0)

  > openapi lint
  contracts:lint OK

  OK gate(quick) passed
  ```

- `pnpm gate:full` (earlier this session) → runs the real `contracts:breaking` step
  (`no baseline released yet`, exit 0 — correct: `origin/main` has no `BE-02-openapi.yaml`), then
  stops at the missing `gitleaks` binary — pre-existing environment limitation, already recorded
  as a deviation in `TMU-OPS-004.md:180-181`, not in this lane.
- Pre-existing flake observed (not this task): `scripts/checks/config-presets.test.mjs:91`
  ("errors on `any` and `console`…") has a 5s timeout but runs 1.9–6.2s — failed twice across
  two `gate:full` runs, passed the third at 2895ms. Recommend a small ops follow-up to raise the
  timeout; not counted as a finding against this PR (out of lane).
- Red evidence **not re-executed** in this sandbox (permission model denies `pnpm contracts:*`,
  `gh`, env-var prefixes, and any write outside `docs/08-project/reviews/**`). Instead verified
  that the recorded outputs in `TMU-OPS-004.md:116-151` byte-match the implementation strings:
  `drift … out of sync (hand-edited or stale)` + `contracts:check failed: 1 file(s) out of sync`
  (`src/check.ts:20`, `scripts/check.ts:23,28`), `breaking/removed-path … was removed` and
  `breaking/version-bump … major bump: 1.0.0 -> 1.0.0` (`src/breaking.ts:180,270`,
  `scripts/breaking.ts:69,74`), `no baseline released yet` (`scripts/breaking.ts:59`). Green side
  of AC2/AC3 re-verified live through `pnpm gate`. The red-first claim is corroborated by the
  deliberate import-order comments (`contract-lint.test.ts:6-8`, `breaking.test.ts:7-9`) and the
  module-resolution failures recorded at `TMU-OPS-004.md:105-114`.
- Spec/law verification: OAS 3.1.1 Response Object requirements fetched from
  spec.openapis.org (§4.8.17.1 — `description` ***REQUIRED***); `zod-to-json-schema@3.25.2`
  nullable/union behaviour read from the installed package source (cited in BLOCKER/MAJOR).
- Tests: 5 new files, 55 tests; no `.only`/`.skip` anywhere in `packages/contracts`; no
  pre-existing test modified or weakened (the diff touches no existing test file); all nine
  frozen lint rules and all five frozen breaking rules are exercised by mutations
  (`contract-lint.test.ts:284-307`, `breaking.test.ts:129-197`); determinism, drift, version
  stamping, error-catalog equality (18 BE-04 codes) and Blueprint §5A.4 enum values all asserted.
- Privacy: `examples.ts` is synthetic (no real people/UNAIR data, `examples.ts:1-23`); no
  emails, embeddings, hint answers or raw sensitive-image URLs anywhere in the diff; test
  fixtures synthetic with explicit comments. i18n/a11y: N/A (no UI in this task).
- PR metadata (label `contract`, two-reviewer requirement of CONTRACTS-README governance §4)
  **not verifiable** from this sandbox (`gh` denied) — see notes.

## Notes for the human

- On PR #11: confirm it carries the `contract` label and the two human approvals (backend +
  frontend lanes) required by `docs/04-contracts/README.md` §Governance 4 — I could not run
  `gh pr view` here.
- Governance rule 5 ("only `TMU-CTR-*` PRs touch `packages/contracts/**` and
  `docs/04-contracts/**`") is technically breached by this orchestrator-authored `TMU-OPS-*`
  bootstrap; it is clearly sanctioned (task file, deviation recorded in BE-02), but if the rule
  is enforced mechanically this needs a DEC line or an explicit carve-out for M0 scaffolding.
- The blocker is a small, mechanical fix (emit `description`, regenerate, add a red test + lint
  rule) — it fits comfortably in cycle 2, leaving one review cycle in reserve
  (max 2 before `needs-human`, `05-definition-of-ready-done.md`).
- MINOR findings are all addressable in the same cycle or filed as follow-ups; per the workflow
  none may be silently dropped (especially the orphaned Spectral/oasdiff deviation and the
  flaky `config-presets` timeout).
- I ran the gate and read every hunk of the diff; I modified no file except this review.
