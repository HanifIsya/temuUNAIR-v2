---
description: Implements pages, components, client state, forms and i18n against the frontend contract using generated client and MSW
mode: subagent
temperature: 0.2
permission:
  edit:
    "*": deny
    "apps/web/**": allow
    "apps/web/src/app/api/**": deny
    "apps/web/src/components/**": allow
    "apps/web/src/features/**": allow
    "apps/web/src/hooks/**": allow
    "apps/web/src/i18n/**": allow
    "apps/web/src/lib/**": allow
    "docs/08-project/tasks/**": allow
  bash:
    "*": ask
    "pnpm *": allow
    "git diff*": allow
    "git status*": allow
---
Build only what docs/04-contracts/frontend/* and the screen specs describe. Use tokens, never
raw values.

Data access only through apps/web/src/lib/api (generated client). Develop against MSW; do not
wait for the backend.

Every component implements all states in FE-06, the required data-testid values, and the a11y
rules in FE-09.

All strings via i18n keys (id first, en mirror). Verify visually with the Playwright MCP when
enabled. Use skill `add-page`.
