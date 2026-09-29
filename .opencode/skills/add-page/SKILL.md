---
name: add-page
description: Recipe for implementing one frontend route/component against the frontend contract using generated client, MSW, tokens and i18n. Use when a task implements any route from FE-01 or a component from FE-03.
---

1. Read the route row in `docs/04-contracts/frontend/FE-01`, the page data requirements
   (`FE-02`) and the component contract (`FE-03`); check the screen spec
   (`docs/02-design/07-screen-specs/`). Missing spec → stop and file a blocker.
2. Implement data access in `apps/web/src/features/<area>/use*.ts` using the generated client
   (`lib/api`) and the query keys from `FE-04`. Components receive props only.
3. Build the UI with existing `CMP-###` components; new components must implement every state in
   `FE-06`, the a11y rules in `FE-09`, and the testids in `FE-12`.
4. Use tokens only (`FE-07`); no raw hex/px/font names.
5. Add every string to `id.json` and `en.json` (`FE-08`); no literal UI text.
6. Write component tests: all states, keyboard path, zero axe violations; use generated MSW
   handlers, never hand-written shapes.
7. Run `pnpm gate` and verify visually with the Playwright MCP when enabled.

Checklist:
- [ ] Loading / empty / error / forbidden / offline states all implemented
- [ ] Query key + invalidation match `FE-04`; optimistic updates only where allowed
- [ ] Error mapping per `FE-11` (409 → refetch, 429 → countdown, 5xx → requestId)
- [ ] `data-testid`s on interactive elements
- [ ] No raw `fetch("/api/v1/…")`
