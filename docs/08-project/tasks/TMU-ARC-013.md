---
id: TMU-ARC-013
title: Review and approve Search Design (13-search-design.md)
status: TODO
lane: arch
slug: review-search-design
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-SEARCH, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-013 — Review and approve Search Design (13-search-design.md)

## Goal

Review `docs/03-architecture/13-search-design.md` against Blueprint §4.4 (text search with Postgres FTS
`simple` config, image search, filters, ranking), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] Text search dictionary choices (`simple` for Indonesian), vector similarity queries, and ranking are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
