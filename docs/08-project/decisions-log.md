---
id: DECISIONS-LOG
title: Decisions log
status: draft
owner: DK
updated: 2026-09-30
depends_on: ["DECISIONS", "ADR-README"]
source_refs: ["Blueprint §1.3, §4.9"]
---

# Decisions log

Chronological index of DEC entries (defaults from the blueprint) and ADRs (architectural
decisions). The DEC table source is `docs/01-product/12-assumptions-and-decisions.md`; ADRs live
in `docs/03-architecture/adr/`.

## DEC entries

| ID | Decision | Status | Confirmer | Recorded |
|---|---|---|---|---|
| DEC-001 | Auth.js + Google OAuth with domain allowlist | provisional (domains unconfirmed) | UNAIR DTI / advisor | 2026-09-29 |
| DEC-002 | PostgreSQL 16 + pgvector | accepted | Team | 2026-09-29 |
| DEC-003 | Multilingual CLIP-aligned text encoder | provisional (ADR-0004) | ML owner | 2026-09-29 |
| DEC-004 | Hidden-detail challenge for ownership verification | accepted | Team | 2026-09-29 |
| DEC-005 | Custody: held by finder / drop point | provisional (real drop points pending) | Stakeholders | 2026-09-29 |
| DEC-006 | Roles USER / MODERATOR / ADMIN | accepted | Team | 2026-09-29 |
| DEC-007 | 90-day TTL, day-76 warning, 30-day grace | accepted | Team | 2026-09-29 |
| DEC-008 | Bahasa Indonesia default, English secondary | accepted | Team | 2026-09-29 |
| DEC-009 | In-app chat only, tied to a claim | accepted | Team | 2026-09-29 |
| DEC-010 | EXIF strip, thumbnails, sensitive masking | accepted | Team | 2026-09-29 |
| DEC-011 | Docker Compose dev/staging; prod TBD; CPU ML | provisional | Advisor | 2026-09-29 |
| DEC-012 | AI is advisory only | accepted | Team | 2026-09-29 |
| DEC-013 | pg-boss on Postgres; separate worker; no Redis | accepted | Team | 2026-09-29 |
| DEC-014 | Sensitive categories: masking, ≥2 hints, moderator visibility | provisional (legal review) | Legal / DPO | 2026-09-29 |
| DEC-015 | YOLO as crop helper; full-image fallback | accepted | ML owner | 2026-09-29 |
| DEC-016 | Ultralytics AGPL acceptable for coursework, flagged | provisional | Advisor | 2026-09-29 |
| DEC-017 | UU PDP (27/2022) as a design constraint | accepted | UNAIR legal / DPO | 2026-09-29 |
| DEC-018 | Login required for all browsing | accepted | Team | 2026-09-29 |
| DEC-019 | Orchestrator holds merge authority at loop step 12; a human may still merge; breaking/irreversible contract or migration PRs stop for a human | superseded (on merge authority by DEC-020; no-approval-count stands) | Repo owner | 2026-09-30 |
| DEC-020 | Any agent may merge at loop step 12; a human may still merge; breaking/irreversible contract or migration PRs still stop for a human | accepted | Repo owner | 2026-09-30 |

## ADR entries

| ADR | Title | Status | Supersedes | Recorded |
|---|---|---|---|---|
| ADR-0001 | Monorepo with pnpm + Turborepo | accepted | — | 2026-09-29 |
| ADR-0002 | Next.js route handlers as the API | accepted | — | 2026-09-29 |
| ADR-0003 | PostgreSQL 16 + pgvector | accepted | — | 2026-09-29 |
| ADR-0004 | Multilingual CLIP-aligned text encoder | proposed | — | 2026-09-29 |
| ADR-0005 | pg-boss instead of Redis | accepted | — | 2026-09-29 |
| ADR-0006 | Auth.js + Google OAuth + domain allowlist | proposed | — | 2026-09-29 |
| ADR-0007 | Hidden-detail verification | accepted | — | 2026-09-29 |
| ADR-0008 | Presigned uploads + EXIF strip + masking | accepted | — | 2026-09-29 |
| ADR-0009 | YOLO crop helper + AGPL flag | accepted | — | 2026-09-29 |
| ADR-0010 | Polling-first chat, SSE later | accepted | — | 2026-09-29 |

## Change protocol

1. New decision → ADR (`/adr`) + row here + update the DEC table if it changes a default.
2. Contract/schema impact → `TMU-CTR-*` task and a `CONTRACT_VERSION` bump.
3. Human gate for decisions affecting auth, privacy, matching thresholds or hosting.
