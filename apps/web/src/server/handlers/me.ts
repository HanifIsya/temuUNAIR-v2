// apps/web/src/server/handlers/me.ts
// API-ME-01 (GET), API-ME-02 (PATCH), API-ME-03 (DELETE /me, 202).

import { DomainError, ErrorCode } from "../errors";
import { getDeletionQueue } from "../services/deletion-queue";
import { getMe, requestAccountDeletion, updateMe } from "../services/me";
import { dispatch } from "./dispatch";

export { dispatch };

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
