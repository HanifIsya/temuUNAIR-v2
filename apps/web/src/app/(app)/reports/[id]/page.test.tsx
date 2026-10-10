/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SAMPLE_REPORT = {
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e84",
  type: "FOUND",
  status: "OPEN",
  category: "WALLET",
  isSensitive: false,
  title: "Dompet cokelat kulit",
  description: "Dompet kulit cokelat lipat dua.",
  colors: ["BROWN"],
  brand: "Bonia",
  images: [],
  campus: "KAMPUS_A",
  locationName: "Lobi FK",
  occurredAt: { from: "2026-09-29T10:00:00+07:00" },
  custody: "HELD_BY_FINDER",
  createdAt: "2026-09-29T10:30:00+07:00",
};

vi.mock("@/features/report/server-report", () => ({
  getServerReport: vi.fn(async () => ({ data: SAMPLE_REPORT })),
}));

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import ReportDetailPage from "./page";

afterAll(() => server.close());

beforeEach(() => {
  server.resetHandlers();
  server.use(http.get("*/api/v1/reports/:id", () => HttpResponse.json(SAMPLE_REPORT)));
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

describe("ReportDetailPage (/reports/[id])", () => {
  it("renders report detail view with SSR initialData", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const pageEl = await ReportDetailPage({
      params: Promise.resolve({ id: SAMPLE_REPORT.id }),
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="id" messages={MESSAGES}>
          {pageEl}
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("report-detail-title")).toBeTruthy();
    });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
