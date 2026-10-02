---
id: TMU-DOC-012
title: Review and approve information architecture and user flows
status: TODO
lane: docs
slug: review-ia-flows
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [IA, FLOWS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
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

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] All Mermaid diagrams parse; every flow named in the Blueprint row exists.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/04-information-architecture.md`
- `docs/02-design/05-user-flows.md`
- `docs/08-project/tasks/TMU-DOC-012.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
