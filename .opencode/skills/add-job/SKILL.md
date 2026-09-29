---
name: add-job
description: Recipe for a new pg-boss queue or handler in apps/worker. Use for any background work (matching, notifications, sweeps, cleanup).
---

1. Add the queue row to `docs/04-contracts/backend/BE-07` (payload, trigger, behaviour, retry)
   — a new queue is a contract change (`TMU-CTR-*`).
2. Define the payload Zod schema in `packages/contracts` and validate at enqueue **and** consume.
3. Implement the handler in `apps/worker/src/jobs/<queue>.ts`:
   - idempotent (safe to run twice);
   - singleton key where ordering matters (`reportId`, `userId`);
   - classify retryable vs non-retryable errors;
   - log `jobId`, entity id, `durationMs`, `attempt`.
4. Register the queue with the correct retry/backoff and cron schedule (WIB).
5. Tests: unit for handler logic; integration for enqueue → run → DB assertions, including a
   double-run idempotency test.
6. Update `ARCH-JOBS` if behaviour differs from the doc.

Checklist:
- [ ] Payload schema exported from contracts and used in tests
- [ ] Dead-letter behaviour documented (e.g. `needs_reprocess`)
- [ ] No PII in logs or payloads
- [ ] Cron schedules use `Asia/Jakarta`
