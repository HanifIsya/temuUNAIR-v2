---
id: TMU-ARC-003
title: Review and approve Data Model and ERD (03-data-model-erd.md)
status: TODO
lane: arch
slug: review-data-model-erd
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020, TMU-CTR-006]
refs: [ARCH-ERD, BE-05, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-003 — Review and approve Data Model and ERD (03-data-model-erd.md)

## Goal

Review `docs/03-architecture/03-data-model-erd.md` against Blueprint §4.4 (ERD mermaid, table purposes,
PII classification per column) and align with `BE-05` (TMU-CTR-006 resolution), then advance status to `approved`.

## Acceptance criteria

- [ ] Mermaid ERD matches BE-05 authoritative DDL.
- [ ] Table purposes and PII classifications are documented for each table.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
