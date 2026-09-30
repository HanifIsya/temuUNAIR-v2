// Contract linter (TMU-OPS-004; BE-01 "Naming and shape rules" + BE-02 conventions).
// Pure function over an already-parsed OpenAPI document. It never throws — malformed input is
// reported as findings so `contracts:lint` fails readably instead of crashing. `scripts/lint.ts`
// parses the generated YAML and prints the result.
import { readFileSync } from "node:fs";
import { ERROR_CODES } from "./errors.ts";
import { registry as defaultRegistry } from "./registry.ts";
import type { RouteDef } from "./registry.ts";

export type Finding = { rule: string; path: string; message: string };

type JsonRecord = { [key: string]: unknown };

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

const ERROR_ENVELOPE_REF = "#/components/schemas/ErrorEnvelope";
const REQUEST_ID_HEADER = "X-Request-Id";
const OPERATION_ID_PATTERN = /^API-[A-Z]+-\d{2}$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const SCREAMING_SNAKE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
// The readiness enum (API-SYS-02) is lowercase by contract; it is the only exception to
// SCREAMING_SNAKE_CASE (BE-03).
const READINESS_VALUES: ReadonlySet<string> = new Set(["ok", "degraded", "down"]);
const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set([...ERROR_CODES]);
// This file lives at packages/contracts/src/lint.ts; three levels up is the repo root.
const CONTRACT_VERSION_PATH = new URL(
  "../../../docs/04-contracts/CONTRACT_VERSION",
  import.meta.url,
);

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isErrorStatus = (status: string): boolean =>
  status === "default" || /^[45]\d{2}$/.test(status);

const hasCookieAuth = (security: unknown): boolean =>
  Array.isArray(security) &&
  security.some((requirement) => isRecord(requirement) && "cookieAuth" in requirement);

const schemaRefOf = (response: unknown): unknown => {
  if (!isRecord(response)) return undefined;
  const content = response["content"];
  if (!isRecord(content)) return undefined;
  const media = content["application/json"];
  if (!isRecord(media)) return undefined;
  const schema = media["schema"];
  if (!isRecord(schema)) return undefined;
  return schema["$ref"];
};

const joinPointer = (pointer: string, segment: string): string =>
  pointer.length === 0 ? segment : `${pointer}.${segment}`;

const readContractVersion = (): string | null => {
  try {
    const content = readFileSync(CONTRACT_VERSION_PATH, "utf8").trim();
    return content.length > 0 ? content : null;
  } catch {
    // The version file is optional in tests and detached checkouts: semver check only.
    return null;
  }
};

export function lintOpenApi(
  doc: unknown,
  registry: readonly RouteDef[] = defaultRegistry,
): Finding[] {
  const findings: Finding[] = [];
  const root = isRecord(doc) ? doc : {};
  const paths = isRecord(root["paths"]) ? root["paths"] : {};
  const routeById = new Map(registry.map((route) => [route.id, route]));

  const operations: Array<{ pointer: string; operation: JsonRecord }> = [];
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!isRecord(pathItem)) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;
      operations.push({ pointer: `paths.${pathKey}.${method}`, operation });
    }
  }

  // base-path: everything lives under /api/v1 except the two system probes (BE-03).
  for (const pathKey of Object.keys(paths)) {
    if (!pathKey.startsWith("/api/v1/") && pathKey !== "/healthz" && pathKey !== "/readyz") {
      findings.push({
        rule: "base-path",
        path: `paths.${pathKey}`,
        message: `path ${pathKey} must live under /api/v1 (only /healthz and /readyz are exempt)`,
      });
    }
  }

  // operation-id: present, well-formed and unique (BE-02 convention 1).
  const pointersById = new Map<string, string[]>();
  for (const { pointer, operation } of operations) {
    const operationId = operation["operationId"];
    if (typeof operationId !== "string" || !OPERATION_ID_PATTERN.test(operationId)) {
      findings.push({
        rule: "operation-id",
        path: `${pointer}.operationId`,
        message: `operationId ${String(operationId)} must match API-<AREA>-<NN>`,
      });
      continue;
    }
    const existing = pointersById.get(operationId);
    if (existing === undefined) {
      pointersById.set(operationId, [pointer]);
    } else {
      existing.push(pointer);
    }
  }
  for (const [operationId, pointers] of pointersById) {
    if (pointers.length < 2) continue;
    for (const pointer of pointers) {
      findings.push({
        rule: "operation-id",
        path: `${pointer}.operationId`,
        message: `operationId ${operationId} is duplicated`,
      });
    }
  }

  // request-id-header + error-envelope, per response (BE-01 headers, BE-02 convention 2).
  for (const { pointer, operation } of operations) {
    const responses = operation["responses"];
    if (!isRecord(responses)) continue;
    for (const [status, response] of Object.entries(responses)) {
      const responsePointer = `${pointer}.responses.${status}`;
      const headers = isRecord(response) ? response["headers"] : undefined;
      if (!isRecord(headers) || !(REQUEST_ID_HEADER in headers)) {
        findings.push({
          rule: "request-id-header",
          path: `${responsePointer}.headers.${REQUEST_ID_HEADER}`,
          message: `response ${status} must declare the ${REQUEST_ID_HEADER} header`,
        });
      }
      if (!isErrorStatus(status)) continue;
      if (schemaRefOf(response) !== ERROR_ENVELOPE_REF) {
        findings.push({
          rule: "error-envelope",
          path: `${responsePointer}.content.application/json.schema.$ref`,
          message: `error response ${status} must reference ${ERROR_ENVELOPE_REF}`,
        });
      }
      const codes = isRecord(response) ? response["x-error-codes"] : undefined;
      if (Array.isArray(codes)) {
        for (const code of codes) {
          if (typeof code !== "string" || !KNOWN_ERROR_CODES.has(code)) {
            findings.push({
              rule: "error-envelope",
              path: `${responsePointer}.x-error-codes`,
              message: `unknown error code ${String(code)} in x-error-codes`,
            });
          }
        }
      }
    }
  }

  // security-scheme: non-public operations must be covered by cookieAuth (BE-02 convention 4).
  // An explicit operation-level `security` overrides root-level security.
  const rootHasCookieAuth = hasCookieAuth(root["security"]);
  for (const { pointer, operation } of operations) {
    const operationId = operation["operationId"];
    if (typeof operationId !== "string") continue;
    const route = routeById.get(operationId);
    if (route === undefined || route.auth === "public") continue;
    const operationSecurity = operation["security"];
    const covered = Array.isArray(operationSecurity)
      ? hasCookieAuth(operationSecurity)
      : rootHasCookieAuth;
    if (!covered) {
      findings.push({
        rule: "security-scheme",
        path: `${pointer}.security`,
        message: `${operationId} requires ${route.auth} auth and must declare cookieAuth`,
      });
    }
  }

  // Schema-shape rules: camelCase properties, SCREAMING_SNAKE enums and page.hasMore.
  const visit = (node: unknown, pointer: string): void => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, `${pointer}[${index}]`));
      return;
    }
    if (!isRecord(node)) return;

    const properties = node["properties"];
    if (isRecord(properties)) {
      for (const key of Object.keys(properties)) {
        if (key.includes("_")) {
          findings.push({
            rule: "camel-case-fields",
            path: `${pointer}.properties.${key}`,
            message: `property ${key} must be camelCase (BE-01)`,
          });
        }
      }
      // A `$ref` to the shared PageMeta component is validated by the component rule below;
      // only inline page objects are checked here.
      const page = properties["page"];
      if (isRecord(page) && typeof page["$ref"] !== "string") {
        const pageProperties = page["properties"];
        if (!isRecord(pageProperties) || !("hasMore" in pageProperties)) {
          findings.push({
            rule: "page-meta",
            path: `${pointer}.properties.page`,
            message: "pagination page schema must declare hasMore (BE-01)",
          });
        }
      }
    }

    const enumValues = node["enum"];
    if (Array.isArray(enumValues)) {
      for (const value of enumValues) {
        const allowed =
          typeof value === "string" &&
          (SCREAMING_SNAKE_PATTERN.test(value) || READINESS_VALUES.has(value));
        if (!allowed) {
          findings.push({
            rule: "enum-values",
            path: `${pointer}.enum`,
            message: `enum value ${String(value)} must be SCREAMING_SNAKE_CASE (readiness values excepted)`,
          });
        }
      }
    }

    for (const [key, value] of Object.entries(node)) {
      visit(value, joinPointer(pointer, key));
    }
  };
  visit(root, "");

  // page-meta: the shared PageMeta component must declare hasMore when present.
  const components = root["components"];
  const schemas =
    isRecord(components) && isRecord(components["schemas"]) ? components["schemas"] : undefined;
  const pageMeta = schemas === undefined ? undefined : schemas["PageMeta"];
  if (pageMeta !== undefined) {
    const pageMetaProperties = isRecord(pageMeta) ? pageMeta["properties"] : undefined;
    if (!isRecord(pageMetaProperties) || !("hasMore" in pageMetaProperties)) {
      findings.push({
        rule: "page-meta",
        path: "components.schemas.PageMeta",
        message: "PageMeta must declare hasMore (BE-01)",
      });
    }
  }

  // contract-version: semver, and in sync with docs/04-contracts/CONTRACT_VERSION when readable.
  const info = root["info"];
  const version = isRecord(info) ? info["version"] : undefined;
  if (typeof version !== "string" || !SEMVER_PATTERN.test(version)) {
    findings.push({
      rule: "contract-version",
      path: "info.version",
      message: `info.version ${String(version)} must be semver (x.y.z)`,
    });
  } else {
    const expectedVersion = readContractVersion();
    if (expectedVersion !== null && expectedVersion !== version) {
      findings.push({
        rule: "contract-version",
        path: "info.version",
        message: `info.version ${version} must match CONTRACT_VERSION ${expectedVersion}`,
      });
    }
  }

  return findings;
}
