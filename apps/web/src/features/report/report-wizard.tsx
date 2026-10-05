"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CategoryPicker } from "@/components/report/category-picker";
import { PhotoUploader } from "@/components/report/photo-uploader";
import { WizardShell, type WizardStepItem } from "@/components/report/wizard-shell";
import { useUpload } from "@/hooks/use-upload";

import { loadDraft, saveDraft } from "./draft";
import { wizardFormSchema } from "./schemas";
import { useCategories } from "./use-categories";
import {
  WIZARD_STEP_KEYS,
  canProceedStep1,
  canProceedStep2,
  stepTitleKey,
  type WizardStepKey,
} from "./wizard-steps";

type WizardValues = z.infer<typeof wizardFormSchema>;

export interface ReportWizardProps {
  initialType?: "LOST" | "FOUND";
}

export function ReportWizard({ initialType }: ReportWizardProps) {
  const t = useTranslations();
  const [current, setCurrent] = useState(1);
  const [draftState, setDraftState] = useState<"saved" | "restored" | null>(null);
  const restoredRef = useRef(false);

  const categories = useCategories();
  const upload = useUpload();
  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardFormSchema),
    mode: "onChange",
    defaultValues: { type: initialType, category: undefined },
  });

  const type = form.watch("type");
  const category = form.watch("category");

  const stepKeys: readonly WizardStepKey[] = WIZARD_STEP_KEYS[type ?? "LOST"];
  const steps: WizardStepItem[] = stepKeys.map((key) => ({ key, titleKey: stepTitleKey(key) }));

  const persistDraft = useCallback(() => {
    if (type === undefined || category === undefined) return;
    saveDraft(type, { type, category, imageIds: upload.readyIds });
    setDraftState("saved");
  }, [type, category, upload.readyIds]);

  // Restore the saved draft once on mount (FE-05: "draft dipulihkan" on reload).
  useEffect(() => {
    if (initialType === undefined || restoredRef.current) return;
    restoredRef.current = true;
    const draft = loadDraft(initialType);
    if (draft === null) return;
    form.setValue("type", draft.type, { shouldValidate: true });
    form.setValue("category", draft.category, { shouldValidate: true });
    upload.rehydrate(draft.imageIds);
    setDraftState("restored");
  }, [initialType, form, upload]);

  const stepOneOk = canProceedStep1({ type, category });
  const stepTwoOk =
    type !== undefined &&
    canProceedStep2(type, {
      readyCount: upload.readyIds.length,
      inFlight: upload.inFlight,
    });
  const canProceed = current === 1 ? stepOneOk : current === 2 ? stepTwoOk : false;

  const blockedHint = (): string | null => {
    if (current === 1) return t("report.wizard.needCategory");
    if (current === 2) {
      return upload.inFlight
        ? t("report.wizard.photos.settled")
        : t("report.wizard.photos.required");
    }
    return null;
  };
  const nextHint = canProceed ? null : blockedHint();

  const goNext = useCallback(() => {
    if (!canProceed) return;
    persistDraft();
    setCurrent(current + 1);
  }, [canProceed, current, persistDraft]);

  const goBack = useCallback(() => {
    if (current <= 1) return;
    persistDraft();
    setCurrent(current - 1);
  }, [current, persistDraft]);

  let body: ReactNode;
  if (current === 1) {
    body = (
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-text">{t("report.wizard.type.label")}</legend>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="radio" value="LOST" {...form.register("type")} />
            {t("report.wizard.type.lost")}
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="radio" value="FOUND" {...form.register("type")} />
            {t("report.wizard.type.found")}
          </label>
        </fieldset>
        <CategoryPicker
          value={category ?? null}
          options={categories.data ?? []}
          loading={categories.isLoading}
          error={categories.isError}
          onRetry={() => {
            void categories.refetch();
          }}
          onChange={(value) => form.setValue("category", value, { shouldValidate: true })}
        />
      </div>
    );
  } else if (current === 2) {
    body = (
      <PhotoUploader
        value={upload.entries}
        required={type === "FOUND"}
        limitReached={upload.limitReached}
        onChange={upload.addFiles}
        onRemove={upload.remove}
        onRetry={upload.retry}
      />
    );
  } else {
    // Steps 3+ land in FE-004; the frame blocks further navigation honestly.
    body = (
      <p data-testid="report-wizard-pending" role="status" className="text-sm text-text-muted">
        {t("report.wizard.step.pending")}
      </p>
    );
  }

  return (
    <WizardShell
      steps={steps}
      current={current}
      canProceed={canProceed}
      nextHint={nextHint}
      draftState={draftState}
      onNext={goNext}
      onBack={goBack}
    >
      {body}
    </WizardShell>
  );
}
