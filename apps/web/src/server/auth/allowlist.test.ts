import { describe, expect, it } from "vitest";

// TMU-BE-002 (red evidence): domain allowlist check (BE-09).

describe("domain allowlist", () => {
  it("accepts an email whose domain is in the allowlist", async () => {
    const { isDomainAllowed } = await import("./allowlist");
    expect(isDomainAllowed("user@unair.ac.id", ["unair.ac.id", "student.unair.ac.id"])).toBe(true);
  });

  it("rejects an email whose domain is not in the allowlist", async () => {
    const { isDomainAllowed } = await import("./allowlist");
    expect(isDomainAllowed("user@gmail.com", ["unair.ac.id", "student.unair.ac.id"])).toBe(false);
  });

  it("is case-insensitive on the domain part", async () => {
    const { isDomainAllowed } = await import("./allowlist");
    expect(isDomainAllowed("User@UNAIR.AC.ID", ["unair.ac.id"])).toBe(true);
  });

  it("rejects everything when the allowlist is empty", async () => {
    const { isDomainAllowed } = await import("./allowlist");
    expect(isDomainAllowed("user@unair.ac.id", [])).toBe(false);
  });

  it("rejects an email without an @ sign", async () => {
    const { isDomainAllowed } = await import("./allowlist");
    expect(isDomainAllowed("not-an-email", ["unair.ac.id"])).toBe(false);
  });

  it("returns the hashed email for logging (BE-09 enforcement rule 5)", async () => {
    const { hashEmailForLog } = await import("./allowlist");
    const hash = hashEmailForLog("user@unair.ac.id");
    expect(hash).not.toContain("user@unair.ac.id");
    expect(hash).not.toContain("unair.ac.id");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("hashEmailForLog is deterministic for the same input", async () => {
    const { hashEmailForLog } = await import("./allowlist");
    expect(hashEmailForLog("user@unair.ac.id")).toBe(hashEmailForLog("user@unair.ac.id"));
  });
});
