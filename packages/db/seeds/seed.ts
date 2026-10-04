// packages/db/seeds/seed.ts
// M3 seed data per BE-05 §Seeds and TMU-DB-005.
// Idempotent (ON CONFLICT DO NOTHING), deterministic, PII-free.
// All names are fictional; emails on example.test only.

// Deterministic UUIDs via a seeded factory to ensure repeatability.
// We use a simple counter-based approach with a fixed UUID prefix.
function makeId(prefix: string, n: number): string {
  const hex = n.toString(16).padStart(12, "0");
  return `${prefix}-0000-7000-8000-${hex}`;
}

// ── Locations (40 across 4 campuses) ────────────────────────────

export interface SeedLocation {
  id: string;
  campus: "KAMPUS_A" | "KAMPUS_B" | "KAMPUS_C" | "BANYUWANGI";
  name: string;
  kind: string;
  parentId: string | null;
  lat: number | null;
  lng: number | null;
}

const LOC_PREFIX = "018f0001";
let locN = 0;

function loc(
  campus: SeedLocation["campus"],
  name: string,
  kind: string,
  parentId: string | null = null,
  lat: number | null = null,
  lng: number | null = null,
): SeedLocation {
  return { id: makeId(LOC_PREFIX, ++locN), campus, name, kind, parentId, lat, lng };
}

// Kampus A (Surabaya) — 12 locations
const kampusA = [
  loc("KAMPUS_A", "Gedung Rektorat", "BUILDING", null, -7.2756, 112.7582),
  loc("KAMPUS_A", "Perpustakaan Pusat", "LIBRARY", null, -7.2761, 112.7576),
  loc("KAMPUS_A", "Fakultas Kedokteran", "BUILDING", null, -7.2748, 112.759),
  loc("KAMPUS_A", "Kantin FKH", "CANTEEN"),
  loc("KAMPUS_A", "Masjid Nuruzzaman", "PRAYER", null, -7.2753, 112.7579),
  loc("KAMPUS_A", "Parkir Utara A", "PARKING"),
  loc("KAMPUS_A", "Lapangan Basket A", "SPORT"),
  loc("KAMPUS_A", "Ruang 101 FK", "ROOM"),
  loc("KAMPUS_A", "Taman Baca A", "OUTDOOR"),
  loc("KAMPUS_A", "Gedung Asrama A", "BUILDING"),
  loc("KAMPUS_A", "Lab Kimia Dasar", "ROOM"),
  loc("KAMPUS_A", "Aula Garuda Mukti", "BUILDING"),
];

// Kampus B (Surabaya) — 10 locations
const kampusB = [
  loc("KAMPUS_B", "Gedung FISIP", "BUILDING", null, -7.2697, 112.7621),
  loc("KAMPUS_B", "Perpustakaan FISIP", "LIBRARY"),
  loc("KAMPUS_B", "Kantin FISIP", "CANTEEN"),
  loc("KAMPUS_B", "Gedung FEB", "BUILDING"),
  loc("KAMPUS_B", "Parkir FEB", "PARKING"),
  loc("KAMPUS_B", "Gedung FH", "BUILDING"),
  loc("KAMPUS_B", "Masjid B", "PRAYER"),
  loc("KAMPUS_B", "Lab Komputer B", "ROOM"),
  loc("KAMPUS_B", "Taman B", "OUTDOOR"),
  loc("KAMPUS_B", "Gedung Psikologi", "BUILDING"),
];

// Kampus C (Mulyorejo) — 10 locations
const kampusC = [
  loc("KAMPUS_C", "Gedung FPK", "BUILDING", null, -7.2695, 112.783),
  loc("KAMPUS_C", "Perpustakaan C", "LIBRARY"),
  loc("KAMPUS_C", "Kantin FPK", "CANTEEN"),
  loc("KAMPUS_C", "Gedung FST", "BUILDING"),
  loc("KAMPUS_C", "Masjid C", "PRAYER"),
  loc("KAMPUS_C", "Parkir C", "PARKING"),
  loc("KAMPUS_C", "Lapangan Voli C", "SPORT"),
  loc("KAMPUS_C", "Lab Biologi C", "ROOM"),
  loc("KAMPUS_C", "Ruang Seminar C", "ROOM"),
  loc("KAMPUS_C", "Taman Kupu-Kupu", "OUTDOOR"),
];

// Banyuwangi — 8 locations
const kampusBwi = [
  loc("BANYUWANGI", "Gedung Utama BWI", "BUILDING", null, -8.2195, 114.3695),
  loc("BANYUWANGI", "Perpustakaan BWI", "LIBRARY"),
  loc("BANYUWANGI", "Kantin BWI", "CANTEEN"),
  loc("BANYUWANGI", "Masjid BWI", "PRAYER"),
  loc("BANYUWANGI", "Parkir BWI", "PARKING"),
  loc("BANYUWANGI", "Lapangan BWI", "SPORT"),
  loc("BANYUWANGI", "Lab BWI", "ROOM"),
  loc("BANYUWANGI", "Taman BWI", "OUTDOOR"),
];

export const locations: SeedLocation[] = [...kampusA, ...kampusB, ...kampusC, ...kampusBwi];

// ── Drop points (6) ────────────────────────────────────────────

export interface SeedDropPoint {
  id: string;
  campus: SeedLocation["campus"];
  locationId: string;
  name: string;
  hours: Record<string, string> | null;
  contactNote: string | null;
}

const DP_PREFIX = "018f0002";
let dpN = 0;

function dp(
  campus: SeedDropPoint["campus"],
  locationId: string,
  name: string,
  hours: Record<string, string> | null = null,
  contactNote: string | null = null,
): SeedDropPoint {
  return { id: makeId(DP_PREFIX, ++dpN), campus, locationId, name, hours, contactNote };
}

export const dropPoints: SeedDropPoint[] = [
  dp(
    "KAMPUS_A",
    kampusA[0].id,
    "Satpam Rektorat",
    { weekday: "07:00-17:00" },
    "Hubungi pos satpam",
  ),
  dp("KAMPUS_A", kampusA[1].id, "Meja Info Perpustakaan Pusat", {
    weekday: "08:00-16:00",
    weekend: "09:00-13:00",
  }),
  dp("KAMPUS_B", kampusB[0].id, "Pos Jaga FISIP", { weekday: "07:00-17:00" }),
  dp("KAMPUS_B", kampusB[3].id, "Ruang TU FEB", { weekday: "08:00-15:00" }),
  dp("KAMPUS_C", kampusC[0].id, "Pos Jaga FPK", { weekday: "07:00-17:00" }),
  dp("BANYUWANGI", kampusBwi[0].id, "Pos Satpam BWI", { weekday: "07:00-17:00" }),
];

// ── Users (12: 1 admin, 4 moderators, 7 users) ─────────────────

export interface SeedUser {
  id: string;
  email: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  moderatorCampus: SeedLocation["campus"] | null;
}

const USR_PREFIX = "018f0003";
let usrN = 0;

function usr(
  email: string,
  displayName: string,
  role: SeedUser["role"],
  moderatorCampus: SeedUser["moderatorCampus"] = null,
): SeedUser {
  return { id: makeId(USR_PREFIX, ++usrN), email, displayName, role, moderatorCampus };
}

export const users: SeedUser[] = [
  usr("admin@example.test", "Admin Contoh", "ADMIN"),
  usr("mod.a@example.test", "Moderator Kampus A", "MODERATOR", "KAMPUS_A"),
  usr("mod.b@example.test", "Moderator Kampus B", "MODERATOR", "KAMPUS_B"),
  usr("mod.c@example.test", "Moderator Kampus C", "MODERATOR", "KAMPUS_C"),
  usr("mod.bwi@example.test", "Moderator Banyuwangi", "MODERATOR", "BANYUWANGI"),
  usr("pengguna1@example.test", "Pengguna Contoh Satu", "USER"),
  usr("pengguna2@example.test", "Pengguna Contoh Dua", "USER"),
  usr("pengguna3@example.test", "Pengguna Contoh Tiga", "USER"),
  usr("pengguna4@example.test", "Pengguna Contoh Empat", "USER"),
  usr("pengguna5@example.test", "Pengguna Contoh Lima", "USER"),
  usr("pengguna6@example.test", "Pengguna Contoh Enam", "USER"),
  usr("pengguna7@example.test", "Pengguna Contoh Tujuh", "USER"),
];

// ── Reports (30 mixed: 15 LOST + 15 FOUND, 3 sensitive) ────────

export interface SeedReport {
  id: string;
  type: "LOST" | "FOUND";
  reporterId: string;
  category: string;
  isSensitive: boolean;
  title: string;
  description: string;
  colors: string[];
  brand: string | null;
  campus: SeedLocation["campus"];
  locationId: string;
  occurredFrom: string; // ISO string
  custody: "HELD_BY_FINDER" | "AT_DROP_POINT" | null;
  dropPointId: string | null;
  expiresAt: string; // ISO string
}

const RPT_PREFIX = "018f0004";
let rptN = 0;

function rpt(
  type: SeedReport["type"],
  reporterIdx: number, // index into users[] (users only, indices 5-11)
  category: string,
  isSensitive: boolean,
  title: string,
  description: string,
  colors: string[],
  brand: string | null,
  campusIdx: number, // 0=A, 1=B, 2=C, 3=BWI
  locationIdx: number,
  custody: SeedReport["custody"] = null,
  dropPointIdx: number | null = null,
): SeedReport {
  const campuses: SeedLocation["campus"][] = ["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"];
  const campusLocations = [kampusA, kampusB, kampusC, kampusBwi];
  const dayOffset = rptN; // spread across days
  return {
    id: makeId(RPT_PREFIX, ++rptN),
    type,
    reporterId: users[reporterIdx].id,
    category,
    isSensitive,
    title,
    description,
    colors,
    brand,
    campus: campuses[campusIdx],
    locationId: campusLocations[campusIdx][locationIdx].id,
    occurredFrom: new Date(Date.UTC(2026, 8, 1 + dayOffset)).toISOString(),
    custody,
    dropPointId: dropPointIdx !== null ? dropPoints[dropPointIdx].id : null,
    expiresAt: new Date(Date.UTC(2026, 10, 1 + dayOffset)).toISOString(),
  };
}

export const reports: SeedReport[] = [
  // LOST reports (15) — reporters are users[5..11]
  rpt(
    "LOST",
    5,
    "BAG",
    false,
    "Tas Ransel Hitam",
    "Ketinggalan di perpustakaan pusat lantai 2",
    ["hitam"],
    "Eiger",
    0,
    1,
  ),
  rpt(
    "LOST",
    6,
    "ELECTRONICS",
    false,
    "Charger Laptop",
    "Tertinggal di kantin FKH",
    ["putih"],
    "Apple",
    0,
    3,
  ),
  rpt(
    "LOST",
    7,
    "KEYS",
    false,
    "Kunci Motor Honda",
    "Jatuh di parkir utara",
    ["abu-abu"],
    "Honda",
    0,
    5,
  ),
  rpt(
    "LOST",
    8,
    "WALLET",
    true,
    "Dompet Coklat",
    "Hilang di sekitar masjid",
    ["coklat"],
    null,
    0,
    4,
  ),
  rpt(
    "LOST",
    9,
    "CLOTHING",
    false,
    "Jaket Almamater",
    "Tertinggal di ruang 101",
    ["biru"],
    null,
    0,
    7,
  ),
  rpt(
    "LOST",
    10,
    "BOOK",
    false,
    "Buku Kalkulus Edisi 5",
    "Tertinggal di lab kimia dasar",
    ["merah", "putih"],
    "Purcell",
    0,
    10,
  ),
  rpt(
    "LOST",
    11,
    "ACCESSORY",
    false,
    "Kacamata Minus",
    "Hilang di taman baca",
    ["hitam"],
    "Rayban",
    0,
    8,
  ),
  rpt(
    "LOST",
    5,
    "ELECTRONICS",
    false,
    "Mouse Wireless",
    "Tertinggal di lab komputer B",
    ["hitam"],
    "Logitech",
    1,
    7,
  ),
  rpt(
    "LOST",
    6,
    "BAG",
    false,
    "Tote Bag Kanvas",
    "Ketinggalan di kantin FISIP",
    ["hijau"],
    null,
    1,
    2,
  ),
  rpt(
    "LOST",
    7,
    "DOCUMENT",
    true,
    "Map Berkas Penting",
    "Hilang di gedung FH",
    ["kuning"],
    null,
    1,
    5,
  ),
  rpt(
    "LOST",
    8,
    "WALLET",
    false,
    "Tempat Kartu",
    "Tertinggal di perpustakaan C",
    ["biru"],
    null,
    2,
    1,
  ),
  rpt("LOST", 9, "KEYS", false, "Kunci Kos", "Jatuh di parkir C", ["abu-abu"], null, 2, 5),
  rpt(
    "LOST",
    10,
    "BAG",
    false,
    "Pouch Alat Tulis",
    "Tertinggal di ruang seminar C",
    ["merah"],
    null,
    2,
    8,
  ),
  rpt(
    "LOST",
    11,
    "ELECTRONICS",
    true,
    "Flash Disk 32GB",
    "Hilang di gedung utama BWI",
    ["biru"],
    "Sandisk",
    3,
    0,
  ),
  rpt(
    "LOST",
    5,
    "ACCESSORY",
    false,
    "Botol Minum",
    "Tertinggal di kantin BWI",
    ["hijau"],
    "Tupperware",
    3,
    2,
  ),

  // FOUND reports (15) — reporters are users[5..11], custody required
  rpt(
    "FOUND",
    6,
    "BAG",
    false,
    "Tas Selempang",
    "Ditemukan di taman kupu-kupu",
    ["hitam", "merah"],
    null,
    2,
    9,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    7,
    "ELECTRONICS",
    false,
    "Power Bank",
    "Ditemukan di masjid Nuruzzaman",
    ["putih"],
    "Xiaomi",
    0,
    4,
    "AT_DROP_POINT",
    0,
  ),
  rpt(
    "FOUND",
    8,
    "KEYS",
    false,
    "Gantungan Kunci",
    "Ditemukan di parkir FEB",
    ["kuning"],
    null,
    1,
    4,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    9,
    "WALLET",
    false,
    "Dompet Hitam Kecil",
    "Ditemukan di gedung FISIP",
    ["hitam"],
    null,
    1,
    0,
    "AT_DROP_POINT",
    2,
  ),
  rpt(
    "FOUND",
    10,
    "CLOTHING",
    false,
    "Jaket Parasut",
    "Ditemukan di lapangan basket A",
    ["biru", "putih"],
    null,
    0,
    6,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    11,
    "BOOK",
    false,
    "Novel Terjemahan",
    "Ditemukan di taman B",
    ["coklat"],
    null,
    1,
    8,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    5,
    "ACCESSORY",
    false,
    "Payung Lipat",
    "Ditemukan di kantin FPK",
    ["merah"],
    null,
    2,
    2,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    6,
    "DOCUMENT",
    false,
    "Kartu Mahasiswa",
    "Ditemukan di perpustakaan FISIP",
    ["putih"],
    null,
    1,
    1,
    "AT_DROP_POINT",
    2,
  ),
  rpt(
    "FOUND",
    7,
    "BAG",
    false,
    "Tas Plastik Berisi Buku",
    "Ditemukan di lab BWI",
    ["putih"],
    null,
    3,
    6,
    "AT_DROP_POINT",
    5,
  ),
  rpt(
    "FOUND",
    8,
    "ELECTRONICS",
    false,
    "Earbuds Wireless",
    "Ditemukan di masjid B",
    ["putih"],
    null,
    1,
    6,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    9,
    "WALLET",
    false,
    "Tempat Uang Receh",
    "Ditemukan di parkir BWI",
    ["hitam"],
    null,
    3,
    4,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    10,
    "KEYS",
    false,
    "Kunci Gembok",
    "Ditemukan di lapangan voli C",
    ["abu-abu"],
    null,
    2,
    6,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    11,
    "ACCESSORY",
    false,
    "Jam Tangan Digital",
    "Ditemukan di gedung Psikologi",
    ["hitam"],
    "Casio",
    1,
    9,
    "AT_DROP_POINT",
    3,
  ),
  rpt(
    "FOUND",
    5,
    "CLOTHING",
    false,
    "Jas Lab",
    "Ditemukan di lab biologi C",
    ["putih"],
    null,
    2,
    7,
    "HELD_BY_FINDER",
  ),
  rpt(
    "FOUND",
    6,
    "OTHER",
    false,
    "Botol Termos",
    "Ditemukan di aula Garuda Mukti",
    ["merah"],
    null,
    0,
    11,
    "AT_DROP_POINT",
    0,
  ),
];

// ── SQL generation ──────────────────────────────────────────────

export function generateLocationsSql(): string {
  const rows = locations.map((l) => {
    const parent = l.parentId ? `'${l.parentId}'` : "NULL";
    const lat = l.lat !== null ? l.lat.toString() : "NULL";
    const lng = l.lng !== null ? l.lng.toString() : "NULL";
    return `  ('${l.id}', '${l.campus}', '${l.name}', '${l.kind}', ${parent}, ${lat}, ${lng}, true)`;
  });
  return `INSERT INTO locations (id, campus, name, kind, parent_id, lat, lng, active)\nVALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;\n`;
}

export function generateDropPointsSql(): string {
  const rows = dropPoints.map((d) => {
    const hours = d.hours ? `'${JSON.stringify(d.hours)}'` : "NULL";
    const contact = d.contactNote ? `'${d.contactNote}'` : "NULL";
    return `  ('${d.id}', '${d.campus}', '${d.locationId}', '${d.name}', ${hours}, ${contact}, true)`;
  });
  return `INSERT INTO drop_points (id, campus, location_id, name, hours, contact_note, active)\nVALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;\n`;
}

export function generateUsersSql(): string {
  const rows = users.map((u) => {
    const mc = u.moderatorCampus ? `'${u.moderatorCampus}'` : "NULL";
    return `  ('${u.id}', '${u.email}', '${u.displayName}', '${u.role}', ${mc})`;
  });
  return `INSERT INTO users (id, email, display_name, role, moderator_campus)\nVALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;\n`;
}

export function generateReportsSql(): string {
  const rows = reports.map((r) => {
    const colors = `'{${r.colors.map((c) => `"${c}"`).join(",")}}'`;
    const brand = r.brand ? `'${r.brand}'` : "NULL";
    const custody = r.custody ? `'${r.custody}'` : "NULL";
    const dpId = r.dropPointId ? `'${r.dropPointId}'` : "NULL";
    return `  ('${r.id}', '${r.type}', '${r.reporterId}', '${r.category}', ${r.isSensitive}, '${r.title}', '${r.description}', ${colors}, ${brand}, '${r.campus}', '${r.locationId}', '${r.occurredFrom}', ${custody}, ${dpId}, '${r.expiresAt}')`;
  });
  return `INSERT INTO reports (id, type, reporter_id, category, is_sensitive, title, description, colors, brand, campus, location_id, occurred_from, custody, drop_point_id, expires_at)\nVALUES\n${rows.join(",\n")}\nON CONFLICT (id) DO NOTHING;\n`;
}

export function generateAllSql(): string {
  return [
    "-- M3 seed data (TMU-DB-005). Idempotent, deterministic, PII-free.",
    "-- All names are fictional; emails on example.test only.",
    "",
    "-- Locations (~40)",
    generateLocationsSql(),
    "-- Drop points (6)",
    generateDropPointsSql(),
    "-- Users (12: 1 admin, 4 moderators, 7 users)",
    generateUsersSql(),
    "-- Reports (30 mixed: 15 LOST + 15 FOUND, 3 sensitive)",
    generateReportsSql(),
  ].join("\n");
}
