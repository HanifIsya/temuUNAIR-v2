---
id: REV-TMU-OPS-004
task: TMU-OPS-004
reviewer: reviewer
verdict: APPROVE
date: 2026-10-01
cycle: 2
---

# TMU-OPS-004 — Review cycle 2 (final allowed cycle)

Diff reviewed: `1133ce9..8d187d1` (one fix commit `8d187d1`; 10 files, +523/−55: `packages/contracts/**`,
`docs/04-contracts/**`, `docs/08-project/{tasks,reviews}/TMU-OPS-004.md`). All paths are
`contracts`-lane or `_common`; lane check green in the gate. Commit is Conventional
(`fix(contracts): …`) with `Task: TMU-OPS-004` + `Refs: BE-02, REV-TMU-OPS-004` trailers.
PR #11: ready for review, CI green (given; `gh` is sandbox-denied — labels not re-verified here).

## Summary

Every cycle-1 finding is either **RESOLVED** (BLOCKER, MAJOR, MINOR 3/5/6/8) or **DEFERRED and
honestly filed** in the task file's "Deferred MINORs" section (MINOR 1/2/4/7, plus the
out-of-lane flake). The BLOCKER fix is complete and now regression-proof: all five Response
Objects carry a non-empty `description` and the new `response-description` lint rule fails any
document that lacks one (mutation-tested). The MAJOR fix rewrites every converter output node
to OAS 3.1 form (`nullable` → `type: […, "null"]`, unions stay `anyOf`), `tsTypeOf` renders
`string | null` / `A | B`, and the `no-30-nullable` rule plus three generator tests pin the
behaviour on a synthetic nullable/union schema. I found no weakened tests (numstat: test files
+118/−7, and the 7 deletions are the stale MSW test and openapi-typescript test name replaced by
stricter assertions), no drift, no regressions. `pnpm gate` green **100/100**, `pnpm gate:full`
green through `contracts:breaking`, worktree clean. **Verdict APPROVE** — 0 BLOCKER, 0 MAJOR,
0 new MINOR; 4 cycle-1 MINORs carried as filed deferrals.

## Cycle-1 findings (cycle 1 = 1 BLOCKER, 1 MAJOR, 8 MINOR)

| # | Cycle-1 finding | Status | Evidence (cycle 2) |
|---|---|---|---|
| BLOCKER | Generated contract invalid OAS 3.1: Response Objects lacked REQUIRED `description` | **RESOLVED** | `BE-02-openapi.yaml:14,29,45,61,71` — all 5 responses have non-empty `description` (`Success` / `Error: VALIDATION_FAILED`); emitted at `src/generate.ts:133` (200) and `:150` (+ join-update at `:146` for shared statuses); new lint rule `response-description` (`src/lint.ts:131-141`); tests: mutation `"a response without a description"` (`contract-lint.test.ts:326`), hand-built-doc test (`:347`), generated-doc non-empty assertion (`:356`); BE-02 convention 6 added (`BE-02-openapi.md:61-63`). |
| MAJOR | `target: "openApi3"` emitted 3.0 `nullable: true` + `tsTypeOf` dropped `| null`/unions | **RESOLVED** | Recursive `toOpenApi31` post-process (`src/generate.ts:40-68`, applied at `:70`) strips `nullable` into `type: […, "null"]` (or an `anyOf` null branch); `tsTypeOf` renders type arrays with shape retention, `anyOf`/`oneOf` as `A \| B`, suffix ` \| null` (`generate.ts:221-277`); lint rule `no-30-nullable` (`src/lint.ts:244-252`); tests: synthetic probe (`generate.test.ts:200-227`: `nextCursor: {type:["string","null"]}`, `candidate: {anyOf:[…]}`, `kind: {type:["string","null"],enum:[…]}`; `string \| null`, `string \| number`, `"FOUND" \| "LOST" \| null`), mutation (`contract-lint.test.ts:331`), `expect(...).not.toContain("nullable")` on the generated doc (`contract-lint.test.ts:370`, `generate.test.ts:224`). Grep confirms zero `nullable` in `BE-02-openapi.yaml` and `generated/**`. |
| MINOR 1 | `CONTRACTS_BASELINE_DIR` fails open / suppresses git fallback | **DEFERRED (filed)** | `tasks/TMU-OPS-004.md` "Deferred MINORs" §MINOR 1. Not a blocker: the override is unset by default (git fallback path, exercised green in `gate:full`) and exists only for tests/red evidence. |
| MINOR 2 | breaking/lint coverage narrower than BE-02's "equivalent" wording; `x-error-codes` checked only when present | **DEFERRED (filed)** | Task file §MINOR 2. Not a blocker/major: the five breaking rules are the task's *frozen* interface (`TMU-OPS-004.md:96`); under-detection is a documented-scope limitation, and with no released baseline the gate is unaffected at M0. Follow-up should narrow the BE-02 wording. |
| MINOR 3 | `scripts/lint.ts` raw stack on malformed YAML | **RESOLVED** | `load()` wraps read + parse (`scripts/lint.ts:19-38`) → `contracts:lint failed: cannot read/invalid YAML …` + exit 1; comment cites REV MINOR 3. |
| MINOR 4 | BE-02 generation table overstates `request`/`rateLimit`/shared-enum/PageMeta inputs | **DEFERRED (filed)** | Task file §MINOR 4. Doc-accuracy only; no runtime impact (`request` is `null` everywhere, no paged route). |
| MINOR 5 | MSW test counted only `http.get`, never asserted bodies; stale openapi-typescript test name | **RESOLVED** | Method-aware count `handlerLines === registry.length` + exact handler line incl. example (`generate.test.ts:169-181`); dedicated body-equals-examples test per route (`:184-189`); test renamed "types.ts carries the @generated banner and API ids (deterministic emitter)" (`:159`). Also kills the latent first-non-GET red I flagged. |
| MINOR 6 | CHANGELOG "(PR pending)"; task `updated` field / unticked ACs | **RESOLVED** | `CHANGELOG.md:11` now links `#11`; task front-matter `updated: 2026-10-01`, all six ACs ticked, progress rows 7-9 added. |
| MINOR 7 | Spectral/oasdiff/openapi-typescript deviation has no owning task | **DEFERRED (filed)** | Task file §MINOR 7 (explicitly notes TMU-OPS-008's scope does not cover toolchain swaps). Process gap, now tracked where it cannot be lost; must become a real backlog row before M0 exit. |
| MINOR 8 | Session cookie name hard-coded in two emitters | **RESOLVED** | Single exported `SESSION_COOKIE_NAME` (`src/generate.ts:25`), used by the security scheme (`:179`) and the types.ts emitter (`:303`). |

No deferred item is a BLOCKER/MAJOR in disguise: MINOR 1 affects only a test hook's failure
mode (default path verified green), MINOR 2 is a wording/coverage gap over a *frozen* rule set
with no released baseline yet, MINOR 4 is documentation drift with no emitted artefact impact,
MINOR 7 is task bookkeeping — now written down in the task file itself.

## Specific verifications requested (cycle 2)

1. **BLOCKER** — every Response Object has a non-empty `description`: grep of
   `BE-02-openapi.yaml` finds exactly 5 `description:` lines matching the 5 responses
   (`:14,29,45,61,71`), zero `nullable`; `response-description` exists (`lint.ts:131-141`) and
   is tested mutation-style (`contract-lint.test.ts:324-333` + hand-built doc `:347-354`) —
   the hand-built doc without description produces the finding, and the whole suite is green.
2. **MAJOR** — no `nullable` anywhere in generated output (grep over `BE-02-openapi.yaml` and
   `packages/contracts/generated/**`: zero hits); nullable → `type: [..., "null"]` and unions →
   `anyOf` verified by `generate.test.ts:200-227` against the exported `toJsonSchema`/`tsTypeOf`
   (`string | null`, `string | number`, `"FOUND" | "LOST" | null`), and `no-30-nullable`
   exists (`lint.ts:244-252`) with a mutation test (`contract-lint.test.ts:331`).
3. **MINOR 3 / 5 / 8** — all fixed, with line evidence in the table above.
4. **No weakened tests / determinism** — `git diff --numstat 1133ce9..8d187d1`:
   `contract-lint.test.ts` +54/−0, `generate.test.ts` +64/−7 (the 7 deletions are the old
   http.get-counting test, the stale test name and import lines — all replaced by stricter
   assertions); no `.only`/`.skip` in the package; the original nine lint-rule mutations and
   five breaking-rule tests are untouched. Determinism: `pnpm contracts:build` /
   `contracts:lint` / `contracts:breaking` direct invocation is sandbox-denied in this session
   (same permission model as cycle 1), so I ran their gate equivalents — `pnpm gate` executes
   `contracts:check` (regenerates in memory and byte-diffs against disk: **OK (version 1.0.0)**)
   and `contracts:lint` (**OK**); `pnpm gate:full` additionally executed `contracts:breaking`
   (**no baseline released yet**, exit 0 — correct, `origin/main` has no BE-02 baseline).
   Build-twice-clean follows airtight from: build.ts writes exactly `generateAll(version)`
   bytes, `contracts:check OK` proves disk == fresh `generateAll`, the determinism test
   (`generate.test.ts:78`, two calls serialise identically) proves `generateAll` is pure, and
   `git status --porcelain` in `E:\wt\TMU-OPS-004` is **clean** after all runs.
5. **Deferred MINORs** — present as a dedicated "### Deferred MINORs (review cycle 1, filed for
   follow-up)" section in `tasks/TMU-OPS-004.md` listing 1, 2, 4, 7 (+6 done, + the flake);
   none is secretly a BLOCKER/MAJOR — assessed above.
6. **Re-checks / new-issue scan** — `toOpenApi31` is a pure, order-preserving rewrite applied
   at the single `zodToJsonSchema` call site (determinism preserved); description emission
   cannot clobber the 200 response (all `ERROR_STATUS` values are 4xx/5xx, asserted in
   `registry.test.ts:109-118`); the `FROZEN_RULES` allowlist gained the two review-mandated
   rule ids with an explanatory comment (`contract-lint.test.ts:26-33`) and BE-02's rule-id
   list was updated to match (`BE-02-openapi.md:39`) — an additive, documented extension of
   the frozen nine, not a weakening. Generated `types.ts`/`client.ts`/`msw-handlers.ts` are
   byte-identical to cycle 1 (not in the diff) — expected, since no current schema is
   nullable/union. One theoretical observation, not a finding: `response-description` (like the
   pre-existing `request-id-header`/`error-envelope` rules) assumes inline response objects and
   would false-positive on a `$ref` response — the contract has no `components.responses` and
   none planned, so this stays an observation.

## Checks run (cycle 2 session)

- `pnpm gate` → **OK gate(quick) passed**: lane check, format, lint, typecheck green; i18n
  skipped (M3); unit **100/100** (55→64 contracts tests: contract-lint 13→18, generate 13→17);
  `contracts:check OK (version 1.0.0)`; `contracts:lint OK`.
- `pnpm gate:full` → same green through `breaking changes → no baseline released yet` (exit 0),
  build/integration/contract-fuzz/e2e pending-steps exit 0, then fails only at
  `secret scan: gitleaks: command not found` — pre-existing environment limitation (recorded in
  the task file; CI's secret-scan job is green per the PR). Not this lane, not this PR.
- `git status --porcelain` (worktree `E:\wt\TMU-OPS-004`) → clean before and after all runs,
  HEAD `8d187d1`.
- `git diff 1133ce9..8d187d1` (stat, numstat, full hunks for `generate.ts`, `lint.ts`,
  `scripts/lint.ts`, both test files, docs) — read in full.
- `git log -1 8d187d1` — Conventional + trailers ✓.
- Grep sweeps: `description`/`nullable` in `BE-02-openapi.yaml` (5 descriptions, 0 nullable);
  `nullable` in `generated/**` (0); `.only`/`.skip` in `packages/contracts` (0).
- Direct `pnpm contracts:build|lint|breaking`: **denied by sandbox permission model** (only
  `pnpm gate*`/`pnpm test*` allowed) — gate equivalents run instead, reasoning above. PR labels
  via `gh`: likewise denied; relying on the provided context (PR #11 ready, CI green).

## Notes for the human

- This is the final allowed cycle (max 2): verdict **APPROVE**, so the task proceeds to step 12
  MERGE GATE (orchestrator, DEC-019) — no further reviewer rounds available if something were
  to regress post-approve.
- The four deferred MINORs (1, 2, 4, 7) and the `config-presets.test.mjs:91` timeout flake are
  listed in the task file but are **not yet backlog rows** — per the workflow, filed ≠ done:
  the orchestrator/docs-keeper should convert them into follow-up tasks (or attach them to a
  real toolchain task for MINOR 7) before M0 exit so they cannot vanish with this PR.
- The task file's `Review:` row still says "cycle 2 pending" — the author's finalization step
  should flip it to the APPROVE verdict and tick DoD #10 against this file; PR #11 should move
  out of draft.
- As in cycle 1, this file was written to the session workspace path
  `docs/08-project/reviews/TMU-OPS-004.md` (the only writable location for the reviewer
  sandbox); copy/commit it into `E:\wt\TMU-OPS-004` so it lands on the branch with the merge.
- I ran the gate and gate:full myself, read every hunk of both commits, and modified no file
  except this review.
