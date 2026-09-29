---
id: OPS-LOCALDEV
title: Local development setup
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["ARCH-STACK", "BE-11", "SEEDS"]
source_refs: ["Blueprint §4.8"]
---

# Local development setup

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 24 LTS | `node -v` |
| pnpm | 10.x | `corepack enable` then `corepack prepare pnpm@latest --activate` |
| Docker Desktop | current | for postgres+pgvector, minio, mailpit, ml |
| uv | latest | Python ML service (`pip install uv` or the installer) |
| gitleaks | latest | pre-commit hook |
| lefthook | via pnpm | `pnpm dlx lefthook install` |

## First run

```bash
git clone https://github.com/HanifIsya/temuUNAIR-v2.git
cd temuUNAIR-v2
pnpm i --frozen-lockfile
cp .env.example .env            # then fill anything missing (defaults work for dev)
docker compose -f infra/docker-compose.yml up -d   # postgres, minio, mailpit, ml
pnpm db:migrate
pnpm seed                       # synthetic demo data
pnpm dev                        # web on :3000
pnpm dev:worker                 # worker in a second terminal
```

## Ports

| Service | Port | URL |
|---|---|---|
| Web | 3000 | http://localhost:3000 |
| Postgres | 5432 | `postgres://temuunair:temuunair@localhost:5432/temuunair` |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO console | 9001 | http://localhost:9001 (`minioadmin`/`minioadmin`) |
| Mailpit UI | 8025 | http://localhost:8025 |
| ML service | 8000 | http://localhost:8000/health |

## Common commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm dev:worker` | pg-boss worker |
| `pnpm gate` / `pnpm gate:full` | quality gates |
| `pnpm contracts:build` | regenerate OpenAPI/client/MSW |
| `pnpm db:migrate` / `pnpm db:check` | migrations |
| `pnpm seed` | demo data |
| `pnpm test:unit` / `test:integration` / `test:e2e` | test layers |
| `cd services/ml && uv run pytest -q` | ML tests |
| `cd services/ml && uv run uvicorn app.main:app --reload` | ML service outside compose |

## Dev login

- Google OAuth is configured with a dev client id; if not available, use the dev magic-link
  provider with a seeded `@example.test` address (`loser@example.test`, `finder@example.test`,
  `mod.a@example.test`, `admin@example.test`).
- The dev env adds `example.test` to `AUTH_ALLOWED_DOMAINS` locally only.

## ML modes

| Mode | Behaviour |
|---|---|
| `ML_MODE=stub` | deterministic vectors, no model download — used for E2E and most dev |
| `ML_MODE=real` | real models; first run downloads them (see `services/ml/README.md`) |

## Troubleshooting

| Symptom | Fix |
|---|---|
| `pnpm` not found | `corepack enable` |
| Postgres port busy | stop the other instance or change the port in `.env` + compose |
| Migrations fail on a fresh DB | ensure the pgvector image is used (`pgvector/pgvector:pg16`) |
| Uploads fail | check MinIO is up and `S3_*` in `.env` matches compose credentials |
| Emails not arriving | Mailpit UI :8025; check `SMTP_URL` |
| ML health `degraded` | models not downloaded; run the download script or use `ML_MODE=stub` |
| `contracts:check` fails | run `pnpm contracts:build` and commit generated files (contract PR only) |
| gitleaks blocks a commit | remove the secret, rotate it, re-commit — never `--no-verify` |
| Wrong remote | `git remote set-url origin https://github.com/HanifIsya/temuUNAIR-v2.git` |

## Resetting

```bash
docker compose -f infra/docker-compose.yml down -v   # drops volumes (data loss)
pnpm db:migrate && pnpm seed
```

## Working in a worktree

Each Orca/git worktree needs its own `pnpm i` and its own `.env` copy. Only one compose stack is
assumed per host for dev; use the same ports across worktrees or override them per worktree.
