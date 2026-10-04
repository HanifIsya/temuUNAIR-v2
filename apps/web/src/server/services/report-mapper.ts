// apps/web/src/server/services/report-mapper.ts
// Pure row → contract view mapping for API-REP-01/02/04 (BE-03 view shapes).
// Sensitive masking happens HERE (ADR-0008, FR-REP-009): non-privileged viewers
// get generalized title/description, masked thumbnails and `url: null` — never
// the original image URL, geo or raw text.

import type {
  ReportImageRow,
  ReportModeratorView,
  ReportOwnerView,
  ReportPublicView,
  ReportRowView,
} from "./reports";

export const SENSITIVE_PUBLIC_TITLE = "Barang sensitif";
export const SENSITIVE_PUBLIC_DESCRIPTION =
  "Deskripsi disamarkan untuk melindungi privasi pelapor.";

export type Presign = (key: string) => Promise<string>;

export async function buildReportImages(
  rows: ReportImageRow[],
  opts: { privileged: boolean; sensitive: boolean; presign: Presign },
): Promise<ReportPublicView["images"]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!opts.privileged && opts.sensitive) {
        return {
          id: row.id,
          url: null,
          thumbUrl: row.maskedKey ? await opts.presign(row.maskedKey) : null,
          isMasked: true,
        };
      }
      return {
        id: row.id,
        url: await opts.presign(row.storageKey),
        thumbUrl: row.thumbKey ? await opts.presign(row.thumbKey) : null,
        isMasked: false,
      };
    }),
  );
}

export function mapReportPublic(
  row: ReportRowView,
  images: ReportPublicView["images"],
  opts: { privileged: boolean },
): ReportPublicView {
  const generalize = row.isSensitive && !opts.privileged;
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    category: row.category,
    isSensitive: row.isSensitive,
    title: generalize ? SENSITIVE_PUBLIC_TITLE : row.title,
    description: generalize ? SENSITIVE_PUBLIC_DESCRIPTION : row.description,
    colors: row.colors,
    ...(row.brand ? { brand: row.brand } : {}),
    images,
    campus: row.campus,
    ...(row.locationName ? { locationName: row.locationName } : {}),
    occurredAt: {
      from: row.occurredFrom,
      ...(row.occurredTo ? { to: row.occurredTo } : {}),
    },
    ...(row.custody ? { custody: row.custody } : {}),
    ...(row.dropPointName ? { dropPointName: row.dropPointName } : {}),
    createdAt: row.createdAt,
  };
}

export function mapReportOwner(
  base: ReportPublicView,
  row: ReportRowView,
  extras: { hintPrompts: string[]; matchCount: number; activeClaimId?: string },
): ReportOwnerView {
  return {
    ...base,
    version: row.version,
    matchCount: extras.matchCount,
    hintPrompts: extras.hintPrompts,
    ...(extras.activeClaimId ? { activeClaimId: extras.activeClaimId } : {}),
    expiresAt: row.expiresAt,
    ...(row.resolvedAt ? { resolvedAt: row.resolvedAt } : {}),
  };
}

export function mapReportModerator(
  ownerView: ReportOwnerView,
  extras: { reporterId: string; reporterEmail: string; flagCount: number },
): ReportModeratorView {
  return { ...ownerView, ...extras };
}
