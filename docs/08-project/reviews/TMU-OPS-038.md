---
id: REV-TMU-OPS-038
task: TMU-OPS-038
title: "Fix main CI red — gitleaks allowlist coverage (secret-scan) + web image patches/ COPY (docker-build)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-05
cycle: 1
---

# Review — TMU-OPS-038

Diff reviewed: `origin/main...HEAD` on branch `agent/ops/TMU-OPS-038-main-ci-green` (`b731e3c`).
Files touched:
- `.gitleaks.toml`
- `infra/docker/web.Dockerfile`
- `docs/08-project/tasks/TMU-OPS-038.md`
- `docs/08-project/tasks/TMU-OPS-039.md`
- `docs/08-project/backlog.md`
- `docs/08-project/status.md`

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 1 MINOR.

This task resolves the two CI red failures on `main` following the squash-merge of `TMU-FE-003` (`8f13326`):
1. **`secret-scan`**: Gitleaks reported two `generic-api-key` false positives (`apps/worker/src/config.ts:41` capturing `env.S3_SECRET_KEY` and `docs/08-project/reviews/TMU-FE-003-security.md:39` quoting advisory `GHSA-7rqj-j65f-68wh`). Resolved with narrow regex allowlists and a path exemption for `.gitleaks.toml` itself. Full history scan reports 0 leaks (was 4).
2. **`docker-build`**: Resolved `ENOENT patches/drizzle-kit@0.31.11.patch` during `pnpm install --frozen-lockfile` by copying `patches/` into the `deps` stage of `infra/docker/web.Dockerfile`.
3. **Out-of-scope separation**: Security finding M-6 (production advisories in `next-auth`/`next-intl`) is cleanly split into follow-up task `TMU-OPS-039` in `backlog.md` and `status.md`.

## Checklist

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Red evidence: problem reproduced and documented before fix | PASS | CI runs `37265352637` (`8f13326`) and `36976231643` (`fcbc9b8`) documented in task log; local `gitleaks detect` reproduced 4 leaks across history. |
| 2 | Exemption scope: no broad or inappropriate exemptions | PASS | `.gitleaks.toml` adds only self-exemption and narrow regexes (`env\.S3_SECRET_KEY`, `GHSA-…`). No source files or docs directories are exempted by path. `web.Dockerfile` adds only `COPY patches/ ./patches/`. |
| 3 | Lane discipline: all modified files inside `ops` or `_common` | PASS | `.gitleaks.toml` and `infra/**` are in `lanes.ops`; task files, backlog, and status are in `lanes._common`. |
| 4 | Privacy & Secrets: no secrets, credentials, or PII exposed | PASS | No real secrets or sensitive data added; regexes match documented identifier patterns. |
| 5 | Minimal diff: no drive-by refactors | PASS | 6 files (+165, -3) strictly focused on the CI blockers and tracking. |
| 6 | DoD compliance | PASS | Zero regressions, contracts untouched, audit/security concerns dispositioned to TMU-OPS-039. |

## Findings

### BLOCKER
*None.*

### MAJOR
*None.*

### MINOR
- [x] `docs/08-project/tasks/TMU-OPS-038.md:51-62` — Acceptance criteria items 1–4 are already implemented and verified in the Progress Log; ticked off in the task file.

## Notes for the human

- **Surgical Gitleaks regexes**:
  - `env\.S3_SECRET_KEY` specifically prevents flagging the TypeScript variable reference `env.S3_SECRET_KEY` in `apps/worker/src/config.ts:41` without allowing actual hardcoded keys or suppressing other worker secrets.
  - `GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}` safely matches GitHub Security Advisory IDs in review documents without exempting review markdown files wholesale.
- **Docker build parity**: `patches/` is required whenever `pnpm.patchedDependencies` is configured in `package.json`. Adding `COPY patches/ ./patches/` restores `pnpm install --frozen-lockfile` parity in the container build.
- **Follow-up task TMU-OPS-039**: Created and scheduled in M3 backlog for upgrading `next-auth` and `next-intl` (handling advisory audit failures).

## Verdict

**APPROVE**
