// Breaking-change classifier tests (TMU-OPS-004). Frozen interface:
// docs/08-project/tasks/TMU-OPS-004.md "Frozen interface for RED" — classifyBreaking compares a
// baseline document with the current one and reports the frozen breaking/* rule ids. BE-02 and
// BE-01 govern versioning (breaking = major), so the generated document is cloned and mutated
// where possible and synthetic docs are used for shapes the minimal registry does not emit.
//
// Fixtures are synthetic; no real people or real UNAIR data (AGENTS.md rule 5). Import order is
// deliberate: "./breaking.ts" precedes "yaml" so the RED run fails on the missing implementation
// before resolving the not-yet-installed YAML parser.
import { describe, expect, it } from "vitest";
import { classifyBreaking, type Finding } from "./breaking.ts";
import { generateAll, type GeneratedFile } from "./generate.ts";
import { parse } from "yaml";

const VERSION = "1.0.0";
const OPENAPI_PATH = "docs/04-contracts/backend/BE-02-openapi.yaml";
const FROZEN_RULES: readonly string[] = [
  "breaking/removed-path",
  "breaking/removed-response-property",
  "breaking/added-required-request-property",
  "breaking/removed-enum-value",
  "breaking/version-bump",
];

type JsonRecord = { [key: string]: unknown };

type OpenApiDocument = JsonRecord & {
  info?: JsonRecord & { version?: string };
  paths?: Record<string, Record<string, unknown> | undefined>;
};

type Versions = { baselineVersion: string; currentVersion: string };

// The document parameters are not part of the frozen signature; the cast keeps the test agnostic
// to how the implementation types them while still allowing arbitrary synthetic docs.
type ClassifyDocument = Parameters<typeof classifyBreaking>[0];

const classify = (baseline: unknown, current: unknown, versions: Versions): Finding[] =>
  classifyBreaking(baseline as ClassifyDocument, current as ClassifyDocument, versions);

const rulesOf = (findings: readonly Finding[]): string[] => findings.map((finding) => finding.rule);

const contentOf = (files: readonly GeneratedFile[], path: string): string => {
  const file = files.find((candidate) => candidate.path === path);
  if (!file) throw new Error(`generateAll did not emit ${path}`);
  return file.content;
};

const cleanDocument = parse(contentOf(generateAll(VERSION), OPENAPI_PATH)) as OpenApiDocument;

const cleanDoc = (): OpenApiDocument => structuredClone(cleanDocument);

const firstPath = (doc: OpenApiDocument): string => {
  const key = Object.keys(doc.paths ?? {})[0];
  if (!key) throw new Error("the generated document declares no paths");
  return key;
};

const removeFirstPath = (doc: OpenApiDocument): void => {
  const paths = doc.paths;
  if (!paths) throw new Error("the generated document declares no paths");
  delete paths[firstPath(doc)];
};

type OperationSpec = {
  responseProperties: Record<string, unknown>;
  requestProperties?: Record<string, unknown>;
  requestRequired?: string[];
};

// Minimal inline document with one POST operation: the minimal registry emits no request bodies,
// so the request-property rule is exercised against this synthetic pair.
const syntheticDoc = (version: string, spec: OperationSpec): OpenApiDocument => {
  const operation: JsonRecord = {
    operationId: "API-TNG-01",
    responses: {
      "200": {
        description: "Synthetic success",
        content: {
          "application/json": {
            schema: { type: "object", properties: spec.responseProperties },
          },
        },
      },
    },
  };
  if (spec.requestProperties) {
    operation["requestBody"] = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: spec.requestProperties,
            required: spec.requestRequired ?? [],
          },
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: { title: "Synthetic API", version },
    paths: { "/api/v1/things": { post: operation } },
  };
};

describe("classifyBreaking", () => {
  it("reports nothing for identical documents at the same version", () => {
    const findings = classify(cleanDoc(), cleanDoc(), {
      baselineVersion: VERSION,
      currentVersion: VERSION,
    });
    expect(findings).toEqual([]);
  });

  it("accepts an additive optional response property with a minor bump", () => {
    const baseline = syntheticDoc("1.0.0", { responseProperties: { id: { type: "string" } } });
    const current = syntheticDoc("1.1.0", {
      responseProperties: { id: { type: "string" }, nickname: { type: "string" } },
    });
    const findings = classify(baseline, current, {
      baselineVersion: "1.0.0",
      currentVersion: "1.1.0",
    });
    expect(findings).toEqual([]);
  });

  it("reports a removed path", () => {
    const baseline = cleanDoc();
    const current = cleanDoc();
    removeFirstPath(current);
    const rules = rulesOf(
      classify(baseline, current, { baselineVersion: "1.0.0", currentVersion: "2.0.0" }),
    );
    expect(rules).toContain("breaking/removed-path");
  });

  it("reports a removed response property", () => {
    const baseline = syntheticDoc("1.0.0", {
      responseProperties: { id: { type: "string" }, name: { type: "string" } },
    });
    const current = syntheticDoc("2.0.0", { responseProperties: { id: { type: "string" } } });
    const rules = rulesOf(
      classify(baseline, current, { baselineVersion: "1.0.0", currentVersion: "2.0.0" }),
    );
    expect(rules).toContain("breaking/removed-response-property");
  });

  it("reports an added required request property and the missing major bump", () => {
    const baseline = syntheticDoc("1.0.0", {
      responseProperties: { id: { type: "string" } },
      requestProperties: { name: { type: "string" } },
      requestRequired: ["name"],
    });
    const current = syntheticDoc("1.0.0", {
      responseProperties: { id: { type: "string" } },
      requestProperties: { name: { type: "string" }, color: { type: "string" } },
      requestRequired: ["name", "color"],
    });
    const rules = rulesOf(
      classify(baseline, current, { baselineVersion: "1.0.0", currentVersion: "1.0.0" }),
    );
    expect(rules).toContain("breaking/added-required-request-property");
    expect(rules).toContain("breaking/version-bump");
  });

  it("reports a removed enum value", () => {
    const baseline = syntheticDoc("1.0.0", {
      responseProperties: { status: { type: "string", enum: ["OPEN", "CLOSED"] } },
    });
    const current = syntheticDoc("1.0.0", {
      responseProperties: { status: { type: "string", enum: ["OPEN"] } },
    });
    const rules = rulesOf(
      classify(baseline, current, { baselineVersion: "1.0.0", currentVersion: "1.0.0" }),
    );
    expect(rules).toContain("breaking/removed-enum-value");
  });

  it("reports the missing major bump when a path is removed on a patch release", () => {
    const baseline = cleanDoc();
    const current = cleanDoc();
    removeFirstPath(current);
    const rules = rulesOf(
      classify(baseline, current, { baselineVersion: "1.0.0", currentVersion: "1.0.1" }),
    );
    expect(rules).toContain("breaking/removed-path");
    expect(rules).toContain("breaking/version-bump");
  });

  it("reports a version downgrade even when the documents are identical", () => {
    const rules = rulesOf(
      classify(cleanDoc(), cleanDoc(), { baselineVersion: "1.1.0", currentVersion: "1.0.0" }),
    );
    expect(rules).toContain("breaking/version-bump");
  });

  it("returns findings whose fields are non-empty strings", () => {
    const baseline = cleanDoc();
    const current = cleanDoc();
    removeFirstPath(current);
    const findings = classify(baseline, current, {
      baselineVersion: "1.0.0",
      currentVersion: "2.0.0",
    });
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
});
