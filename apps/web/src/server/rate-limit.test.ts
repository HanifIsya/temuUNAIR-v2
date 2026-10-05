import { afterEach, describe, expect, it } from "vitest";
import { createRateLimiter, isRateLimitEnabled, UPLOAD_INIT_RATE } from "./rate-limit";

// TMU-BE-004: BE-12 per-user rate limit for POST /uploads (30 per hour),
// keyed (scope, subject), bounded Retry-After, kill-switch via RATE_LIMIT_ENABLED.

const BASE = 1_780_000_000_000;

describe("upload rate limiter", () => {
  it("allows exactly 30 inits per hour for a user", () => {
    let now = BASE;
    const limiter = createRateLimiter({ now: () => now });

    for (let i = 0; i < UPLOAD_INIT_RATE.limit; i += 1) {
      const result = limiter.check(
        "uploads:init",
        "user-1",
        UPLOAD_INIT_RATE.limit,
        UPLOAD_INIT_RATE.windowMs,
      );
      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBe(0);
    }

    const blocked = limiter.check(
      "uploads:init",
      "user-1",
      UPLOAD_INIT_RATE.limit,
      UPLOAD_INIT_RATE.windowMs,
    );
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(3600);

    now += UPLOAD_INIT_RATE.windowMs + 1000;
    const afterWindow = limiter.check(
      "uploads:init",
      "user-1",
      UPLOAD_INIT_RATE.limit,
      UPLOAD_INIT_RATE.windowMs,
    );
    expect(afterWindow.allowed).toBe(true);
  });

  it("keeps subjects isolated", () => {
    const limiter = createRateLimiter({ now: () => BASE });
    for (let i = 0; i <= UPLOAD_INIT_RATE.limit; i += 1) {
      limiter.check("uploads:init", "user-1", UPLOAD_INIT_RATE.limit, UPLOAD_INIT_RATE.windowMs);
    }
    expect(
      limiter.check("uploads:init", "user-1", UPLOAD_INIT_RATE.limit, UPLOAD_INIT_RATE.windowMs)
        .allowed,
    ).toBe(false);
    expect(
      limiter.check("uploads:init", "user-2", UPLOAD_INIT_RATE.limit, UPLOAD_INIT_RATE.windowMs)
        .allowed,
    ).toBe(true);
  });

  it("keeps scopes isolated", () => {
    const limiter = createRateLimiter({ now: () => BASE });
    for (let i = 0; i <= UPLOAD_INIT_RATE.limit; i += 1) {
      limiter.check("uploads:init", "user-1", UPLOAD_INIT_RATE.limit, UPLOAD_INIT_RATE.windowMs);
    }
    expect(limiter.check("reports:create", "user-1", 10, 86_400_000).allowed).toBe(true);
  });

  it("decreases Retry-After as the window elapses", () => {
    let now = BASE;
    const limiter = createRateLimiter({ now: () => now });
    for (let i = 0; i <= UPLOAD_INIT_RATE.limit; i += 1) {
      limiter.check("uploads:init", "user-1", UPLOAD_INIT_RATE.limit, UPLOAD_INIT_RATE.windowMs);
    }
    const early = limiter.check(
      "uploads:init",
      "user-1",
      UPLOAD_INIT_RATE.limit,
      UPLOAD_INIT_RATE.windowMs,
    );
    now += 600_000;
    const later = limiter.check(
      "uploads:init",
      "user-1",
      UPLOAD_INIT_RATE.limit,
      UPLOAD_INIT_RATE.windowMs,
    );
    expect(later.retryAfterSeconds).toBeLessThan(early.retryAfterSeconds);
  });
});

describe("RATE_LIMIT_ENABLED kill-switch", () => {
  const original = process.env.RATE_LIMIT_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.RATE_LIMIT_ENABLED;
    else process.env.RATE_LIMIT_ENABLED = original;
  });

  it("is enabled by default", () => {
    delete process.env.RATE_LIMIT_ENABLED;
    expect(isRateLimitEnabled()).toBe(true);
  });

  it("honours RATE_LIMIT_ENABLED=false", () => {
    process.env.RATE_LIMIT_ENABLED = "false";
    expect(isRateLimitEnabled()).toBe(false);
  });

  it("honours RATE_LIMIT_ENABLED=true", () => {
    process.env.RATE_LIMIT_ENABLED = "true";
    expect(isRateLimitEnabled()).toBe(true);
  });
});
