import { step1Schema } from "./schemas";
import type { ReportTypeValue } from "./types";

export type WizardStepKey =
  "category" | "photos" | "details" | "where" | "custody" | "hints" | "review";

export const WIZARD_STEP_KEYS = {
  LOST: ["category", "photos", "details", "where", "review"],
  FOUND: ["category", "photos", "details", "where", "custody", "hints", "review"],
} as const satisfies Record<ReportTypeValue, readonly WizardStepKey[]>;

export function stepTitleKey(key: WizardStepKey): string {
  return `report.wizard.step.${key}.title`;
}

export function canProceedStep1(values: { type?: string; category?: string }): boolean {
  return step1Schema.safeParse({ type: values.type, category: values.category }).success;
}

export function canProceedStep2(
  type: ReportTypeValue,
  input: { readyCount: number; inFlight: boolean },
): boolean {
  if (input.inFlight) return false;
  if (type === "FOUND") return input.readyCount >= 1;
  return true;
}

export function canProceedStep3(values: {
  title?: string;
  description?: string;
  colors?: string[];
  brand?: string;
}): boolean {
  if (!values.title || values.title.trim().length < 3 || values.title.length > 80) return false;
  if (
    !values.description ||
    values.description.trim().length < 10 ||
    values.description.length > 1000
  ) {
    return false;
  }
  if (values.colors && values.colors.length > 3) return false;
  if (values.brand && values.brand.length > 60) return false;
  return true;
}

const MAX_REPORT_WINDOW_MS = 180 * 24 * 60 * 60 * 1000;

export function canProceedStep4(
  values: {
    type?: string;
    location?: { campus?: string; locationId?: string; note?: string };
    occurredAt?: { from?: string; to?: string };
  },
  now: Date = new Date(),
): boolean {
  if (!values.location?.campus) return false;
  if (!values.occurredAt?.from) return false;
  const fromTime = Date.parse(values.occurredAt.from);
  if (Number.isNaN(fromTime)) return false;
  if (fromTime > now.getTime()) return false;
  if (values.type === "LOST" && fromTime < now.getTime() - MAX_REPORT_WINDOW_MS) return false;
  if (values.occurredAt.to) {
    const toTime = Date.parse(values.occurredAt.to);
    if (Number.isNaN(toTime)) return false;
    if (toTime < fromTime) return false;
  }
  return true;
}

export function canProceedStep5(values: { custody?: string; dropPointId?: string }): boolean {
  if (!values.custody) return false;
  if (values.custody === "AT_DROP_POINT") {
    return typeof values.dropPointId === "string" && values.dropPointId.trim().length > 0;
  }
  if (values.custody === "HELD_BY_FINDER") {
    return true;
  }
  return false;
}

export function canProceedStep6(
  values: {
    hints?: Array<{ prompt?: string; answer?: string }>;
  },
  isSensitive: boolean = false,
): boolean {
  const hints = values.hints ?? [];
  const minHints = isSensitive ? 2 : 1;
  if (hints.length < minHints || hints.length > 3) return false;
  for (const hint of hints) {
    if (!hint.prompt || hint.prompt.trim().length < 3 || hint.prompt.length > 200) return false;
    if (!hint.answer || hint.answer.trim().length < 1 || hint.answer.length > 200) return false;
  }
  return true;
}
