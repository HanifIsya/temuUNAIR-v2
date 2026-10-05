// apps/web/src/server/middleware/rate-limit.test.ts
// TMU-BE-008: BE-12 rate-limit middleware — endpoint tiers throw 429-shaped
// RATE_LIMITED with Retry-After details, hits are logged with the scope only,
// and the IP tiers key on a hash (never the raw address).

import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError, ErrorCode } from "../errors";
import { logger } from "../logging";
import { AUTH_IP_RATE, GLOBAL_IP_RATE, getAuthIpLimiter, getGlobalIpLimiter } from "../rate-limit";
import { enforceAuthIpRate, enforceGlobalIpRate, ipSubjectFor, withRateLimit } from "./rate-limit";

const ORIGINAL_ENABLED = process.env.RATE_LIMIT_ENABLED;
const ORIGINAL_SECRET = process.env.AUTH_SECRET;

afterEach(() => {
  if (ORIGINAL_ENABLED === undefined) delete process.env.RATE_LIMIT_ENABLED;
  else process.env.RATE_LIMIT_ENABLED = ORIGINAL_ENABLED;
  if (ORIGINAL_SECRET === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = ORIGINAL_SECRET;
  vi.restoreAllMocks();
});

describe("withRateLimit", () => {
  const rate = { scope: "test.scope", limit: 2, windowMs: 60_000 };

  it("calls through while under the limit", async () => {
    for (let i = 0; i < 2; i += 1) {
      const out = await withRateLimit([rate], "u1", async () => `ok-${i}`);
      expect(out).toBe(`ok-${i}`);
    }
  });

  it("throws RATE_LIMITED with retryAfterSeconds and the scope over the limit", async () => {
    for (let i = 0; i < 2; i += 1) {
      await withRateLimit([rate], "u2", async () => i);
    }
    try {
      await withRateLimit([rate], "u2", async () => "never");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      const de = err as DomainError;
      expect(de.code).toBe(ErrorCode.RATE_LIMITED);
      expect(de.httpStatus).toBe(429);
      const details = de.details as { retryAfterSeconds: number; scope: string };
      expect(details.retryAfterSeconds).toBeGreaterThan(0);
      expect(details.scope).toBe("test.scope");
    }
  });

  it("logs the hit with the scope and never the subject", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => logger);
    for (let i = 0; i < 2; i += 1) {
      await withRateLimit([rate], "u3", async () => i);
    }
    await withRateLimit([rate], "u3", async () => "never").catch(() => undefined);
    expect(warn).toHaveBeenCalledTimes(1);
    const payload = warn.mock.calls[0]?.[0] as { scope?: string; subject?: string };
    expect(payload.scope).toBe("test.scope");
    expect(payload.subject).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain("u3");
  });

  it("is a no-op when RATE_LIMIT_ENABLED=false", async () => {
    process.env.RATE_LIMIT_ENABLED = "false";
    for (let i = 0; i < 10; i += 1) {
      const out = await withRateLimit([rate], "u4", async () => i);
      expect(out).toBe(i);
    }
  });
});

describe("ipSubjectFor", () => {
  it("hashes the address — never returns the raw IP", () => {
    process.env.AUTH_SECRET = Buffer.from("b".repeat(32)).toString("base64");
    const subject = ipSubjectFor("203.0.113.9");
    expect(subject).not.toBeNull();
    expect(subject).not.toContain("203.0.113.9");
    expect(subject).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns null without AUTH_SECRET", () => {
    delete process.env.AUTH_SECRET;
    expect(ipSubjectFor("203.0.113.9")).toBeNull();
  });
});

function fill(
  limiter: ReturnType<typeof getGlobalIpLimiter>,
  rate: { scope: string; limit: number; windowMs: number },
  subject: string,
) {
  for (let i = 0; i < rate.limit; i += 1) {
    limiter.check(rate.scope, subject, rate.limit, rate.windowMs);
  }
}

describe("enforceGlobalIpRate", () => {
  it("passes when there is no X-Forwarded-For to key on", () => {
    process.env.RATE_LIMIT_ENABLED = "true";
    process.env.AUTH_SECRET = Buffer.from("c".repeat(32)).toString("base64");
    expect(() => enforceGlobalIpRate(new Request("http://test.local"))).not.toThrow();
  });

  it("skips when AUTH_SECRET is missing", () => {
    process.env.RATE_LIMIT_ENABLED = "true";
    delete process.env.AUTH_SECRET;
    const req = new Request("http://test.local", {
      headers: { "x-forwarded-for": "198.51.100.4" },
    });
    const subject = ipSubjectFor("198.51.100.4");
    expect(subject).toBeNull();
    expect(() => enforceGlobalIpRate(req)).not.toThrow();
  });

  it("throws 429 once the per-IP window is exhausted", () => {
    process.env.RATE_LIMIT_ENABLED = "true";
    process.env.AUTH_SECRET = Buffer.from("d".repeat(32)).toString("base64");
    const ip = "198.51.100.7";
    const subject = ipSubjectFor(ip);
    expect(subject).not.toBeNull();
    fill(getGlobalIpLimiter(), GLOBAL_IP_RATE, subject!);
    const req = new Request("http://test.local", { headers: { "x-forwarded-for": ip } });
    try {
      enforceGlobalIpRate(req);
      expect.unreachable("should have thrown");
    } catch (err) {
      const de = err as DomainError;
      expect(de.code).toBe(ErrorCode.RATE_LIMITED);
      expect(de.httpStatus).toBe(429);
      expect((de.details as { scope: string }).scope).toBe("global.ip");
    }
  });

  it("skips when RATE_LIMIT_ENABLED=false", () => {
    process.env.RATE_LIMIT_ENABLED = "false";
    process.env.AUTH_SECRET = Buffer.from("e".repeat(32)).toString("base64");
    const ip = "198.51.100.8";
    const subject = ipSubjectFor(ip)!;
    fill(getGlobalIpLimiter(), GLOBAL_IP_RATE, subject);
    const req = new Request("http://test.local", { headers: { "x-forwarded-for": ip } });
    expect(() => enforceGlobalIpRate(req)).not.toThrow();
  });
});

describe("enforceAuthIpRate", () => {
  it("throws with the auth scope after 20 requests from one IP", () => {
    process.env.RATE_LIMIT_ENABLED = "true";
    process.env.AUTH_SECRET = Buffer.from("f".repeat(32)).toString("base64");
    const ip = "198.51.100.9";
    const subject = ipSubjectFor(ip)!;
    fill(getAuthIpLimiter(), AUTH_IP_RATE, subject);
    const req = new Request("http://test.local", { headers: { "x-forwarded-for": ip } });
    expect(() => enforceAuthIpRate(req)).toThrowError(
      expect.objectContaining({ code: ErrorCode.RATE_LIMITED }),
    );
    const thrown = (() => {
      try {
        enforceAuthIpRate(req);
        return null;
      } catch (err) {
        return err as DomainError;
      }
    })();
    expect((thrown?.details as { scope: string }).scope).toBe("auth.ip");
  });
});
