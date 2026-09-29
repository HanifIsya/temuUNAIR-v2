---
id: OPS-DEPLOY
title: Deployment runbook
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["DEPLOYMENT", "WF-RELEASE", "OPS-BACKUP"]
source_refs: ["Blueprint §7.11"]
---

# Deployment runbook

Human-triggered, always with a pre-migration backup. Production target is TBD (DEC-011); the
steps are written for the single-host compose plan and adapt to managed services.

## Pre-flight checklist

- [ ] Release tag created (`v0.x.y`) on `main` with `gate:full` green
- [ ] Changelog updated; migration rollback notes reviewed
- [ ] Secrets present in the host secret store / `.env` (no changes needed unless listed)
- [ ] Backup completed and verified (see `03-backup-restore.md`)
- [ ] Maintenance window agreed if downtime is expected (schema changes usually need it)

## Deploy steps

1. **Fetch and build images**
   ```bash
   git fetch --tags && git checkout v0.x.y
   docker build -f infra/docker/web.Dockerfile   -t temuunair-web:v0.x.y .
   docker build -f infra/docker/worker.Dockerfile -t temuunair-worker:v0.x.y .
   docker build -f infra/docker/ml.Dockerfile    -t temuunair-ml:v0.x.y .
   ```
2. **Backup** — `bash scripts/backup.sh` (DB dump + bucket sync); verify sizes.
3. **Migrate** — `pnpm db:migrate` with the production `DATABASE_URL`; stop on any error.
4. **Restart** — worker first (drain: stop accepting, finish in-flight), then web, then ml if
   changed. Compose: `docker compose up -d --no-deps worker web ml`.
5. **Smoke tests**
   - `curl -fsS https://<host>/healthz` → `{"status":"ok"}`
   - `curl -fsS https://<host>/readyz` → all `ok` (ml may be `degraded` without blocking)
   - login with a staging account; create a report; confirm it appears in `/me/reports`
   - confirm a seeded match still appears (matching path)
   - check Mailpit/provider for a test notification
6. **Post-deploy** — note the deploy in `docs/08-project/changelog.md`; watch logs for 15 min
   (error rate, queue depth, ML latency).

## Rollback

| Situation | Action |
|---|---|
| App regression, no migration | redeploy the previous image tag |
| Migration applied, reversible | apply the migration's rollback note |
| Migration applied, not reversible | restore the pre-migration backup (documented data-loss window) |
| ML model regression | pin the previous `models.lock.json` and restart ml |

After any rollback: incident entry (`05-incident-response.md`) + a follow-up task.

## Zero-downtime notes

- Web/worker are stateless; restarting one at a time avoids downtime.
- Migrations must be **additive** to allow mixed versions during the rollover (expand →
  deploy → contract pattern). Destructive migrations require an explicit maintenance window.
- pg-boss jobs continue across worker restarts (durable).

## Verification queries

```sql
-- queue health
SELECT name, COUNT(*) FROM pgboss.job WHERE state IN ('created','retry') GROUP BY name;
-- stuck reports
SELECT COUNT(*) FROM reports WHERE needs_reprocess;
-- recent signups (smoke)
SELECT COUNT(*) FROM users WHERE created_at > now() - interval '1 hour';
```

## Environment-specific notes

| Env | Notes |
|---|---|
| Staging | seeded demo data; safe to reset; use for UAT |
| Production | no seeds; `NODE_ENV=production`; `ML_MODE=real`; TLS only |

## Ownership

| Step | Owner |
|---|---|
| Tag / release decision | human (project owner) |
| Build + migrate + restart | human operator |
| Smoke tests | human + one agent (read-only checks) |
| Rollback decision | human + architect |
