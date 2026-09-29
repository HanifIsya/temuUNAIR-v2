---
id: SEC-CHECKLIST
title: Security checklist
status: draft
owner: SR
updated: 2026-09-29
depends_on: ["THREAT-MODEL", "PRIVACY-RETENTION", "WF-SECRETS"]
source_refs: ["Blueprint §9.2", "NFR-020..026"]
---

# Security checklist

Runnable form of the threat model (`docs/03-architecture/14-security-threat-model.md`). Run at
M2, M8 and after any change to auth, uploads, claims, admin or privacy surfaces.

## Authentication and session

- [ ] Google OAuth only; domain allowlist enforced server-side after callback
- [ ] Rejected domains create no user row and log a hashed email only
- [ ] Session cookie: `httpOnly`, `Secure`, `SameSite=Lax`; 30-day sliding; logout revokes
- [ ] Suspended accounts blocked on every endpoint (`ACCOUNT_SUSPENDED`)
- [ ] Auth endpoints rate-limited (20/min/IP); login errors do not reveal account existence
- [ ] No tokens in localStorage/sessionStorage
- [ ] `next` redirect param validated to internal paths only

## Authorization

- [ ] Every non-public route has `requireUser()` + role/ownership checks in services
- [ ] Campus scoping for moderators on all moderation queries
- [ ] Hidden resources return `NOT_FOUND` (no existence leak)
- [ ] Self-demotion guard for admins
- [ ] Table-driven RBAC tests pass for role × endpoint groups
- [ ] IDOR probes: report/claim/message/upload ids of other users return 403/404

## Privacy and data protection

- [ ] Hint answers AES-GCM encrypted; never logged, never returned to non-owners
- [ ] EXIF (GPS) stripped on every upload; original never served to non-owners for sensitive items
- [ ] Masking applied for `isSensitive` categories; public `url: null`
- [ ] Exact geo hidden for sensitive items and for non-owners
- [ ] Other users' emails never returned by any endpoint
- [ ] Embeddings and raw scores never exposed
- [ ] Analytics events contain no PII (audit the `FE-10` list)
- [ ] Log redaction covers cookies, auth headers, emails, answers, bodies, image URLs, tokens
- [ ] Deletion flow: `DELETE /me` → cool-off → anonymize + image removal; audit stubs kept
- [ ] Retention jobs running (expiry, cleanup, notification purge) and counted in metrics

## Uploads and storage

- [ ] Presigned PUT scoped to a fresh key, content-type and size; cannot overwrite
- [ ] Server re-validates magic bytes on `complete`
- [ ] Bucket private; signed GETs short-lived; no listing
- [ ] Dimension/size caps enforced; decompression-bomb protections via `sharp` limits
- [ ] Orphan cleanup job active

## ML service boundary

- [ ] Bearer token required on `/v1/*`; service not publicly exposed
- [ ] `imageUrl` allowlisted to our storage host; redirects rejected; size/time caps
- [ ] No image/text logged or persisted
- [ ] `models.lock.json` checksums verified at startup
- [ ] `ML_MODE=stub` rejected in production

## Rate limits and abuse

- [ ] All `BE-12` limits implemented and tested (`Retry-After` on 429)
- [ ] Claim quotas (3/day, 3 rejections, 1 active) enforced with DB support
- [ ] Flag threshold moves reports to PENDING_REVIEW
- [ ] Login-only browsing (no anonymous catalog access)

## Admin and audit

- [ ] Every privileged mutation writes exactly one audit row (before/after, ip_hash, request_id)
- [ ] `audit_logs` is append-only (REVOKE UPDATE/DELETE for the app role)
- [ ] Sensitive photo/hint-answer reveals in the console are audited
- [ ] Removal/dispute decisions require a reason/note

## Dependencies and secrets

- [ ] `gitleaks detect` clean; hooks installed
- [ ] `pnpm audit --prod` and `pip-audit` reviewed; high findings fixed or documented
- [ ] Ultralytics AGPL flagged (RISK-006) and tracked before public deployment
- [ ] `.env.example` has no real values; secrets only in env/secret store
- [ ] Dependabot enabled for npm, pip, actions

## Infrastructure

- [ ] TLS everywhere; HSTS at the proxy; only the proxy is public
- [ ] DB/object storage/ML on the internal network
- [ ] Backups encrypted; restore drill performed
- [ ] `/metrics` internal only; `/readyz` does not leak secrets
- [ ] Error responses never include stack traces; `requestId` only

## Sign-off

| Date | Reviewer | Result | Findings |
|---|---|---|---|
| (fill at M2) | security-reviewer | | |
| (fill at M8) | security-reviewer | | |
