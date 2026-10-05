---
id: NFR
title: Non-functional requirements
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "BE-11", "FE-09", "06-performance-budget"]
source_refs: ["Blueprint §2, §9", "DEC-007", "DEC-011", "DEC-013", "DEC-017", "DEC-018"]
---

# Non-functional requirements

Non-functional requirement targets serve as **concrete budgets agents must design and test against**,
not aspirations. Performance, reliability, security, privacy and accessibility budgets are enforced
in CI and the project gate.

## Performance

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-001 | The system shall serve read APIs at p95 ≤ 300 ms (server time, excl. network) | 300 ms | `06-performance-budget.md` |
| NFR-002 | The system shall serve write APIs at p95 ≤ 500 ms excluding queued work | 500 ms | Matching is async |
| NFR-003 | The system shall render the landing and report detail pages with LCP ≤ 2.5 s on 4G mobile | 2.5 s | Budget in quality doc |
| NFR-004 | The system shall answer ML `analyze-image` in ≤ 3 s p95 on CPU (single image, ViT-B/32 + YOLO-n) | 3 s | Warm-up required |
| NFR-005 | The system shall deliver the initial JS bundle ≤ 250 kB gzip per route | 250 kB | Measured in CI |
| NFR-006 | The system shall paginate every list endpoint (max 50/page) and cap match suggestions at top-10 per report | — | Prevents unbounded reads |

## Availability and reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-010 | The web app shall be available ≥ 99.0% monthly (coursework hosting) | 99.0% |
| NFR-011 | Background jobs shall be idempotent and retried with exponential backoff; failures land in a dead-letter state | 3 retries |
| NFR-012 | `GET /readyz` shall report `db`, `storage` and `ml` status; the app shall degrade gracefully when ML is down (`needs_reprocess`, not 5xx) | — |
| NFR-013 | The system shall not lose user submissions on transient failures: `POST /reports` and `/claims` require `Idempotency-Key` | 24 h window |

## Security

| ID | Requirement | Notes |
|---|---|---|
| NFR-020 | The system shall enforce authn on every non-public route and authz per the RBAC matrix; hidden resources return `NOT_FOUND`, never `FORBIDDEN` | IDOR prevention |
| NFR-021 | The system shall store hint answers AES-GCM-encrypted with `FIELD_ENCRYPTION_KEY` and never log them | DEC-004 |
| NFR-022 | The system shall validate uploads by magic bytes, strip EXIF (GPS), and serve images only through scoped signed URLs | DEC-010 |
| NFR-023 | The system shall rate-limit per §5A.13 and set `Retry-After` on 429 | |
| NFR-024 | The system shall keep an append-only audit log for privileged mutations | UU PDP accountability |
| NFR-025 | The system shall pass `gitleaks` with zero findings and keep dependencies free of known high-severity advisories (or document an exception) | AGPL noted (RISK-006) |
| NFR-026 | The system shall set `httpOnly`, `Secure`, `SameSite=Lax` cookies plus same-origin `Origin` checks on mutations | CSRF |

## Privacy (UU PDP — Law 27/2022, DEC-017)

| ID | Requirement | Notes |
|---|---|---|
| NFR-030 | The system shall collect only the data listed in the data inventory (`15-privacy-and-data-retention.md`) and use it only for lost-and-found matching and communication | Purpose limitation |
| NFR-031 | The system shall hide exact geolocation of sensitive items and never expose other users' emails | |
| NFR-032 | The system shall honour deletion requests: 7-day cool-off, then anonymize account, remove images, keep audit stubs | FR-AUTH-005 |
| NFR-033 | The system shall retain reports for `REPORT_TTL_DAYS` (default 90) + 30-day renew grace, then expire; chat messages follow the claim lifecycle + retention policy | DEC-007 |
| NFR-034 | The system shall require login for all browsing to reduce scraping | DEC-018 |
| NFR-035 | The system shall publish a privacy notice and terms; legal review required before launch | `13-legal-privacy-drafts.md` |

## Accessibility

| ID | Requirement | Notes |
|---|---|---|
| NFR-040 | The system shall meet WCAG 2.2 AA on all user-facing flows | `10-accessibility.md`, `FE-09` |
| NFR-041 | The system shall be fully keyboard-operable, including photo upload and location selection | alternative "pilih dari daftar" |
| NFR-042 | The system shall never convey status by colour alone; yellow is accent-only (dark text on yellow) | contrast rules |
| NFR-043 | The system shall honour `prefers-reduced-motion` and provide touch targets ≥ 44×44 px | mobile-first |

## Internationalisation

| ID | Requirement |
|---|---|
| NFR-050 | The system shall support `id` (default) and `en` locales with no hard-coded UI strings |
| NFR-051 | The system shall format dates/times in `Asia/Jakarta` and use ICU plurals |
| NFR-052 | The system shall fail CI when a translation key is missing, unused, or an error code lacks `error.<code>` |

## Browser and device support

| ID | Requirement |
|---|---|
| NFR-060 | The system shall support the last 2 versions of Chrome, Safari, Firefox, Edge (desktop + mobile) |
| NFR-061 | The system shall be usable from 360 px width up (mobile-first); primary device is a phone |

## Scalability and capacity

| ID | Requirement | Assumption |
|---|---|---|
| NFR-070 | The system shall support 5,000 registered users, 2,000 active reports, 500 matches/day, 20 concurrent users | Coursework scale |
| NFR-071 | The system shall keep ML on CPU with a worker concurrency that bounds p95 latency at load | DEC-011 |
| NFR-072 | The system shall run all async work through `pg-boss` on Postgres (no Redis) | DEC-013 |

## Maintainability and observability

| ID | Requirement |
|---|---|
| NFR-080 | The system shall pass `pnpm gate` (lint, typecheck, unit, contracts, i18n, migrations) on every PR |
| NFR-081 | The system shall emit structured logs with `requestId`/`jobId` and redact PII; logs never contain hint answers, emails, embeddings |
| NFR-082 | The system shall expose `/healthz` and `/readyz`, and metrics/logs sufficient for the alerts in `04-monitoring-and-alerts.md` |
| NFR-083 | The system shall keep generated artifacts (OpenAPI, client, MSW) reproducible via `contracts:check` |
