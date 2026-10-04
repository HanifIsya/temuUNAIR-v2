import { describe, expect, it, vi } from "vitest";
import { buildAuthOptions } from "./config";

// TMU-BE-003 (red evidence): re-login within the cool-off cancels the pending
// account.delete job (FR-AUTH-005, BE-09 "re-login cancels it") — wired through
// the Auth.js signIn event.

const input = {
  googleId: "test-client-id",
  googleSecret: "test-client-secret",
  allowedDomains: ["unair.ac.id"],
  databaseUrl: "postgresql://user:pass@localhost:5432/test",
};

describe("auth config signIn event", () => {
  it("invokes the onSignIn hook with the user id after a successful sign-in", async () => {
    const onSignIn = vi.fn();
    const opts = buildAuthOptions(input, { onSignIn });
    expect(opts.events?.signIn).toBeDefined();
    await opts.events!.signIn!({
      user: { id: "user-1", email: "a@unair.ac.id" },
      account: { provider: "google", providerAccountId: "g-1", type: "oauth" },
    });
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledWith("user-1");
  });

  it("survives a sign-in without a user id", async () => {
    const onSignIn = vi.fn();
    const opts = buildAuthOptions(input, { onSignIn });
    await opts.events!.signIn!({
      user: { email: undefined },
      account: { provider: "google", providerAccountId: "g-2", type: "oauth" },
    });
    expect(onSignIn).not.toHaveBeenCalled();
  });
});
