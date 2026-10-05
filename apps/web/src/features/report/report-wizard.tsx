"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { CategoryPicker } from "@/components/report/category-picker";
import { CustodyStep } from "@/components/report/custody-step";
import { DetailsStep } from "@/components/report/details-step";
import { HintsStep, type HintItem } from "@/components/report/hints-step";
import { LocationStep } from "@/components/report/location-step";
import { PhotoUploader } from "@/components/report/photo-uploader";
import { ReviewStep } from "@/components/report/review-step";
import { WizardShell, type WizardStepItem } from "@/components/report/wizard-shell";
import { useUpload } from "@/hooks/use-upload";
import { ApiQueryError } from "@/lib/api/client";

import { clearDraft, loadDraft, saveDraft } from "./draft";
import { wizardFormSchema } from "./schemas";
import { useCampuses } from "./use-campuses";
import { useCategories } from "./use-categories";
import { useCreateReport } from "./use-create-report";
import { useDropPoints } from "./use-drop-points";
import { useLocations } from "./use-locations";
import type { CampusValue, ReportCreateRequest } from "./types";
import {
  WIZARD_STEP_KEYS,
  canProceedStep1,
  canProceedStep2,
  canProceedStep3,
  canProceedStep4,
  canProceedStep5,
  canProceedStep6,
  stepTitleKey,
  type WizardStepKey,
} from "./wizard-steps";

type WizardValues = z.infer<typeof wizardFormSchema>;

export interface ReportWizardProps {
  initialType?: "LOST" | "FOUND";
}

export function ReportWizard({ initialType }: ReportWizardProps) {
  const t = useTranslations();
  const router = useRouter();
  const [current, setCurrent] = useState(1);
  const [draftState, setDraftState] = useState<"saved" | "restored" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const restoredRef = useRef(false);
  const lastPayloadRef = useRef<string | null>(null);
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const categories = useCategories();
  const upload = useUpload();
  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardFormSchema),
    mode: "onChange",
    defaultValues: {
      type: initialType,
      category: undefined,
      title: "",
      description: "",
      colors: [],
      brand: "",
      hints: [],
    },
  });

  const type = form.watch("type");
  const category = form.watch("category");
  const title = form.watch("title") ?? "";
  const description = form.watch("description") ?? "";
  const colors = form.watch("colors") ?? [];
  const brand = form.watch("brand");
  const location = form.watch("location");
  const occurredAt = form.watch("occurredAt");
  const custody = form.watch("custody");
  const dropPointId = form.watch("dropPointId");
  const hints = form.watch("hints") ?? [];

  const campuses = useCampuses();
  const locations = useLocations(location?.campus as CampusValue | undefined);
  const dropPoints = useDropPoints(location?.campus as CampusValue | undefined);
  const createReport = useCreateReport();

  const categoryMeta = categories.data?.find((c) => c.value === category);
  const isSensitive = categoryMeta?.isSensitive ?? false;

  const stepKeys: readonly WizardStepKey[] = WIZARD_STEP_KEYS[type ?? "LOST"];
  const steps: WizardStepItem[] = stepKeys.map((key) => ({ key, titleKey: stepTitleKey(key) }));
  const stepKey = stepKeys[current - 1];

  const persistDraft = useCallback(() => {
    if (type === undefined || category === undefined) return;
    saveDraft(type, {
      type,
      category,
      imageIds: upload.readyIds,
      title: title || undefined,
      description: description || undefined,
      colors: colors.length > 0 ? colors : undefined,
      brand: brand || undefined,
      location: location?.campus
        ? {
            campus: location.campus as CampusValue,
            locationId: location.locationId,
            note: location.note,
          }
        : undefined,
      occurredAt: occurredAt?.from ? { from: occurredAt.from, to: occurredAt.to } : undefined,
      custody,
      dropPointId,
      // Hint answers are NEVER persisted in draft (ADR-0007 / FE-04 privacy check)
      hints:
        hints.length > 0
          ? hints.map((h) => ({ prompt: h.prompt, answer: "" as const }))
          : undefined,
    });
    setDraftState("saved");
  }, [
    type,
    category,
    upload.readyIds,
    title,
    description,
    colors,
    brand,
    location,
    occurredAt,
    custody,
    dropPointId,
    hints,
  ]);

  // Restore the saved draft once on mount (FE-05: "draft dipulihkan" on reload).
  useEffect(() => {
    if (initialType === undefined || restoredRef.current) return;
    restoredRef.current = true;
    const draft = loadDraft(initialType);
    if (draft === null) return;
    form.setValue("type", draft.type, { shouldValidate: true });
    form.setValue("category", draft.category, { shouldValidate: true });
    if (draft.title) form.setValue("title", draft.title);
    if (draft.description) form.setValue("description", draft.description);
    if (draft.colors) form.setValue("colors", draft.colors);
    if (draft.brand) form.setValue("brand", draft.brand);
    if (draft.location) form.setValue("location", draft.location);
    if (draft.occurredAt) form.setValue("occurredAt", draft.occurredAt);
    if (draft.custody) form.setValue("custody", draft.custody);
    if (draft.dropPointId) form.setValue("dropPointId", draft.dropPointId);
    if (draft.hints) {
      form.setValue(
        "hints",
        draft.hints.map((h) => ({ prompt: h.prompt, answer: "" })),
      );
    }
    upload.rehydrate(draft.imageIds);
    setDraftState("restored");
  }, [initialType, form, upload]);

  // Ensure at least one empty hint exists when entering hints step
  useEffect(() => {
    if (stepKey === "hints" && hints.length === 0) {
      form.setValue("hints", [{ prompt: "", answer: "" }]);
    }
  }, [stepKey, hints.length, form]);

  const stepOneOk = canProceedStep1({ type, category });
  const stepTwoOk =
    type !== undefined &&
    canProceedStep2(type, {
      readyCount: upload.readyIds.length,
      inFlight: upload.inFlight,
    });
  const stepThreeOk = canProceedStep3({ title, description, colors, brand });
  const stepFourOk = canProceedStep4({ type, location, occurredAt });
  const stepFiveCustodyOk = canProceedStep5({ custody, dropPointId });
  const stepSixHintsOk = canProceedStep6({ hints }, isSensitive);

  let canProceed = false;
  if (stepKey === "category") canProceed = stepOneOk;
  else if (stepKey === "photos") canProceed = stepTwoOk;
  else if (stepKey === "details") canProceed = stepThreeOk;
  else if (stepKey === "where") canProceed = stepFourOk;
  else if (stepKey === "custody") canProceed = stepFiveCustodyOk;
  else if (stepKey === "hints") canProceed = stepSixHintsOk;
  else if (stepKey === "review") canProceed = !createReport.isPending;

  const blockedHint = (): string | null => {
    if (stepKey === "category") return t("report.wizard.needCategory");
    if (stepKey === "photos") {
      return upload.inFlight
        ? t("report.wizard.photos.settled")
        : t("report.wizard.photos.required");
    }
    if (stepKey === "details") {
      if (!title || title.trim().length < 3) return t("report.wizard.details.titleHint");
      if (!description || description.trim().length < 10)
        return t("report.wizard.details.descHint");
      return t("report.wizard.details.titleHint");
    }
    if (stepKey === "where") {
      if (!location?.campus) return t("report.wizard.where.campusPlaceholder");
      if (!occurredAt?.from) return t("report.wizard.where.fromLabel");
      return t("report.wizard.where.campusPlaceholder");
    }
    if (stepKey === "custody") {
      if (!custody) return t("report.wizard.custody.label");
      if (custody === "AT_DROP_POINT" && !dropPointId) {
        return t("report.wizard.custody.dropPointSelect");
      }
    }
    if (stepKey === "hints") {
      return isSensitive
        ? t("report.wizard.hints.sensitiveWarning")
        : t("report.wizard.hints.desc");
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

  const handleSubmit = async () => {
    if (!type || !category || !title || !description || !location?.campus || !occurredAt?.from) {
      return;
    }
    setSubmitError(null);

    const payload: ReportCreateRequest = {
      type,
      category,
      title,
      description,
      colors: colors ?? [],
      brand: brand || undefined,
      imageIds: upload.readyIds,
      location: {
        campus: location.campus as CampusValue,
        locationId: location.locationId || undefined,
        note: location.note || undefined,
      },
      occurredAt: {
        from: occurredAt.from,
        to: occurredAt.to || undefined,
      },
      custody: type === "FOUND" ? custody : undefined,
      dropPointId: type === "FOUND" && custody === "AT_DROP_POINT" ? dropPointId : undefined,
      hints: type === "FOUND" ? hints.filter((h) => h.prompt && h.answer) : undefined,
    };

    const serializedPayload = JSON.stringify(payload);
    if (lastPayloadRef.current !== serializedPayload) {
      idempotencyKeyRef.current = crypto.randomUUID();
      lastPayloadRef.current = serializedPayload;
    }

    try {
      const res = await createReport.mutateAsync({
        payload,
        idempotencyKey: idempotencyKeyRef.current,
      });
      clearDraft(type);
      router.push(`/reports/${res.id}`);
    } catch (err: unknown) {
      if (err instanceof ApiQueryError) {
        if (err.status === 409) {
          // 409 conflict: keep draft intact so user can adjust or recover
          persistDraft();
        }
        const key = `error.${err.message}`;
        setSubmitError(t.has(key) ? t(key) : t("error.INTERNAL"));
      } else {
        setSubmitError(t("error.INTERNAL"));
      }
    }
  };

  let body: ReactNode;
  if (stepKey === "category") {
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
  } else if (stepKey === "photos") {
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
  } else if (stepKey === "details") {
    body = (
      <DetailsStep
        title={title}
        description={description}
        colors={colors}
        brand={brand}
        onChangeTitle={(val) => form.setValue("title", val, { shouldValidate: true })}
        onChangeDescription={(val) => form.setValue("description", val, { shouldValidate: true })}
        onChangeColors={(val) => form.setValue("colors", val, { shouldValidate: true })}
        onChangeBrand={(val) => form.setValue("brand", val, { shouldValidate: true })}
      />
    );
  } else if (stepKey === "where") {
    body = (
      <LocationStep
        type={type ?? "LOST"}
        campus={location?.campus as CampusValue | undefined}
        locationId={location?.locationId}
        note={location?.note}
        occurredFrom={occurredAt?.from}
        occurredTo={occurredAt?.to}
        campuses={campuses.data ?? []}
        locations={locations.data ?? []}
        loadingCampuses={campuses.isLoading}
        loadingLocations={locations.isLoading}
        onChangeCampus={(val) => {
          form.setValue("location.campus", val, { shouldValidate: true });
        }}
        onChangeLocationId={(val) => {
          form.setValue("location.locationId", val, { shouldValidate: true });
        }}
        onChangeNote={(val) => {
          form.setValue("location.note", val, { shouldValidate: true });
        }}
        onChangeOccurredFrom={(val) => {
          form.setValue("occurredAt.from", val, { shouldValidate: true });
        }}
        onChangeOccurredTo={(val) => {
          form.setValue("occurredAt.to", val, { shouldValidate: true });
        }}
      />
    );
  } else if (stepKey === "custody") {
    body = (
      <CustodyStep
        custody={custody}
        dropPointId={dropPointId}
        dropPoints={dropPoints.data ?? []}
        loadingDropPoints={dropPoints.isLoading}
        onChangeCustody={(val) => form.setValue("custody", val, { shouldValidate: true })}
        onChangeDropPointId={(val) => form.setValue("dropPointId", val, { shouldValidate: true })}
      />
    );
  } else if (stepKey === "hints") {
    body = (
      <HintsStep
        hints={hints as HintItem[]}
        suggestedPrompts={categoryMeta?.hintPrompts ?? []}
        isSensitive={isSensitive}
        onChangeHints={(val) => form.setValue("hints", val, { shouldValidate: true })}
      />
    );
  } else if (stepKey === "review") {
    const selectedCampus = campuses.data?.find((c) => c.id === location?.campus);
    const selectedLocation = locations.data?.find((l) => l.id === location?.locationId);
    const selectedDropPoint = dropPoints.data?.find((d) => d.id === dropPointId);

    body = (
      <ReviewStep
        type={type ?? "LOST"}
        category={category}
        categoryLabel={categoryMeta ? t(categoryMeta.labelKey) : undefined}
        imageCount={upload.readyIds.length}
        title={title}
        description={description}
        colors={colors}
        brand={brand}
        campus={location?.campus as CampusValue | undefined}
        campusName={selectedCampus?.name}
        locationName={selectedLocation?.name}
        locationNote={location?.note}
        occurredFrom={occurredAt?.from}
        occurredTo={occurredAt?.to}
        custody={custody}
        dropPointName={selectedDropPoint?.name}
        hintsCount={hints.length}
        isSubmitting={createReport.isPending}
        onSubmit={handleSubmit}
        error={submitError}
      />
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
