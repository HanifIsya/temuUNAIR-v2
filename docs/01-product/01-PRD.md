---
id: PRD
title: Product Requirements Document — TemuUNAIR
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["BLUEPRINT", "SRC-README"]
source_refs: ["proposal.pdf §A/§B (pending extract)", "DEC-001..DEC-018", "Blueprint §1"]
---

# PRD — TemuUNAIR ("Lost Today, Found Together")

> **Draft note.** `docs/_source/proposal.pdf` is not in the repo yet. Goal wording (G1–G5),
> the PDF's feature names and the "Cara Kerja" step list are provisional reconstructions from
> Blueprint §1.2 and are marked `OPEN QUESTION` where the exact PDF wording matters. Do not
> treat quoted Indonesian labels as verbatim until `proposal-extract.md` exists.

## 1. Problem

Civitas akademika UNAIR loses everyday items across four campuses (A, B, C, Banyuwangi/FIKKIA)
and currently relies on scattered WhatsApp groups, Instagram stories and physical notice boards.
Consequences:

- Reports disappear in chat scroll; there is no single searchable place.
- Finders and losers rarely connect because nothing compares *text, photo, place and time*.
- Handovers happen over personal phone numbers with no verification and no record.
- Sensitive items (KTM, ATM cards, passports) get posted publicly with identity details visible.

## 2. Goals (PDF "Tujuan 1–5")

| ID | Goal | How we know it is met | Trace |
|---|---|---|---|
| G1 | Make reporting a lost or found item fast and effortless for civitas akademika | Median time-to-submit a report < 60 s on mobile | §11 |
| G2 | Automatically suggest likely matches using text + photo + location + time (AI) | Precision@5 of suggestions ≥ target on the eval set; match notifications delivered | §11, `07-ml-evaluation-plan.md` |
| G3 | Let both sides verify ownership and arrange a safe return inside the platform | ≥ X% of approved claims complete with two-sided confirmation; zero phone-number exposure | §11 |
| G4 | Give admins/moderators tools to verify, moderate and manage reports and places | Moderation queue SLA; 100% of flagged items actioned | §11, `06-admin-operations-guide.md` |
| G5 | Operate the platform lawfully and trustworthily (UU PDP) with campus-appropriate scope | Data inventory complete; deletion requests honoured; no PII leaks in audits | §9, `15-privacy-and-data-retention.md` |

`OPEN QUESTION` (blocks M1 approval): exact wording and priority of the five *Tujuan* from the
proposal PDF. Owner: spec-writer, source: `docs/_source/proposal-extract.md`.

## 3. Non-goals (MVP)

Native mobile apps · payments/rewards · automatic item release · public anonymous browsing ·
phone-number sharing · voice/video chat · multi-university tenancy · fine-tuning YOLO/CLIP
(stretch only). See Blueprint §1.4.

## 4. Personas

| ID | Persona | Primary jobs | Success looks like |
|---|---|---|---|
| `P-LOSER` | Student/staff who lost something | Report fast, get notified on a match, prove ownership, get the item back | Item returned without calling a stranger |
| `P-FINDER` | Student/staff who found something | Report with photo + custody, keep custody private-ish, verify the owner | Item handed over with confidence it went to the right person |
| `P-ADMIN` | Campus admin/moderator (added; PDF only says "admin", DEC-006) | Verify reports, resolve disputes, manage drop points, keep the service trustworthy | Queue empty, disputes resolved with a record |

Details: `03-personas.md`.

## 5. Scope by release

| Release | Contents | Milestone |
|---|---|---|
| **MVP** | AUTH (domain-restricted), REPORT (lost+found, photos, custody, hidden-detail hints), SEARCH (text+image+filters), MATCH (AI suggestions, STRONG/POSSIBLE), CLAIM (challenge → approve/reject → handover → returned), CHAT (text, polling), NOTIFICATION (in-app + email), MANAGE (my reports, cancel/renew), ADMIN (queue, flags, users, places, audit), i18n id/en, privacy controls | M3–M8 |
| **v1** | SSE chat, batch digest tuning, ML model refresh, analytics dashboard, refined eval, accessibility audit fixes | M9+ |
| **Later / stretch** | OCR "notify owner by name/NIM" (needs legal review, DEC-014), YOLO fine-tuning on campus classes (DEC-015), native app, multi-campus tenancy | post-launch |

## 6. Features (MoSCoW)

| ID | Feature | Priority | PDF source | Modules |
|---|---|---|---|---|
| F1 | *Pelaporan Barang* — report lost/found with photos, place, time, custody, hints | **Must** | Fitur 1 | REPORT, UPLOAD |
| F2 | *Pencarian & Pencocokan Barang* — browse/search + AI matching | **Must** | Fitur 2 | SEARCH, MATCH |
| F3 | *Komunikasi & Pengembalian Barang* — verification challenge, chat, handover | **Must** | Fitur 3 | CLAIM, CHAT, HANDOVER |
| F4 | *Manajemen Laporan* + admin verification/moderation | **Must** | Fitur 4 | MANAGE, ADMIN |
| — | Login with UNAIR identity | **Must** | Cara Kerja 1 | AUTH |
| — | Notifications | **Must** | Cara Kerja 5 | NOTIFICATION |
| — | Sensitive-item protection (masking, ≥2 hints) | **Must** | DEC-014 | REPORT, CLAIM |
| — | Analytics for success metrics | **Should** | §11 | ANALYTICS |
| — | OCR owner notification | **Won't (this release)** | DEC-014 stretch | — |
| — | YOLO fine-tuning | **Won't (this release)** | DEC-015 stretch | — |

## 7. Success metrics

See `11-success-metrics.md`. Headline: activation (first report within 24 h of login),
report→match rate, time-to-return (median days), precision@k on the eval set, claim success
rate, % of returns completed with two-sided confirmation.

## 8. Assumptions

1. UNAIR Google Workspace (or equivalent) accounts are available and their domains are known
   (DEC-001 — **unconfirmed**, `AUTH_ALLOWED_DOMAINS`).
2. Campus network/CPU-only hosting is sufficient at campus scale (DEC-011).
3. Drop points exist at security posts and their real list can be obtained (DEC-005).
4. Bahasa Indonesia is the default language of reports (DEC-008).
5. Users have smartphones with cameras and reasonable connectivity between classes.

## 9. Dependencies

| Dependency | Owner | Needed by | Fallback |
|---|---|---|---|
| Real UNAIR email domains | UNAIR DTI / advisor | M3 (AUTH) | Dev allowlist + magic link for testers (DEC-001) |
| Real drop points + hours | UNAIR stakeholders | M3 (seed data) | Synthetic drop points flagged "contoh" |
| Google OAuth client credentials | Team | M3 | Dev-only magic-link provider |
| Proposal PDF + logo in `docs/_source/` | Team | M1 approval | Docs stay `draft` |
| Eval dataset (labelled lost/found pairs) | ML owner | M5 (matching quality) | Synthetic pairs; metrics marked provisional |

## 10. Risks (summary)

Full register: `09-risk-register.md`. Top: false-positive matches erode trust (RISK-001),
PII leak of sensitive items (RISK-002), fraud/false claims (RISK-003), cold start with no data
(RISK-004), YOLO class gap (RISK-005), AGPL licence (RISK-006), CPU latency (RISK-007),
SSO availability (RISK-008), moderator workload (RISK-009).

## 11. Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| OQ-1 | Verbatim *Tujuan 1–5* and the PDF's "Cara Kerja" 8 steps | spec-writer | M1 approval |
| OQ-2 | Real UNAIR domains (DEC-001) | UNAIR DTI | M3 AUTH |
| OQ-3 | Drop-point list and operating hours (DEC-005) | Stakeholders | M3 seeds |
| OQ-4 | Which sensitive categories are prohibited from public listing entirely? (DEC-014) | Legal/DPO | M3 REPORT |
| OQ-5 | Production hosting target (DEC-011) | Advisor | M9 deploy |
