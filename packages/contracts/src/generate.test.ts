// Generator tests (TMU-OPS-004). Frozen interface: docs/08-project/tasks/TMU-OPS-004.md
// section "Frozen interface for RED"; contract rules: BE-02 "Conventions baked into the
// generator" and BE-13 "Contract test helpers". The generator is the only writer of the four
// derived artefacts (docs/04-contracts/README.md governance), so its output is pinned here
// before the implementation exists.
//
// Fixtures are synthetic; no real people or real UNAIR data (AGENTS.md rule 5). The generator
// is pure: same version in, same bytes out (no clocks, no randomness).
//
// Import order is deliberate: "./generate.ts" precedes "yaml" so the RED run fails on the
// missing implementation module before resolving the not-yet-installed YAML parser.
import { describe, expect, it } from "vitest";
import { generateAll, toJsonSchema, tsTypeOf, type GeneratedFile } from "./generate.ts";
import { parse, stringify } from "yaml";
import { registry } from "./registry.ts";
import { examples } from "./examples.ts";
import { z } from "zod";

const VERSION = "1.0.0";
const OPENAPI_PATH = "docs/04-contracts/backend/BE-02-openapi.yaml";
const TYPES_PATH = "packages/contracts/generated/types.ts";
const CLIENT_PATH = "packages/contracts/generated/client.ts";
const MSW_PATH = "packages/contracts/generated/msw-handlers.ts";
const EXPECTED_PATHS = [OPENAPI_PATH, TYPES_PATH, CLIENT_PATH, MSW_PATH] as const;
const ISO_TIMESTAMP = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const ERROR_ENVELOPE_REF = "#/components/schemas/ErrorEnvelope";

type ResponseObject = {
  headers?: Record<string, unknown>;
  content?: Record<string, { schema?: { $ref?: string } } | undefined>;
};

type OperationObject = {
  operationId?: string;
  responses?: Record<string, ResponseObject | undefined>;
};

type OpenApiDocument = {
  openapi?: string;
  info?: { version?: string };
  paths?: Record<string, Record<string, OperationObject | undefined> | undefined>;
  components?: {
    securitySchemes?: Record<string, { type?: string; in?: string; name?: string } | undefined>;
  };
};

const contentOf = (files: readonly GeneratedFile[], path: string): string => {
  const file = files.find((candidate) => candidate.path === path);
  if (!file) throw new Error(`generateAll did not emit ${path}`);
  return file.content;
};

const parseOpenApi = (files: readonly GeneratedFile[]): OpenApiDocument =>
  parse(contentOf(files, OPENAPI_PATH)) as OpenApiDocument;

const operationOf = (
  doc: OpenApiDocument,
  path: string,
  method: string,
): OperationObject | undefined => doc.paths?.[path]?.[method];

const responsesOf = (
  doc: OpenApiDocument,
  path: string,
  method: string,
): Record<string, ResponseObject | undefined> => operationOf(doc, path, method)?.responses ?? {};

const isErrorStatus = (status: string): boolean =>
  status === "default" || /^[45]\d{2}$/.test(status);

describe("generateAll", () => {
  it("returns exactly the four derived artefacts", () => {
    const files = generateAll(VERSION);
    expect(files).toHaveLength(4);
    expect(files.map((file) => file.path).sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  it("is deterministic: two calls serialise identically", () => {
    expect(JSON.stringify(generateAll(VERSION))).toBe(JSON.stringify(generateAll(VERSION)));
  });

  it("stamps the contract version into all four artefacts", () => {
    const files = generateAll(VERSION);
    for (const path of EXPECTED_PATHS) {
      expect(contentOf(files, path), path).toContain(VERSION);
    }
  });

  it("emits no generation timestamps", () => {
    const yaml = contentOf(generateAll(VERSION), OPENAPI_PATH);
    expect(yaml).not.toContain("x-generated-at");
    expect(yaml).not.toMatch(ISO_TIMESTAMP);
  });
});

describe("BE-02-openapi.yaml", () => {
  it("parses as OpenAPI 3.1.0 at the requested info.version", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    expect(doc.openapi).toBe("3.1.0");
    expect(doc.info?.version).toBe(VERSION);
  });

  it("declares a path entry for every registry route", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    for (const route of registry) {
      expect(doc.paths?.[route.path], `missing path ${route.path}`).toBeDefined();
      expect(
        operationOf(doc, route.path, route.method),
        `missing ${route.method} ${route.path}`,
      ).toBeDefined();
    }
  });

  it("uses each route id as its operationId", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    for (const route of registry) {
      expect(operationOf(doc, route.path, route.method)?.operationId, route.id).toBe(route.id);
    }
  });

  it("declares an X-Request-Id header on every response of every operation", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    for (const route of registry) {
      const responses = responsesOf(doc, route.path, route.method);
      const statuses = Object.keys(responses);
      expect(statuses.length, `${route.id} must declare at least one response`).toBeGreaterThan(0);
      for (const status of statuses) {
        expect(responses[status]?.headers?.["X-Request-Id"], `${route.id} ${status}`).toBeDefined();
      }
    }
  });

  it("references ErrorEnvelope from every error response", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    let errorResponses = 0;
    for (const route of registry) {
      const responses = responsesOf(doc, route.path, route.method);
      for (const status of Object.keys(responses)) {
        if (!isErrorStatus(status)) continue;
        errorResponses += 1;
        const ref = responses[status]?.content?.["application/json"]?.schema?.$ref;
        expect(ref, `${route.id} ${status}`).toBe(ERROR_ENVELOPE_REF);
      }
    }
    // API-META-03 declares VALIDATION_FAILED, so the document must contain error responses.
    expect(errorResponses).toBeGreaterThan(0);
  });

  it("declares the cookie session security scheme", () => {
    const doc = parseOpenApi(generateAll(VERSION));
    const scheme = doc.components?.securitySchemes?.cookieAuth;
    expect(scheme?.type).toBe("apiKey");
    expect(scheme?.in).toBe("cookie");
    expect(scheme?.name).toBe("__Secure-temuunair.session");
  });
});

describe("generated artefacts", () => {
  it("types.ts carries the @generated banner and API ids (deterministic emitter)", () => {
    const types = contentOf(generateAll(VERSION), TYPES_PATH);
    expect(types).toContain("@generated");
    expect(types).toContain("API-SYS-01");
  });

  it("client.ts exposes an openapi-fetch factory", () => {
    expect(contentOf(generateAll(VERSION), CLIENT_PATH)).toContain("createClient");
  });

  it("msw-handlers.ts registers one example-backed handler per registry route", () => {
    const handlers = contentOf(generateAll(VERSION), MSW_PATH);
    const handlerLines = handlers
      .split("\n")
      .filter((line) => line.trimStart().startsWith("http."));
    expect(handlerLines).toHaveLength(registry.length);
    for (const route of registry) {
      const example = examples[route.id];
      if (example === undefined) throw new Error(`examples is missing an entry for ${route.id}`);
      const pattern = route.path.replace(/\{([^}]+)\}/g, ":$1");
      expect(handlers, route.id).toContain(
        `http.${route.method}("*${pattern}", () => HttpResponse.json(${JSON.stringify(example)}))`,
      );
    }
  });

  it("msw-handlers.ts body of every handler equals its examples.ts entry", () => {
    const handlers = contentOf(generateAll(VERSION), MSW_PATH);
    for (const route of registry) {
      const example = JSON.stringify(examples[route.id]);
      expect(handlers, route.id).toContain(`HttpResponse.json(${example})`);
    }
  });
});

// REV-TMU-OPS-004 MAJOR: zod-to-json-schema's "openApi3" target emits the 3.0 `nullable` keyword
// (ignored by 3.1) and unions as anyOf, while tsTypeOf had no branch for either. The frozen M0
// registry contains no nullable/union response yet (PageMeta.nextCursor lands with the first
// paginated M2 endpoint), so the emission path is pinned here on a synthetic schema — red first.
describe("OpenAPI 3.1 nullable and union emission", () => {
  const probe = z.object({
    nextCursor: z.string().nullable(),
    candidate: z.union([z.string(), z.number()]),
    kind: z.enum(["FOUND", "LOST"]).nullable(),
  });

  it("yaml uses 3.1 type arrays and never the 3.0 nullable keyword", () => {
    const yaml = stringify({ components: { schemas: { Probe: toJsonSchema(probe) } } });
    // Block sequence at any indent; "null" is quoted because JSON Schema needs the *string*
    // "null" (a bare `null` would round-trip as the null value).
    expect(yaml).toMatch(/type:\n\s+- string\n\s+- "null"/);
    expect(yaml).not.toContain("nullable");
    const parsed = parse(yaml) as { components?: { schemas?: { Probe?: unknown } } };
    expect(parsed.components?.schemas?.Probe).toMatchObject({
      properties: {
        nextCursor: { type: ["string", "null"] },
        candidate: { anyOf: [{ type: "string" }, { type: "number" }] },
        kind: { type: ["string", "null"], enum: ["FOUND", "LOST"] },
      },
    });
  });

  it("types nullable as | null and unions as A | B", () => {
    const ts = tsTypeOf(toJsonSchema(probe));
    expect(ts).toContain("string | null");
    expect(ts).toContain("string | number");
    expect(ts).toContain('"FOUND" | "LOST" | null');
  });

  it("the generated OpenAPI document itself carries no nullable keyword", () => {
    expect(contentOf(generateAll(VERSION), OPENAPI_PATH)).not.toContain("nullable");
  });
});
