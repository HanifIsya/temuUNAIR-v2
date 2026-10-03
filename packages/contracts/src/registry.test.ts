// Contract registry tests (TMU-OPS-004). Frozen interface: docs/08-project/tasks/TMU-OPS-004.md
// section "Frozen interface for RED"; contract rules: BE-13 §1 and "Contract test helpers",
// FE-12 "MSW / contract validation". The registry is the single source of truth for API ids,
// auth, response schemas and examples (docs/04-contracts/README.md), so it is pinned here
// before the implementation exists.
//
// Fixtures are synthetic; no real people or real UNAIR data (AGENTS.md rule 5).
import { describe, expect, it } from "vitest";
import { ERROR_CODES, ERROR_STATUS } from "./errors.ts";
import { examples } from "./examples.ts";
import { Campus, Category, ReportStatus, ReportType } from "./enums.ts";
import { registry, registryById, type ApiId, type Auth, type RouteDef } from "./registry.ts";
import { expectMatchesContract } from "./testing.ts";

const AUTH_VALUES: readonly Auth[] = ["public", "user", "owner", "moderator", "admin"];
const NON_PUBLIC_AUTH: readonly Auth[] = ["user", "owner", "moderator", "admin"];

// BE-04 error catalog, verbatim (18 codes).
const BE_04_CODES = [
  "AUTH_REQUIRED",
  "AUTH_DOMAIN_NOT_ALLOWED",
  "ACCOUNT_SUSPENDED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "CONFLICT_STATE",
  "IDEMPOTENCY_CONFLICT",
  "CLAIM_ALREADY_ACTIVE",
  "CLAIM_LIMIT_EXCEEDED",
  "REPORT_NOT_CLAIMABLE",
  "SELF_CLAIM_NOT_ALLOWED",
  "UPLOAD_INVALID_TYPE",
  "UPLOAD_TOO_LARGE",
  "UPLOAD_LIMIT_REACHED",
  "RATE_LIMITED",
  "ML_UNAVAILABLE",
  "INTERNAL",
] as const;

const routeFor = (id: ApiId): RouteDef => {
  const route = registryById.get(id);
  if (!route) throw new Error(`registryById is missing ${id}`);
  return route;
};

describe("registry", () => {
  it("assigns every route a unique API-<AREA>-<NN> id", () => {
    const ids = registry.map((route) => route.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id, `${id} must match API-<AREA>-<NN>`).toMatch(/^API-[A-Z]+-\d{2}$/);
    }
  });

  it("uses lowercase HTTP methods and absolute paths", () => {
    const methods = ["get", "post", "put", "patch", "delete"] as const;
    for (const route of registry) {
      expect(methods, `${route.id} method`).toContain(route.method);
      expect(route.method, `${route.id} method`).toBe(route.method.toLowerCase());
      expect(route.path.startsWith("/"), `${route.id} path`).toBe(true);
    }
  });

  it("declares only auth values from the frozen Auth union", () => {
    for (const route of registry) {
      expect(AUTH_VALUES, `${route.id} auth`).toContain(route.auth);
      if (route.auth !== "public") {
        expect(NON_PUBLIC_AUTH, `${route.id} auth`).toContain(route.auth);
      }
    }
  });

  it("indexes every route by id and rejects unknown ids", () => {
    expect(registryById.get("API-SYS-01")).toBeDefined();
    expect(registryById.get("API-NOPE-99")).toBeUndefined();
    expect(registryById.size).toBe(registry.length);
    for (const route of registry) {
      expect(registryById.get(route.id)?.id).toBe(route.id);
    }
  });

  it("ships the route set including TMU-CTR-001 and TMU-CTR-002 additions", () => {
    expect(registry.map((route) => route.id).sort()).toEqual([
      "API-ME-01",
      "API-ME-02",
      "API-ME-03",
      "API-ME-04",
      "API-ME-05",
      "API-META-01",
      "API-META-02",
      "API-META-03",
      "API-META-04",
      "API-REP-01",
      "API-REP-02",
      "API-REP-03",
      "API-REP-04",
      "API-REP-05",
      "API-REP-06",
      "API-REP-07",
      "API-REP-08",
      "API-SYS-01",
      "API-SYS-02",
      "API-UPL-01",
      "API-UPL-02",
      "API-UPL-03",
    ]);

    expect(routeFor("API-SYS-01").path).toBe("/healthz");
    expect(routeFor("API-SYS-01").auth).toBe("public");
    expect(routeFor("API-SYS-02").path).toBe("/readyz");
    expect(routeFor("API-SYS-02").auth).toBe("public");
    expect(routeFor("API-META-01").path).toBe("/api/v1/meta/categories");
    expect(routeFor("API-META-01").auth).toBe("user");
    expect(routeFor("API-META-03").path).toBe("/api/v1/meta/locations");
    expect(routeFor("API-META-03").auth).toBe("user");
    expect(routeFor("API-META-03").errors).toEqual(["VALIDATION_FAILED"]);
    expect(routeFor("API-ME-01").path).toBe("/api/v1/me");
    expect(routeFor("API-UPL-01").path).toBe("/api/v1/uploads");
    expect(routeFor("API-REP-01").path).toBe("/api/v1/reports");
  });
});

describe("errors", () => {
  it("declares exactly the 18 BE-04 codes", () => {
    const codes = [...ERROR_CODES].sort();
    expect(codes).toHaveLength(18);
    expect(codes).toEqual([...BE_04_CODES].sort());
  });

  it("maps every code to a 4xx/5xx status and has no extra keys", () => {
    const codes = [...ERROR_CODES].sort();
    expect(Object.keys(ERROR_STATUS).sort()).toEqual(codes);
    for (const code of codes) {
      const status = ERROR_STATUS[code];
      expect(Number.isInteger(status), `${code} status`).toBe(true);
      expect(status, `${code} status`).toBeGreaterThanOrEqual(400);
      expect(status, `${code} status`).toBeLessThanOrEqual(599);
    }
  });

  it("keeps every route error a known ErrorCode", () => {
    const known = new Set<string>([...ERROR_CODES]);
    for (const route of registry) {
      for (const code of route.errors) {
        expect(known.has(code), `${route.id} declares unknown error ${code}`).toBe(true);
      }
    }
  });
});

describe("examples", () => {
  it("provides exactly one example per registry id", () => {
    const exampleById = new Map<string, unknown>(Object.entries(examples));
    expect(exampleById.size).toBe(registry.length);
    for (const route of registry) {
      expect(exampleById.has(route.id), `examples is missing ${route.id}`).toBe(true);
    }
  });

  it("parses every example with its route response schema", () => {
    const exampleById = new Map<string, unknown>(Object.entries(examples));
    for (const route of registry) {
      const parsed = route.response.safeParse(exampleById.get(route.id));
      const issues = parsed.success ? "" : JSON.stringify(parsed.error.issues);
      expect(parsed.success, `${route.id} example must parse: ${issues}`).toBe(true);
    }
  });
});

describe("expectMatchesContract", () => {
  it("accepts a payload matching the API-SYS-01 response schema", () => {
    const route = routeFor("API-SYS-01");
    expect(() =>
      expectMatchesContract("API-SYS-01", { status: "ok" }, route.response),
    ).not.toThrow();
  });

  it("throws for an api id that is not in the registry", () => {
    const route = routeFor("API-SYS-01");
    // Deliberately outside the ApiId union: the helper must fail closed.
    const unknownApiId = "API-NOPE-99" as unknown as ApiId;
    expect(() => expectMatchesContract(unknownApiId, { status: "ok" }, route.response)).toThrow();
  });

  it("throws when the payload violates the response schema", () => {
    const route = routeFor("API-SYS-01");
    expect(() => expectMatchesContract("API-SYS-01", { status: 123 }, route.response)).toThrow();
  });
});

describe("enums", () => {
  it("spot-checks the Blueprint §5A.4 values", () => {
    expect(Category.options).toContain("ID_CARD");
    expect(Category.options).toContain("OTHER");
    expect(ReportStatus.options).toContain("PENDING_REVIEW");
    expect(ReportStatus.options).toContain("RETURNED");
    expect(ReportType.options).toEqual(["LOST", "FOUND"]);
    expect(Campus.options).toContain("BANYUWANGI");
  });
});
