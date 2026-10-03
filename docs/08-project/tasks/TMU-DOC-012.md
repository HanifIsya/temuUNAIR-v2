---
id: TMU-DOC-012
title: Review and approve information architecture and user flows
status: DONE
lane: docs
slug: review-ia-flows
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [IA, FLOWS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-012 — Review and approve information architecture and user flows

## Goal

Review `docs/02-design/04-information-architecture.md` and `05-user-flows.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/04-information-architecture.md`, `05-user-flows.md`.
- Blueprint §4 requires: IA — sitemap, navigation model (top nav desktop / bottom nav mobile),
  URL scheme; FLOWS — Mermaid flows: report lost, report found, match review, claim, handover,
  admin moderation (mirrors the PDF's 8-step diagram).
- The URL scheme here must agree with `docs/03-architecture` route/FE-01 material where it
  exists; Mermaid blocks must parse (same standard the gate's docs rely on elsewhere).

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] All Mermaid diagrams parse; every flow named in the Blueprint row exists.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/04-information-architecture.md`
- `docs/02-design/05-user-flows.md`
- `docs/08-project/tasks/TMU-DOC-012.md`
- `docs/08-project/reviews/TMU-DOC-012.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-012-review-ia-flows` created from `main` (`9c00998`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit IA against Blueprint §4 (sitemap, navigation model, URL scheme, content hierarchy, deep-link targets), bump status to approved; 2) Audit FLOWS against Blueprint §4 (all 6 required flows + dispute resolution + edge flows, parse Mermaid diagrams), refresh source_refs to proposal §D figure via extract, bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-012; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | IA: verified sitemap, navigation model, URL scheme, deep-link targets, status approved; FLOWS: verified 6 core flows + dispute resolution + edge flows, all Mermaid diagrams parsed, refreshed source_refs to §D figure via extract, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-012.md`; IA + FLOWS meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and diagram syntax checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-012.md`

## Blockers

(none)
