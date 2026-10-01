import { describe, it, expect } from "vitest";
import { ERROR_CODES } from "../../packages/contracts/src/errors.js";

describe("TC-I18N-001: API returns error.code / labelKey, never translated strings", () => {
  it("defines exact 18 stable error codes conforming to BE-04", () => {
    expect(ERROR_CODES.length).toBe(18);
    for (const code of ERROR_CODES) {
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
    }
  });

  it("does not allow localized punctuation or spaces in error codes", () => {
    for (const code of ERROR_CODES) {
      expect(code).not.toContain(" ");
      expect(code).not.toContain(".");
    }
  });
});
