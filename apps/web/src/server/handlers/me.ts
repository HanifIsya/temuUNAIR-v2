// apps/web/src/server/handlers/me.ts
// API-ME-01 (GET), API-ME-02 (PATCH), API-ME-03 (DELETE /me, 202).

import { assertMutationCsrf } from "../auth/csrf";
import { requireSessionUser } from "../auth/request-user";
import { getDb } from "../db";
import { DomainError, ErrorCode, toErrorResponse } from "../errors";
import { generateRequestId } from "../logging";
import { PgMeRepository } from "../repositories/me";
import { getDeletionQueue } from "../services/deletion-queue";
import { getMe, requestAccountDeletion, updateMe } from "../services/me";

interface DispatchInput {
  request: Request;
  repo: PgMeRepository;
  userId: string;
  requestId: string;
  now: Date;
}

/**
 * Shared handler wrapper: X-Request-Id → auth (BE-09 rule 1) → CSRF for
 * mutations → business run → BE-01 envelope on failure.
 */
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
    return Response.json(toErrorResponse(err, requestId), {
      status,
      headers: { "X-Request-Id": requestId },
    });
  }
}

function json(body: unknown, requestId: string, status = 200): Response {
  return Response.json(body, { status, headers: { "X-Request-Id": requestId } });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new DomainError(ErrorCode.VALIDATION_FAILED, "Body must be valid JSON", {
      fields: [],
    });
  }
}

export async function GET(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ repo, userId, requestId }) => {
    const me = await getMe(repo, userId);
    return json(me, requestId);
  });
}

export async function PATCH(request: Request): Promise<Response> {
  return dispatch(request, true, async ({ request: req, repo, userId, requestId, now }) => {
    const body = await readJson(req);
    const me = await updateMe(repo, userId, body, { now, requestId });
    return json(me, requestId);
  });
}

export async function DELETE(request: Request): Promise<Response> {
  return dispatch(request, true, async ({ repo, userId, requestId, now }) => {
    const result = await requestAccountDeletion(repo, getDeletionQueue(), userId, {
      now,
      requestId,
    });
    return json(result, requestId, 202);
  });
}
