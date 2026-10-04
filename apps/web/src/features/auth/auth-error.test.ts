import { describe, expect, it } from "vitest";

import { resolveAuthError } from "./auth-error";

describe("resolveAuthError", () => {
  it("maps AUTH_DOMAIN_NOT_ALLOWED to the domain variant with a retry link", () => {
    const resolved = resolveAuthError("AUTH_DOMAIN_NOT_ALLOWED");
    expect(resolved).toEqual({
      kind: "domain",
      titleKey: "auth.error.title",
      descKey: "auth.error.domain",
      action: { labelKey: "auth.error.action.another", href: "/login" },
    });
  });

  it("maps the Auth.js AccessDenied callback code to the domain variant (BE-09: the signIn callback only rejects domains)", () => {
    expect(resolveAuthError("AccessDenied").kind).toBe("domain");
    expect(resolveAuthError("AccessDenied").descKey).toBe("auth.error.domain");
  });

  it("maps ACCOUNT_SUSPENDED to the suspended variant without any action", () => {
    const resolved = resolveAuthError("ACCOUNT_SUSPENDED");
    expect(resolved.kind).toBe("suspended");
    expect(resolved.titleKey).toBe("auth.error.suspended.title");
    expect(resolved.descKey).toBe("error.ACCOUNT_SUSPENDED");
    expect(resolved.action).toBeUndefined();
  });

  it("maps Auth.js callback failures to the generic variant with a retry link", () => {
    for (const code of ["OAuthCallback", "OAuthAccountNotLinked", "Configuration", "Default"]) {
      const resolved = resolveAuthError(code);
      expect(resolved.kind).toBe("generic");
      expect(resolved.titleKey).toBe("auth.error.title");
      expect(resolved.descKey).toBe("auth.error.generic");
      expect(resolved.action).toEqual({ labelKey: "auth.error.action.another", href: "/login" });
    }
  });

  it("maps an unknown or missing code to the generic variant", () => {
    expect(resolveAuthError("SomethingWeird").kind).toBe("generic");
    expect(resolveAuthError(null).kind).toBe("generic");
    expect(resolveAuthError("").kind).toBe("generic");
  });
});
