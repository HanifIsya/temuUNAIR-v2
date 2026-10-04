// apps/web/src/server/services/meta.ts
// TMU-BE-005: catalog services for API-META-01..04. Categories are static
// (mirror of the shared Category enum — asserted against the contract enum in
// tests); campuses enrich the Campus enum with active location counts;
// locations and drop points read seeded data (DEC-005/DEC-022 "contoh"
// entries until the real list lands).

import { z } from "zod";
import { zodToValidationFailed } from "../validation";
import type { DropPointRow, MetaRepository } from "../repositories/meta";

export const CAMPUS_VALUES = ["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"] as const;
export type CampusValue = (typeof CAMPUS_VALUES)[number];

export interface CategoryMeta {
  value: string;
  labelKey: string;
  isSensitive: boolean;
  hintPrompts: string[];
}

export interface CampusMeta {
  id: CampusValue;
  name: string;
  locationCount: number;
}

export interface LocationMeta {
  id: string;
  campus: CampusValue;
  name: string;
}

export interface DropPointMeta {
  id: string;
  campus: CampusValue;
  name: string;
  locationId?: string;
  hours?: string;
  contactNote?: string;
  active: boolean;
}

export const SENSITIVE_CATEGORIES = ["ID_CARD", "BANK_CARD", "WALLET"] as const;

export const CATEGORY_META: readonly CategoryMeta[] = [
  {
    value: "ID_CARD",
    labelKey: "category.ID_CARD",
    isSensitive: true,
    hintPrompts: ["Nama depan di kartu?", "Ada tanda tangan di belakang?"],
  },
  {
    value: "BANK_CARD",
    labelKey: "category.BANK_CARD",
    isSensitive: true,
    hintPrompts: ["4 digit terakhir nomor kartu?", "Nama penerbit kartunya?"],
  },
  {
    value: "WALLET",
    labelKey: "category.WALLET",
    isSensitive: true,
    hintPrompts: ["Warna dominan dompetnya?", "Ada kartu atau uang di dalamnya?"],
  },
  {
    value: "PHONE",
    labelKey: "category.PHONE",
    isSensitive: false,
    hintPrompts: ["Apa warna casingnya?", "Ada stiker atau goresan khas?"],
  },
  {
    value: "LAPTOP_TABLET",
    labelKey: "category.LAPTOP_TABLET",
    isSensitive: false,
    hintPrompts: ["Berapa inci ukuran layarnya?", "Ada stiker atau goresan khas di cover?"],
  },
  {
    value: "EARPHONES",
    labelKey: "category.EARPHONES",
    isSensitive: false,
    hintPrompts: ["Apa warna earphonenya?", "Merek atau bentuk casingnya?"],
  },
  {
    value: "CHARGER_CABLE",
    labelKey: "category.CHARGER_CABLE",
    isSensitive: false,
    hintPrompts: ["Panjang kabelnya kira-kira?", "Ada kepala charger-nya?"],
  },
  {
    value: "KEYS",
    labelKey: "category.KEYS",
    isSensitive: false,
    hintPrompts: ["Berapa jumlah anak kuncinya?", "Ada gantungan atau label di keyring?"],
  },
  {
    value: "BAG",
    labelKey: "category.BAG",
    isSensitive: false,
    hintPrompts: ["Apa warna utama tasnya?", "Ada merek atau jahitan khas?"],
  },
  {
    value: "CLOTHING",
    labelKey: "category.CLOTHING",
    isSensitive: false,
    hintPrompts: ["Apa warna pakaiannya?", "Ada logo atau tulisan di bajunya?"],
  },
  {
    value: "GLASSES",
    labelKey: "category.GLASSES",
    isSensitive: false,
    hintPrompts: ["Apa warna bingkainya?", "Ada case atau lap kacamatanya?"],
  },
  {
    value: "BOTTLE",
    labelKey: "category.BOTTLE",
    isSensitive: false,
    hintPrompts: ["Berapa kapasitas botolnya?", "Apa warna tutupnya?"],
  },
  {
    value: "BOOK_DOCUMENT",
    labelKey: "category.BOOK_DOCUMENT",
    isSensitive: false,
    hintPrompts: ["Apa judul atau subjek bukunya?", "Ada nama pemilik di halaman awal?"],
  },
  {
    value: "STATIONERY",
    labelKey: "category.STATIONERY",
    isSensitive: false,
    hintPrompts: ["Jenis alat tulis apa itu?", "Ada merek atau warna khasnya?"],
  },
  {
    value: "ACCESSORY",
    labelKey: "category.ACCESSORY",
    isSensitive: false,
    hintPrompts: ["Aksesoris seperti apa bentuknya?", "Apa warna bahannya?"],
  },
  {
    value: "SPORTS_GEAR",
    labelKey: "category.SPORTS_GEAR",
    isSensitive: false,
    hintPrompts: ["Untuk olahraga apa alat ini?", "Apa warna utamanya?"],
  },
  {
    value: "UMBRELLA",
    labelKey: "category.UMBRELLA",
    isSensitive: false,
    hintPrompts: ["Apa warna payungnya?", "Gagangnya lurus atau melengkung?"],
  },
  {
    value: "HELMET",
    labelKey: "category.HELMET",
    isSensitive: false,
    hintPrompts: ["Apa warna helmnya?", "Ada visor atau stiker di helm?"],
  },
  {
    value: "OTHER",
    labelKey: "category.OTHER",
    isSensitive: false,
    hintPrompts: ["Seperti apa bentuk dan warnanya?", "Ada ciri khas yang mudah dikenali?"],
  },
];

export const CAMPUS_META: ReadonlyArray<{ id: CampusValue; name: string }> = [
  { id: "KAMPUS_A", name: "Kampus A" },
  { id: "KAMPUS_B", name: "Kampus B" },
  { id: "KAMPUS_C", name: "Kampus C" },
  { id: "BANYUWANGI", name: "Kampus Banyuwangi" },
];

const campusParamSchema = z.object({ campus: z.enum(CAMPUS_VALUES).optional() });

export function parseCampusParam(raw: string | null): CampusValue | undefined {
  const parsed = campusParamSchema.safeParse({ campus: raw ?? undefined });
  if (!parsed.success) throw zodToValidationFailed(parsed.error);
  return parsed.data.campus;
}

export async function getCampuses(repo: MetaRepository): Promise<CampusMeta[]> {
  const counts = await repo.countActiveLocationsByCampus();
  return CAMPUS_META.map((campus) => ({
    id: campus.id,
    name: campus.name,
    locationCount: counts.get(campus.id) ?? 0,
  }));
}

export async function getLocations(
  repo: MetaRepository,
  campus?: CampusValue,
): Promise<LocationMeta[]> {
  const rows = await repo.listLocations(campus);
  return rows.map((row) => ({ id: row.id, campus: row.campus as CampusValue, name: row.name }));
}

function formatHours(hours: DropPointRow["hours"]): string | undefined {
  if (hours === null || hours === undefined) return undefined;
  if (typeof hours === "string") return hours;
  if (typeof hours === "object") {
    return Object.entries(hours as Record<string, string>)
      .map(([day, time]) => `${day}: ${time}`)
      .join(", ");
  }
  return undefined;
}

export async function getDropPoints(
  repo: MetaRepository,
  campus?: CampusValue,
): Promise<DropPointMeta[]> {
  const rows = await repo.listDropPoints(campus);
  return rows.map((row) => {
    const hours = formatHours(row.hours);
    return {
      id: row.id,
      campus: row.campus as CampusValue,
      name: row.name,
      ...(row.locationId ? { locationId: row.locationId } : {}),
      ...(hours ? { hours } : {}),
      ...(row.contactNote ? { contactNote: row.contactNote } : {}),
      active: row.active,
    };
  });
}
