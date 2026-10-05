import { describe, expect, it } from "vitest";

// TMU-BE-002 (red evidence): Auth.js config shape (BE-09).

describe("auth config", () => {
  const input = {
    googleId: "test-client-id",
    googleSecret: "test-client-secret",
    allowedDomains: ["unair.ac.id", "student.unair.ac.id"],
    databaseUrl: "postgresql://user:pass@localhost:5432/test",
  };

  it("builds options with Google provider", async () => {
    const { buildAuthOptions } = await import("./config");
    const opts = buildAuthOptions(input);
    expect(opts).toBeDefined();
    expect(opts.providers).toBeDefined();
    expect(opts.providers.length).toBeGreaterThanOrEqual(1);
  });

  it("uses database session strategy with 30-day max age", async () => {
    const { buildAuthOptions } = await import("./config");
    const opts = buildAuthOptions(input);
    expect(opts.session?.strategy).toBe("database");
    // 30 days in seconds
    expect(opts.session?.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it("configures __Secure-temuunair.session cookie with correct flags", async () => {
    const { buildAuthOptions } = await import("./config");
    const opts = buildAuthOptions(input);
    const cookie = opts.cookies?.sessionToken;
    expect(cookie?.name).toBe("__Secure-temuunair.session");
    expect(cookie?.options?.httpOnly).toBe(true);
    expect(cookie?.options?.sameSite).toBe("lax");
    expect(cookie?.options?.path).toBe("/");
  });

  it("exports a signIn callback that enforces domain allowlist", async () => {
    const { buildAuthOptions } = await import("./config");
    const opts = buildAuthOptions(input);
    expect(typeof opts.callbacks?.signIn).toBe("function");
  });

  it("signIn callback rejects an email not in the allowlist", async () => {
    const { buildAuthOptions } = await import("./config");
    const opts = buildAuthOptions(input);
    const signIn = opts.callbacks?.signIn;
    expect(signIn).toBeDefined();
    const allowed = await signIn!({
      user: { email: "user@unair.ac.id" } as any,
      account: {} as any,
      profile: undefined as any,
      credentials: {} as any,
    });
    expect(allowed).toBe(true);
    const rejected = await signIn!({
      user: { email: "user@gmail.com" } as any,
      account: {} as any,
      profile: undefined as any,
      credentials: {} as any,
    });
    expect(rejected).toBe(false);
  });
});
