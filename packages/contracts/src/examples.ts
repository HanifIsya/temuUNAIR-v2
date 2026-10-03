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
  "API-META-02": [
    {
      id: "KAMPUS_A",
      name: "Kampus A",
    },
    {
      id: "KAMPUS_B",
      name: "Kampus B",
    },
  ],
  "API-META-04": [
    {
      id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e80",
      campus: "KAMPUS_B",
      name: "Pos Keamanan Utama",
      active: true,
    },
  ],
  "API-ME-01": {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81",
    email: "budi@student.unair.ac.id",
    displayName: "Budi S.",
    role: "USER",
    status: "ACTIVE",
    locale: "id",
    createdAt: "2026-09-20T08:00:00+07:00",
  },
  "API-ME-02": {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81",
    email: "budi@student.unair.ac.id",
    displayName: "Budi Santoso",
    role: "USER",
    status: "ACTIVE",
    locale: "en",
    createdAt: "2026-09-20T08:00:00+07:00",
  },
  "API-ME-03": {
    scheduledAt: "2026-10-10T08:00:00+07:00",
  },
  "API-ME-04": {
    emailEnabled: true,
    mutedTypes: [],
  },
  "API-ME-05": {
    emailEnabled: false,
    mutedTypes: ["MATCH_SUGGESTED"],
  },
  "API-UPL-01": {
    uploadId: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
    uploadUrl: "https://storage.example.test/uploads/018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
    expiresAt: "2026-10-03T09:05:00+07:00",
  },
  "API-UPL-02": {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
    status: "READY",
    mime: "image/jpeg",
    sizeBytes: 102400,
    thumbUrl: "https://storage.example.test/uploads/018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82_thumb.jpg",
  },
  "API-UPL-03": {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
    status: "READY",
    mime: "image/jpeg",
    sizeBytes: 102400,
    thumbUrl: "https://storage.example.test/uploads/018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82_thumb.jpg",
  },
};
