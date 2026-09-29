---
name: add-endpoint
description: Recipe for implementing one API endpoint against the backend contract, test-first. Use when a task implements or changes any API-* endpoint.
---

1. Read the endpoint row (API-ID) in `docs/04-contracts/backend/BE-03` and the schemas in
   `packages/contracts`. If anything is missing → stop (create a `TMU-CTR-*` contract task).
2. Write failing tests first:
   - unit: service rules, every state transition touched;
   - route: auth (401/403), validation (422), success shape via `expectMatchesContract(apiId,
     res)`, rate limit, idempotency, audit row.
3. Implement the service in `apps/web/src/server/services/<module>.ts`; keep the route handler
   thin (validate → service → map).
4. Enforce visibility rules (never leak existence: use `NOT_FOUND`) and strip private fields in
   the mapper, not in the handler.
5. Add the audit log + notification/job enqueue where the contract requires (`BE-07`, `BE-08`).
6. Run `pnpm gate`; then `pnpm test:contract` for this endpoint.
7. Update the task file Progress log with evidence (test names, commands, gate tail).

Checklist:
- [ ] `Idempotency-Key` handled where required (reports, claims, uploads)
- [ ] `If-Match`/version concurrency for `PATCH /reports/{id}`
- [ ] Rate limit per `BE-12`
- [ ] No hint answers, emails, embeddings or raw scores in responses
- [ ] Errors use `BE-04` codes; i18n `error.<code>` keys exist
