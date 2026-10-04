// apps/web/src/server/middleware/idempotency.test.ts
// TMU-BE-008: BE-01 idempotency middleware — required header, body fingerprint,
// replay of the stored success, 409 on a conflicting fingerprint.

import { createHash, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DomainError, ErrorCode } from "../errors";
import { fingerprint, readJsonBody, requireIdempotencyKey, withIdempotency } from "./idempotency";

describe("readJsonBody", () => {
  it("returns the raw text and the parsed value for valid JSON", async () => {
    const req = new Request("http://test.local", {
      method: "POST",
      body: JSON.stringify({ a: 1 }),
    });
    const { text, raw } = await readJsonBody(req);
    expect(raw).toEqual({ a: 1 });
    expect(text).toBe('{"a":1}');
  });

  it("rejects a non-JSON body with 422 VALIDATION_FAILED", async () => {
    const req = new Request("http://test.local", { method: "POST", body: "not-json" });
    await expect(readJsonBody(req)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      httpStatus: 422,
    });
  });
});

describe("requireIdempotencyKey", () => {
  it("rejects a missing header with 422 and the Idempotency-Key field path", () => {
    const req = new Request("http://test.local", { method: "POST" });
    try {
      requireIdempotencyKey(req);
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      const de = err as DomainError;
      expect(de.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(de.httpStatus).toBe(422);
      const details = de.details as { fields: { path?: string; key?: string }[] };
      expect(details.fields[0]?.path).toBe("Idempotency-Key");
    }
  });

  it("returns the trimmed key when present", () => {
    const req = new Request("http://test.local", {
      method: "POST",
      headers: { "idempotency-key": "  k-123  " },
    });
    expect(requireIdempotencyKey(req)).toBe("k-123");
  });
});

describe("fingerprint", () => {
  it("is the sha256 hex of the body text", () => {
    expect(fingerprint('{"a":1}')).toBe(createHash("sha256").update('{"a":1}').digest("hex"));
    expect(fingerprint('{"a":1}')).toHaveLength(64);
  });

  it("differs for different bodies", () => {
    expect(fingerprint('{"a":1}')).not.toBe(fingerprint('{"a":2}'));
  });
});

describe("withIdempotency", () => {
  const opts = { scope: "POST /t", subject: "u1", key: "k1", bodyHash: "hash-a" };
  const freshOpts = () => ({ ...opts, key: `k-${randomBytes(6).toString("hex")}` });

  it("runs the function and returns { replayed: false } on first use", async () => {
    let calls = 0;
    const run = await withIdempotency(freshOpts(), async () => {
      calls += 1;
      return { id: "r1" };
    });
    expect(run).toEqual({ replayed: false, value: { id: "r1" } });
    expect(calls).toBe(1);
  });

  it("replays the stored value for the same key+body without re-running", async () => {
    let calls = 0;
    const key = freshOpts();
    const first = await withIdempotency(key, async () => {
      calls += 1;
      return { id: "r2", status: "OPEN" };
    });
    const second = await withIdempotency(key, async () => {
      calls += 1;
      return { id: "other" };
    });
    expect(second.replayed).toBe(true);
    expect(second.value).toEqual(first.value);
    expect(calls).toBe(1);
  });

  it("rejects the same key with a different fingerprint with 409 IDEMPOTENCY_CONFLICT", async () => {
    const key = freshOpts();
    await withIdempotency(key, async () => ({ id: "r3" }));
    await expect(
      withIdempotency({ ...key, bodyHash: "hash-b" }, async () => ({ id: "other" })),
    ).rejects.toMatchObject({
      code: ErrorCode.IDEMPOTENCY_CONFLICT,
      httpStatus: 409,
    });
  });

  it("keys replays per subject", async () => {
    let calls = 0;
    const fn = async () => {
      calls += 1;
      return { calls };
    };
    const key = freshOpts();
    await withIdempotency({ ...key, subject: "u1" }, fn);
    await withIdempotency({ ...key, subject: "u2" }, fn);
    expect(calls).toBe(2);
  });

  it("does not store a failed attempt", async () => {
    const failing = freshOpts();
    await expect(
      withIdempotency(failing, async () => {
        throw new DomainError(ErrorCode.RATE_LIMITED, "limited", { retryAfterSeconds: 60 });
      }),
    ).rejects.toMatchObject({ code: ErrorCode.RATE_LIMITED });
    const retry = await withIdempotency(failing, async () => ({ ok: true }));
    expect(retry.replayed).toBe(false);
    expect(retry.value).toEqual({ ok: true });
  });
});
