// apps/web/src/server/handlers/reports.ts
// TMU-BE-006: API-REP-01 (POST /reports), API-REP-02 (GET /reports),
// API-REP-04 (GET /reports/{id}). TMU-BE-008: POST /reports composes the
// BE-01 idempotency middleware (outer) around the BE-12 rate tiers (inner).

import { getDb } from "../db";
import {
  fingerprint,
  readJsonBody,
  requireIdempotencyKey,
  withIdempotency,
} from "../middleware/idempotency";
import { withRateLimit } from "../middleware/rate-limit";
import { REPORT_CREATE_RATES } from "../rate-limit";
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
    const { text, raw } = await readJsonBody(req);
    const idempotencyKey = requireIdempotencyKey(req);

    const config = parseReportConfig();
    const deps = {
      ...readDeps(),
      queue: getReportProcessQueue(),
      fieldEncryptionKey: config.fieldEncryptionKey,
      reportTtlDays: config.reportTtlDays,
    };
    const { value } = await withIdempotency(
      {
        scope: "POST /api/v1/reports",
        subject: userId,
        key: idempotencyKey,
        bodyHash: fingerprint(text),
      },
      () =>
        withRateLimit(REPORT_CREATE_RATES, userId, () => createReport(deps, raw, { userId, now })),
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
