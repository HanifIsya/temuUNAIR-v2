// apps/web/src/server/handlers/uploads.ts
// API-UPL-01 (POST /uploads), API-UPL-02 (POST /uploads/{id}/complete),
// API-UPL-03 (GET /uploads/{id}). TMU-BE-008: POST /uploads composes the
// BE-01 idempotency middleware (outer) around the BE-12 rate tier (inner).

import { z } from "zod";
import { getDb } from "../db";
import {
  fingerprint,
  readJsonBody,
  requireIdempotencyKey,
  withIdempotency,
} from "../middleware/idempotency";
import { withRateLimit } from "../middleware/rate-limit";
import { UPLOAD_INIT_RATE } from "../rate-limit";
import { PgUploadsRepository } from "../repositories/uploads";
import { completeUpload, getUploadState, initUpload } from "../services/uploads";
import { getStorage } from "../storage";
import { zodToValidationFailed } from "../validation";
import { dispatch } from "./dispatch";

const uploadInitSchema = z.object({
  mime: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  sha256: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),
});

function json(body: unknown, requestId: string, status = 200): Response {
  return Response.json(body, { status, headers: { "X-Request-Id": requestId } });
}

export async function POST(request: Request): Promise<Response> {
  return dispatch(request, true, async ({ request: req, userId, requestId, now }) => {
    const { text, raw } = await readJsonBody(req);
    const parsed = uploadInitSchema.safeParse(raw);
    if (!parsed.success) throw zodToValidationFailed(parsed.error);

    const idempotencyKey = requireIdempotencyKey(req);

    const repo = new PgUploadsRepository(getDb());
    const deps = { storage: getStorage() };
    const { value } = await withIdempotency(
      {
        scope: "POST /api/v1/uploads",
        subject: userId,
        key: idempotencyKey,
        bodyHash: fingerprint(text),
      },
      () =>
        withRateLimit([UPLOAD_INIT_RATE], userId, () =>
          initUpload(
            repo,
            deps,
            {
              userId,
              mime: parsed.data.mime,
              sizeBytes: parsed.data.sizeBytes,
              sha256: parsed.data.sha256,
            },
            now,
          ),
        ),
    );
    return json(value, requestId);
  });
}

interface IdContext {
  params: Promise<{ id: string }>;
}

export async function COMPLETE(request: Request, ctx: IdContext): Promise<Response> {
  const { id } = await ctx.params;
  return dispatch(request, true, async ({ userId, requestId }) => {
    const repo = new PgUploadsRepository(getDb());
    const deps = { storage: getStorage() };
    const state = await completeUpload(repo, deps, { userId, uploadId: id });
    return json(state, requestId);
  });
}

export async function GET_BY_ID(request: Request, ctx: IdContext): Promise<Response> {
  const { id } = await ctx.params;
  return dispatch(request, false, async ({ userId, requestId }) => {
    const repo = new PgUploadsRepository(getDb());
    const deps = { storage: getStorage() };
    const state = await getUploadState(repo, deps, { userId, uploadId: id });
    return json(state, requestId);
  });
}
