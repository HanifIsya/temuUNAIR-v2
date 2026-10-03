---
id: TMU-ARC-012
title: Review and approve Chat Design (12-chat-design.md)
status: TODO
lane: arch
slug: review-chat-design
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-CHAT, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-012 — Review and approve Chat Design (12-chat-design.md)

## Goal

Review `docs/03-architecture/12-chat-design.md` against Blueprint §4.4 (scope, moderation, rate limits,
retention, SSE upgrade path), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] Chat thread scoping to claims, polling intervals, rate limits, and phase-2 SSE upgrade paths are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
