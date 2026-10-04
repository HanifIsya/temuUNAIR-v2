// apps/web/src/server/middleware/rate-limit.ts
// TMU-BE-008: BE-12 rate-limit middleware. Endpoint tiers run *inside* the
// idempotency wrapper (replays never consume quota); IP tiers key on an HMAC
// of the client address (rule 1: subject = userId | ipHash) and every hit is
// logged with the scope only — never the address (rule 4).

import { createHmac } from "node:crypto";
import { DomainError, ErrorCode } from "../errors";
import { logger } from "../logging";
import {
  AUTH_IP_RATE,
  createRateLimiter,
  getAuthIpLimiter,
  getGlobalIpLimiter,
  GLOBAL_IP_RATE,
  isRateLimitEnabled,
  type RateLimiter,
} from "../rate-limit";

export interface RateTier {
  scope: string;
  limit: number;
  windowMs: number;
}

const endpointLimiter: RateLimiter = createRateLimiter();

function rateLimited(scope: string, retryAfterSeconds: number): DomainError {
  logger.warn({ scope }, "rate limit hit");
  return new DomainError(ErrorCode.RATE_LIMITED, "Rate limit exceeded", {
    scope,
    retryAfterSeconds,
  });
}

export async function withRateLimit<T>(
  rates: readonly RateTier[],
  subject: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (isRateLimitEnabled()) {
    for (const rate of rates) {
      const result = endpointLimiter.check(rate.scope, subject, rate.limit, rate.windowMs);
      if (!result.allowed) {
        throw rateLimited(rate.scope, result.retryAfterSeconds);
      }
    }
  }
  return fn();
}

/** BE-12 rule 1: IP subjects are hashed (HMAC-SHA256 with AUTH_SECRET). */
export function ipSubjectFor(ip: string): string | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(ip).digest("hex");
}

function forwardedFor(request: Request): string | null {
  const header = request.headers.get("x-forwarded-for");
  const first = header?.split(",")[0]?.trim();
  return first ? first : null;
}

function enforceIpTier(rates: readonly RateTier[], limiter: RateLimiter, request: Request): void {
  if (!isRateLimitEnabled()) return;
  const ip = forwardedFor(request);
  if (!ip) return;
  const subject = ipSubjectFor(ip);
  if (!subject) return;
  for (const rate of rates) {
    const result = limiter.check(rate.scope, subject, rate.limit, rate.windowMs);
    if (!result.allowed) {
      throw rateLimited(rate.scope, result.retryAfterSeconds);
    }
  }
}

/** BE-12: any endpoint, 300/minute per client IP. Wired in `dispatch`. */
export function enforceGlobalIpRate(request: Request): void {
  enforceIpTier([GLOBAL_IP_RATE], getGlobalIpLimiter(), request);
}

/** BE-12: auth endpoints (login/callback/magic link), 20/minute per IP. */
export function enforceAuthIpRate(request: Request): void {
  enforceIpTier([AUTH_IP_RATE], getAuthIpLimiter(), request);
}
