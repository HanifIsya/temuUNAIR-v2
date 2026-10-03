---
id: TMU-ARC-014
title: Review and approve Security Threat Model and Privacy (14-security-threat-model.md, 15-privacy-and-data-retention.md)
status: TODO
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

- [ ] STRIDE analysis across all trust boundaries and UU PDP data retention rules are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped on both documents.
- [ ] `pnpm gate:quick` green.
