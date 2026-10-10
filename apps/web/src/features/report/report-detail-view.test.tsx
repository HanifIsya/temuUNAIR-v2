/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

import type { ReportOwnerItem, ReportPublicItem } from "@/features/browse/types";
import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import { ReportDetailView } from "./report-detail-view";

const PUBLIC_FOUND_REPORT: ReportPublicItem = {
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

const OWNER_REPORT: ReportOwnerItem = {
  ...PUBLIC_FOUND_REPORT,
  version: 1,
  matchCount: 2,
  hintPrompts: ["Apa warna gantungan kunci?", "Ada berapa kartu di dalamnya?"],
  expiresAt: "2026-12-27T12:30:00+07:00",
};

const SENSITIVE_REPORT: ReportPublicItem = {
  ...PUBLIC_FOUND_REPORT,
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

afterAll(() => server.close());

beforeEach(() => {
  notFoundMock.mockReset();
  server.resetHandlers();
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

function renderDetailView(reportId: string, initialData?: ReportPublicItem | ReportOwnerItem) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <ReportDetailView reportId={reportId} initialData={initialData} />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("ReportDetailView (SCR-006, FE-06)", () => {
  it("renders report details and claim button for public FOUND report", async () => {
    server.use(http.get("*/api/v1/reports/:id", () => HttpResponse.json(PUBLIC_FOUND_REPORT)));
    renderDetailView(PUBLIC_FOUND_REPORT.id);
    await waitFor(() => {
      expect(screen.getByTestId("report-detail-title").textContent).toContain(
        "Dompet cokelat kulit",
      );
    });
    expect(screen.getByTestId("report-claim-button")).toBeTruthy();
    expect(screen.queryByTestId("report-owner-panel")).toBeNull();
  });

  it("renders owner panel and hides claim button when viewer is the owner", async () => {
    server.use(http.get("*/api/v1/reports/:id", () => HttpResponse.json(OWNER_REPORT)));
    renderDetailView(OWNER_REPORT.id);
    await waitFor(() => {
      expect(screen.getByTestId("report-detail-title")).toBeTruthy();
    });
    expect(screen.getByTestId("report-owner-panel")).toBeTruthy();
    expect(screen.queryByTestId("report-claim-button")).toBeNull();
    // Hint prompts visible to owner
    expect(screen.getByText("Apa warna gantungan kunci?")).toBeTruthy();
  });

  it("renders sensitive notice and masked photo badge when report is sensitive", async () => {
    server.use(http.get("*/api/v1/reports/:id", () => HttpResponse.json(SENSITIVE_REPORT)));
    renderDetailView(SENSITIVE_REPORT.id);
    await waitFor(() => {
      expect(screen.getByTestId("report-sensitive-notice")).toBeTruthy();
    });
    expect(screen.getByAltText("Foto disamarkan untuk melindungi pemilik")).toBeTruthy();
  });

  it("calls notFound() when report does not exist", async () => {
    server.use(
      http.get("*/api/v1/reports/:id", () =>
        HttpResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 }),
      ),
    );
    renderDetailView("non-existent-id");
    await waitFor(() => {
      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  it("renders ErrorState on server failure and allows retry", async () => {
    server.use(
      http.get("*/api/v1/reports/:id", () =>
        HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
      ),
    );
    renderDetailView("018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e84");
    await waitFor(() => {
      expect(screen.getByTestId("error-state-message")).toBeTruthy();
    });
    expect(screen.getByTestId("error-state-retry")).toBeTruthy();
  });

  it("has zero axe violations", async () => {
    server.use(http.get("*/api/v1/reports/:id", () => HttpResponse.json(PUBLIC_FOUND_REPORT)));
    const { container } = renderDetailView(PUBLIC_FOUND_REPORT.id, PUBLIC_FOUND_REPORT);
    await waitFor(() => {
      expect(screen.getByTestId("report-detail-title")).toBeTruthy();
    });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
