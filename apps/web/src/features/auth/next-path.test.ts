import { describe, expect, it } from "vitest";

import { safeInternalNext } from "./next-path";

describe("safeInternalNext", () => {
  it("keeps internal paths", () => {
    expect(safeInternalNext("/reports")).toBe("/reports");
    expect(safeInternalNext("/")).toBe("/");
    expect(safeInternalNext("/reports/new?type=lost")).toBe("/reports/new?type=lost");
  });

  it("falls back to / for absolute external URLs", () => {
    expect(safeInternalNext("https://evil.example")).toBe("/");
    expect(safeInternalNext("http://evil.example")).toBe("/");
  });

  it("falls back to / for protocol-relative URLs", () => {
    expect(safeInternalNext("//evil.example")).toBe("/");
    expect(safeInternalNext("/\\evil.example")).toBe("/");
  });

  it("falls back to / for javascript: and other non-path values", () => {
    expect(safeInternalNext("javascript:alert(1)")).toBe("/");
    expect(safeInternalNext("reports")).toBe("/");
    expect(safeInternalNext(undefined)).toBe("/");
  });
});
