// apps/web/src/server/handlers/dispatch.ts
// Shared handler wrapper: X-Request-Id → auth (BE-09 rule 1) → CSRF for
// mutations → business run → BE-01 envelope on failure.

import { assertMutationCsrf } from "../auth/csrf";
import { requireSessionUser } from "../auth/request-user";
import { getDb } from "../db";
import { DomainError, ErrorCode, toErrorResponse } from "../errors";
import { generateRequestId } from "../logging";
import { PgMeRepository } from "../repositories/me";

export interface DispatchInput {
  request: Request;
  repo: PgMeRepository;
  userId: string;
  requestId: string;
  now: Date;
}

export async function dispatch(
  request: Request,
  needsCsrf: boolean,
  run: (input: DispatchInput) => Promise<Response>,
): Promise<Response> {
  const requestId = generateRequestId(request.headers.get("X-Request-Id"));
  try {
    const repo = new PgMeRepository(getDb());
    const user = await requireSessionUser(request, repo);
    if (needsCsrf) {
      assertMutationCsrf(request);
    }
    return await run({ request, repo, userId: user.id, requestId, now: new Date() });
  } catch (err) {
    const status = err instanceof DomainError ? err.httpStatus : 500;
    const headers: Record<string, string> = { "X-Request-Id": requestId };
    if (err instanceof DomainError && err.code === ErrorCode.RATE_LIMITED) {
      const details = err.details as { retryAfterSeconds?: number } | undefined;
      if (typeof details?.retryAfterSeconds === "number") {
        headers["Retry-After"] = String(details.retryAfterSeconds);
      }
    }
    return Response.json(toErrorResponse(err, requestId), { status, headers });
  }
}
