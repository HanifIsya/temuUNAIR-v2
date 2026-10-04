// apps/web/src/server/handlers/uploads.ts
// API-UPL-01 (POST /uploads), API-UPL-02 (POST /uploads/{id}/complete),
// API-UPL-03 (GET /uploads/{id}).

import { createHash } from "node:crypto";
import { z } from "zod";
import { getDb } from "../db";
import { DomainError, ErrorCode } from "../errors";
import { getIdempotencyStore } from "../idempotency";
import { getUploadLimiter } from "../rate-limit";
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
    const text = await req.text();
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, "Body must be valid JSON", {
        fields: [],
      });
    }
    const parsed = uploadInitSchema.safeParse(raw);
    if (!parsed.success) throw zodToValidationFailed(parsed.error);

    const idempotencyKey = req.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, "Idempotency-Key header is required", {
        fields: [{ path: "Idempotency-Key" }],
      });
    }
    const bodyHash = createHash("sha256").update(text).digest("hex");

    const repo = new PgUploadsRepository(getDb());
    const deps = { storage: getStorage(), limiter: getUploadLimiter() };
    const { value } = await getIdempotencyStore().run(
      { scope: "POST /api/v1/uploads", subject: userId, key: idempotencyKey, bodyHash },
      () =>
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
    const deps = { storage: getStorage(), limiter: getUploadLimiter() };
    const state = await completeUpload(repo, deps, { userId, uploadId: id });
    return json(state, requestId);
  });
}

export async function GET_BY_ID(request: Request, ctx: IdContext): Promise<Response> {
  const { id } = await ctx.params;
  return dispatch(request, false, async ({ userId, requestId }) => {
    const repo = new PgUploadsRepository(getDb());
    const deps = { storage: getStorage(), limiter: getUploadLimiter() };
    const state = await getUploadState(repo, deps, { userId, uploadId: id });
    return json(state, requestId);
  });
}
