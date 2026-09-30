---
id: REV-TMU-OPS-001
task: TMU-OPS-001
reviewer: reviewer
verdict: APPROVE
date: 2026-09-29
---

# TMU-OPS-001 — Review

## Verdict

**APPROVE.** The reviewer ran `pnpm gate` on the branch and it passed: every quick-mode step
reports a result and the placeholder steps exit 0 with an explicit "not implemented until
TMU-OPS-004/005" notice, which is exactly what the M0 exit criteria allow. The lane map now covers
every path this task adds, and the diff stays within the `ops` lane. All findings below are MINOR
and can be follow-ups (file them rather than ignoring them, per
`docs/05-workflow/05-definition-of-ready-done.md`).

Reviewer note: on this Windows host `pnpm gate` only ran after adding `C:\Program Files\Git\bin`
to `PATH`; the bare invocation fails with `'bash' is not recognized as an internal or external
command`, which is the prerequisite this task documents at
`docs/07-ops/01-local-dev-setup.md:19`. That is finding F4 below, not a gate failure.

## Checks run

- `pnpm gate` → **OK gate(quick) passed** (lane check, format, lint, typecheck, i18n keys, unit
  tests, contracts:check, contracts:lint, db:check). ML step skipped as intended because
  `services/ml/pyproject.toml` does not exist yet.
- `pnpm test:unit` → 1 file passed, 12 tests passed.
- `node scripts/i18n-check.mjs` → `i18n:check skipped (message files not created yet — M3)`, exit 0.
- `node scripts/checks/pending.mjs contracts:check` → `pending: … TMU-OPS-004`, exit 0.
- `node scripts/checks/build.mjs` → `pending: build — no buildable workspace package yet`, exit 0.
- `node scripts/checks/dev.mjs` → exit 1 with `pending: apps/web does not exist yet — created in TMU-OPS-003` (by design until TMU-OPS-003).
- `git diff --cached --stat` → 37 entries (36 text + `pnpm-lock.yaml`, shown as `Bin` because `.gitattributes:27` sets `-diff` on it).

## Findings

All MINOR. No BLOCKER or MAJOR found.

- **F1 — `meta` lane keeps a contracts-only path and the new test hides it.**
  `scripts/checks/scaffold.test.mjs:91` skips `meta` in the "keeps contract paths out of every
  non-contract lane" check, because `.agent/lanes.json:84` gives `meta` ownership of
  `docs/04-contracts/CHANGELOG.md`. Lane semantics rule 3
  (`docs/05-workflow/10-parallel-lanes-and-ownership.md:37`) reserves `docs/04-contracts/**` for
  the `contracts` lane, so the conflict is a real (pre-existing) map entry that the test was
  written around rather than documenting. Suggest narrowing the `meta` entry to a comment or
  codifying the exception explicitly.
- **F2 — the M0 task-id test is hard-coded to exactly `TMU-OPS-001..010`.**
  `scripts/checks/scaffold.test.mjs:142-145` asserts `m0` equals the literal set of ten ids. Any
  future `ops` task, or a cut/moved M0 task, turns a repo-hygiene test red. Suggest filtering by
  the `milestone: M0` front-matter or asserting "no gaps below the max id" instead of a fixed
  count.
- **F3 — `.npmrc` comments do not describe the settings they sit above.**
  `.npmrc:2` says dependency lifecycle scripts are not run by default, but line 3 is
  `enable-pre-post-scripts=true` (about `pnpm run` pre/post hooks) and there is no
  `ignore-scripts=true`; the actual supply-chain control is `pnpm.onlyBuiltDependencies` in
  `package.json:49-53`. `.npmrc:4` ("keep the store inside the workspace") sits above
  `strict-peer-dependencies=false`/`auto-install-peers=true`, which do not affect store location.
  Fix the comments (or add the settings) so the intended policy is not mistaken for the applied
  one.
- **F4 — gate needs `bash` on `PATH`; no Windows shim.**
  Verified: `pnpm gate` fails with `'bash' is not recognized` until `C:\Program Files\Git\bin` is
  on `PATH`; with it, the gate passes. `package.json:33-35` hard-codes `bash scripts/gate.sh` and
  `docs/07-ops/01-local-dev-setup.md:19` / `:83` document the prerequisite, which satisfies the
  task's acceptance criterion, but a tiny `scripts/gate.mjs` (locate `bash.exe` or delegate to the
  Node steps) would remove a first-run failure class. MINOR because documentation was explicitly
  in scope.
- **F5 — `pnpm dev` exits 1 while the setup doc presents it as part of "First run".**
  `scripts/checks/dev.mjs:17-20` intentionally exits 1 until `apps/web` exists, but
  `docs/07-ops/01-local-dev-setup.md:35-36` lists `pnpm dev` / `pnpm dev:worker` as the last steps
  of the first-run sequence with no "not yet runnable at M0" note. Add a one-line M0 caveat so a
  fresh-clone user does not read the intentional failure as a broken scaffold.
- **F6 — evidence claim about `git diff -w` is not reproducible.**
  `docs/08-project/tasks/TMU-OPS-001.md:136-139` says the 7 reformatted files are whitespace-only
  "verified with `git diff -w`". Running `git diff --cached -w --stat` still lists all 36 files,
  because line re-wrapping is not collapsed by `-w`; the changes are indeed semantically neutral
  by inspection, but the cited verification does not demonstrate it. Rephrase the evidence (e.g.
  "re-wrapping/indentation only, reviewed hunk-by-hunk") or drop the command claim.
- **F7 — Node globals are applied to every TS/TSX file workspace-wide.**
  `eslint.config.mjs:23-29` sets `globals.node` for `**/*.{js,mjs,cjs,ts,mts,cts,tsx}`, so the
  future browser code under `apps/web/src/**` will resolve `process`, `Buffer`, etc. without an
  error. The entry point sets the precedent for TMU-OPS-002's shared presets; suggest scoping
  Node globals to `scripts/**`, `*.config.*` and `apps/worker/**`, and adding browser globals for
  `apps/web/**`.
- **F8 — `audit` flags are duplicated and the command name is ambiguous.**
  `scripts/gate.sh:26` runs `pnpm -s audit --prod --audit-level=high` while `package.json:30`
  already defines `audit` with the same flags, so the arguments are either appended twice (if the
  script is selected) or the script is bypassed by the built-in `pnpm audit` (if the built-in is
  selected). Harmless today but two sources of truth for the same policy; call the script once
  (`pnpm -s audit`) or the built-in once.

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first and failed for the right reason | Met | Task file red snippets: `ERR_PNPM_NO_PKG_MANIFEST`, 47 lint errors, `expected [ 'audit' ] to deeply equal []` (`TMU-OPS-001.md:91-112`) |
| 2 | New/updated tests pass; `pnpm gate` green | Met | Reviewer ran `pnpm gate` → `OK gate(quick) passed`; `pnpm test:unit` → 12/12 |
| 3 | Contract tests for every touched `API-*` | N/A | No endpoint or contract touched in this scaffold |
| 4 | Auth/RBAC + state transitions covered | N/A | No routes, services or state machines in scope |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | See Privacy section |
| 6 | i18n keys for `id` and `en`, new `error.<code>` keys | N/A | `i18n:check` intentionally skips until message files land in TMU-OPS-003/M3; no user-facing string added |
| 7 | A11y: states, keyboard path, zero axe violations | N/A | No UI component added |
| 8 | Docs updated: task status, Progress log, traceability, CHANGELOG | Met | `TMU-OPS-001.md` status `REVIEW` with Progress log; `docs/08-project/backlog.md` and `status.md` regenerated by `scripts/backlog-index.mjs`; no contract change ⇒ no CHANGELOG entry required |
| 9 | Generated files in sync, no hand edits | Met | `pnpm-lock.yaml` produced by install; backlog/status carry the `GENERATED … do not edit` banner and match the generator (`backlog-index.mjs`) |
| 10 | Reviewer verdict `APPROVE` in `docs/08-project/reviews/<ID>.md` | Met | This file |
| 11 | Security review for sensitive tasks | N/A (note) | No auth, claims, uploads or privacy logic; F3 notes the `.npmrc` supply-chain comment mismatch |
| 12 | PR ready, CI green, labels correct | Pending | `TMU-OPS-001.md:151` still says `PR: (pending — push is git-steward's step)`; to be closed by the human/CI step, not by this review |

## Privacy

No PII is touched. The diff touches only workspace manifests, configs, gate scripts, task/review
bookkeeping and formatting of pre-existing tooling; there are no user models, no auth or session
code, no uploads, no analytics, and no fixtures with real data. `scripts/checks/pending.mjs:70-73`
reads only the contract version string, and `scripts/checks/dev.mjs` prints only the target
directory/owner. No emails, hint answers, embeddings, raw image URLs or secrets are logged,
returned or committed; `.env` is absent and `.env.example` (not modified by this branch) is the
only env artefact the scaffold test permits (`scripts/checks/scaffold.test.mjs:162-165`).
