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
import { generateAll, type GeneratedFile } from "./generate.ts";
import { parse } from "yaml";
import { registry } from "./registry.ts";

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
  it("types.ts is an openapi-typescript module with the @generated banner and API ids", () => {
    const types = contentOf(generateAll(VERSION), TYPES_PATH);
    expect(types).toContain("@generated");
    expect(types).toContain("API-SYS-01");
  });

  it("client.ts exposes an openapi-fetch factory", () => {
    expect(contentOf(generateAll(VERSION), CLIENT_PATH)).toContain("createClient");
  });

  it("msw-handlers.ts registers at least one http.get handler per registry route", () => {
    const handlers = contentOf(generateAll(VERSION), MSW_PATH);
    const occurrences = handlers.match(/http\.get\(/g) ?? [];
    expect(handlers).toContain("http.get(");
    expect(occurrences.length).toBeGreaterThanOrEqual(registry.length);
  });
});
