// Core contract enums (Blueprint §5A.4). Values are frozen: rename/reorder requires a
// TMU-CTR task, a CONTRACT_VERSION major bump and an ADR (docs/04-contracts/README.md).
import { z } from "zod";

export const ReportType = z.enum(["LOST", "FOUND"]);

export const ReportStatus = z.enum([
  "PENDING_REVIEW",
  "OPEN",
  "MATCHED",
  "IN_VERIFICATION",
  "RETURNED",
  "EXPIRED",
  "CANCELLED",
  "REMOVED",
]);

export const Category = z.enum([
  "ID_CARD",
  "BANK_CARD",
  "WALLET",
  "PHONE",
  "LAPTOP_TABLET",
  "EARPHONES",
  "CHARGER_CABLE",
  "KEYS",
  "BAG",
  "CLOTHING",
  "GLASSES",
  "BOTTLE",
  "BOOK_DOCUMENT",
  "STATIONERY",
  "ACCESSORY",
  "SPORTS_GEAR",
  "UMBRELLA",
  "HELMET",
  "OTHER",
]);

export const Campus = z.enum(["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"]);

export const Custody = z.enum(["HELD_BY_FINDER", "AT_DROP_POINT"]);

export const MatchBand = z.enum(["STRONG", "POSSIBLE"]);

export const MatchState = z.enum(["SUGGESTED", "DISMISSED", "CLAIMED", "INVALIDATED"]);

export const ClaimStatus = z.enum([
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "DISPUTED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

export const UserRole = z.enum(["USER", "MODERATOR", "ADMIN"]);

export const UserStatus = z.enum(["ACTIVE", "SUSPENDED", "DELETED"]);

export const UploadStatus = z.enum(["PENDING", "READY", "REJECTED"]);

export const FlagStatus = z.enum(["OPEN", "RESOLVED"]);

export const DisputeDecision = z.enum(["APPROVE", "REJECT"]);

export const NotificationType = z.enum([
  "MATCH_SUGGESTED",
  "MATCH_INVITE",
  "CLAIM_SUBMITTED",
  "CLAIM_APPROVED",
  "CLAIM_REJECTED",
  "CLAIM_REMINDER",
  "MESSAGE_RECEIVED",
  "HANDOVER_PLANNED",
  "HANDOVER_CONFIRMED",
  "REPORT_RETURNED",
  "REPORT_EXPIRING",
  "REPORT_EXPIRED",
  "REPORT_REMOVED",
  "REPORT_APPROVED",
  "ADMIN_DISPUTE",
]);

export const LocationKind = z.enum([
  "BUILDING",
  "ROOM",
  "CANTEEN",
  "LIBRARY",
  "PARKING",
  "PRAYER",
  "SPORT",
  "OUTDOOR",
  "OTHER",
]);
