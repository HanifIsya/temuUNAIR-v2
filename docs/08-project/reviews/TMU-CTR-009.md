---
id: TMU-CTR-009
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-05
---

# Review — TMU-CTR-009

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red evidence: generator tests `2 failed / 17 passed` before the fix — uniqueness failure listed all 9 duplicated paths (`/api/v1/me` ×3, `/api/v1/reports`, …); log in the task file | PASS |
| 2 | New tests pass; full `pnpm gate` green (53 files / 464 tests; contracts 1.1.0) | PASS |
| 3 | Contract tests: `generate.test.ts` is the generator's contract test — two new assertions pin the merged-`paths` emission for every registry route; `contracts:check` green, no registry/schema change | PASS |
| 4 | Auth/RBAC + state transitions: n/a (generator-only change) | PASS (n/a) |
| 5 | Privacy: no PII; generated examples untouched | PASS |
| 6 | i18n: no UI strings touched | PASS (n/a) |
| 7 | A11y: n/a (no UI) | PASS (n/a) |
| 8 | Docs updated: task file DONE with evidence, CHANGELOG entry, this review, backlog regenerated (98 tasks) | PASS |
| 9 | Generated files in sync: `pnpm contracts:build` + `contracts:check OK (version 1.1.0)`; only `generated/types.ts` changed — `BE-02-openapi.yaml`, `client.ts`, `msw-handlers.ts` byte-identical (git status) | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security review: no security-relevant surface (emitter formatting only); `CONTRACT_VERSION` unchanged — no breaking/irreversible contract change, so no human merge gate per AGENTS.md rule 4 | PASS |
| 12 | Lane: all files inside contracts globs (`packages/contracts/**`) + `_common` (`docs/08-project/tasks/**`); lane check green in gate | PASS |

## Notes

- **Findings on cycle 1: none blocking.** The fix groups registry routes by path with a
  `Map` (first-appearance order), mirroring the existing YAML emitter's merge — output shape
  matches what openapi-fetch consumers expect (`paths["/api/v1/me"]` carries `get` + `patch` +
  `delete`).
- **Versioning call:** no registry/schema/behaviour change → `CONTRACT_VERSION` stays
  1.1.0; the CHANGELOG records it under `Fixed` as an artefact-emitter bugfix (the previous
  output did not typecheck at all, so nothing depended on its shape).
- **Latent-defect note:** `packages/contracts/tsconfig.json` excludes `generated/**`, so the
  contract package cannot catch this class of bug itself; the regression is now pinned by the
  generator unit tests, and `TMU-FE-002`'s first generated-client import keeps root
  typecheck honest (`tsc -p tsconfig.test.json` evidence in the task file).
