---
id: TMU-ARC-005
title: Review and approve Matching Algorithm Spec (05-matching-algorithm-spec.md)
status: TODO
lane: arch
slug: review-matching-algorithm-spec
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [MATCH-SPEC, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-005 — Review and approve Matching Algorithm Spec (05-matching-algorithm-spec.md)

## Goal

Review `docs/03-architecture/05-matching-algorithm-spec.md` against Blueprint §4.4 (hard filters, candidate
retrieval, scoring formula, weights, thresholds, explanations, cold-start, sensitive rules), fix findings,
and advance status to `approved`.

## Acceptance criteria

- [ ] Scoring weights, thresholds (STRONG/POSSIBLE), and explanation logic are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
