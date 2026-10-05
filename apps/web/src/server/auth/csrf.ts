// apps/web/src/server/auth/csrf.ts
// CSRF checks for mutating requests (BE-09 §CSRF): X-Requested-With + same-origin.

import { DomainError, ErrorCode } from "../errors";

/**
 * Reject mutating requests that do not carry both anti-CSRF markers:
 * `X-Requested-With: temuunair` and an `Origin` header matching the request host.
 * Throws FORBIDDEN (403) otherwise.
 */
export function assertMutationCsrf(request: Request): void {
  if (request.headers.get("x-requested-with") !== "temuunair") {
    throw new DomainError(ErrorCode.FORBIDDEN, "Missing X-Requested-With header");
  }
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new DomainError(ErrorCode.FORBIDDEN, "Missing Origin header");
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new DomainError(ErrorCode.FORBIDDEN, "Malformed Origin header");
  }
  if (originHost !== new URL(request.url).host) {
    throw new DomainError(ErrorCode.FORBIDDEN, "Cross-origin request rejected");
  }
}
