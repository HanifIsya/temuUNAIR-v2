---
id: WF-SECRETS
title: Secrets and environment handling
status: draft
owner: SR
updated: 2026-09-29
depends_on: ["BE-11", "DEPLOYMENT"]
source_refs: ["NFR-025", "DEC-017"]
---

# Secrets and environment handling

## Rules

1. **No secret in git.** `.env` is gitignored; `.env.example` documents names and dev defaults
   only. gitleaks runs pre-commit (`lefthook.yml`) and in CI (`secret-scan`).
2. **No secret in logs.** pino redaction covers cookies, authorization headers, and any field
   named `secret`, `token`, `key`, `password`, `dsn`, `url` with credentials
   (`15-privacy-and-data-retention.md`).
3. **No secret in tests.** Fixtures use dummy values; testcontainers generate their own.
4. **No secret in CI output.** Never `echo $SECRET`; GitHub masks known secrets, but do not rely
   on it.
5. **Least privilege.** The app DB role has no `UPDATE/DELETE` on `audit_logs`; the storage
   bucket is private; the ML token only opens `/v1/*`.

## Where secrets live

| Environment | Storage |
|---|---|
| Local dev | `.env` (created from `.env.example`) |
| CI | GitHub Actions secrets (only `GITHUB_TOKEN`, optional `TURBO_*`) |
| Staging/production | host secret store or root-owned `.env` with `600` permissions |

See `BE-11-env-config-contract.md` for the full variable list and which are secret.

## Rotation

| Secret | Cadence | Procedure |
|---|---|---|
| `AUTH_SECRET` | quarterly / on incident | rotate, restart web (sessions invalidate — announce) |
| `AUTH_GOOGLE_SECRET` | quarterly / on incident | rotate in Google console + env |
| `S3_ACCESS_KEY`/`S3_SECRET_KEY` | quarterly | rotate in storage console + env |
| `ML_SERVICE_TOKEN` | quarterly | rotate in ML env + worker env together |
| `SMTP_URL` credentials | on provider change | |
| `FIELD_ENCRYPTION_KEY` | rarely | **requires a re-encryption migration** — `OPEN` procedure (D-3) |
| `SENTRY_DSN` | on project change | |

Rotation checklist: update the secret store → restart affected services → verify `/readyz` →
note the rotation in the ops log → if leaked, treat as an incident
(`05-incident-response.md`).

## If a secret is committed

1. **Rotate immediately** (assume it is public).
2. Write a blocker/incident entry.
3. Remove from history with the human's help (`git filter-repo`); force-push only with explicit
   human approval on the affected branches.
4. Add a gitleaks rule or pre-commit improvement if the pattern was missed.

## `.env.example` discipline

- Every variable in `BE-11` appears with a safe dev default or an empty value.
- Comments explain purpose and mark secrets.
- Adding a variable requires updating: `BE-11`, `.env.example`, and the Zod config schema in the
  same PR (`BE-11` rule 7).

## Verification

| Check | Command | When |
|---|---|---|
| No secrets staged | `gitleaks protect --staged` | pre-commit |
| No secrets in history | `gitleaks detect` | `gate:full` + CI |
| Redaction works | unit test on the logger config | per change |
| Env validation | startup test with missing vars | per change |
