"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, type ReactNode } from "react";

export interface WizardStepItem {
  key: string;
  titleKey: string;
}

export interface WizardShellProps {
  steps: WizardStepItem[];
  current: number;
  canProceed: boolean;
  nextHint?: string | null;
  draftState?: "saved" | "restored" | null;
  onNext: () => void;
  onBack: () => void;
  children: ReactNode;
}

export function WizardShell({
  steps,
  current,
  canProceed,
  nextHint,
  draftState,
  onNext,
  onBack,
  children,
}: WizardShellProps) {
  const t = useTranslations();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hintId = useId();
  const currentStep = steps[current - 1];

  useEffect(() => {
    headingRef.current?.focus();
  }, [current]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p data-testid="wizard-step-count" className="text-sm text-text-muted">
          {t("report.wizard.stepOf", { current, total: steps.length })}
        </p>
        <ol className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <li
              key={step.key}
              aria-current={index === current - 1 ? "step" : undefined}
              className={`text-xs ${
                index === current - 1 ? "font-semibold text-text" : "text-text-muted"
              }`}
            >
              {t(step.titleKey)}
            </li>
          ))}
        </ol>
        {draftState === "saved" ? (
          <p data-testid="wizard-draft-saved" role="status" className="text-sm text-text-muted">
            {t("report.wizard.draftSaved")}
          </p>
        ) : null}
        {draftState === "restored" ? (
          <p data-testid="wizard-draft-restored" role="status" className="text-sm text-text-muted">
            {t("report.wizard.draftRestored")}
          </p>
        ) : null}
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        data-testid="wizard-step-heading"
        className="text-xl font-bold text-text focus:outline-none"
      >
        {t(currentStep?.titleKey ?? "report.wizard.step.category.title")}
      </h1>

      <div>{children}</div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="wizard-back"
          disabled={current <= 1}
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2 text-sm text-text disabled:opacity-50"
        >
          {t("common.back")}
        </button>
        <button
          type="button"
          data-testid="wizard-next"
          disabled={!canProceed}
          onClick={onNext}
          aria-describedby={canProceed ? undefined : hintId}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {t("common.next")}
        </button>
        {!canProceed && nextHint ? (
          <p
            id={hintId}
            data-testid="wizard-next-hint"
            role="status"
            className="text-sm text-text-muted"
          >
            {nextHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
