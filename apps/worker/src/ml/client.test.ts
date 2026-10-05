import { describe, expect, it, vi } from "vitest";
import {
  Attributes,
  EmbedTextResponse,
  ImageAnalysis,
  MlCallError,
  STUB_MODEL_VERSIONS,
  createMlClient,
} from "./client.js";

// TMU-BE-007 (red evidence): typed ML client per BE-06 — bearer auth, 8 s timeout,
// allowlisted storage host only, deterministic ML_MODE=stub vectors, retryable vs
// non-retryable error classification (BE-07 retry table).

const ALLOWED = ["http://localhost:9000"];
const IMG_URL = "http://localhost:9000/temuunair-dev/reports/abc/img.jpg?X-Amz-Expires=300";

function stubClient() {
  return createMlClient({
    mode: "stub",
    serviceUrl: "http://ml.internal:8000",
    token: "dev-ml-token",
    allowedStorageOrigins: ALLOWED,
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const validAnalysis = {
  modelVersions: { yolo: "1.0", clip: "1.0", quality: "1" },
  detections: [
    { label: "backpack", classId: 24, confidence: 0.91, bbox: { x: 0.1, y: 0.2, w: 0.5, h: 0.6 } },
  ],
  primaryObject: null,
  embedding: {
    model: "clip-vit-b-32",
    dim: 512,
    vector: Array.from({ length: 512 }, (_, i) => i / 512),
    source: "full",
  },
  categoryGuess: [{ category: "BAG", score: 0.74 }],
  quality: { blur: 0.18, brightness: 0.62, width: 1024, height: 768, usable: true },
  sensitive: { cardLikely: false },
};

describe("ML client — ML_MODE=stub", () => {
  it("returns deterministic, L2-normalised, schema-valid image analysis", async () => {
    const client = stubClient();
    const a = await client.analyzeImage(IMG_URL);
    const b = await client.analyzeImage(IMG_URL);

    expect(ImageAnalysis.safeParse(a).success).toBe(true);
    expect(a.embedding.vector).toHaveLength(512);
    expect(a.embedding.vector).toEqual(b.embedding.vector);
    const norm = Math.sqrt(a.embedding.vector.reduce((s, v) => s + v * v, 0));
    expect(norm).toBeCloseTo(1, 5);
    expect(a.modelVersions).toEqual(STUB_MODEL_VERSIONS);
  });

  it("returns deterministic 512-d clip and 384-d sentence vectors for text", async () => {
    const client = stubClient();
    const req = [{ id: "r1", text: "Tas ransel biru tua eiger" }];
    const a = await client.embedText(req, "id");
    const b = await client.embedText(req, "id");

    expect(EmbedTextResponse.safeParse(a).success).toBe(true);
    expect(a.embeddings[0]?.clipText).toHaveLength(512);
    expect(a.embeddings[0]?.sentence).toHaveLength(384);
    expect(a.embeddings[0]?.clipText).toEqual(b.embeddings[0]?.clipText);
    expect(a.modelVersions).toEqual(STUB_MODEL_VERSIONS);
  });

  it("returns schema-valid attributes without making network calls", async () => {
    const fetchImpl = vi.fn();
    const client = createMlClient({
      mode: "stub",
      serviceUrl: "http://ml.internal:8000",
      token: "dev-ml-token",
      allowedStorageOrigins: ALLOWED,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const attrs = await client.extractAttributes({
      title: "Tas ransel",
      description: "Biru tua",
      locale: "id",
    });

    expect(Attributes.safeParse(attrs).success).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("exposes the stub model versions used for idempotency checks", async () => {
    await expect(stubClient().modelVersions()).resolves.toEqual(STUB_MODEL_VERSIONS);
  });

  it("rejects a non-allowlisted image URL even in stub mode", async () => {
    const client = stubClient();
    const err = await client.analyzeImage("https://evil.example/img.jpg").catch((e: unknown) => e);

    expect(err).toBeInstanceOf(MlCallError);
    expect((err as MlCallError).code).toBe("ML_URL_NOT_ALLOWED");
    expect((err as MlCallError).retryable).toBe(false);
  });
});

describe("ML client — ML_MODE=real", () => {
  function realClient(fetchImpl: unknown, timeoutMs = 8000) {
    return createMlClient({
      mode: "real",
      serviceUrl: "http://ml.internal:8000",
      token: "secret-token",
      allowedStorageOrigins: ALLOWED,
      fetchImpl: fetchImpl as typeof fetch,
      timeoutMs,
    });
  }

  it("POSTs with bearer auth, JSON body, redirect:error and an abort timeout", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(validAnalysis));
    const client = realClient(fetchImpl);

    await client.analyzeImage(IMG_URL);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://ml.internal:8000/v1/analyze-image");
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("error");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer secret-token");
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(String(init.body)) as { imageUrl: string };
    expect(body.imageUrl).toBe(IMG_URL);
  });

  it("parses and validates successful responses against the BE-06 schemas", async () => {
    const embed = {
      embeddings: [
        {
          id: "r1",
          clipText: Array.from({ length: 512 }, () => 0.01),
          sentence: Array.from({ length: 384 }, () => 0.01),
        },
      ],
      modelVersions: { clip: "2.0", sentence: "2.0" },
    };
    const client = realClient(vi.fn(async () => jsonResponse(embed)));
    const out = await client.embedText([{ id: "r1", text: "x" }], "id");
    expect(EmbedTextResponse.safeParse(out).success).toBe(true);
  });

  it("maps 429 and 5xx to retryable failures without echoing the body", async () => {
    for (const status of [429, 500, 503]) {
      const fetchImpl = vi.fn(async () => jsonResponse({ error: { code: "X" } }, status));
      const err = await realClient(fetchImpl)
        .analyzeImage(IMG_URL)
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(MlCallError);
      expect((err as MlCallError).retryable).toBe(true);
      expect((err as MlCallError).status).toBe(status);
      expect((err as MlCallError).message).not.toContain("imageUrl");
    }
  });

  it("maps 400/401/404/415/422 to non-retryable failures (fail fast)", async () => {
    for (const status of [400, 401, 404, 415, 422]) {
      const fetchImpl = vi.fn(async () => jsonResponse({}, status));
      const err = await realClient(fetchImpl)
        .analyzeImage(IMG_URL)
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(MlCallError);
      expect((err as MlCallError).retryable).toBe(false);
      expect((err as MlCallError).status).toBe(status);
    }
  });

  it("maps timeouts and connection resets to retryable failures", async () => {
    const timeout = realClient(() =>
      Promise.reject(new DOMException("The operation was aborted", "TimeoutError")),
    );
    const timeoutErr = await timeout.analyzeImage(IMG_URL).catch((e: unknown) => e);
    expect((timeoutErr as MlCallError).code).toBe("ML_TIMEOUT");
    expect((timeoutErr as MlCallError).retryable).toBe(true);

    const reset = realClient(() => Promise.reject(new TypeError("fetch failed")));
    const resetErr = await reset.analyzeImage(IMG_URL).catch((e: unknown) => e);
    expect((resetErr as MlCallError).code).toBe("ML_NETWORK");
    expect((resetErr as MlCallError).retryable).toBe(true);
  });

  it("maps malformed or schema-violating 200 responses to non-retryable failures", async () => {
    const notJson = realClient(
      vi.fn(async () => new Response("<html>proxy error</html>", { status: 200 })),
    );
    const err1 = await notJson.analyzeImage(IMG_URL).catch((e: unknown) => e);
    expect((err1 as MlCallError).code).toBe("ML_INVALID_RESPONSE");
    expect((err1 as MlCallError).retryable).toBe(false);

    const wrongShape = realClient(vi.fn(async () => jsonResponse({ modelVersions: {} })));
    const err2 = await wrongShape.analyzeImage(IMG_URL).catch((e: unknown) => e);
    expect((err2 as MlCallError).code).toBe("ML_INVALID_RESPONSE");
    expect((err2 as MlCallError).retryable).toBe(false);
  });

  it("rejects a non-allowlisted URL before any network call", async () => {
    const fetchImpl = vi.fn();
    const client = realClient(fetchImpl);
    const err = await client
      .analyzeImage("http://169.254.169.254/latest/meta-data")
      .catch((e: unknown) => e);
    expect((err as MlCallError).code).toBe("ML_URL_NOT_ALLOWED");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reads current model versions from GET /v1/models for idempotency checks", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse([
        { name: "yolo", version: "9.9" },
        { name: "clip", version: "9.9" },
      ]),
    );
    const client = realClient(fetchImpl);
    await expect(client.modelVersions()).resolves.toEqual({ yolo: "9.9", clip: "9.9" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://ml.internal:8000/v1/models");
    expect(init.method).toBe("GET");
  });
});
