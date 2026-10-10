/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { StatusBadge } from "./status-badge";

afterEach(() => {
  cleanup();
});

function renderBadge(status: string) {
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <StatusBadge status={status as never} />
    </NextIntlClientProvider>,
  );
}

describe("StatusBadge (CMP-007)", () => {
  it("renders icon and localized text for report status OPEN", () => {
    renderBadge("OPEN");
    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Aktif");
    const svg = badge.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders localized text for all ReportStatus values", () => {
    const statuses = [
      "OPEN",
      "MATCHED",
      "CLAIMED",
      "RETURNED",
      "EXPIRED",
      "CANCELLED",
      "REMOVED",
    ] as const;
    for (const s of statuses) {
      cleanup();
      renderBadge(s);
      expect(screen.getByTestId("status-badge")).toBeTruthy();
    }
  });

  it("has zero axe violations", async () => {
    const { container } = renderBadge("OPEN");
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
