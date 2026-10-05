// apps/web/src/server/auth/session.ts
// Session helpers per BE-09: cookie parsing, status checks, error mapping.

import { DomainError, ErrorCode } from "../errors";

/** The __Secure- prefixed session cookie name (BE-09). */
export const SESSION_COOKIE_NAME = "__Secure-temuunair.session";

/**
 * Extract the session token from a Cookie header string.
 * Returns null if the cookie is absent or the header is empty/undefined.
 */
export function parseSessionToken(cookieHeader: string | undefined | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE_NAME) {
      return rest.join("=") || null;
    }
  }
  return null;
}

/** Minimal session user shape used for status checks (BE-09 SessionUser). */
interface SessionUserLike {
  id: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
}

/**
 * Check whether a session user is allowed to make requests.
 * Returns a DomainError for AUTH_REQUIRED or ACCOUNT_SUSPENDED,
 * or null when the user is active (BE-09).
 */
export function sessionErrorFor(user: SessionUserLike | null): DomainError | null {
  if (!user) {
    return new DomainError(ErrorCode.AUTH_REQUIRED, "No active session");
  }
  if (user.status !== "ACTIVE") {
    return new DomainError(ErrorCode.ACCOUNT_SUSPENDED, "Account is not active");
  }
  return null;
}
