---
id: TMU-ARC-011
title: Review and approve Notification Design (11-notification-design.md)
status: TODO
lane: arch
slug: review-notification-design
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-NOTIF, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-011 — Review and approve Notification Design (11-notification-design.md)

## Goal

Review `docs/03-architecture/11-notification-design.md` against Blueprint §4.4 (channels, deduplication,
batching, user preferences), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] In-app vs email routing, dedupe key generation, and daily digest windows are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
