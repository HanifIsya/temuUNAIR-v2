// apps/web/src/server/handlers/reports.ts
// TMU-BE-006: API-REP-01 (POST /reports), API-REP-02 (GET /reports),
// API-REP-04 (GET /reports/{id}).

import { createHash } from "node:crypto";
import { getDb } from "../db";
import { DomainError, ErrorCode } from "../errors";
import { getIdempotencyStore } from "../idempotency";
import { getReportLimiter, isRateLimitEnabled } from "../rate-limit";
import { PgReportsRepository } from "../repositories/reports";
import { getReportProcessQueue } from "../jobs/report-process";
import { createReport, getReportView, listReports } from "../services/reports";
import { parseReportConfig } from "../config";
import { getStorage } from "../storage";
import { dispatch } from "./dispatch";

function json(body: unknown, requestId: string, status = 200): Response {
  return Response.json(body, { status, headers: { "X-Request-Id": requestId } });
}

function readDeps() {
  return { repo: new PgReportsRepository(getDb()), storage: getStorage() };
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
    const idempotencyKey = req.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, "Idempotency-Key header is required", {
        fields: [{ path: "Idempotency-Key", key: "error.VALIDATION_FAILED.Idempotency-Key" }],
      });
    }
    const bodyHash = createHash("sha256").update(text).digest("hex");

    const config = parseReportConfig();
    const deps = {
      ...readDeps(),
      queue: getReportProcessQueue(),
      limiter: getReportLimiter(),
      fieldEncryptionKey: config.fieldEncryptionKey,
      reportTtlDays: config.reportTtlDays,
      isRateLimitEnabled,
    };
    const { value } = await getIdempotencyStore().run(
      { scope: "POST /api/v1/reports", subject: userId, key: idempotencyKey, bodyHash },
      () => createReport(deps, raw, { userId, now }),
    );
    return json(value, requestId, 201);
  });
}

export async function GET_LIST(request: Request): Promise<Response> {
  return dispatch(request, false, async ({ userId, requestId }) => {
    const page = await listReports(readDeps(), {
      params: new URL(request.url).searchParams,
      viewerId: userId,
    });
    return json(page, requestId);
  });
}

interface IdContext {
  params: Promise<{ id: string }>;
}

export async function GET_BY_ID(request: Request, ctx: IdContext): Promise<Response> {
  const { id } = await ctx.params;
  return dispatch(request, false, async ({ userId, role, moderatorCampus, requestId }) => {
    const view = await getReportView(readDeps(), {
      reportId: id,
      viewer: { userId, role, moderatorCampus },
    });
    return json(view, requestId);
  });
}
