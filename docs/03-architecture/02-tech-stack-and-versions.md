---
id: ARCH-STACK
title: Tech stack and pinned versions
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-OVERVIEW"]
source_refs: ["Blueprint §2", "DEC-002", "DEC-011", "DEC-013"]
---

# Tech stack and pinned versions

> **Action (M2, TMU-ARC-001):** verify each version against current releases before M3 and
> update this table. Versions below are the intended majors; the lockfiles are the real pin.

## Runtime and tooling

| Layer | Choice | Version (intended) | Why |
|---|---|---|---|
| Package manager | pnpm workspaces | pnpm 10.x | fast, strict, workspace protocol |
| Monorepo build | Turborepo | 2.x | caching + task graph |
| Node | Node.js LTS | 24.x (CI) | current LTS at M0 |
| TS | TypeScript | 5.x, `strict: true` | safety across FE/BE/contracts |
| Python | CPython | 3.11 | ML libs compatibility |
| Python deps | uv | latest | lockfile + speed |
| Lint/format TS | ESLint (flat) + Prettier | latest | one style |
| Lint Python | Ruff | latest | lint + format |
| Hooks | lefthook | latest | fast git hooks |
| Commit lint | commitlint | latest | Conventional Commits |
| Secrets | gitleaks | latest | pre-commit + CI |

## Application

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Web framework | Next.js App Router | 15.x | PDF: Next.js |
| UI | React | 19.x | ships with Next 15 |
| Styling | Tailwind CSS | 4.x | PDF: Tailwind |
| Components | shadcn/ui on Radix | latest | accessible primitives |
| Forms | react-hook-form + `@hookform/resolvers` | latest | zodResolver |
| Server state | TanStack Query | 5.x | caching, polling |
| i18n | next-intl | 3.x | `id` default, `en` |
| Validation/contracts | Zod | 3.x | single source (P2) |
| API client | openapi-fetch + openapi-typescript | latest | generated from contracts |
| ORM | Drizzle ORM + drizzle-kit | latest | typed SQL, forward migrations |
| Queue | pg-boss | 10.x | Postgres-only queue (DEC-013) |
| Auth | Auth.js (NextAuth v5) | 5.x | Google provider + DB sessions (DEC-001) |
| Dates | date-fns / Temporal polyfill | latest | `Asia/Jakarta` rendering |
| Logging | pino | 9.x | structured, redacted |
| Email | nodemailer | 6.x | SMTP; Mailpit in dev |

## Database and storage

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Database | PostgreSQL | 16 | DEC-002 |
| Vectors | pgvector | 0.7+ | HNSW indexes, `vector(512)`/`vector(384)` |
| Case-insensitive text | citext | bundled | emails |
| Object storage | MinIO (dev) / S3-compatible (prod) | latest | presigned URLs |
| Image processing | sharp | latest | EXIF strip, thumbnails, masking |

## ML service

| Layer | Choice | Version | Notes |
|---|---|---|---|
| API | FastAPI + uvicorn | latest | stateless |
| Detection | ultralytics YOLO (small) | pinned in `models.lock.json` | AGPL — RISK-006, ADR-0009 |
| Image embeddings | open_clip ViT-B/32 | pinned | 512-d, L2-normalised |
| Multilingual text↔image | sentence-transformers multilingual CLIP-aligned | pinned | DEC-003, ADR-0004 |
| Text↔text | sentence-transformers multilingual (e.g. MiniLM multilingual) | pinned | 384-d |
| Numerics | numpy, torch (CPU) | pinned | CPU budget §17 |
| Eval | scikit-learn, pandas | latest | Recall@k, MRR |

## Testing

| Layer | Tool | Notes |
|---|---|---|
| Unit/component | Vitest + Testing Library + jest-axe | FE + BE services |
| API integration | Vitest + testcontainers | real Postgres |
| Contract | `expectMatchesContract` + Schemathesis | fuzz OpenAPI + ML OpenAPI |
| E2E | Playwright | `ML_MODE=stub` |
| Python | pytest + ruff | ML service |
| Load (later) | k6 | optional M8 |

## Infrastructure

| Layer | Choice | Notes |
|---|---|---|
| Local infra | Docker Compose | postgres, minio, mailpit, ml |
| CI | GitHub Actions | jobs per §7.10 |
| Observability | pino logs + optional Sentry | no PII |
| Hosting | TBD (DEC-011) | compose or managed |

## Upgrade policy

1. Dependencies update via Dependabot PRs; security patches merge fast.
2. Major upgrades require an ADR when they affect contracts, runtime or ML outputs.
3. ML model or version changes bump `algo_version` and require an eval report (`tune-matching`).
4. Node/Python runtime changes are announced in `docs/08-project/changelog.md`.
