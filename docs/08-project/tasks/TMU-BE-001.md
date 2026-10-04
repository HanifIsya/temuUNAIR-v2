---
id: TMU-BE-001
title: Server config, env validation and typed error mapping (BE-11/BE-01/BE-04)
status: TODO
lane: be
slug: be-config-errors
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-005]
refs: [BE-01, BE-04, BE-11, NFR]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-BE-001 — Server config, env validation and typed error mapping (BE-11/BE-01/BE-04)

## Goal

Stand up `apps/web/src/server/config.ts` validating every `BE-11` env var at boot
(Zod, fail-fast with a named missing var), `requestId` generation/propagation
(`X-Request-Id` accepted or minted, echoed on every response, pino redaction list per
`15-privacy-and-data-retention.md`), and the domain-error → `BE-04` status/code mapping
helpers that route handlers will use. No business endpoints yet.

## Acceptance criteria

- [ ] Contract test asserts the error envelope shape for all 18 `BE-04` codes.
- [ ] Missing/invalid env fails boot with a named variable (never silent defaults for secrets).
- [ ] pino config redacts cookie/authorization/email/answer/body/token/password paths.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/server/config.ts`, `apps/web/src/server/errors.ts`, `apps/web/src/server/logging.ts`
- matching `**/*.test.ts`
- `docs/08-project/tasks/TMU-BE-001.md`

Handoff: if BE-11 adds a var, `.env.example` edit is ops-lane — record it here and file to a
follow-up ops task rather than editing out-of-lane.
