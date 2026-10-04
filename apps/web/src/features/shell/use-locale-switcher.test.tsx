/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Must stay the first project import: it starts the MSW server before the
// generated API client captures `globalThis.fetch` (openapi-fetch@0.17).
import { captured, server } from "./msw-server";

const navigationMocks = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigationMocks.refresh, push: navigationMocks.push }),
  usePathname: () => "/home",
}));
vi.mock("next-intl", () => ({ useLocale: () => "id" }));

import { useLocaleSwitcher } from "./use-locale-switcher";

afterAll(() => server.close());
beforeEach(() => {
  captured.length = 0;
  navigationMocks.refresh.mockReset();
  document.cookie = "NEXT_LOCALE=; max-age=0";
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

describe("useLocaleSwitcher", () => {
  it("persists the profile, sets the locale cookie and refreshes in place", async () => {
    const { result } = renderHook(() => useLocaleSwitcher());
    expect(result.current.locale).toBe("id");

    await act(async () => {
      await result.current.onChange("en");
    });

    await waitFor(() => expect(navigationMocks.refresh).toHaveBeenCalledTimes(1));
    const patch = captured.find((entry) => entry.method === "PATCH");
    expect(patch).toBeDefined();
    expect(patch?.xsr).toBe("temuunair");
    expect(await patch?.body.json()).toEqual({ locale: "en" });
    expect(document.cookie).toContain("NEXT_LOCALE=en");
    expect(window.location.pathname).toBe("/");
  });

  it("still applies the cookie and refresh when the profile write fails", async () => {
    server.use(http.patch("*/api/v1/me", () => HttpResponse.error()));

    const { result } = renderHook(() => useLocaleSwitcher());
    await act(async () => {
      await result.current.onChange("en");
    });

    expect(navigationMocks.refresh).toHaveBeenCalledTimes(1);
    expect(document.cookie).toContain("NEXT_LOCALE=en");
  });

  it("does nothing when the locale is unchanged", async () => {
    const { result } = renderHook(() => useLocaleSwitcher());

    await act(async () => {
      await result.current.onChange("id");
    });

    expect(captured.filter((entry) => entry.method === "PATCH")).toHaveLength(0);
    expect(navigationMocks.refresh).not.toHaveBeenCalled();
  });
});
