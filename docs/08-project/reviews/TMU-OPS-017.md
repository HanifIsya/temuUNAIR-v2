---
id: REV-TMU-OPS-017
task: TMU-OPS-017
reviewer: reviewer
cycle: 1
date: 2026-10-01
verdict: APPROVE
---
# Review — TMU-OPS-017

Branch `agent/ops/TMU-OPS-017-e2e-guard` @ `47976c3` (1 commit on `origin/main` @ `76124aa`), diff reviewed directly (no PR — creation denied by session permissions).

## Findings

**BLOCKER** — none.

**MAJOR** — none.

**MINOR 1 — stale doc command (out of scope, file a follow-up).** `docs/06-quality/03-e2e-scenarios.md:46` still tells contributors to run root-level `pnpm exec playwright install --with-deps chromium` — exactly the command the task's red evidence shows fails with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`. File is in the `docs`/`qa` lane, correctly not touched here; raise a follow-up task to switch it to `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`. (Filed as TMU-OPS-019.)

**MINOR 2 — red evidence is claimed, not re-verifiable read-only.** Commit body and task state red-first (`AssertionError … to contain 'tests/e2e/package.json'`, 1 failed/26); reproducing would require editing the file, which review forbids. Acceptable on the strength of the message + green re-run; note for the record.

**Verification limits (not a finding):** session allowlist permits only git read commands and `pnpm gate*`/`pnpm test*`, so no standalone YAML parser. Validated instead by a full visual read of all 181 lines of `ci.yml` — indentation and structure are consistent (steps at 6 sp, keys at 8 sp; edited lines are in-place value swaps of pre-existing valid lines), plus the green gate.

## Evidence

- **Scope:** `git diff origin/main...HEAD --stat` → exactly `.github/workflows/ci.yml | 14 ++++---` and `scripts/checks/scaffold.test.mjs | 7 +++--`. No out-of-lane edits. `git status` clean; branch == `origin/agent/ops/…`.
- **Commit:** `ci(e2e): …` (Conventional ✓), body + `Task: TMU-OPS-017` trailer ✓, `Refs:`/`Agent:` trailers present; no `--no-verify` artifacts.
- **ci.yml:** guard `[ -f tests/e2e/package.json ]` (`ci.yml:134`); install `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium` (`ci.yml:143`); skip echo names TMU-OPS-013 (`ci.yml:147`); comment block rewritten (`ci.yml:127-131`). All six `if:` still keyed on `steps.present.outputs.exists` (`:135,137,140,142,144,146`). `ML_MODE: stub` (`:125`), `pnpm -s test:e2e` (`:145`) and ML guard (`:87`, `:100`) untouched; diff hunks confined to the `e2e` job (lines 122-147).
- **Stale wiring greps:** `apps/web/package.json` → **0 matches** in `.github/` and `scripts/`; `pnpm exec playwright` → only prose comments (`ci.yml:131`, `scaffold.test.mjs:54`) and the out-of-scope doc (MINOR 1). `playwright install` → only `ci.yml:143` + that doc.
- **scaffold.test.mjs:** `expect(ci).toContain("tests/e2e/package.json")` (`:57`), ML assertion intact (`:56`), comment updated (`:51-54`).
- **Package name pre-agreed:** `scripts/checks/step.mjs:26` already maps `test:e2e` → `tests/e2e`, `@temuunair/e2e-tests`.
- **Tests:** `pnpm test:unit scripts/checks/scaffold.test.mjs` → 26/26; `pnpm gate` → lane check ✓, **36 tests passed (2 files)**, `OK gate(quick) passed`.

## DoD / AC checklist

| # | AC / DoD | Result |
|---|---|---|
| 1 | Guard checks `tests/e2e/package.json`; skip notice names TMU-OPS-013 | ✓ (`ci.yml:134`, `:147`) |
| 2 | Install via `--filter @temuunair/e2e-tests …`, only after package exists (`if: … == 'yes'`) | ✓ (`ci.yml:142-143`) |
| 3 | scaffold.test asserts new guard + ML skip | ✓ (`:56-57`) |
| 4 | `apps/web` present alone cannot activate job | ✓ (grep 0 matches) |
| 5 | `pnpm gate` green (36 tests) | ✓ |
| DoD 1 | Red evidence first | claimed in commit (MINOR 2) |
| DoD 3/4 | Contract tests / auth / transitions | n/a (CI config only) |
| DoD 5 | Privacy | ✓ no private fields touched |
| DoD 6 | i18n | n/a (no UI strings) |
| DoD 9 | Generated files in sync | ✓ gate green |
| Lane | `.github/**`, `scripts/**` ∈ ops; worktree clean | ✓ |

## Verdict

**APPROVE.** All five ACs verified in the worktree; no BLOCKER/MAJOR findings. MINOR 1 filed as TMU-OPS-019 (docs lane), not silently dropped.
