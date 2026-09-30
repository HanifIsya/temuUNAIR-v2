// Breaking-change classifier (TMU-OPS-004; BE-01 "Versioning and deprecation", BE-02).
// Pure comparison of two parsed OpenAPI documents. It never throws: malformed input is ignored
// so `contracts:breaking` fails readably instead of crashing.
import type { Finding } from "./lint.ts";

export type { Finding } from "./lint.ts";

type JsonRecord = { [key: string]: unknown };

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): JsonRecord | undefined => (isRecord(value) ? value : undefined);

type Semver = readonly [number, number, number];

const semverOf = (value: string): Semver | null => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.trim());
  if (match === null) return null;
  const major = match[1];
  const minor = match[2];
  const patch = match[3];
  if (major === undefined || minor === undefined || patch === undefined) return null;
  return [Number(major), Number(minor), Number(patch)];
};

const compareSemver = (a: Semver, b: Semver): number => {
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
  if (a[2] !== b[2]) return a[2] < b[2] ? -1 : 1;
  return 0;
};

const valuesEqual = (a: unknown, b: unknown): boolean =>
  a === b || (typeof a === "object" && a !== null && JSON.stringify(a) === JSON.stringify(b));

type SchemaVisitor = (schema: unknown, pointer: string) => void;

// Response schemas: inline response bodies plus every component schema (components are shared
// response shapes in this contract; requests never live there).
const forEachResponseSchema = (doc: JsonRecord, visit: SchemaVisitor): void => {
  const paths = asRecord(doc["paths"]);
  if (paths !== undefined) {
    for (const [pathKey, pathItemValue] of Object.entries(paths)) {
      const pathItem = asRecord(pathItemValue);
      if (pathItem === undefined) continue;
      for (const method of HTTP_METHODS) {
        const operation = asRecord(pathItem[method]);
        if (operation === undefined) continue;
        const responses = asRecord(operation["responses"]);
        if (responses === undefined) continue;
        for (const [status, responseValue] of Object.entries(responses)) {
          const response = asRecord(responseValue);
          if (response === undefined) continue;
          const content = asRecord(response["content"]);
          const media = content === undefined ? undefined : asRecord(content["application/json"]);
          const schema = media === undefined ? undefined : media["schema"];
          if (schema === undefined) continue;
          visit(
            schema,
            `paths.${pathKey}.${method}.responses.${status}.content.application/json.schema`,
          );
        }
      }
    }
  }
  const components = asRecord(doc["components"]);
  const schemas = components === undefined ? undefined : asRecord(components["schemas"]);
  if (schemas !== undefined) {
    for (const [name, schema] of Object.entries(schemas)) {
      visit(schema, `components.schemas.${name}`);
    }
  }
};

const forEachRequestSchema = (doc: JsonRecord, visit: SchemaVisitor): void => {
  const paths = asRecord(doc["paths"]);
  if (paths === undefined) return;
  for (const [pathKey, pathItemValue] of Object.entries(paths)) {
    const pathItem = asRecord(pathItemValue);
    if (pathItem === undefined) continue;
    for (const method of HTTP_METHODS) {
      const operation = asRecord(pathItem[method]);
      if (operation === undefined) continue;
      const requestBody = asRecord(operation["requestBody"]);
      if (requestBody === undefined) continue;
      const content = asRecord(requestBody["content"]);
      const media = content === undefined ? undefined : asRecord(content["application/json"]);
      const schema = media === undefined ? undefined : media["schema"];
      if (schema === undefined) continue;
      visit(schema, `paths.${pathKey}.${method}.requestBody.content.application/json.schema`);
    }
  }
};

const walkProperties = (schema: unknown, pointer: string, out: Map<string, JsonRecord>): void => {
  const node = asRecord(schema);
  if (node === undefined) return;
  const properties = asRecord(node["properties"]);
  if (properties !== undefined) {
    out.set(`${pointer}.properties`, properties);
    for (const [key, value] of Object.entries(properties)) {
      walkProperties(value, `${pointer}.properties.${key}`, out);
    }
  }
  if (node["items"] !== undefined) walkProperties(node["items"], `${pointer}.items`, out);
  const additional = node["additionalProperties"];
  if (additional !== undefined && isRecord(additional)) {
    walkProperties(additional, `${pointer}.additionalProperties`, out);
  }
};

const walkEnums = (schema: unknown, pointer: string, out: Map<string, unknown[]>): void => {
  const node = asRecord(schema);
  if (node === undefined) return;
  const enumValues = node["enum"];
  if (Array.isArray(enumValues)) out.set(`${pointer}.enum`, enumValues);
  const properties = asRecord(node["properties"]);
  if (properties !== undefined) {
    for (const [key, value] of Object.entries(properties)) {
      walkEnums(value, `${pointer}.properties.${key}`, out);
    }
  }
  if (node["items"] !== undefined) walkEnums(node["items"], `${pointer}.items`, out);
};

const collectResponseProperties = (doc: JsonRecord): Map<string, JsonRecord> => {
  const out = new Map<string, JsonRecord>();
  forEachResponseSchema(doc, (schema, pointer) => walkProperties(schema, pointer, out));
  return out;
};

const collectResponseEnums = (doc: JsonRecord): Map<string, unknown[]> => {
  const out = new Map<string, unknown[]>();
  forEachResponseSchema(doc, (schema, pointer) => walkEnums(schema, pointer, out));
  return out;
};

const requiredKeysOf = (schema: unknown): Set<string> => {
  const node = asRecord(schema);
  const required = node === undefined ? undefined : node["required"];
  if (!Array.isArray(required)) return new Set();
  return new Set(required.filter((key): key is string => typeof key === "string"));
};

const collectRequestRequired = (doc: JsonRecord): Map<string, Set<string>> => {
  const out = new Map<string, Set<string>>();
  forEachRequestSchema(doc, (schema, pointer) => out.set(pointer, requiredKeysOf(schema)));
  return out;
};

const collectOperations = (doc: JsonRecord): Map<string, Set<string>> => {
  const out = new Map<string, Set<string>>();
  const paths = asRecord(doc["paths"]);
  if (paths === undefined) return out;
  for (const [pathKey, pathItemValue] of Object.entries(paths)) {
    const pathItem = asRecord(pathItemValue);
    if (pathItem === undefined) continue;
    const methods = new Set<string>();
    for (const method of HTTP_METHODS) {
      if (isRecord(pathItem[method])) methods.add(method);
    }
    if (methods.size > 0) out.set(pathKey, methods);
  }
  return out;
};

const removedPathFindings = (baseline: JsonRecord, current: JsonRecord): Finding[] => {
  const findings: Finding[] = [];
  const currentOperations = collectOperations(current);
  for (const [pathKey, methods] of collectOperations(baseline)) {
    const currentMethods = currentOperations.get(pathKey);
    for (const method of methods) {
      if (currentMethods !== undefined && currentMethods.has(method)) continue;
      findings.push({
        rule: "breaking/removed-path",
        path: `paths.${pathKey}.${method}`,
        message: `${method.toUpperCase()} ${pathKey} was removed`,
      });
    }
  }
  return findings;
};

const removedResponsePropertyFindings = (baseline: JsonRecord, current: JsonRecord): Finding[] => {
  const findings: Finding[] = [];
  const baselineProperties = collectResponseProperties(baseline);
  const currentProperties = collectResponseProperties(current);
  for (const [pointer, properties] of baselineProperties) {
    const currentKeys = currentProperties.get(pointer);
    for (const key of Object.keys(properties)) {
      if (currentKeys !== undefined && Object.hasOwn(currentKeys, key)) continue;
      findings.push({
        rule: "breaking/removed-response-property",
        path: `${pointer}.${key}`,
        message: `response property ${key} was removed`,
      });
    }
  }
  return findings;
};

const addedRequiredRequestPropertyFindings = (
  baseline: JsonRecord,
  current: JsonRecord,
): Finding[] => {
  const findings: Finding[] = [];
  const baselineRequired = collectRequestRequired(baseline);
  const currentRequired = collectRequestRequired(current);
  for (const [pointer, currentKeys] of currentRequired) {
    const baselineKeys = baselineRequired.get(pointer) ?? new Set<string>();
    for (const key of currentKeys) {
      if (baselineKeys.has(key)) continue;
      findings.push({
        rule: "breaking/added-required-request-property",
        path: `${pointer}.required`,
        message: `request property ${key} is required now but was not required before`,
      });
    }
  }
  return findings;
};

const removedEnumValueFindings = (baseline: JsonRecord, current: JsonRecord): Finding[] => {
  const findings: Finding[] = [];
  const baselineEnums = collectResponseEnums(baseline);
  const currentEnums = collectResponseEnums(current);
  for (const [pointer, baselineValues] of baselineEnums) {
    const currentValues = currentEnums.get(pointer);
    for (const value of baselineValues) {
      const stillAccepted =
        currentValues !== undefined &&
        currentValues.some((candidate) => valuesEqual(candidate, value));
      if (stillAccepted) continue;
      findings.push({
        rule: "breaking/removed-enum-value",
        path: pointer,
        message: `enum value ${String(value)} was removed`,
      });
    }
  }
  return findings;
};

export function classifyBreaking(
  baselineDoc: unknown,
  currentDoc: unknown,
  versions: { baselineVersion: string; currentVersion: string },
): Finding[] {
  const baseline = asRecord(baselineDoc) ?? {};
  const current = asRecord(currentDoc) ?? {};

  const findings: Finding[] = [
    ...removedPathFindings(baseline, current),
    ...removedResponsePropertyFindings(baseline, current),
    ...addedRequiredRequestPropertyFindings(baseline, current),
    ...removedEnumValueFindings(baseline, current),
  ];

  // Breaking changes require a major bump; a pure downgrade is also a version error (BE-01).
  const baselineSemver = semverOf(versions.baselineVersion);
  const currentSemver = semverOf(versions.currentVersion);
  if (baselineSemver !== null && currentSemver !== null) {
    if (findings.length > 0 && currentSemver[0] <= baselineSemver[0]) {
      findings.push({
        rule: "breaking/version-bump",
        path: "info.version",
        message: `breaking changes require a major bump: ${versions.baselineVersion} -> ${versions.currentVersion}`,
      });
    } else if (findings.length === 0 && compareSemver(currentSemver, baselineSemver) < 0) {
      findings.push({
        rule: "breaking/version-bump",
        path: "info.version",
        message: `contract version went backwards: ${versions.baselineVersion} -> ${versions.currentVersion}`,
      });
    }
  }

  return findings;
}
