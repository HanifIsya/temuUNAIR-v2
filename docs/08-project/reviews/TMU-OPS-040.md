---
id: REV-TMU-OPS-040
task: TMU-OPS-040
title: "Docker build: set CI=true for pnpm prune non-interactive execution"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-05
cycle: 1
---

# Review — TMU-OPS-040

Diff reviewed: `origin/main...HEAD` on branch `agent/ops/TMU-OPS-040-docker-prune-ci` (`b449702`).
Files touched:
- `infra/docker/web.Dockerfile`
- `docs/08-project/tasks/TMU-OPS-040.md`
- `docs/08-project/backlog.md`
- `docs/08-project/status.md`

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 1 MINOR.

This task resolves the Docker container build failure on `main` following the merge of `TMU-OPS-038` (`dbf804c`):
In pnpm v10, `pnpm prune --prod` (and related prune/install operations) requires interactive confirmation when removing existing node_modules directories unless running in a CI environment (`CI=true`) or configured with `confirmModulesPurge=false`. During automated container builds without a TTY, this caused:
`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY Aborted removal of modules directory due to no TTY`

Adding `ENV CI=true` in the `base` stage of `infra/docker/web.Dockerfile` ensures all build stages (`deps`, `builder`, `runner`) run pnpm non-interactively without TTY aborts.

## Checklist

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Red evidence: problem reproduced and documented before fix | PASS | CI run `37280048214` on commit `dbf804c` documented in task log; failure output `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` captured verbatim in `tasks/TMU-OPS-040.md`. |
| 2 | Minimal & correct Dockerfile change: `ENV CI=true` in base stage | PASS | 1 line added (`ENV CI=true` in `base` stage). Inherited cleanly by `deps`, `builder`, and `runner`. Follows upstream pnpm guidance for non-interactive container environments. |
| 3 | Lane discipline: all modified files inside `ops` or `_common` | PASS | `infra/docker/web.Dockerfile` is inside `lanes.ops`; task, backlog, and status files are inside `lanes._common`. No out-of-lane edits. |
| 4 | Privacy & Secrets: no secrets, credentials, or PII exposed | PASS | Build metadata only; zero credentials, secrets, or PII touched. |
| 5 | Minimal diff: no drive-by refactors | PASS | Exactly 1 line changed in Dockerfile (+1 line in base stage). Backlog and status accurately indexed. |
| 6 | DoD compliance | PASS | Zero contract drift, zero regressions in application code or migrations. |

## Findings

### BLOCKER
*None.*

### MAJOR
*None.*

### MINOR
- [x] `docs/08-project/tasks/TMU-OPS-040.md:34-35` — Acceptance criteria items 1 and 2 are ticked off.

## Notes for the human

- **pnpm v10 non-interactive requirement**:
  In pnpm v10, module pruning without a TTY will abort with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` unless `CI=true` or `confirmModulesPurge=false`. Setting `ENV CI=true` in Dockerfile's `base` stage is the standard container pattern recommended by pnpm upstream.
- **Runtime impact**:
  `ENV CI=true` is inherited by `runner`, where Next.js runs `next start`. In production Next.js runtime, `CI=true` does not interfere with request serving or application logic.

## Verdict

**APPROVE**
