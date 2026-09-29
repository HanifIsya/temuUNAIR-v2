#!/usr/bin/env bash
# Backup Postgres + object storage (docs/07-ops/03-backup-restore.md).
# Usage: DATABASE_URL=... scripts/backup.sh [output-dir]
set -euo pipefail

OUT="${1:-backups}"
STAMP="$(date +%F-%H%M)"
mkdir -p "$OUT"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

echo "Backing up Postgres -> $OUT/temuunair-$STAMP.dump"
pg_dump "$DATABASE_URL" --format=custom --no-owner --file "$OUT/temuunair-$STAMP.dump"
pg_restore --list "$OUT/temuunair-$STAMP.dump" >/dev/null && echo "dump verified"

if [ -n "${S3_ENDPOINT:-}" ] && command -v mc >/dev/null 2>&1; then
  echo "Syncing object storage -> $OUT/objects-$STAMP"
  mkdir -p "$OUT/objects-$STAMP"
  mc mirror --overwrite "local/${S3_BUCKET:-temuunair-dev}" "$OUT/objects-$STAMP"
fi

echo "Backup complete: $OUT (remember to encrypt before moving off-host)"
