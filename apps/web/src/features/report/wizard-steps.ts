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
