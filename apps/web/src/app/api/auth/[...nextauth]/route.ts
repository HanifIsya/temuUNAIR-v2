// apps/web/src/app/api/auth/[...nextauth]/route.ts
// Auth.js v5 route handler (BE-09). Mounts at /api/auth/*.
// FR-AUTH-005: every successful sign-in cancels a pending account.delete job
// (re-login within the cool-off restores the account).

import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/server/auth/config";
import { getDb } from "@/server/db";
import { DomainError, ErrorCode, toErrorResponse } from "@/server/errors";
import { generateRequestId, logger } from "@/server/logging";
import { enforceAuthIpRate } from "@/server/middleware/rate-limit";
import { PgMeRepository } from "@/server/repositories/me";
import { getDeletionQueue } from "@/server/services/deletion-queue";
import { cancelPendingDeletion } from "@/server/services/me";

const { handlers } = NextAuth(
  getAuthOptions({
    onSignIn: (userId) => {
      cancelPendingDeletion(new PgMeRepository(getDb()), getDeletionQueue(), userId).catch(
        (err: unknown) => {
          logger.warn({ userId, err: String(err) }, "could not cancel pending account deletion");
        },
      );
    },
  }),
);

// TMU-BE-008 / BE-12: auth endpoints are limited to 20/minute per IP.
// The rate error is mapped to the BE-01 envelope here because this route
// sits outside handlers/dispatch.ts.
async function withAuthRateLimit(request: NextRequest): Promise<Response> {
  const requestId = generateRequestId(request.headers.get("X-Request-Id"));
  try {
    enforceAuthIpRate(request);
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
  return request.method === "POST" ? handlers.POST(request) : handlers.GET(request);
}

export { withAuthRateLimit as GET, withAuthRateLimit as POST };
