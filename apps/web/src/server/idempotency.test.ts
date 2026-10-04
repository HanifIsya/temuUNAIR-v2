import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import { createIdempotencyStore, IDEMPOTENCY_TTL_MS } from "./idempotency";

// TMU-BE-004: BE-01 idempotency semantics for POST /uploads —
// same key + same body within 24 h replays the original result;
// same key + different body is an IDEMPOTENCY_CONFLICT.

const BASE = 1_780_000_000_000;

function opts(
  overrides: Partial<{ scope: string; subject: string; key: string; bodyHash: string }> = {},
) {
  return {
    scope: "POST /api/v1/uploads",
    subject: "user-1",
    key: "key-1",
    bodyHash: "hash-a",
    ...overrides,
  };
}

describe("idempotency store", () => {
  it("executes once and replays the stored result for the same key and body", async () => {
    let calls = 0;
    const store = createIdempotencyStore({ now: () => BASE });
    const run = () =>
      store.run(opts(), async () => {
        calls += 1;
        return { uploadId: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81" };
      });

    const first = await run();
    const second = await run();

    expect(calls).toBe(1);
    expect(first).toEqual({
      replayed: false,
      value: { uploadId: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81" },
    });
    expect(second.replayed).toBe(true);
    expect(second.value).toEqual(first.value);
  });

  it("throws IDEMPOTENCY_CONFLICT when the same key is reused with a different body", async () => {
    const store = createIdempotencyStore({ now: () => BASE });
    await store.run(opts(), async () => "original");

    const conflict = store.run(opts({ bodyHash: "hash-b" }), async () => "never");
    await expect(conflict).rejects.toMatchObject({ code: "IDEMPOTENCY_CONFLICT" });
    await expect(conflict).rejects.toBeInstanceOf(DomainError);
  });

  it("re-executes after the 24 h window has elapsed", async () => {
    let now = BASE;
    let calls = 0;
    const store = createIdempotencyStore({ now: () => now, ttlMs: IDEMPOTENCY_TTL_MS });

    await store.run(opts(), async () => {
      calls += 1;
      return "first";
    });
    now += IDEMPOTENCY_TTL_MS + 1;
    const afterExpiry = await store.run(opts(), async () => {
      calls += 1;
      return "second";
    });

    expect(calls).toBe(2);
    expect(afterExpiry).toEqual({ replayed: false, value: "second" });
  });

  it("keeps subjects isolated", async () => {
    let calls = 0;
    const store = createIdempotencyStore({ now: () => BASE });
    const fn = async () => {
      calls += 1;
      return calls;
    };

    await store.run(opts({ subject: "user-1" }), fn);
    await store.run(opts({ subject: "user-2" }), fn);

    expect(calls).toBe(2);
  });

  it("does not cache failures", async () => {
    let calls = 0;
    const store = createIdempotencyStore({ now: () => BASE });

    await expect(
      store.run(opts(), async () => {
        calls += 1;
        throw new Error("storage down");
      }),
    ).rejects.toThrow("storage down");

    const retry = await store.run(opts(), async () => {
      calls += 1;
      return "recovered";
    });

    expect(calls).toBe(2);
    expect(retry).toEqual({ replayed: false, value: "recovered" });
  });
});
