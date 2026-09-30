---
id: REV-TMU-OPS-002
task: TMU-OPS-002
reviewer: reviewer
verdict: APPROVE
date: 2026-09-30
---

# TMU-OPS-002 — Review

## Verdict

**APPROVE.** I re-ran the gate on the branch (`OK gate(quick) passed`, 36/36 unit tests) and
audited the move byte-for-byte: the three moved presets are identical to the blobs they replaced
(`git hash-object` = `origin/main` hashes), no ESLint rule, tsconfig option or Prettier option was
lost, and no ignore was added. The root configs genuinely delegate, `pnpm lint`/`typecheck`/
`format:check` still execute through the presets, and the lockfile importers match the manifests.
All findings below are MINOR and should be follow-ups (file them, per
`docs/05-workflow/05-definition-of-ready-done.md`); none blocks the merge.

## Checks run

- `pnpm gate` (workdir `E:\wt\TMU-OPS-002`) → **OK gate(quick) passed**: lane check, format, lint,
  typecheck green; `i18n:check` skipped (message files land in M3); unit 36/36;
  `contracts:check`/`contracts:lint`/`db:check` pending by design (M0).
- `pnpm test:unit` → `Test Files 2 passed (2)`, `Tests 36 passed (36)` (scaffold 26 +
  config-presets 10).
- Move fidelity: `git hash-object packages/config/{eslint.config.mjs,tsconfig.base.json,prettier.json}`
  vs `git rev-parse origin/main:{eslint.config.mjs,tsconfig.base.json,.prettierrc.json}` → identical
  (`d638015…`, `5324e42…`, `1770cec…`). `vitest.base.ts` is new (no origin counterpart); content
  reviewed line by line.
- Lane/scope: `git diff --name-only origin/main...HEAD` → 16 paths, all inside `ops`
  (`scripts/**`, `package.json`, `tsconfig*.json`, `*.config.*`, `.prettierrc.json`,
  `packages/config/**`) plus `_common` (task file, backlog, status, `pnpm-lock.yaml`).
- `git diff --check origin/main...HEAD` → clean (no whitespace errors).
- Lockfile consistency (static): `pnpm-lock.yaml:7-47` importers match root `package.json:38-46`
  and `packages/config/package.json:13-20` exactly; `@eslint/js@9.39.5`, `globals@17.12.0`,
  `typescript-eslint@8.71.0` keep the same resolutions after the move.
- `git log origin/main..HEAD` → 2 commits, Conventional, both with `Task:` and `Agent:` trailers.
- **Could not run** (sandbox permission layer denies anything but `pnpm gate*`/`pnpm test*`/git
  read commands): `pnpm install --frozen-lockfile`, `pnpm exec tsc --showConfig`, and
  `gh pr view/checks`. Lockfile↔manifest consistency was verified by reading both sides; the
  extends chain is proven loadable because `pnpm typecheck` resolves it (an unresolvable `extends`
  is a hard `tsc` error). The `--showConfig` strict-trio observation remains unverified by command.

## Findings

### BLOCKER

None.

### MAJOR

None.

### MINOR

- **F1 — the preset's header comment still claims to be the workspace entry point.**
  `packages/config/eslint.config.mjs:1-2` says "this file is the workspace entry point that the
  gate's `lint` step executes". That was true of the blob at its old path; it is now the preset,
  and the entry point is root `eslint.config.mjs:1-5`. The blob was moved verbatim (correctly),
  so the comment is stale. Reword to describe the preset ("workspace-wide flat config preset;
  root `eslint.config.mjs` is the entry point").
- **F2 — "Move fidelity" evidence cites `HEAD:` for blobs that are actually `origin/main:` blobs.**
  `docs/08-project/tasks/TMU-OPS-002.md:197-201` claims
  `HEAD:eslint.config.mjs`/`HEAD:tsconfig.base.json`/`HEAD:.prettierrc.json` equal
  `d638015…`/`5324e42…`/`1770cec…`. At the reviewed HEAD those tree entries are the delegating
  stubs `cc138d7…`/`f3d7b42…`/`6351b2f…`; the claimed hashes match `origin/main:<file>` (and
  matched `HEAD` only at commit `48e63c1`). The move fidelity itself is real and I verified it,
  but the command as written is not reproducible at the reviewed commit — rephrase to
  `origin/main:<path>` (or `48e63c1:<path>`).
- **F3 — the end-to-end ESLint guard asserts rule ids, not severity.**
  `scripts/checks/config-presets.test.mjs:98-100` uses `toContain(ruleId)`. Downgrading
  `@typescript-eslint/no-explicit-any`/`no-console` from `error` to `warn` keeps the test green,
  and `pnpm lint` is `eslint .` with no `--max-warnings 0`, so the gate would also stay green —
  i.e. the guard has a hole exactly where "no weakened checks" matters. Assert `severity === 2`
  (or `result.errorCount >= 2`) for both rules.
- **F4 — turbo `globalDependencies` no longer covers the real tsconfig.**
  `turbo.json:3` lists root `tsconfig.base.json`, which is now a 5-line stub; the preset lives at
  `packages/config/tsconfig.base.json` (plus the other three preset files) and is not listed, so
  preset changes will not invalidate turbo caches. Follow-up for TMU-OPS-008 or a small ops task.
- **F5 — qa-engineer→ops-dev test authoring deviation (documented).**
  The loop makes `qa-engineer` the owner of step 4 RED (`docs/05-workflow/02-agent-loop.md:24,47`),
  but the lane map gives `qa` only `tests/**`, `**/*.test.ts`, `**/*.test.tsx`
  (`.agent/lanes.json:63-68`) while the guard is `scripts/checks/config-presets.test.mjs` and the
  red fixture is under `scripts/tooling/**` — both `ops` (`:70`). `ops-dev` authoring them is
  structurally forced, and it is disclosed with red-first evidence at
  `docs/08-project/tasks/TMU-OPS-002.md:203-212`, so I accept it this cycle. Codify the exception
  (DEC or lane/task-template change) or put future guard tests in a `tests/**/*.test.ts` file so
  step 4 stays honest.
- **F6 — the task file lost its trailing newline.**
  `docs/08-project/tasks/TMU-OPS-002.md` now ends `(none)` with no LF; the diff shows
  `\ No newline at end of file` on the added side only, so `origin/main` had one. This regresses
  the TMU-OPS-011 m10 fix. `git diff --check` stays clean because git only flags whitespace
  *errors*, not EOF style.
- **F7 — claim-commit scope is outside the documented list.**
  `48e63c1 chore(tasks): claim TMU-OPS-002` uses scope `tasks`; the allowed scopes are
  `web api worker ml db contracts ui i18n e2e docs ops agents`
  (`docs/05-workflow/07-commit-and-pr-conventions.md:28`). `commitlint` is referenced by
  `lefthook.yml:16` but not installed (`node_modules/commitlint` absent), so nothing catches it;
  prefer an allowed scope (e.g. `chore(ops)`).
- **F8 — the shared Vitest preset is never typechecked.**
  `packages/config/vitest.base.ts` is linted by `eslint .` but is not in any `include`
  (root `tsconfig.json:9` covers only `scripts/**/*.mjs`, `scripts/**/*.ts`, `eslint.config.mjs`),
  so the strict trio cannot be observed on it. Acceptable at M0; revisit when `packages/*` gain
  their own tsconfigs (TMU-OPS-003+).
- **F9 — the `basePath` design note is inaccurate for the installed toolchain.**
  `docs/08-project/tasks/TMU-OPS-002.md:72` says "ESLint 9.39.5 has no `basePath` (v10-only)".
  The installed tree appears to support it: `node_modules/eslint/lib/config/flat-config-array.js:24`
  treats `basePath` as a meta field, and `@eslint/config-array@0.21.2` (what `eslint@9.39.5`
  depends on) validates and applies it (`dist/cjs/index.cjs:66-81,149-160,1237-1250`); the v9.x
  docs also document "Specifying base path". Delivered behaviour is unaffected (only the root
  consumes the preset today), but the note could mislead TMU-OPS-003+ when sub-packages extend
  the preset. Correct it or probe it before relying on it.

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first and failed for the right reason | Met | Task file `:96-141`: fixture lint (3 errors incl. `ban-ts-comment`) + TS2322 before delegation; guard tests 8 failed / 28 passed with `packages/config` absent. Authored by `ops-dev` per F5 (documented deviation). |
| 2 | New/updated tests pass; full `pnpm gate` green | Met | Reviewer ran `pnpm gate` → `OK gate(quick) passed`; `pnpm test:unit` → 36/36. |
| 3 | Contract tests for every touched `API-*` | N/A | No endpoint, contract or generated artefact touched. |
| 4 | Auth/RBAC asserted; state transitions covered | N/A | Config-only change; no routes, services or state machines. |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | See Privacy. |
| 6 | i18n keys for `id` and `en`; `error.<code>` keys | N/A | No user-facing string added; `i18n:check` intentionally skips until M3. |
| 7 | A11y: states + keyboard path + zero axe violations | N/A | No UI component added. |
| 8 | Docs updated: task status, Progress log, traceability, CHANGELOG | Met (with F2, F6) | Task file `status: REVIEW`, Progress log and Evidence current; `backlog.md`/`status.md` regenerated (16 tasks consistent). No contract change ⇒ no CHANGELOG entry. F2 (hash citation) and F6 (EOF newline) are hygiene fixes. |
| 9 | Generated files in sync; no hand edits | Met | `pnpm-lock.yaml` generated by pnpm and consistent with both manifests; `backlog.md`/`status.md` carry the `GENERATED` banner and match `backlog-index.mjs` output; `contracts:check` pending by design at M0. |
| 10 | Reviewer verdict `APPROVE` in `reviews/<ID>.md` | Met | This file. |
| 11 | Security review for sensitive tasks | N/A (note) | No auth/claims/uploads/privacy code. Supply-chain posture unchanged: three packages moved between workspace manifests, no new external dependency was introduced. |
| 12 | PR ready, CI green, labels correct | Not verifiable here | `gh` is blocked in this sandbox; task file `:211` still reads `PR: (pending — orchestrator commits via git-steward)`. Carry to SHIP/CI. |

## Privacy

Clean. The diff touches only manifests, configs, a lockfile, one test file and bookkeeping docs.
There is no `.env` (still absent; the scaffold test that forbids committing one is unchanged), no
secrets, no emails, no hint answers, no embeddings and no raw image URLs. A pattern scan of the
full diff for secret/PII markers returned nothing; the only test fixture data is an inline
synthetic snippet (`scripts/checks/config-presets.test.mjs:95,106`). The Postgres credentials in
`.github/workflows/ci.yml` are pre-existing CI test values and are not modified by this branch.

## Notes for the human

- The two commands the task asked the reviewer to run outside the gate
  (`pnpm install --frozen-lockfile`, `pnpm exec tsc --showConfig`) were blocked by the sandbox
  permission layer; CI's frozen install is the remaining end-to-end proof. Static consistency is
  strong, so I do not consider this a risk — just unverified by me.
- `packages/config` relies on `eslint`/`typescript` being provided by the consuming workspace root
  (they are not declared in its `package.json`). Fine for root consumption; later consumers may
  want explicit peers.
- F4/F8/F9 are forward-looking and belong with TMU-OPS-008 (gate/CI parity) or the first consuming
  package task; F1/F2/F6 are one-line doc/comment fixes for the author.
