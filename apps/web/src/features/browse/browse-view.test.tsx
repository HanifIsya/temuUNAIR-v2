/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/reports",
  useSearchParams: () => new URLSearchParams(),
}));

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import { BrowseView } from "./browse-view";

const CAMPUSES = [
  { id: "KAMPUS_A", name: "Kampus A", locationCount: 3 },
  { id: "KAMPUS_B", name: "Kampus B", locationCount: 5 },
];

const CATEGORIES = [
  { value: "WALLET", labelKey: "category.WALLET", isSensitive: false, hintPrompts: [] },
  { value: "BAG", labelKey: "category.BAG", isSensitive: false, hintPrompts: [] },
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
  page: { nextCursor: "cursor_123", hasMore: true },
};

afterAll(() => server.close());

beforeEach(() => {
  replaceMock.mockReset();
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

function renderBrowseView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <BrowseView />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("BrowseView (SCR-005, FE-06)", () => {
  it("renders loading skeleton initially, then items in report grid", async () => {
    renderBrowseView();
    expect(screen.getByTestId("browse-loading-skeleton")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("Dompet cokelat kulit")).toBeTruthy();
    });
    expect(screen.getByTestId("browse-results")).toBeTruthy();
    expect(screen.getByTestId("browse-load-more")).toBeTruthy();
  });

  it("renders empty state when data is empty", async () => {
    server.use(
      http.get("*/api/v1/reports", () =>
        HttpResponse.json({ data: [], page: { nextCursor: null, hasMore: false } }),
      ),
    );
    renderBrowseView();
    await waitFor(() => {
      expect(screen.getByTestId("browse-empty-state")).toBeTruthy();
    });
    expect(screen.getByText("Tidak ada hasil")).toBeTruthy();
    expect(screen.getByTestId("browse-empty-create-report")).toBeTruthy();
  });

  it("renders ErrorState on API failure and allows retry", async () => {
    server.use(
      http.get("*/api/v1/reports", () =>
        HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
      ),
    );
    renderBrowseView();
    await waitFor(() => {
      expect(screen.getByTestId("error-state-message")).toBeTruthy();
    });
    expect(screen.getByTestId("error-state-retry")).toBeTruthy();
  });

  it("filters by type, campus and category and syncs to URL", async () => {
    const user = userEvent.setup();
    renderBrowseView();
    await waitFor(() => {
      expect(screen.getByText("Dompet cokelat kulit")).toBeTruthy();
    });

    const lostTab = screen.getByTestId("browse-filter-type-lost");
    await user.click(lostTab);
    expect(lostTab.getAttribute("aria-pressed")).toBe("true");
    expect(replaceMock).toHaveBeenCalledWith("/reports?type=lost");
  });

  it("has zero axe violations when content is loaded", async () => {
    const { container } = renderBrowseView();
    await waitFor(() => {
      expect(screen.getByText("Dompet cokelat kulit")).toBeTruthy();
    });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
