---
id: ADR-0002
title: Next.js route handlers as the API layer
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ADR-0001", "ARCH-OVERVIEW"]
source_refs: ["Blueprint §2"]
---

# ADR-0002 — Next.js route handlers as the API layer

## Context

The PDF specifies Next.js for the frontend. The platform needs a REST API for the web app
(and later a possible mobile client), plus a separate worker.

## Options

1. **Separate API service** (NestJS/Fastify) + Next.js frontend. Clean separation, but two
   deployments, duplicated auth, more infra for a course-scale project.
2. **Next.js route handlers under `/api/v1`** with services in `src/server/*`. One deployment,
   shared types, Auth.js integration, still a real REST surface.
3. **tRPC** — great DX but couples client and server tightly and complicates the generated
   OpenAPI/Schemathesis contract story the blueprint requires.

## Decision

Option 2. Thin route handlers validate with contract Zod schemas, delegate to
`src/server/services/*`, and map to contract responses. The API is versioned at `/api/v1` and
described by generated OpenAPI.

## Consequences

- One auth/session implementation shared by UI and API.
- The worker imports the same `packages/db` and services where safe, so business rules are not
  duplicated.
- Contract tests and Schemathesis run against the Next.js server.
- Risk: Next.js runtime quirks (edge vs node) — mitigated by forcing the Node runtime for API
  routes and by keeping handlers thin.
- A future standalone API would be a lift-and-shift of `src/server/*`; the ADR is revisited if
  mobile apps need a different backend.
