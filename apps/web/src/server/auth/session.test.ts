import { describe, expect, it } from "vitest";

// TMU-BE-002 (red evidence): session helpers (BE-09).

describe("session helpers", () => {
  it("parses the __Secure-temuunair.session cookie from a Cookie header", async () => {
    const { parseSessionToken } = await import("./session");
    const token = parseSessionToken("other=xyz; __Secure-temuunair.session=abc123; another=1");
    expect(token).toBe("abc123");
  });

  it("returns null when the session cookie is absent", async () => {
    const { parseSessionToken } = await import("./session");
    expect(parseSessionToken("other=xyz")).toBeNull();
  });

  it("returns null for an empty cookie header", async () => {
    const { parseSessionToken } = await import("./session");
    expect(parseSessionToken("")).toBeNull();
    expect(parseSessionToken(undefined)).toBeNull();
  });

  it("exposes the correct cookie name constant", async () => {
    const { SESSION_COOKIE_NAME } = await import("./session");
    expect(SESSION_COOKIE_NAME).toBe("__Secure-temuunair.session");
  });

  it("returns 401 AUTH_REQUIRED for a request with no session", async () => {
    const { sessionErrorFor } = await import("./session");
    const err = sessionErrorFor(null);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("AUTH_REQUIRED");
    expect(err!.httpStatus).toBe(401);
  });

  it("returns 403 ACCOUNT_SUSPENDED for a suspended user", async () => {
    const { sessionErrorFor } = await import("./session");
    const err = sessionErrorFor({ id: "u1", status: "SUSPENDED" } as any);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("ACCOUNT_SUSPENDED");
    expect(err!.httpStatus).toBe(403);
  });

  it("returns 403 ACCOUNT_SUSPENDED for a deleted user", async () => {
    const { sessionErrorFor } = await import("./session");
    const err = sessionErrorFor({ id: "u1", status: "DELETED" } as any);
    expect(err).not.toBeNull();
    expect(err!.code).toBe("ACCOUNT_SUSPENDED");
    expect(err!.httpStatus).toBe(403);
  });

  it("returns null (no error) for an active user", async () => {
    const { sessionErrorFor } = await import("./session");
    const err = sessionErrorFor({ id: "u1", status: "ACTIVE" } as any);
    expect(err).toBeNull();
  });
});
