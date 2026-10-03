---
id: TMU-ARC-010
title: Review and approve Auth and RBAC (10-auth-and-rbac.md)
status: TODO
lane: arch
slug: review-auth-rbac
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-AUTH, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-010 — Review and approve Auth and RBAC (10-auth-and-rbac.md)

## Goal

Review `docs/03-architecture/10-auth-and-rbac.md` against Blueprint §4.4 (session model, domain allowlist,
role matrix, suspension), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] Complete RBAC matrix across USER, campus MODERATOR, and ADMIN is documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
