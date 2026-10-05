/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

// Must stay the first project import: it starts the MSW server before the
// generated API client captures `globalThis.fetch` (openapi-fetch@0.17).
import { server } from "@/features/shell/msw-server";

import { useUpload } from "./use-upload";

interface CapturedRequest {
  method: string;
  url: string;
  header(name: string): string | null;
  json(): Promise<unknown>;
}

const requests: CapturedRequest[] = [];

server.events.on("request:start", ({ request }) => {
  requests.push({
    method: request.method,
    url: request.url,
    header: (name) => request.headers.get(name),
    json: async () => {
      try {
        return await request.clone().json();
      } catch {
        return null;
      }
    },
  });
});

const STORAGE_PUT_OK = http.put(
  "https://storage.example.test/*",
  () => new HttpResponse(null, { status: 200 }),
);

function makeFile(name = "photo.jpg", type = "image/jpeg", bytes = 64): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

afterAll(() => server.close());
beforeEach(() => {
  requests.length = 0;
  server.resetHandlers();
  server.use(STORAGE_PUT_OK);
});
afterEach(() => cleanup());

describe("useUpload", () => {
  it("runs the presign → PUT → complete handshake and reports READY", async () => {
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile()]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("ready"));

    const entry = result.current.entries[0];
    expect(entry?.uploadId).toBe("018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82");
    expect(entry?.thumbUrl).toBe(
      "https://storage.example.test/uploads/018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82_thumb.jpg",
    );
    expect(result.current.readyIds).toEqual(["018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82"]);
    expect(result.current.inFlight).toBe(false);

    const init = requests.find(
      (r) =>
        r.method === "POST" && r.url.includes("/api/v1/uploads") && !r.url.includes("complete"),
    );
    expect(init).toBeDefined();
    expect(init?.header("x-requested-with")).toBe("temuunair");
    expect(init?.header("idempotency-key")).toBeTruthy();
    expect(await init?.json()).toEqual({ mime: "image/jpeg", sizeBytes: 64 });

    const put = requests.find((r) => r.method === "PUT" && r.url.includes("storage.example.test"));
    expect(put).toBeDefined();
    expect(put?.header("content-type")).toBe("image/jpeg");

    const complete = requests.find((r) => r.url.includes("/complete"));
    expect(complete).toBeDefined();
  });

  it("rejects a disallowed MIME locally without any network call", async () => {
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile("doc.gif", "image/gif")]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("failed"));

    expect(result.current.entries[0]?.errorCode).toBe("UPLOAD_INVALID_TYPE");
    expect(result.current.inFlight).toBe(false);
    expect(requests.filter((r) => r.url.includes("/api/v1/uploads"))).toHaveLength(0);
  });

  it("rejects a file over 8 MB locally without any network call", async () => {
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile("big.jpg", "image/jpeg", 8 * 1024 * 1024 + 1)]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("failed"));

    expect(result.current.entries[0]?.errorCode).toBe("UPLOAD_TOO_LARGE");
    expect(requests.filter((r) => r.url.includes("/api/v1/uploads"))).toHaveLength(0);
  });

  it("caps the list at max and reports the limit", async () => {
    const { result } = renderHook(() => useUpload({ max: 2 }));

    await act(async () => {
      result.current.addFiles([makeFile("a.jpg"), makeFile("b.jpg"), makeFile("c.jpg")]);
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    await waitFor(() =>
      expect(result.current.entries.every((e) => e.phase === "ready")).toBe(true),
    );

    expect(result.current.limitReached).toBe(true);
    expect(result.current.entries.map((e) => e.fileName)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("marks the entry offline when the presigned PUT fails", async () => {
    server.use(http.put("https://storage.example.test/*", () => HttpResponse.error()));
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile()]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("failed"));

    expect(result.current.entries[0]?.errorCode).toBe("OFFLINE");
    expect(result.current.inFlight).toBe(false);
  });

  it("marks the entry offline when the presign request cannot reach the network", async () => {
    server.use(http.post("*/api/v1/uploads", () => HttpResponse.error()));
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile()]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("failed"));

    expect(result.current.entries[0]?.errorCode).toBe("OFFLINE");
  });

  it("retries a failed upload with the same idempotency key", async () => {
    server.use(http.put("https://storage.example.test/*", () => HttpResponse.error()));
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      result.current.addFiles([makeFile()]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("failed"));

    const firstKey = requests
      .find((r) => r.method === "POST" && r.url.includes("/api/v1/uploads"))
      ?.header("idempotency-key");
    expect(firstKey).toBeTruthy();

    server.use(STORAGE_PUT_OK);
    await act(async () => {
      result.current.retry(result.current.entries[0]!.localId);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("ready"));

    const initRequests = requests.filter(
      (r) =>
        r.method === "POST" && r.url.includes("/api/v1/uploads") && !r.url.includes("/complete"),
    );
    expect(initRequests).toHaveLength(2);
    expect(initRequests[1]?.header("idempotency-key")).toBe(firstKey);
  });

  it("removes an entry and clears the limit flag", async () => {
    const { result } = renderHook(() => useUpload({ max: 1 }));

    await act(async () => {
      result.current.addFiles([makeFile()]);
    });
    await waitFor(() => expect(result.current.entries[0]?.phase).toBe("ready"));

    await act(async () => {
      result.current.addFiles([makeFile("second.jpg")]);
    });
    expect(result.current.limitReached).toBe(true);

    await act(async () => {
      result.current.remove(result.current.entries[0]!.localId);
    });

    expect(result.current.entries).toHaveLength(0);
    expect(result.current.limitReached).toBe(false);
  });
});
