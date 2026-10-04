// apps/worker/src/ml/client.ts
// Typed ML service client per BE-06. ML_MODE=stub returns deterministic,
// L2-normalised vectors with zero network traffic (tests/E2E); ML_MODE=real
// POSTs to the FastAPI service with bearer auth, an 8 s timeout and
// allowlisted storage hosts only. Error classification follows BE-07.

import { z } from "zod";

export const STUB_MODEL_VERSIONS = {
  yolo: "stub-1.0.0",
  clip: "stub-1.0.0",
  quality: "stub-1.0.0",
  sentence: "stub-1.0.0",
} as const;

export const REQUEST_TIMEOUT_MS = 8000;

const bboxSchema = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });

const detectionSchema = z.object({
  label: z.string(),
  classId: z.number().int(),
  confidence: z.number().min(0).max(1),
  bbox: bboxSchema,
});

export const ImageAnalysis = z.object({
  modelVersions: z.record(z.string()),
  detections: z.array(detectionSchema),
  primaryObject: z.record(z.unknown()).nullable(),
  embedding: z.object({
    model: z.string(),
    dim: z.literal(512),
    vector: z.array(z.number()).length(512),
    source: z.enum(["crop", "full"]),
  }),
  categoryGuess: z.array(z.object({ category: z.string(), score: z.number().min(0).max(1) })),
  quality: z.object({
    blur: z.number(),
    brightness: z.number(),
    width: z.number().int(),
    height: z.number().int(),
    usable: z.boolean(),
  }),
  sensitive: z.object({ cardLikely: z.boolean() }),
});
export type ImageAnalysis = z.infer<typeof ImageAnalysis>;

export const EmbedTextResponse = z.object({
  embeddings: z
    .array(
      z.object({
        id: z.string(),
        clipText: z.array(z.number()).length(512),
        sentence: z.array(z.number()).length(384),
      }),
    )
    .min(1),
  modelVersions: z.record(z.string()),
});
export type EmbedTextResponse = z.infer<typeof EmbedTextResponse>;

export const Attributes = z.object({
  normalized: z.string(),
  itemName: z.string(),
  category: z.record(z.unknown()).nullable().optional(),
  colors: z.array(z.string()),
  brand: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  features: z.array(z.string()),
  keywords: z.array(z.string()),
});
export type Attributes = z.infer<typeof Attributes>;

export interface MlCallErrorOptions {
  code: string;
  status?: number;
  retryable: boolean;
}

export class MlCallError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, options: MlCallErrorOptions) {
    super(message);
    this.name = "MlCallError";
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable;
  }
}

export interface TextItem {
  id: string;
  text: string;
}

export interface AttributesInput {
  title: string;
  description: string;
  locale: "id" | "en";
}

export interface MlClient {
  analyzeImage(imageUrl: string): Promise<ImageAnalysis>;
  embedText(texts: TextItem[], locale: "id" | "en"): Promise<EmbedTextResponse>;
  extractAttributes(input: AttributesInput): Promise<Attributes>;
  modelVersions(): Promise<Record<string, string>>;
}

export interface MlClientOptions {
  mode: "stub" | "real";
  serviceUrl: string;
  token: string;
  allowedStorageOrigins: string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function fnv1a(key: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function unitVector(key: string, dim: number): number[] {
  let state = fnv1a(key) || 0x9e3779b9;
  const values: number[] = new Array<number>(dim);
  for (let i = 0; i < dim; i += 1) {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    values[i] = (state / 0xffffffff) * 2 - 1;
  }
  const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0)) || 1;
  return values.map((v) => v / norm);
}

function classifyFetchError(err: unknown, path: string): MlCallError {
  if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
    return new MlCallError(`${path}: timed out`, { code: "ML_TIMEOUT", retryable: true });
  }
  return new MlCallError(`${path}: network error`, { code: "ML_NETWORK", retryable: true });
}

function statusError(path: string, status: number): MlCallError {
  const retryable = status === 429 || status === 408 || status >= 500;
  return new MlCallError(`${path} returned HTTP ${status}`, {
    code: `ML_HTTP_${status}`,
    status,
    retryable,
  });
}

function invalidResponse(path: string, detail: string): MlCallError {
  return new MlCallError(`${path}: ${detail}`, { code: "ML_INVALID_RESPONSE", retryable: false });
}

export function createMlClient(options: MlClientOptions): MlClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  function assertAllowed(imageUrl: string): void {
    let origin: string;
    try {
      origin = new URL(imageUrl).origin;
    } catch {
      throw new MlCallError("imageUrl is not a valid URL", {
        code: "ML_URL_NOT_ALLOWED",
        retryable: false,
      });
    }
    if (!options.allowedStorageOrigins.includes(origin)) {
      throw new MlCallError("imageUrl host is not allowlisted", {
        code: "ML_URL_NOT_ALLOWED",
        retryable: false,
      });
    }
  }

  async function requestJson(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await fetchImpl(`${options.serviceUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${options.token}`,
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw classifyFetchError(err, path);
    }
    if (!response.ok) {
      throw statusError(path, response.status);
    }
    try {
      return await response.json();
    } catch {
      throw invalidResponse(path, "response is not JSON");
    }
  }

  async function postSchema<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
    const json = await requestJson("POST", path, body);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw invalidResponse(path, "response failed schema validation");
    }
    return parsed.data;
  }

  function stubAnalysis(imageUrl: string): ImageAnalysis {
    return ImageAnalysis.parse({
      modelVersions: { ...STUB_MODEL_VERSIONS },
      detections: [],
      primaryObject: null,
      embedding: {
        model: "stub-clip-vit-b-32",
        dim: 512,
        vector: unitVector(`image:${imageUrl}`, 512),
        source: "full",
      },
      categoryGuess: [],
      quality: { blur: 0, brightness: 0.5, width: 512, height: 512, usable: true },
      sensitive: { cardLikely: false },
    });
  }

  function stubEmbed(texts: TextItem[], locale: "id" | "en"): EmbedTextResponse {
    return EmbedTextResponse.parse({
      embeddings: texts.map((item) => ({
        id: item.id,
        clipText: unitVector(`clip:${locale}:${item.text}`, 512),
        sentence: unitVector(`sentence:${locale}:${item.text}`, 384),
      })),
      modelVersions: { ...STUB_MODEL_VERSIONS },
    });
  }

  function stubAttributes(input: AttributesInput): Attributes {
    return Attributes.parse({
      normalized: input.title.trim(),
      itemName: input.title.trim(),
      category: null,
      colors: [],
      brand: null,
      material: null,
      features: [],
      keywords: [],
    });
  }

  return {
    async analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
      assertAllowed(imageUrl);
      if (options.mode === "stub") {
        return stubAnalysis(imageUrl);
      }
      return postSchema("/v1/analyze-image", { imageUrl }, ImageAnalysis);
    },

    async embedText(texts: TextItem[], locale: "id" | "en"): Promise<EmbedTextResponse> {
      if (options.mode === "stub") {
        return stubEmbed(texts, locale);
      }
      return postSchema("/v1/embed-text", { texts, locale }, EmbedTextResponse);
    },

    async extractAttributes(input: AttributesInput): Promise<Attributes> {
      if (options.mode === "stub") {
        return stubAttributes(input);
      }
      return postSchema("/v1/extract-attributes", input, Attributes);
    },

    async modelVersions(): Promise<Record<string, string>> {
      if (options.mode === "stub") {
        return { ...STUB_MODEL_VERSIONS };
      }
      const json = await requestJson("GET", "/v1/models");
      if (!Array.isArray(json)) {
        throw invalidResponse("/v1/models", "expected an array");
      }
      const versions: Record<string, string> = {};
      for (const item of json as { name?: unknown; version?: unknown }[]) {
        if (typeof item.name === "string" && typeof item.version === "string") {
          versions[item.name] = item.version;
        }
      }
      return versions;
    },
  };
}
