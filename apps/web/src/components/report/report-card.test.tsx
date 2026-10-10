/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import type { ReportPublicItem } from "@/features/browse/types";
import MESSAGES from "@/i18n/messages/id.json";
import { ReportCard } from "./report-card";

afterEach(() => {
  cleanup();
});

const SAMPLE_REPORT: ReportPublicItem = {
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e84",
  type: "FOUND",
  status: "OPEN",
  category: "WALLET",
  isSensitive: false,
  title: "Dompet cokelat kulit",
  description: "Dompet kulit cokelat lipat dua.",
  colors: ["BROWN"],
  brand: "Bonia",
  images: [
    {
      id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
      url: "https://storage.example.test/uploads/wallet.jpg",
      thumbUrl: "https://storage.example.test/uploads/wallet_thumb.jpg",
      isMasked: false,
    },
  ],
  campus: "KAMPUS_A",
  locationName: "Lobi FK",
  occurredAt: { from: "2026-09-29T10:00:00+07:00" },
  custody: "HELD_BY_FINDER",
  createdAt: "2026-09-29T10:30:00+07:00",
};

const SENSITIVE_REPORT: ReportPublicItem = {
  ...SAMPLE_REPORT,
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e85",
  isSensitive: true,
  category: "ID_CARD",
  images: [
    {
      id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e83",
      url: "https://storage.example.test/uploads/ktp.jpg",
      thumbUrl: null,
      isMasked: true,
    },
  ],
};

function renderCard(report: ReportPublicItem, variant: "browse" | "mine" | "compact" = "browse") {
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <ReportCard report={report} variant={variant} />
    </NextIntlClientProvider>,
  );
}

describe("ReportCard (CMP-004)", () => {
  it("renders report title, category, campus, and image link", () => {
    renderCard(SAMPLE_REPORT);
    const card = screen.getByTestId(`report-card-${SAMPLE_REPORT.id}`);
    expect(card).toBeTruthy();
    expect(screen.getByText("Dompet cokelat kulit")).toBeTruthy();
    expect(card.querySelector("a")?.getAttribute("href")).toBe(`/reports/${SAMPLE_REPORT.id}`);
  });

  it("renders masked photo badge and alt text for sensitive report", () => {
    renderCard(SENSITIVE_REPORT);
    const img = screen.getByAltText("Foto disamarkan untuk melindungi pemilik");
    expect(img).toBeTruthy();
  });

  it("renders status badge in mine variant", () => {
    renderCard(SAMPLE_REPORT, "mine");
    expect(screen.getByTestId("status-badge")).toBeTruthy();
  });

  it("has zero axe violations", async () => {
    const { container } = renderCard(SAMPLE_REPORT);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
