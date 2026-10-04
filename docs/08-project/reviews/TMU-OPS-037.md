---
id: TMU-OPS-037
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-05
---

# Review — TMU-OPS-037

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red evidence: probe test failed for the right reason before the fix (`Cannot find package '@/i18n/messages/id.json'`) — recorded in the task file | PASS |
| 2 | All tests pass: probe `1 passed` (then removed); full `pnpm gate` green (46 files / 416 tests — whole suite runs under the new resolution, zero regressions) | PASS |
| 3 | Contract tests unaffected (`contracts:check OK 1.1.0`) — resolution-only change | PASS |
| 4 | N/A (no endpoints/state transitions) | PASS (n/a) |
| 5 | Privacy: no data touched; no secrets logged | PASS |
| 6 | i18n: no UI strings | PASS (n/a) |
| 7 | A11y: no UI | PASS (n/a) |
| 8 | Docs: task filed before the change, DONE with evidence (probe before/after, `projects:` rationale), this review | PASS |
| 9 | Generated files in sync; lockfile updated by pnpm (no hand edits) | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: dev-only devDependency (build tooling), no runtime surface | PASS |
| 12 | Work in lane: `package.json`, `pnpm-lock.yaml`, `vitest.config.ts` (root `*.config.*` + `package.json` are ops globs; lockfile is `_common`); lane check green in gate | PASS |

## Notes

- **Root cause**: WF-STANDARDS mandates `@/…` imports for `apps/web/src`, but Vitest had
  no tsconfig-paths resolution — nested FE routes (`app/(public)/auth/error/*`) would
  otherwise need 4-level relative chains, breaking the two-level limit. Discovered during
  TMU-FE-001 DoR research with a failing probe, filed as a task (not improvised on the fe
  branch — root `vitest.config.ts` is ops-owned).
- **`projects:` is required, not optional**: default discovery only finds `tsconfig.json`
  (root has no `paths`), and the plugin respects `include/exclude` —
  `apps/web/tsconfig.json` excludes `*.test.ts(x)`, so the root `tsconfig.test.json`
  (paths + test includes) had to be listed alongside the web config. Recorded in the task
  file so the next agent does not "simplify" it away.
- **Verification was empirical both ways**: probe red before the fix, green after, removed
  before commit; gate proves the whole suite still resolves (416 tests).

## Verdict

**APPROVE** — unblocks standards-compliant FE work (TMU-FE-001..006), minimal diff
(one devDependency + one config block), full gate green, no BLOCKER/MAJOR findings.
