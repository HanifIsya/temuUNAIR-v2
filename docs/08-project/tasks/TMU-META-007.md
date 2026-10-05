---
id: TMU-META-007
title: File the M3 task breakdown (TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006)
status: DONE
lane: meta
slug: file-m3-backlog
milestone: M3
priority: P1
owner: orchestrator
deps: [TMU-CTR-007]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-META-007 — File the M3 task breakdown (TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006)

## Goal

Decompose the roadmap M3 row ("Walking skeleton": auth, DB migrations, upload handshake,
report create/read, `/home` shell, seeds, docker compose up; key tasks
`TMU-DB-001..005, TMU-BE-001..008, TMU-FE-001..006`) into task files so
`scripts/next-task.mjs` can drive M3 deterministically — the mirror of `TMU-META-004`
for M1. Also records the M2-exit handoffs that M3 planning must honour.

## Context

- M2 exit evidence is in `TMU-CTR-007` (M2 100%): 66-operation contract at `CONTRACT_VERSION`
  1.1.0, all architecture docs approved, `gate:full` green.
- Carried handoffs that M3 tasks must absorb (from `TMU-CTR-007`/`TMU-CTR-008` reviews):
  1. `tests/contract/run-contract.mjs` mock serves only the four M0 GET routes — real handler
     work in `TMU-BE-*` must extend it (Schemathesis 404/405 warnings close when handlers exist).
  2. BE-05 (post-`TMU-CTR-006`) lands per-table: `reports` + `needs_reprocess` + FTS trigger in
     the reports migration; chat/claims indexes in the claims migration; notifications/audit/
     flags indexes in the messaging migration.
  3. `DEC-021` (real UNAIR domains) and `DEC-022` (drop points) are due in M3: dev allowlist +
     magic-link fallback (DEC-001) and synthetic "contoh" drop points stand until confirmed.
  4. Contract-doc front-matter (`BE-*`/`FE-*` still `draft`) needs a governance sweep before the
     M3 gate; filed as `TMU-META-008` (`TMU-DOC-021..024` are reserved for M9 course-report work).

## Filed by this task

| ID | Title | Lane | Priority | Deps |
|---|---|---|---|---|
| TMU-DB-001 | Core tables migration: users, Auth.js adapter, locations, drop_points | db | P1 | TMU-CTR-007 |
| TMU-DB-002 | Reports base migration: reports, report_images, verification_hints | db | P1 | TMU-DB-001 |
| TMU-DB-003 | Reports additions + matching: needs_reprocess, FTS trigger, features, matches (BE-05 §TMU-DB-003) | db | P1 | TMU-DB-002 |
| TMU-DB-004 | Claims/chat migration: claims (+partial uniques), claim_answers, messages (+BE-05 §TMU-DB-004 indexes) | db | P1 | TMU-DB-003 |
| TMU-DB-005 | Ops migration: notifications, prefs, flags, audit_logs (+BE-05 §TMU-DB-005 indexes), M3 seed data | db | P1 | TMU-DB-004 |
| TMU-BE-001 | Server config + env validation (BE-11) and error envelope mapping (BE-01/BE-04) | be | P1 | TMU-DB-005 |
| TMU-BE-002 | Auth: Auth.js + Google OAuth, domain allowlist, DB sessions, magic-link dev fallback (BE-09, DEC-001/021) | be | P1 | TMU-BE-001 |
| TMU-BE-003 | ME + preferences handlers (API-ME-01..05) with RBAC middleware | be | P1 | TMU-BE-002 |
| TMU-BE-004 | Upload handshake (API-UPL-01..03): presign, magic-byte + size validation, complete | be | P1 | TMU-BE-003 |
| TMU-BE-005 | META handlers (API-META-01..04) incl. synthetic "contoh" drop points (DEC-022) | be | P1 | TMU-BE-003 |
| TMU-BE-006 | Report create/read (API-REP-01/02/04) + owner views; visibility + masking mappers | be | P1 | TMU-BE-004, TMU-BE-005 |
| TMU-BE-007 | report.process job + ML client with `needs_reprocess`/`ML_MODE=stub` (BE-07, BE-06) | be | P1 | TMU-BE-006 |
| TMU-BE-008 | Idempotency + rate-limit middleware, Schemathesis mock upgrade to real handlers (BE-01/BE-12, TMU-CTR-007 handoff) | be | P1 | TMU-BE-007 |
| TMU-FE-001 | Login flow: landing → Google OAuth → callback, auth error page (SCR-001/002) | fe | P1 | TMU-BE-002 |
| TMU-FE-002 | App shell: bottom/top nav, locale switcher, notification bell slot (SCR-003 frame, IA) | fe | P1 | TMU-FE-001 |
| TMU-FE-003 | Report wizard step 1–2: category + photos with upload hooks (SCR-004, FE-05) | fe | P1 | TMU-BE-004, TMU-FE-002 |
| TMU-FE-004 | Report wizard step 3–5 + review/submit; draft autosave (SCR-004) | fe | P1 | TMU-FE-003 |
| TMU-FE-005 | Browse list + report detail (mobile-first) via generated client (SCR-005/006, FE-04) | fe | P1 | TMU-BE-006, TMU-FE-002 |
| TMU-FE-006 | Home dashboard: my-reports summary + CTAs, seed demo pass (SCR-003) | fe | P1 | TMU-FE-005 |
| TMU-META-008 | Contract-doc governance sweep: BE-*/FE-* status, traceability rows, M2 evidence index | meta | P2 | TMU-CTR-008 |
| TMU-OPS-034 | M3 compose bring-up: web + worker + postgres + minio healthy, migrate+seed on boot (roadmap "docker compose up") | ops | P1 | TMU-DB-005, TMU-BE-008 |
| TMU-QA-001 | M3 demo scenarios E2E-01..03: login, create LOST/FOUND report, read back (walking skeleton gate) | qa | P1 | TMU-FE-006, TMU-OPS-034 |

Deps notes: the `db` lane serialises naturally (one migration PR open at a time, Blueprint §7.3 —
`next-task.mjs` skips db tasks while any `agent/db/*` branch exists). BE tasks 002..008 follow the
ME→UPL→REP pipeline; FE tasks mirror BE availability; OPS-034 turns the roadmap's compose line into
a verified deliverable (infra is ops lane, not QA's); QA-001 closes the demo gate.

## Acceptance criteria

- [x] The 22 files above exist under `docs/08-project/tasks/` with scheduler-required front-matter
      (`id`, `title`, `status`, `lane`, `slug`, `milestone`, `priority`, `owner`, `deps`), IDs
      matching filenames, single-line `deps: [...]` arrays.
- [x] Every `lane` is one of the lanes in `.agent/lanes.json`; every `deps` entry references an
      existing task ID; the chain is acyclic.
- [x] `node scripts/backlog-index.mjs` regenerates `backlog.md`/`status.md` and
      `node scripts/next-task.mjs` returns `TMU-DB-001`.
- [x] Only `docs/08-project/**` files change.
- [x] `pnpm gate` green.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/meta/TMU-META-007-file-m3-backlog` created from `main` (`49d8b27`); status → `IN_PROGRESS`; dep `TMU-CTR-007` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | Decompose roadmap M3 row per BE-05 (per-table migrations post-CTR-006), BE-03/BE-09 handler order and FE-01 screen order; fold M2-exit handoffs (mock-server upgrade into BE-008, DEC-021/022 fallbacks into BE-002/005, contract-doc sweep into META-008, compose bring-up into new OPS-034 — infra/ is ops lane and "docker compose up" is an unowned M3 roadmap deliverable); file 22 task files |
| 2026-10-03 | orchestrator | 4 LANE AUDIT | DoR #6 sweep vs `.agent/lanes.json` (the MAJOR class `REV-TMU-META-004` caught): BE-001 `.env.example` and BE-002 `lib/auth.ts`/`middleware.ts`/`v1/auth` routes were out-of-lane → replaced with in-lane paths + explicit handoff rows; QA-001 compose boot moved to OPS-034; META-008 traceability path corrected to `docs/08-project/traceability-matrix.md`; QA file renamed QA-006 → QA-001 (roadmap reserves QA-010+ elsewhere); BE-007 H2 title ID corrected |
| 2026-10-03 | orchestrator | 5 GREEN | 22 files created (DB×5, BE×8, FE×6, META-008, OPS-034, QA-001) + this file; front-matter audit script: IDs match filenames, all deps resolvable, acyclic; backlog regenerated to 94 tasks; next-task returns TMU-DB-001 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` (lane check green incl. all new files; 140/140 unit; contracts 1.1.0) |

## Evidence

- Red: N/A — backlog decomposition task; ACs are file/index invariants verified by the
  front-matter audit script (IDs==filenames, deps resolvable, acyclic) + `backlog-index.mjs`
- Green: `pnpm gate:quick` → `OK gate(quick) passed`; `node scripts/next-task.mjs` → `TMU-DB-001`; audit: `front-matter + deps OK, acyclic, all files` (94 tasks)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-META-007.md`

## Blockers

(none)
