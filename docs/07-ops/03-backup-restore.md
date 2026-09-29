---
id: OPS-BACKUP
title: Backup and restore
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["DEPLOYMENT"]
source_refs: ["Blueprint §4.8"]
---

# Backup and restore

## What is backed up

| Asset | Method | Frequency | Retention | Location |
|---|---|---|---|---|
| PostgreSQL | `pg_dump --format=custom` + volume snapshot | daily 01:00 WIB | 14 days | off-host storage |
| Object storage | bucket sync (`mc mirror` / `aws s3 sync`) | daily 02:00 WIB | 14 days | second location |
| Secrets | encrypted export from the host secret store | on change | — | human-managed |
| Audit logs | included in the DB dump | daily | 12 months (in DB) | same as DB |

## Backup commands

```bash
# Postgres
pg_dump "$DATABASE_URL" --format=custom --no-owner \
  --file "backups/temuunair-$(date +%F).dump"

# Object storage (MinIO client example)
mc mirror --overwrite local/temuunair backups/temuunair-objects/$(date +%F)

# Verify
pg_restore --list "backups/temuunair-$(date +%F).dump" | head
```

Encrypt dumps at rest (`age`/`gpg`) before copying off-host; the key lives in the secret store,
never next to the dump.

## Restore drill (monthly, staging)

1. Provision a clean Postgres with pgvector.
2. `pg_restore --dbname "$STAGING_DATABASE_URL" --no-owner backups/<date>.dump`.
3. Run `pnpm db:migrate` to confirm the dump matches the expected schema version.
4. Restore a sample of objects; verify signed URLs resolve.
5. Boot the app against the restored DB; smoke test login + report read.
6. Record the drill: date, duration, issues, in this file's log below.

## Restore log

| Date | Operator | RTO observed | Issues | Notes |
|---|---|---|---|---|
| (first drill at M8) | | | | |

## Targets

| Metric | Target |
|---|---|
| RPO (max data loss) | ≤ 24 h |
| RTO (restore time) | ≤ 4 h |
| Drill frequency | monthly (staging) |

## Failure handling

| Failure | Action |
|---|---|
| Backup job failed | alert; re-run; if it fails twice, blocker + investigate disk/credentials |
| Corrupt dump | restore the previous day's dump; document the gap |
| Storage sync failed | re-run; check credentials and bucket policy |
| Accidental data deletion | restore to a scratch DB first, extract the needed rows, then apply surgically |

## Notes

- Deletion requests (UU PDP) mean backups may briefly contain data that should be gone; document
  the window (≤ 14 days) in the privacy notice and honour deletion in the live system
  immediately.
- Never restore a production dump onto a laptop with real user data; use staging and anonymized
  copies for debugging.
