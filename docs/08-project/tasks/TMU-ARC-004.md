---
id: TMU-ARC-004
title: Review and approve State Machines (04-state-machines.md)
status: TODO
lane: arch
slug: review-state-machines
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-STATES, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-004 — Review and approve State Machines (04-state-machines.md)

## Goal

Review `docs/03-architecture/04-state-machines.md` against Blueprint §4.4 (Report, Claim, Match
state machines with guards and side effects), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] All three state machines (Report R1–R12, Claim C1–C9, Match M1–M4) are documented with guards and side effects.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
