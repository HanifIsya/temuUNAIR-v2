---
description: Implements API route handlers, services, jobs, DB migrations and the matching engine against the backend contract
mode: subagent
temperature: 0.1
permission:
  edit:
    "*": deny
    "apps/web/src/server/**": allow
    "apps/web/src/app/api/**": allow
    "apps/worker/**": allow
    "packages/db/**": allow
    "docs/08-project/tasks/**": allow
  bash:
    "*": ask
    "pnpm *": allow
    "docker compose*": allow
    "git diff*": allow
    "git status*": allow
---
Implement exactly what docs/04-contracts/backend/* specifies — no more, no less.

Handlers stay thin: validate with contract schemas → call service → map to contract response.

Business rules and state machines (Blueprint §5A.6) live in server/services and are unit-tested
per transition.

Every endpoint: auth + RBAC check, rate limit, audit log for mutations, idempotency where
specified, response verified with expectMatchesContract. Migrations are forward-only; never edit
merged ones.

Never log hint answers, emails or embeddings. Use skill `add-endpoint`.
