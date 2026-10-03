---
id: TMU-ARC-006
title: Review and approve ML Service Design (06-ml-service-design.md)
status: TODO
lane: ml
slug: review-ml-service-design
milestone: M2
priority: P2
owner: ml-dev
deps: [TMU-DOC-020]
refs: [ML-DESIGN, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-006 — Review and approve ML Service Design (06-ml-service-design.md)

## Goal

Review `docs/03-architecture/06-ml-service-design.md` against Blueprint §4.4 (model choices, preprocessing,
batching, CPU budget, model registry, lockfile, warm-up), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] CPU-only ViT-B/32 and YOLO-n resource budgets and warm-up procedures are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
