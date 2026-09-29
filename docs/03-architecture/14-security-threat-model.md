---
id: THREAT-MODEL
title: Security threat model (STRIDE)
status: draft
owner: SR
updated: 2026-09-29
depends_on: ["ARCH-OVERVIEW", "NFR", "ARCH-AUTH", "ARCH-MEDIA"]
source_refs: ["Blueprint §9", "DEC-014", "DEC-017", "DEC-018"]
---

# Security threat model

STRIDE per trust boundary (TB-1..TB-6 in `01-system-overview.md`), plus abuse cases specific to
a lost-and-found service. Every mitigation maps to a requirement or task; the runnable checklist
is `docs/06-quality/07-security-checklist.md`.

## TB-1 Browser ↔ web API

| Threat | Example | Mitigation |
|---|---|---|
| Spoofing | Stolen session cookie | httpOnly + Secure + SameSite=Lax; 30-day sliding; logout revokes; no tokens in JS |
| Tampering | Client sends `reporterId`/`status` fields | Zod schemas strip unknown fields; server derives identity from session |
| Repudiation | User denies cancelling a report | audit row for state changes by staff; user actions logged with requestId |
| Information disclosure | IDOR on `/reports/{id}` / `/claims/{id}` | ownership/party checks in services; `NOT_FOUND` for hidden resources; no email/geo/embeddings in public payloads |
| Denial of service | Flood report creation | rate limits (§5A.13), IP limits, body size caps |
| Elevation of privilege | User calls admin endpoints | `requireRole()` per handler; campus scoping; DB constraints; UI hiding is cosmetic |

## TB-2 Web ↔ object storage

| Threat | Example | Mitigation |
|---|---|---|
| Spoofing | Attacker uploads to another user's key | presigned PUT scoped to a fresh UUID key, content-type, size |
| Tampering | Malicious file masquerading as JPEG | magic-byte check on complete; decode via `sharp` only |
| Information disclosure | Guessing object URLs | private bucket; signed GET with short TTL; unguessable keys |
| DoS | Huge uploads / decompression bombs | 8 MB cap; dimension caps; sharp limits; per-user upload quota |
| Privacy | EXIF GPS leak | strip all metadata on ingest; never store the original |

## TB-3 Worker ↔ ML service

| Threat | Example | Mitigation |
|---|---|---|
| Spoofing | Rogue caller to ML | bearer `ML_SERVICE_TOKEN`; service not publicly exposed |
| SSRF | `imageUrl` pointing to internal host | allowlist our storage host; reject redirects; size/time caps |
| Information disclosure | Image/text logged | no logging of payloads; structured logs exclude bodies |
| Tampering | Model swap | `models.lock.json` checksums verified at startup |

## TB-4 Services ↔ database

| Threat | Example | Mitigation |
|---|---|---|
| Injection | SQL via query params | Drizzle parameterised queries; no string SQL from user input |
| Credential theft | Secrets in repo | gitleaks hooks + CI; env-only secrets; least-privilege DB role |
| Repudiation | Editing audit rows | `REVOKE UPDATE, DELETE` on `audit_logs` for the app role |
| Disclosure | Backup leak | encrypted backups; restore drill; access limited to admins |

## TB-5 Admin ↔ system

| Threat | Example | Mitigation |
|---|---|---|
| Elevation | Moderator acts on another campus | campus scoping enforced in queries |
| Abuse of power | Unmasking sensitive photos silently | two-step disclosure + audit log of reveals |
| Repudiation | Dispute decision without trace | mandatory note; audit row with before/after |
| Self-lockout | Admin demotes self | `FORBIDDEN` on self-demotion |

## TB-6 Notification/email out

| Threat | Example | Mitigation |
|---|---|---|
| Disclosure | Hint answer in email | payload discipline (`ARCH-NOTIF`); template review; no free text |
| Spam | Notification flood | dedupe keys, rate limits, digest batching, per-type mute |
| Phishing lookalike | Fake TemuUNAIR email | consistent sender, no links to external domains, no credential asks |

## Abuse cases (product-specific)

| # | Abuse | Controls |
|---|---|---|
| A1 | Fraudulent claim on a valuable item | hidden-detail challenge; 3 rejections → block; quotas; dispute path; audit |
| A2 | Posting someone's KTM/ATM photo publicly | `isSensitive` masking + generalized text; drop-point advice; moderation |
| A3 | Scraping the catalog for resale leads | login-only browsing (DEC-018); rate limits; no bulk export endpoints |
| A4 | Harassment via chat | claim-bound chat (no cold DMs); rate limits; report path; suspension |
| A5 | Enumeration of users/reports | opaque UUIDs; `NOT_FOUND` semantics; no user search for non-admins |
| A6 | Spam reports to poison matching | rate limits; flag threshold; moderation; dedupe by sha256 |
| A7 | Moderator leaks hint answers | confidentiality rules; audit trail; two-person review for sensitive disputes (`OPEN`) |

## Residual risks and open items

| # | Item | Severity | Owner |
|---|---|---|---|
| S-1 | OCR owner-notify feature would add high-risk PII processing — gated by legal review (DEC-014) | high | Legal |
| S-2 | No dedicated abuse-reporting flow for chat users in MVP (only claim disputes/flags) | medium | AR |
| S-3 | Production hosting/secret management still TBD (DEC-011) | medium | Advisor |
| S-4 | Ultralytics AGPL licence (RISK-006) | medium | SR |

## Review cadence

- Full STRIDE review at M2 (this document) and again at M8 hardening.
- Any new endpoint or trust boundary update requires a security-reviewer pass (skill: `/review` +
  `security-reviewer` agent) before merge.
- Findings tracked in `docs/08-project/reviews/` and the security checklist.
