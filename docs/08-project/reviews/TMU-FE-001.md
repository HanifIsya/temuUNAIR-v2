---
id: TMU-FE-001
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-05
---

# Review — TMU-FE-001

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red evidence: 8/9 files failed first for the right reason (`Cannot find module`/`Failed to resolve import` on the 8 unwritten implementations); log in the task file | PASS |
| 2 | New/updated tests pass; full `pnpm gate` green (53 files / 462 tests; contracts 1.1.0; db ok) | PASS |
| 3 | Contract tests: no `API-*` endpoints touched (UI-only task); FE contract adherence verified below | PASS (n/a) |
| 4 | Auth/RBAC + state transitions: `/login` and `/auth/error` are public per FE-01; header session states (loading/unauthenticated/authenticated) covered; auth-error domain→generic→suspended mapping unit-tested incl. Auth.js `AccessDenied` | PASS |
| 5 | Privacy: no hint answers, emails, embeddings or sensitive URLs in code, tests or logs; `next` allowlist-validated (open-redirect unit-tested); fixtures contain no PII | PASS |
| 6 | i18n: new keys added to **both** `id` and `en` (incl. `auth.error.*`); `pnpm i18n:check` green (84 keys); no literal UI strings (brand via `t("app.name")`) | PASS |
| 7 | A11y: focus-on-mount tests (login h1, ErrorState heading), keyboard paths (skip-link order, landing CTA, tab→Enter sign-in), zero axe violations across 8 renders | PASS |
| 8 | Docs updated: task file DONE with decisions/observations/deferrals, BLK-004 filed, this review, backlog regenerated | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); lockfile by pnpm, no hand edits | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security review: open-redirect guard (`safeInternalNext` rejects `//`, `/\`, absolute, `javascript:`) unit-tested; no secrets in code; BLK-004 raised for the raw-provider-error gap instead of papering over it | PASS |
| 12 | Lane: all files inside fe globs (`app/(public)/**`, `components/**`, `features/**`, `i18n/**`, `styles/**`, `apps/web/package.json`) + `_common` (lockfile, docs); lane check green in gate | PASS |

## Notes

- **Findings on cycle 1: none blocking.** The three first-green failures (mock dropped
  `data-testid`, missing probe key, missing `action` prop) were test-harness bugs, fixed
  before the gate — no product code weakened, no assertion removed.
- **Contract gaps filed, not silently absorbed**: FE-03's nonexistent `ApiError` (O-1),
  FE-03 `Me` type (O-2), unimplemented i18n scans (O-3), FE-01/SCR-001 guest-CTA drift
  (O-4), missing middleware guard (O-5) — all recorded in the task file for `TMU-CTR-*`
  / follow-up tasks.
- **BLK-004** (be lane): Auth.js `pages` config + magic-link gap found during DoR; FE-001
  shipped around it (`/auth/error` consumes `?error=`), deferring only the dev
  magic-link form per D-13.
- The task's own red-first rule was honoured for every behavioural file; `layout.test`
  was pre-wired with its SessionProvider mock so the layout change itself is covered by
  the green run (noted transparently in the progress log).

## Verdict

**APPROVE** — all four acceptance criteria met with evidence, gate fully green, a11y and
privacy checks pass, deferrals explicit and filed. Unblocks FE-002..006; BLK-004 routes
the be-side auth pages/magic-link work to a human decision.
