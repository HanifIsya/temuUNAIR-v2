---
id: TMU-OPS-039
title: Upgrade `next-auth` / `next-intl` off production advisories (security M-6) + ADR for v3→v4
status: TODO
lane: ops
slug: next-auth-intl-advisories
milestone: M3
priority: P2
owner: ops-dev
deps: []
refs: [TMU-FE-003, WF-CICD]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-OPS-039 — Upgrade `next-auth` / `next-intl` off production advisories (M-6)

## Goal

Security review M-6 (`docs/08-project/reviews/TMU-FE-003-security.md`, row "Dependency
advisories"): `apps/web` pins `next-auth@5.0.0-beta.29` (exact) → 3 critical + 2 high
production advisories through `@auth/core` (fail-open auth checks, homoglyph `@` bypass,
`getToken()` crash), and `next-intl@^3.26.5` carries 2 moderate advisories (open redirect /
prototype pollution). The CI `audit` job (`pnpm audit --prod --audit-level=high`,
`ci.yml:178`) therefore exits non-zero on every run — it is advisory today
(`continue-on-error`, `ci.yml:171`) but keeps main's runs red.

Upgrade to advisory-free releases. The `next-intl` major jump (v3 → v4) needs an ADR
(`write-adr` skill) plus an i18n regression pass (`FE-08` keys, `i18n:check`). Auth is a
sensitive area: the task gets a `security-reviewer` pass.

Filed per M-6's disposition ("requires an ops/BE task — not a frontend-wizard change").

## Acceptance criteria

- [ ] `pnpm -s run audit` (root, `--prod --audit-level=high`) exits 0 — no production
      advisory paths remain for `next-auth`, `@auth/core` or `next-intl`.
- [ ] If no advisory-free `next-auth` 5.x release exists upstream, this is recorded and the
      task escalates to a decision (blocker or ADR) instead of silently skipping.
- [ ] ADR recorded for any `next-intl` v3→v4 jump (arch lane — split or lane exception
      decided at execution time).
- [ ] Auth flows re-verified (login, session, callback) and security re-review passed.
- [ ] `pnpm gate` green.

## Files expected to change

- `apps/web/package.json`, `pnpm-lock.yaml`
- ADR under `docs/03-architecture/` (if the v3→v4 jump happens — arch lane)
- `docs/08-project/tasks/TMU-OPS-039.md`, `docs/08-project/reviews/TMU-OPS-039.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-05 | ops-dev | 1 PICK | filed while executing TMU-OPS-038, completing security M-6's disposition (no task existed — checked backlog/tasks for next-auth/next-intl upgrades) |
