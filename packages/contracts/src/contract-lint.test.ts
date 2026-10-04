// Contract linter tests (TMU-OPS-004). Frozen interface: docs/08-project/tasks/TMU-OPS-004.md
// section "Frozen interface for RED" — `lintOpenApi(doc, registry?): Finding[]` must never throw
// and must report the frozen rule ids. BE-01 and Blueprint §5A.4 define the conventions the
// linter enforces, so the generated document is cloned and mutated one rule at a time here.
//
// Fixtures are synthetic; no real people or real UNAIR data (AGENTS.md rule 5). Import order is
// deliberate: "./lint.ts" precedes "yaml" so the RED run fails on the missing implementation
// before resolving the not-yet-installed YAML parser.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { lintOpenApi, type Finding } from "./lint.ts";
import { generateAll, type GeneratedFile } from "./generate.ts";
import { parse } from "yaml";

// Track the real contract version file: the lint rule under test asserts the generated
// document matches CONTRACT_VERSION, so the fixture must follow it (TMU-CTR-008 minor bump).
const VERSION = readFileSync(
  new URL("../../../docs/04-contracts/CONTRACT_VERSION", import.meta.url),
  "utf8",
).trim();
const OPENAPI_PATH = "docs/04-contracts/backend/BE-02-openapi.yaml";
const ERROR_ENVELOPE_REF = "#/components/schemas/ErrorEnvelope";
const REQUEST_ID_HEADER = "X-Request-Id";
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const FROZEN_RULES: readonly string[] = [
  "base-path",
  "operation-id",
  "camel-case-fields",
  "enum-values",
  "request-id-header",
  "error-envelope",
  "page-meta",
  "security-scheme",
  "contract-version",
  // Review cycle 1 additions: TMU-OPS-004 freezes the original nine, and REV-TMU-OPS-004
  // (BLOCKER + MAJOR) mandates these two so the same defects cannot pass the gate again.
  "response-description",
  "no-30-nullable",
] as const;

type JsonRecord = { [key: string]: unknown };

type OperationObject = JsonRecord & {
  operationId?: string;
  security?: unknown[];
  responses?: Record<string, JsonRecord | undefined>;
};

type OpenApiDocument = JsonRecord & {
  info?: JsonRecord & { version?: string };
  paths?: Record<string, Record<string, OperationObject | undefined> | undefined>;
  components?: JsonRecord & { schemas?: Record<string, JsonRecord | undefined> };
  security?: Array<Record<string, unknown>>;
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ensureRecord = (parent: JsonRecord, key: string): JsonRecord => {
  const current = parent[key];
  if (isRecord(current)) return current;
  const created: JsonRecord = {};
  parent[key] = created;
  return created;
};

const contentOf = (files: readonly GeneratedFile[], path: string): string => {
  const file = files.find((candidate) => candidate.path === path);
  if (!file) throw new Error(`generateAll did not emit ${path}`);
  return file.content;
};

const cleanDocument = parse(contentOf(generateAll(VERSION), OPENAPI_PATH)) as OpenApiDocument;

const cleanDoc = (): OpenApiDocument => structuredClone(cleanDocument);

// The document parameter is not part of the frozen signature; the cast keeps the test agnostic
// to how the implementation types it while still letting malformed values through at runtime.
type LintDocument = Parameters<typeof lintOpenApi>[0];

const lint = (doc: unknown): Finding[] => lintOpenApi(doc as LintDocument);

const rulesOf = (doc: unknown): string[] => lint(doc).map((finding) => finding.rule);

const operationsOf = (doc: OpenApiDocument): OperationObject[] => {
  const operations: OperationObject[] = [];
  for (const pathItem of Object.values(doc.paths ?? {})) {
    if (!isRecord(pathItem)) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (isRecord(operation)) operations.push(operation as OperationObject);
    }
  }
  return operations;
};

const firstOperation = (doc: OpenApiDocument): OperationObject => {
  const operation = operationsOf(doc)[0];
  if (!operation) throw new Error("the generated document declares no operations");
  return operation;
};

const operationById = (doc: OpenApiDocument, operationId: string): OperationObject => {
  const operation = operationsOf(doc).find((candidate) => candidate.operationId === operationId);
  if (!operation) throw new Error(`the generated document declares no ${operationId} operation`);
  return operation;
};

// Depth-first search over the parsed document; mutations never assume a fixed position.
const findRecord = (
  node: unknown,
  predicate: (record: JsonRecord) => boolean,
): JsonRecord | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecord(item, predicate);
      if (found) return found;
    }
    return undefined;
  }
  if (!isRecord(node)) return undefined;
  if (predicate(node)) return node;
  for (const value of Object.values(node)) {
    const found = findRecord(value, predicate);
    if (found) return found;
  }
  return undefined;
};

type PropertyAnchor = { properties: JsonRecord; key: string };

const findCamelCaseProperty = (node: unknown): PropertyAnchor | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findCamelCaseProperty(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!isRecord(node)) return undefined;
  const properties = node["properties"];
  if (isRecord(properties)) {
    const key = Object.keys(properties).find((candidate) => /[a-z][A-Z]/.test(candidate));
    if (key) return { properties, key };
  }
  for (const value of Object.values(node)) {
    const found = findCamelCaseProperty(value);
    if (found) return found;
  }
  return undefined;
};

const isScreamingSnake = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Z][A-Z0-9_]*$/.test(value);

const findEnumArray = (node: unknown): unknown[] | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findEnumArray(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!isRecord(node)) return undefined;
  const enumValues = node["enum"];
  if (Array.isArray(enumValues) && enumValues.some(isScreamingSnake)) return enumValues;
  for (const value of Object.values(node)) {
    const found = findEnumArray(value);
    if (found) return found;
  }
  return undefined;
};

const findErrorEnvelopeSchema = (doc: OpenApiDocument): JsonRecord => {
  for (const operation of operationsOf(doc)) {
    for (const response of Object.values(operation.responses ?? {})) {
      if (!isRecord(response)) continue;
      const content = response["content"];
      if (!isRecord(content)) continue;
      const media = content["application/json"];
      if (!isRecord(media)) continue;
      const schema = media["schema"];
      if (isRecord(schema) && schema["$ref"] === ERROR_ENVELOPE_REF) return schema;
    }
  }
  throw new Error(`the generated document has no error response referencing ${ERROR_ENVELOPE_REF}`);
};

const minimalOperation = (operationId: string): OperationObject => ({
  operationId,
  responses: {
    "200": {
      headers: { [REQUEST_ID_HEADER]: { schema: { type: "string" } } },
      content: { "application/json": { schema: { type: "object" } } },
    },
  },
});

// --- Mutations: each one breaks exactly one frozen rule -------------------------------

const mutateForeignBasePath = (doc: OpenApiDocument): void => {
  const paths = (doc.paths ??= {});
  paths["/v2/thing"] = { get: minimalOperation("API-NOPE-99") };
};

const mutateWrongOperationId = (doc: OpenApiDocument): void => {
  firstOperation(doc).operationId = "nope";
};

const mutateDuplicateOperationIds = (doc: OpenApiDocument): void => {
  const [first, second] = operationsOf(doc);
  if (!first?.operationId) throw new Error("the generated document has no operationId to copy");
  if (!second) throw new Error("the generated document has fewer than two operations");
  second.operationId = first.operationId;
};

const mutateSnakeCaseProperty = (doc: OpenApiDocument): void => {
  const anchor = findCamelCaseProperty(doc);
  if (!anchor) throw new Error("the generated document has no camelCase property to mutate");
  const snakeCase = anchor.key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  const value = anchor.properties[anchor.key];
  delete anchor.properties[anchor.key];
  anchor.properties[snakeCase] = value;
};

// The minimal registry may not surface a SCREAMING_SNAKE enum yet; if so, add a synthetic inline
// schema so the enum-values rule can still be exercised deterministically.
const injectSyntheticEnum = (doc: OpenApiDocument): unknown[] => {
  const paths = ensureRecord(doc, "paths");
  const operation = minimalOperation("API-SYN-97");
  const response = ensureRecord(ensureRecord(operation, "responses"), "200");
  const media = ensureRecord(ensureRecord(response, "content"), "application/json");
  const enumValues = ["SYNTHETIC_VALUE"];
  media["schema"] = {
    type: "object",
    properties: { syntheticEnum: { type: "string", enum: enumValues } },
  };
  paths["/api/v1/synthetic-enum"] = { get: operation };
  return enumValues;
};

const mutateLowercaseEnumValue = (doc: OpenApiDocument): void => {
  const enumValues = findEnumArray(doc) ?? injectSyntheticEnum(doc);
  const index = enumValues.findIndex(isScreamingSnake);
  enumValues[index] = String(enumValues[index]).toLowerCase();
};

const mutateMissingRequestIdHeader = (doc: OpenApiDocument): void => {
  const response = findRecord(doc, (record) => {
    const headers = record["headers"];
    return isRecord(headers) && REQUEST_ID_HEADER in headers;
  });
  const headers = response?.["headers"];
  if (!isRecord(headers))
    throw new Error(`the generated document declares no ${REQUEST_ID_HEADER}`);
  delete headers[REQUEST_ID_HEADER];
};

const mutateWrongErrorEnvelopeRef = (doc: OpenApiDocument): void => {
  findErrorEnvelopeSchema(doc)["$ref"] = "#/components/schemas/NotTheErrorEnvelope";
};

const mutatePageMissingHasMore = (doc: OpenApiDocument): void => {
  // Component form: a shared page schema that lost hasMore.
  const schemas = ensureRecord(ensureRecord(doc, "components"), "schemas");
  schemas["PageMeta"] = {
    type: "object",
    properties: { nextCursor: { type: ["string", "null"] } },
  };

  // Inline form: the first response gains a page object without hasMore.
  const response = ensureRecord(ensureRecord(firstOperation(doc), "responses"), "200");
  const media = ensureRecord(ensureRecord(response, "content"), "application/json");
  const schema = ensureRecord(media, "schema");
  const properties = ensureRecord(schema, "properties");
  properties["page"] = { type: "object", properties: { nextCursor: { type: ["string", "null"] } } };
};

const mutateNonPublicWithoutCookieAuth = (doc: OpenApiDocument): void => {
  const operation = operationById(doc, "API-META-01");
  delete operation["security"];
  // Root-level security would still cover the operation, so drop cookieAuth there too.
  if (Array.isArray(doc.security)) {
    doc.security = doc.security.filter((requirement) => !("cookieAuth" in requirement));
  }
};

const mutateNonSemverVersion = (doc: OpenApiDocument): void => {
  doc.info = { ...(doc.info ?? {}), version: "not-semver" };
};

const mutateMissingResponseDescription = (doc: OpenApiDocument): void => {
  for (const operation of operationsOf(doc)) {
    for (const response of Object.values(operation.responses ?? {})) {
      if (isRecord(response)) delete response["description"];
    }
  }
};

const mutateThirtyNullable = (doc: OpenApiDocument): void => {
  const schemas = ensureRecord(ensureRecord(doc, "components"), "schemas");
  schemas["SyntheticNullable"] = { type: "string", nullable: true };
};

type Mutation = { name: string; rule: string; apply: (doc: OpenApiDocument) => void };

const MUTATIONS: readonly Mutation[] = [
  { name: "a path outside /api/v1", rule: "base-path", apply: mutateForeignBasePath },
  { name: "an unknown operationId", rule: "operation-id", apply: mutateWrongOperationId },
  { name: "duplicate operationIds", rule: "operation-id", apply: mutateDuplicateOperationIds },
  { name: "a snake_case property", rule: "camel-case-fields", apply: mutateSnakeCaseProperty },
  { name: "a lowercase enum value", rule: "enum-values", apply: mutateLowercaseEnumValue },
  {
    name: "a response without X-Request-Id",
    rule: "request-id-header",
    apply: mutateMissingRequestIdHeader,
  },
  {
    name: "an error response not referencing ErrorEnvelope",
    rule: "error-envelope",
    apply: mutateWrongErrorEnvelopeRef,
  },
  { name: "a page object missing hasMore", rule: "page-meta", apply: mutatePageMissingHasMore },
  {
    name: "a non-public operation without cookieAuth",
    rule: "security-scheme",
    apply: mutateNonPublicWithoutCookieAuth,
  },
  { name: "a non-semver info.version", rule: "contract-version", apply: mutateNonSemverVersion },
  {
    name: "a response without a description",
    rule: "response-description",
    apply: mutateMissingResponseDescription,
  },
  {
    name: "a 3.0-style nullable keyword",
    rule: "no-30-nullable",
    apply: mutateThirtyNullable,
  },
];

describe("lintOpenApi", () => {
  it("reports no findings for the generated document", () => {
    expect(lint(cleanDoc())).toEqual([]);
  });

  it.each(MUTATIONS)("reports $rule for $name", ({ rule, apply }) => {
    const doc = cleanDoc();
    apply(doc);
    expect(rulesOf(doc)).toContain(rule);
  });

  it("reports response-description for a hand-built document whose response omits it", () => {
    const doc: OpenApiDocument = {
      openapi: "3.1.0",
      info: { title: "probe", version: VERSION },
      paths: { "/api/v1/probe": { get: minimalOperation("API-PRB-01") } },
    };
    expect(rulesOf(doc)).toContain("response-description");
  });

  it("declares a non-empty description on every response of the generated document", () => {
    let seen = 0;
    for (const operation of operationsOf(cleanDoc())) {
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!isRecord(response)) continue;
        seen += 1;
        const label = `${operation.operationId} ${status}`;
        expect(typeof response["description"], label).toBe("string");
        expect(String(response["description"]).trim().length, label).toBeGreaterThan(0);
      }
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("emits no OpenAPI 3.0 nullable keyword in the generated document", () => {
    expect(JSON.stringify(cleanDoc())).not.toContain("nullable");
  });

  it("returns findings whose fields are non-empty strings", () => {
    const doc = cleanDoc();
    mutateForeignBasePath(doc);
    const findings = lint(doc);
    expect(findings.length).toBeGreaterThan(0);
    for (const finding of findings) {
      expect(typeof finding.rule).toBe("string");
      expect(typeof finding.path).toBe("string");
      expect(typeof finding.message).toBe("string");
      expect(finding.rule.length).toBeGreaterThan(0);
      expect(finding.path.length).toBeGreaterThan(0);
      expect(finding.message.length).toBeGreaterThan(0);
      expect(FROZEN_RULES).toContain(finding.rule);
    }
  });

  it("never throws on malformed documents", () => {
    const malformed: readonly unknown[] = [null, {}, "x", { paths: 1 }];
    for (const doc of malformed) {
      expect(() => lint(doc), JSON.stringify(doc)).not.toThrow();
      expect(Array.isArray(lint(doc)), JSON.stringify(doc)).toBe(true);
    }
  });
});
