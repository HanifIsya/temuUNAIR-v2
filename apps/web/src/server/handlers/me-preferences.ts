// apps/web/src/server/handlers/me-preferences.ts
// API-ME-04 (GET), API-ME-05 (PUT /me/notification-preferences).

import { DomainError, ErrorCode } from "../errors";
import { getPrefs, setPrefs } from "../services/me";
import { dispatch } from "./me";

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
    const prefs = await getPrefs(repo, userId);
    return json(prefs, requestId);
  });
}

export async function PUT(request: Request): Promise<Response> {
  return dispatch(request, true, async ({ request: req, repo, userId, requestId, now }) => {
    const body = await readJson(req);
    const prefs = await setPrefs(repo, userId, body, { now, requestId });
    return json(prefs, requestId);
  });
}
