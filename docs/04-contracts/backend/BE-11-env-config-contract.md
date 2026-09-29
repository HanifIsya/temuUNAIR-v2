---
id: BE-11
title: Environment and configuration contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-01", "DEPLOYMENT"]
source_refs: ["Blueprint §5A.12", "NFR-025"]
---

# BE-11 — Environment contract

Mirrored in `.env.example`. Secrets are marked **(SECRET)** and must never appear in logs, git
or CI output (gitleaks enforced).

| Variable | Type | Default (dev) | Secret | Owner | Notes |
|---|---|---|---|---|---|
| `APP_BASE_URL` | url | `http://localhost:3000` | no | OR | absolute links in emails |
| `DATABASE_URL` | url | `postgres://temuunair:temuunair@localhost:5432/temuunair` | **yes** | AR | pgvector + pg-boss |
| `AUTH_SECRET` | base64 32B | dev-only value | **yes** | AR | Auth.js |
| `AUTH_GOOGLE_ID` | string | dev client id | **yes** | AR | OAuth client |
| `AUTH_GOOGLE_SECRET` | string | dev client secret | **yes** | AR | OAuth client |
| `AUTH_ALLOWED_DOMAINS` | csv | `unair.ac.id,student.unair.ac.id` | no | AR | **confirm real domains (DEC-001)** |
| `S3_ENDPOINT` | url | `http://localhost:9000` | no | AR | MinIO in dev |
| `S3_REGION` | string | `us-east-1` | no | AR | |
| `S3_BUCKET` | string | `temuunair-dev` | no | AR | private bucket |
| `S3_ACCESS_KEY` | string | `minioadmin` | **yes** | AR | |
| `S3_SECRET_KEY` | string | `minioadmin` | **yes** | AR | |
| `S3_PUBLIC_BASE_URL` | url | `http://localhost:9000/temuunair-dev` | no | AR | used only for signed URLs |
| `ML_SERVICE_URL` | url | `http://localhost:8000` | no | ML | |
| `ML_SERVICE_TOKEN` | string | dev token | **yes** | ML | bearer for `/v1/*` |
| `ML_MODE` | `stub\|real` | `stub` | no | ML | stub = deterministic vectors (tests/E2E) |
| `SMTP_URL` | url | `smtp://localhost:1025` | **yes** | OR | Mailpit in dev |
| `EMAIL_FROM` | string | `TemuUNAIR <no-reply@temuunair.local>` | no | OR | |
| `FIELD_ENCRYPTION_KEY` | base64 32B | dev-only value | **yes** | SR | AES-GCM for hint answers |
| `REPORT_TTL_DAYS` | int | `90` | no | AR | DEC-007 |
| `CLAIM_TTL_HOURS` | int | `72` | no | AR | claim expiry |
| `MATCH_THRESHOLD_STRONG` | float | `0.75` | no | ML | ADR/tuning |
| `MATCH_THRESHOLD_POSSIBLE` | float | `0.55` | no | ML | ADR/tuning |
| `RATE_LIMIT_ENABLED` | bool | `true` | no | AR | disabled only in unit tests |
| `LOG_LEVEL` | enum | `info` | no | OR | `debug\|info\|warn\|error` |
| `SENTRY_DSN` | url | empty | **yes** | OR | optional error reporting |
| `NEXT_PUBLIC_API_MOCKING` | `enabled\|disabled` | `disabled` | no | FE | MSW in dev/tests |
| `NEXT_PUBLIC_APP_URL` | url | `http://localhost:3000` | no | FE | client-side absolute links |

## Rules

1. **No secrets in git.** `.env` is gitignored; `.env.example` documents names and dev defaults
   only. gitleaks runs pre-commit and in CI.
2. Secrets are never logged: pino redaction covers cookies, authorization headers and any field
   named `secret`, `token`, `key` (`15-privacy-and-data-retention.md`).
3. `AUTH_ALLOWED_DOMAINS` is parsed as csv, trimmed, lowercased; empty list fails startup.
4. `FIELD_ENCRYPTION_KEY` must decode to exactly 32 bytes; startup fails otherwise. Rotation
   requires a re-encryption migration (`OPEN`: procedure, D-3 in `18-deployment-topology.md`).
5. `ML_MODE=stub` is forbidden in production (startup check when `NODE_ENV=production`).
6. Thresholds may only change with an eval report (`tune-matching`).
7. Every new env var requires: this table, `.env.example`, and a Zod validation entry in
   `apps/web/src/server/config.ts` — in the same PR.

## Startup validation

`apps/web/src/server/config.ts` (and the worker's equivalent) parse `process.env` with Zod at
boot and exit with a readable error listing missing/invalid variables. No handler reads
`process.env` directly.
