/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("@/features/shell/server-user", () => ({
  getAppUser: vi.fn(async () => ({
    user: { id: "u-1", displayName: "Airlangga Hartarto", email: "airlangga@unair.ac.id" },
  })),
}));

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import HomePage from "./page";

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
  matchCount: 0,
  hintPrompts: [],
  expiresAt: "2026-12-27T12:30:00+07:00",
};

afterAll(() => server.close());

beforeEach(() => {
  server.resetHandlers();
  server.use(
    http.get("*/api/v1/notifications/unread-count", () => HttpResponse.json({ count: 0 })),
    http.get("*/api/v1/reports/mine", () =>
      HttpResponse.json({
        data: [SAMPLE_MY_REPORT],
        page: { nextCursor: null, hasMore: false },
      }),
    ),
    http.get("*/api/v1/reports/:id/matches", () => HttpResponse.json([])),
  );
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

describe("HomePage (/home)", () => {
  it("renders home dashboard with greeting and CTAs", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const pageEl = await HomePage();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="id" messages={MESSAGES}>
          {pageEl}
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("home-greeting").textContent).toContain("Airlangga");
    });
    expect(screen.getByTestId("home-lost-cta")).toBeTruthy();
    expect(screen.getByTestId("home-found-cta")).toBeTruthy();

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
