// One synthetic, schema-valid example per registry id. Used by the generated MSW handlers and
// by tests; never real people or real UNAIR data (AGENTS.md rule 5).
import type { ApiId } from "./registry.ts";

export const examples: Record<ApiId, unknown> = {
  "API-SYS-01": { status: "ok" },
  "API-SYS-02": { db: "ok", storage: "ok", ml: "degraded" },
  "API-META-01": [
    {
      value: "ID_CARD",
      labelKey: "category.ID_CARD",
      isSensitive: true,
      hintPrompts: ["Nama depan di kartu?"],
    },
  ],
  "API-META-03": [
    {
      id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e7f",
      campus: "KAMPUS_B",
      name: "Perpustakaan",
    },
  ],
};
