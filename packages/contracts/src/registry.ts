// Route registry: the single source of truth for API ids, auth, schemas and error codes
// (docs/04-contracts/README.md; BE-02). The generator derives every artefact from this list.
// The minimal M0 set is frozen by TMU-OPS-004; the full catalogue lands in TMU-CTR-001..005.
import { z } from "zod";
import { CategoryMeta, HealthResponse, LocationMeta, ReadyResponse } from "./common.ts";
import type { ErrorCode } from "./errors.ts";

export type Auth = "public" | "user" | "owner" | "moderator" | "admin";

export type RouteDef = {
  id: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  auth: Auth;
  request: z.ZodTypeAny | null;
  response: z.ZodTypeAny;
  errors: ErrorCode[];
  rateLimit?: string;
  deprecated?: boolean;
};

export type ApiId = string;

export const registry: readonly RouteDef[] = [
  {
    id: "API-SYS-01",
    method: "get",
    path: "/healthz",
    auth: "public",
    request: null,
    response: HealthResponse,
    errors: [],
  },
  {
    id: "API-SYS-02",
    method: "get",
    path: "/readyz",
    auth: "public",
    request: null,
    response: ReadyResponse,
    errors: [],
  },
  {
    id: "API-META-01",
    method: "get",
    path: "/api/v1/meta/categories",
    auth: "user",
    request: null,
    response: z.array(CategoryMeta),
    errors: [],
  },
  {
    id: "API-META-03",
    method: "get",
    path: "/api/v1/meta/locations",
    auth: "user",
    request: null,
    response: z.array(LocationMeta),
    errors: ["VALIDATION_FAILED"],
  },
];

export const registryById = new Map(registry.map((route) => [route.id, route]));
