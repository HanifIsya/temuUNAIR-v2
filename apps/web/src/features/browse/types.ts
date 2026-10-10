import type { components } from "@temuunair/contracts/generated/types";

export type ReportPublicItem = components["schemas"]["API-REP-02Response"]["data"][number];
export type ReportOwnerItem = components["schemas"]["API-REP-01Response"];
export type ReportModeratorItem = components["schemas"]["API-ADM-02Response"];

export type CampusValue = ReportPublicItem["campus"];
export type CategoryValue = ReportPublicItem["category"];
export type ReportTypeValue = ReportPublicItem["type"];
export type CustodyValue = NonNullable<ReportPublicItem["custody"]>;
export type ReportStatusValue = ReportPublicItem["status"];

export interface BrowseFilters {
  type?: ReportTypeValue;
  campus?: CampusValue[];
  category?: CategoryValue[];
  dateFrom?: string;
  dateTo?: string;
  custody?: CustodyValue;
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface CampusMetaItem {
  id: string;
  name: string;
  locationCount?: number;
}

export interface CategoryMetaItem {
  value: string;
  labelKey: string;
  isSensitive: boolean;
  hintPrompts: string[];
}
