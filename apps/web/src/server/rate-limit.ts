// apps/web/src/server/rate-limit.ts
// BE-12 fixed-window counters keyed (scope, subject). In-memory,
// per-instance; disabled only when RATE_LIMIT_ENABLED=false (BE-12 rule 3).

export const UPLOAD_INIT_RATE = { limit: 30, windowMs: 3_600_000 } as const;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(scope: string, subject: string, limit: number, windowMs: number): RateLimitResult;
}

interface Window {
  start: number;
  count: number;
}

export function createRateLimiter(opts: { now?: () => number } = {}): RateLimiter {
  const now = opts.now ?? Date.now;
  const windows = new Map<string, Window>();

  return {
    check(scope: string, subject: string, limit: number, windowMs: number): RateLimitResult {
      const key = `${scope}|${subject}`;
      const ts = now();
      let entry = windows.get(key);
      if (!entry || ts >= entry.start + windowMs) {
        entry = { start: ts, count: 0 };
        windows.set(key, entry);
      }
      entry.count += 1;
      if (entry.count <= limit) {
        return { allowed: true, retryAfterSeconds: 0 };
      }
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.start + windowMs - ts) / 1000));
      return { allowed: false, retryAfterSeconds };
    },
  };
}

const uploadLimiter = createRateLimiter();

export function getUploadLimiter(): RateLimiter {
  return uploadLimiter;
}

export function isRateLimitEnabled(): boolean {
  return (process.env.RATE_LIMIT_ENABLED ?? "true").trim().toLowerCase() !== "false";
}
