// Contract test helper (BE-13 "Contract test helpers"): every endpoint test parses its payload
// with the registry response schema so drift fails closed.
import type { z } from "zod";
import { registryById, type ApiId } from "./registry.ts";

export function expectMatchesContract(apiId: ApiId, payload: unknown, schema: z.ZodTypeAny): void {
  if (!registryById.get(apiId)) {
    throw new Error(`Unknown API id: ${apiId}`);
  }
  schema.parse(payload);
}
