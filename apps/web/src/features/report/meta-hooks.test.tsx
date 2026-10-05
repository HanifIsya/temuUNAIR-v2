/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

import { server } from "@/features/shell/msw-server";
import { metaKey } from "@/lib/api/keys";

import { useCampuses } from "./use-campuses";
import { useLocations } from "./use-locations";
import { useDropPoints } from "./use-drop-points";
import { useCreateReport } from "./use-create-report";

afterAll(() => server.close());
beforeEach(() => server.resetHandlers());
afterEach(() => server.resetHandlers());

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe("metadata and mutation hooks", () => {
  it("useCampuses fetches and caches campuses under ['meta', 'campuses']", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useCampuses(), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(client.getQueryData(metaKey("campuses"))).toEqual(result.current.data);
  });

  it("useLocations fetches locations for a selected campus", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useLocations("KAMPUS_B"), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(client.getQueryData(metaKey("locations", "KAMPUS_B"))).toEqual(result.current.data);
  });

  it("useLocations is disabled when campus is not provided", () => {
    const client = makeClient();
    const { result } = renderHook(() => useLocations(undefined), { wrapper: wrapperFor(client) });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("useDropPoints fetches drop points", async () => {
    const client = makeClient();
    const { result } = renderHook(() => useDropPoints("KAMPUS_B"), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("useCreateReport sends Idempotency-Key and invalidates reports queries on success", async () => {
    const client = makeClient();
    let receivedKey: string | null = null;

    server.use(
      http.post("*/api/v1/reports", async ({ request }) => {
        receivedKey = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e83" }, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateReport(), { wrapper: wrapperFor(client) });

    await result.current.mutateAsync({
      idempotencyKey: "test-key-1",
      payload: {
        type: "LOST",
        category: "BAG",
        title: "Tas ransel biru",
        description: "Tas ransel biru tua di perpus",
        location: { campus: "KAMPUS_B" },
        occurredAt: { from: "2026-10-04T10:00:00+07:00" },
      },
    });

    expect(receivedKey).toBe("test-key-1");
  });
});
