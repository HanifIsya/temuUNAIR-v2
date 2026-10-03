---
id: REV-TMU-ARC-010
task: TMU-ARC-010
title: "Review and approve Auth and RBAC (10-auth-and-rbac.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-010 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-010-review-auth-rbac`.
Files reviewed: `docs/03-architecture/10-auth-and-rbac.md`, `tasks/TMU-ARC-010.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/10-auth-and-rbac.md` has been audited against Blueprint §4.4 and §5A.11.
The authentication and authorization architecture is fully specified: Auth.js Google OAuth callback
validation with `AUTH_ALLOWED_DOMAINS` allowlist, 30-day sliding database sessions, cookie-based
transport (`SameSite=Lax`, `Origin` verification), an authoritative 3-role permission matrix (USER,
campus MODERATOR, ADMIN), 4 distinct enforcement layers, and a 7-day cool-off account deletion flow.
Front-matter status is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Session model & OAuth | §Session model | PASS | Auth.js NextAuth v5, Google OAuth, domain allowlist callback (AUTH_DOMAIN_NOT_ALLOWED 403), 30d DB session cookie. |
| Role scoping | §Roles | PASS | USER (default, own data), campus MODERATOR (`moderator_campus`), and global ADMIN. |
| Permission matrix | §Permission matrix | PASS | Complete matrix covering report, hint prompts vs answers, claim approval, moderation queues, and audit access. |
| Multi-layer enforcement | §Enforcement layers | PASS | 4 layers: Middleware navigation hints, Route handlers auth/ownership checks, Service transaction guards, UI visibility. |
| Campus scoping & deletion | §Campus scoping & §Account deletion | PASS | Campus query filtering and 7-day deletion cool-off with anonymization and media removal. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (RBAC Matrix Documented):** Complete RBAC matrix across USER, campus MODERATOR, and ADMIN documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
