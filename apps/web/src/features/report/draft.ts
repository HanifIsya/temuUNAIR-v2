import { z } from "zod";

import { draftDataSchema } from "./schemas";

export const DRAFT_VERSION = 1;

const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Draft data mirrors the contract shapes (see schemas.ts for the TS5097 note);
// contract-parity.test.ts locks the mirror to `ReportCreate.pick(...)`.
export type ReportDraftData = z.infer<typeof draftDataSchema>;

interface DraftEnvelope {
  version: number;
  savedAt: string;
  data: ReportDraftData;
}

export function draftKey(type: ReportDraftData["type"]): string {
  return `tu.draft.report.${type.toLowerCase()}`;
}

export function saveDraft(
  type: ReportDraftData["type"],
  data: ReportDraftData,
  now: Date = new Date(),
): void {
  // Strip verification hint answers before persisting to localStorage (ADR-0007 / FE-04 privacy rule)
  const sanitizedData: ReportDraftData = {
    ...data,
    hints: data.hints?.map((h) => ({
      prompt: h.prompt,
      answer: "",
    })),
  };
  const envelope: DraftEnvelope = {
    version: DRAFT_VERSION,
    savedAt: now.toISOString(),
    data: sanitizedData,
  };
  try {
    localStorage.setItem(draftKey(type), JSON.stringify(envelope));
  } catch {
    // Storage unavailable/quota — the draft is best-effort.
  }
}

export function loadDraft(
  type: ReportDraftData["type"],
  now: Date = new Date(),
): ReportDraftData | null {
  const key = draftKey(type);
  const drop = (): null => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — nothing to clear.
    }
    return null;
  };

  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return drop();
  }
  if (typeof parsed !== "object" || parsed === null) return drop();

  const envelope = parsed as Partial<DraftEnvelope>;
  if (envelope.version !== DRAFT_VERSION) return drop();

  const result = draftDataSchema.safeParse(envelope.data);
  if (!result.success) return drop();

  const savedAt = typeof envelope.savedAt === "string" ? Date.parse(envelope.savedAt) : NaN;
  if (Number.isNaN(savedAt) || now.getTime() - savedAt > DRAFT_MAX_AGE_MS) return drop();

  return result.data;
}

export function clearDraft(type: ReportDraftData["type"]): void {
  try {
    localStorage.removeItem(draftKey(type));
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
