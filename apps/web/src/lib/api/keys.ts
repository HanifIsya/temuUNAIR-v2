// Query key helpers (FE-04). Keys are the single source for cache lookups,
// invalidation and tests — never hand-build key arrays in components.
export type MetaName = "categories" | "campuses" | "locations" | "drop-points";

export function metaKey(name: MetaName, params?: unknown): unknown[] {
  return params === undefined ? ["meta", name] : ["meta", name, params];
}

export function reportsListKey(filters?: unknown): unknown[] {
  return filters === undefined ? ["reports", "list"] : ["reports", "list", filters];
}

export function reportsDetailKey(id: string): unknown[] {
  return ["reports", "detail", id];
}

export function reportsMineKey(filters?: unknown): unknown[] {
  return filters === undefined ? ["reports", "mine"] : ["reports", "mine", filters];
}

export function challengeKey(reportId: string): unknown[] {
  return ["challenge", reportId];
}
