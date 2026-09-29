---
id: ADR-0006
title: Auth.js with Google OAuth and a domain allowlist
status: proposed
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-AUTH"]
source_refs: ["DEC-001", "Blueprint §5A.11"]
---

# ADR-0006 — Auth.js with Google OAuth and a domain allowlist

## Context

"Login with UNAIR identity" is unspecified in the PDF. UNAIR likely uses Google Workspace for
student/staff mail, but the exact domains are unconfirmed.

## Options

1. **Auth.js + Google OAuth, server-side domain allowlist** — no passwords stored, works if
   UNAIR is on Google Workspace; domains are configuration, not code.
2. **Custom SSO/SAML** — depends on UNAIR IT providing an IdP and metadata; heavy for a course
   project.
3. **Email + password** — worst security posture, password support burden, rejected.
4. **Magic link only** — good UX, but email deliverability and domain verification still
   require UNAIR mail infrastructure.

## Decision

Option 1 as the default. `AUTH_ALLOWED_DOMAINS` (env, csv) gates sign-in after the OAuth
callback; rejected emails get `AUTH_DOMAIN_NOT_ALLOWED` and no user row. Dev-only email magic
link for non-UNAIR test accounts, still domain-checked.

## Consequences

- No password storage; MFA is inherited from Google.
- Domain changes are config-only; but the real domains must be confirmed (OQ-2) before M3.
- If UNAIR is **not** on Google Workspace, this ADR is revisited with option 2/4 — the session
  and RBAC layers (database sessions) are provider-agnostic.
- Status remains **proposed** until UNAIR DTI confirms domains and OAuth client provisioning.
