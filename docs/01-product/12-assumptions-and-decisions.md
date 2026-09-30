---
id: DECISIONS
title: Assumptions and decisions (DEC table)
status: draft
owner: DK
updated: 2026-09-30
depends_on: ["BLUEPRINT", "PRD"]
source_refs: ["Blueprint §1.3", "docs/08-project/decisions-log.md"]
---

# Assumptions and decisions

Canonical source: **Blueprint §1.3**. This table mirrors it and is kept current by the
docs-keeper after every merge. Changing a default requires an ADR (`docs/03-architecture/adr/`).

| ID | Gap in the PDF | Default decision | Status | Confirmed by |
|---|---|---|---|---|
| DEC-001 | "Login with UNAIR identity" unspecified | Auth.js + Google OAuth, server-side allowlist `AUTH_ALLOWED_DOMAINS` (dev magic link for non-UNAIR testers) | **provisional — domains unconfirmed** | UNAIR DTI / advisor |
| DEC-002 | "MySQL/PostgreSQL" | PostgreSQL 16 + pgvector | accepted | Team |
| DEC-003 | CLIP text encoder is English-centric | Multilingual CLIP text encoder aligned to ViT-B/32 (verify model) + multilingual sentence encoder | provisional (ADR-0004) | ML owner |
| DEC-004 | "Verify ownership" has no mechanism | Hidden-detail challenge: 1–3 private prompts+answers; claimant answers; finder approves; admin arbitrates | accepted | Team |
| DEC-005 | Physical custody unspecified | `HELD_BY_FINDER` or `AT_DROP_POINT` (admin-managed) | provisional — real drop points needed | Stakeholders |
| DEC-006 | Roles: only "admin" | `USER`, `MODERATOR` (campus-scoped), `ADMIN` | accepted | Team |
| DEC-007 | Report lifetime unspecified | Auto-expire 90 days, warning day 76, 30-day renew grace (env-configurable) | accepted | Team |
| DEC-008 | Language | UI Bahasa Indonesia default, English secondary, i18n from day one | accepted | Team |
| DEC-009 | Communication channel | In-app chat only, text only, tied to a claim | accepted | Team |
| DEC-010 | Photo privacy | Strip EXIF (GPS), thumbnails, mask sensitive-category photos publicly | accepted | Team |
| DEC-011 | Hosting unspecified | Docker Compose dev/staging; prod TBD; ML on CPU | provisional | Advisor |
| DEC-012 | Matching authority | AI is suggestion only; never releases items or reveals private details | accepted | Team |
| DEC-013 | Async work | `pg-boss` on PostgreSQL; separate `apps/worker`; no Redis | accepted | Team |
| DEC-014 | Sensitive items carry identity-theft risk | `isSensitive` flag, masked photos, generalized description, ≥2 hints, moderator visibility; OCR owner-notify is stretch | provisional — legal review | Legal / DPO |
| DEC-015 | YOLO/COCO lacks campus classes | YOLO as crop helper only; full-image embedding fallback; CLIP zero-shot categories | accepted | ML owner |
| DEC-016 | Ultralytics YOLO is AGPL-3.0 | Acceptable for coursework; flagged RISK-006; re-evaluate before public deployment | provisional | Advisor |
| DEC-017 | Personal data law | UU PDP (27/2022) as design constraint; legal review before launch | accepted | UNAIR legal / DPO |
| DEC-018 | Public browsing | All browsing requires login; landing/help public | accepted | Team |
| DEC-019 | Who merges a green PR | Orchestrator holds merge authority at loop step 12; a human may still merge; breaking/irreversible contract or migration PRs stop for a human | accepted | Repo owner |

## How to change a decision

1. Write an ADR in `docs/03-architecture/adr/` (context → options → decision → consequences).
2. Update this table and `docs/08-project/decisions-log.md` (docs-keeper).
3. If the change touches a contract or schema, follow the `contract-change` skill and bump
   `CONTRACT_VERSION`.
4. Human gate: decisions affecting auth, privacy, matching thresholds or hosting require the
   named confirmer above.
