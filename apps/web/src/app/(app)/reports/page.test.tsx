/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/reports",
  useSearchParams: () => new URLSearchParams(),
}));

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import ReportsPage from "./page";

const CAMPUSES = [{ id: "KAMPUS_A", name: "Kampus A", locationCount: 3 }];
const CATEGORIES = [
  { value: "WALLET", labelKey: "category.WALLET", isSensitive: false, hintPrompts: [] },
];
const SAMPLE_PAGE = {
  data: [
    {
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
    },
  ],
  page: { nextCursor: null, hasMore: false },
};

afterAll(() => server.close());

beforeEach(() => {
  server.resetHandlers();
  server.use(
    http.get("*/api/v1/meta/campuses", () => HttpResponse.json(CAMPUSES)),
    http.get("*/api/v1/meta/categories", () => HttpResponse.json(CATEGORIES)),
    http.get("*/api/v1/reports", () => HttpResponse.json(SAMPLE_PAGE)),
  );
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

describe("ReportsPage (/reports)", () => {
  it("renders browse view with search and items", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const pageEl = await ReportsPage({ searchParams: Promise.resolve({ type: "found" }) });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="id" messages={MESSAGES}>
          {pageEl}
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Dompet cokelat kulit")).toBeTruthy();
    });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
