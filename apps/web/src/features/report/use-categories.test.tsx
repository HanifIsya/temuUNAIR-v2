/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

// Must stay the first project import: it starts the MSW server before the
// generated API client captures `globalThis.fetch` (openapi-fetch@0.17).
import { server } from "@/features/shell/msw-server";

import { metaKey } from "@/lib/api/keys";

import { useCategories } from "./use-categories";

afterAll(() => server.close());
beforeEach(() => server.resetHandlers());
afterEach(() => server.resetHandlers());

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("useCategories", () => {
  it("caches categories under the FE-004 query key", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useCategories(), {
      wrapper: wrapperFor(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.value).toBe("ID_CARD");
    expect(client.getQueryData(metaKey("categories"))).toEqual(result.current.data);
    // The hook must cache under the literal FE-004 key ["meta","categories"].
    expect(client.getQueryData(["meta", "categories"])).toEqual(result.current.data);
    expect(client.getQueryState(["meta", "categories"])?.data).toBeDefined();
  });

  it("surfaces a server failure as a query error", async () => {
    server.use(
      http.get("*/api/v1/meta/categories", () =>
        HttpResponse.json({ error: { code: "INTERNAL", message: "boom" } }, { status: 500 }),
      ),
    );
    const client = makeClient();
    const { result } = renderHook(() => useCategories(), {
      wrapper: wrapperFor(client),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
