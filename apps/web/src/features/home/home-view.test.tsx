/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
}));

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import { HomeView } from "./home-view";

const SAMPLE_MY_REPORT = {
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e83",
  type: "LOST" as const,
  status: "OPEN" as const,
  category: "BAG" as const,
  isSensitive: false,
  title: "Tas ransel biru",
  description: "Tas ransel biru tua, ada gantungan kunci kuning.",
  colors: ["BLUE"],
  brand: "Eiger",
  images: [],
  campus: "KAMPUS_B" as const,
  locationName: "Perpustakaan",
  occurredAt: { from: "2026-09-28T07:30:00+07:00" },
  createdAt: "2026-09-28T12:30:00+07:00",
  version: 1,
  matchCount: 1,
  hintPrompts: [],
  expiresAt: "2026-12-27T12:30:00+07:00",
};

// Expiring in 5 days
const EXPIRING_REPORT = {
  ...SAMPLE_MY_REPORT,
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e89",
  title: "Kunci motor Honda",
  expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
};

const SAMPLE_MATCH = {
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e85",
  state: "SUGGESTED" as const,
  band: "STRONG" as const,
  reasons: [{ code: "IMAGE_SIMILAR", labelKey: "match.reason.IMAGE_SIMILAR" }],
  other: {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e84",
    type: "FOUND" as const,
    status: "OPEN" as const,
    category: "WALLET" as const,
    isSensitive: false,
    title: "Dompet cokelat",
    description: "Dompet kulit cokelat lipat dua.",
    colors: ["BROWN"],
    brand: "Bonia",
    images: [],
    campus: "KAMPUS_A" as const,
    locationName: "Lobi FK",
    occurredAt: { from: "2026-09-29T10:00:00+07:00" },
    custody: "HELD_BY_FINDER" as const,
    createdAt: "2026-09-29T10:30:00+07:00",
  },
  createdAt: "2026-09-29T11:00:00+07:00",
};

afterAll(() => server.close());

beforeEach(() => {
  pushMock.mockReset();
  localStorage.clear();
  server.resetHandlers();
  server.use(
    http.get("*/api/v1/notifications/unread-count", () => HttpResponse.json({ count: 2 })),
    http.get("*/api/v1/reports/mine", () =>
      HttpResponse.json({
        data: [SAMPLE_MY_REPORT],
        page: { nextCursor: null, hasMore: false },
      }),
    ),
    http.get("*/api/v1/reports/:id/matches", () => HttpResponse.json([SAMPLE_MATCH])),
    http.post("*/api/v1/reports/:id/renew", () =>
      HttpResponse.json({ id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e89", status: "OPEN" }),
    ),
  );
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

function renderHomeView(user = { displayName: "Airlangga Hartarto" }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <HomeView user={user} />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("HomeView (SCR-003, FE-06)", () => {
  it("renders greeting with first name and both action CTAs", async () => {
    renderHomeView();
    expect(screen.getByTestId("home-greeting").textContent).toContain("Airlangga");
    expect(screen.getByTestId("home-lost-cta")).toBeTruthy();
    expect(screen.getByTestId("home-found-cta")).toBeTruthy();
  });

  it("submits search query and redirects to /reports", async () => {
    const user = userEvent.setup();
    renderHomeView();
    const searchInput = screen.getByTestId("home-search-input");
    await user.type(searchInput, "laptop asus{enter}");
    expect(pushMock).toHaveBeenCalledWith("/reports?q=laptop%20asus");
  });

  it("renders loading skeletons initially before data settles", () => {
    renderHomeView();
    expect(screen.getByTestId("home-reports-loading")).toBeTruthy();
  });

  it("renders my reports preview and match cards when data exists", async () => {
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByText("Tas ransel biru")).toBeTruthy();
    });
    expect(screen.getByTestId(`home-report-card-${SAMPLE_MY_REPORT.id}`)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId(`match-card-${SAMPLE_MATCH.id}`)).toBeTruthy();
    });
  });

  it("surfaces expiring reports with renew button and executes renewal", async () => {
    server.use(
      http.get("*/api/v1/reports/mine", () =>
        HttpResponse.json({
          data: [EXPIRING_REPORT],
          page: { nextCursor: null, hasMore: false },
        }),
      ),
    );
    const user = userEvent.setup();
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByText("Kunci motor Honda")).toBeTruthy();
    });
    expect(screen.getByText("Segera kedaluwarsa")).toBeTruthy();

    const renewBtn = screen.getByTestId(`home-renew-button-${EXPIRING_REPORT.id}`);
    expect(renewBtn).toBeTruthy();
    await user.click(renewBtn);
  });

  it("surfaces renewal failure via alert message", async () => {
    server.use(
      http.get("*/api/v1/reports/mine", () =>
        HttpResponse.json({
          data: [EXPIRING_REPORT],
          page: { nextCursor: null, hasMore: false },
        }),
      ),
      http.post("*/api/v1/reports/:id/renew", () =>
        HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByText("Kunci motor Honda")).toBeTruthy();
    });

    const renewBtn = screen.getByTestId(`home-renew-button-${EXPIRING_REPORT.id}`);
    await user.click(renewBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });
    expect(screen.getByRole("alert").textContent).toContain("Gagal memperpanjang");
  });

  it("renders empty states when no active reports exist", async () => {
    server.use(
      http.get("*/api/v1/reports/mine", () =>
        HttpResponse.json({ data: [], page: { nextCursor: null, hasMore: false } }),
      ),
    );
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByTestId("home-reports-empty")).toBeTruthy();
    });
    expect(screen.getByText("Belum ada laporan")).toBeTruthy();
  });

  it("renders empty matches state when active report has no matches", async () => {
    server.use(http.get("*/api/v1/reports/:id/matches", () => HttpResponse.json([])));
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByTestId("home-matches-empty")).toBeTruthy();
    });
    expect(screen.getByText("Belum ada kecocokan")).toBeTruthy();
  });

  it("renders ErrorState on API failure and allows retry", async () => {
    server.use(
      http.get("*/api/v1/reports/mine", () =>
        HttpResponse.json({ error: { code: "INTERNAL" } }, { status: 500 }),
      ),
    );
    renderHomeView();
    await waitFor(() => {
      expect(screen.getByTestId("error-state-message")).toBeTruthy();
    });
    expect(screen.getByTestId("error-state-retry")).toBeTruthy();
  });

  it("allows dismissing the onboarding hint banner", async () => {
    const user = userEvent.setup();
    renderHomeView();
    expect(screen.getByTestId("home-onboarding")).toBeTruthy();
    await user.click(screen.getByTestId("home-onboarding-dismiss"));
    expect(screen.queryByTestId("home-onboarding")).toBeNull();
  });

  it("has zero axe violations", async () => {
    const { container } = renderHomeView();
    await waitFor(() => {
      expect(screen.getByText("Tas ransel biru")).toBeTruthy();
    });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
