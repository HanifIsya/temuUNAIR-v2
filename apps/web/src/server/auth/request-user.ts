// apps/web/src/server/auth/request-user.ts
// requireSessionUser: BE-09 enforcement rule 1 (resolve session → status check →
// 30-day sliding extension) shared by every authenticated API handler.

import { DomainError, ErrorCode } from "../errors";
import type { MeRepository } from "../services/me";
import { parseSessionToken, sessionErrorFor } from "./session";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  moderatorCampus: string | null;
  locale: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
}

/** BE-09: 30-day sliding sessions, renewed when inside the last day. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SLIDING_THRESHOLD_MS = SESSION_TTL_MS - 24 * 60 * 60 * 1000;

export async function requireSessionUser(
  request: Request,
  repo: Pick<MeRepository, "findSessionUser" | "extendSession">,
  now: Date = new Date(),
): Promise<SessionUser> {
  const token = parseSessionToken(request.headers.get("cookie"));
  if (!token) {
    throw new DomainError(ErrorCode.AUTH_REQUIRED, "No active session");
  }
  const row = await repo.findSessionUser(token, now);
  if (!row) {
    throw sessionErrorFor(null) ?? new DomainError(ErrorCode.AUTH_REQUIRED, "No active session");
  }
  if (row.status !== "ACTIVE") {
    throw (
      sessionErrorFor({ id: row.id, status: row.status }) ??
      new DomainError(ErrorCode.ACCOUNT_SUSPENDED, "Account is not active")
    );
  }
  if (row.sessionExpires.getTime() < now.getTime() + SLIDING_THRESHOLD_MS) {
    await repo.extendSession(token, new Date(now.getTime() + SESSION_TTL_MS));
  }
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    moderatorCampus: row.moderatorCampus,
    locale: row.locale,
    status: row.status,
  };
}
