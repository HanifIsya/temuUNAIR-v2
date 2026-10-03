---
id: TMU-ARC-014
title: Review and approve Security Threat Model and Privacy (14-security-threat-model.md, 15-privacy-and-data-retention.md)
status: DONE
lane: sec
slug: review-security-privacy-arch
milestone: M2
priority: P2
owner: security-reviewer
deps: [TMU-DOC-020]
refs: [ARCH-SEC, ARCH-PRIVACY, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-014 — Review and approve Security Threat Model and Privacy (14-security-threat-model.md, 15-privacy-and-data-retention.md)

## Goal

Review `docs/03-architecture/14-security-threat-model.md` and `15-privacy-and-data-retention.md` against
Blueprint §4.4 (STRIDE per boundary, abuse cases, data inventory, retention periods, deletion flow, UU PDP notes),
fix findings, and advance status to `approved`.

## Acceptance criteria

- [x] STRIDE analysis across all trust boundaries and UU PDP data retention rules are documented.
- [x] Front-matter `status` is `approved`, with `updated:` bumped on both documents.
- [x] `pnpm gate:quick` green.

## Files expected to change

- `docs/03-architecture/14-security-threat-model.md`
- `docs/03-architecture/15-privacy-and-data-retention.md`
- `docs/08-project/tasks/TMU-ARC-014.md`
- `docs/08-project/reviews/TMU-ARC-014.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | orchestrator | filed | TMU-META-006 M2 backlog breakdown |
| 2026-10-03 | security-reviewer | 1 PICK | branch `agent/sec/TMU-ARC-014-review-security-privacy-arch` created from `main`; status → `IN_PROGRESS`; deps `TMU-DOC-020` DONE |
| 2026-10-03 | security-reviewer | 3 PLAN | 1) Audit 14-security-threat-model.md and 15-privacy-and-data-retention.md against Blueprint §4.4 (STRIDE TB-1..6, abuse cases A1-A7, data inventory, minimisation rules, deletion flows, pino redaction); 2) Advance status to approved and updated to 2026-10-03 on both; 3) Run pnpm gate:quick; 4) Write review REV-TMU-ARC-014; 5) Ship |
| 2026-10-03 | security-reviewer | 5 GREEN | Verified STRIDE mitigations per boundary TB-1..6, 7 abuse cases, UU PDP data inventory, minimisation rules, deletion flows, and pino redaction; advanced status to approved on both documents and bumped updated to 2026-10-03 |
| 2026-10-03 | security-reviewer | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-014.md` |
| 2026-10-03 | security-reviewer | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — architecture documentation review/approval task
- Green: `pnpm gate:quick` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-ARC-014.md`

## Blockers

(none)
