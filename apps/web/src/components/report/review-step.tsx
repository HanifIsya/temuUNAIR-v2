"use client";

import { useLocale, useTranslations } from "next-intl";

import type { CampusValue, CategoryValue, CustodyValue } from "@/features/report/types";

export interface ReviewStepProps {
  type: "LOST" | "FOUND";
  category?: CategoryValue;
  categoryLabel?: string;
  imageCount: number;
  title: string;
  description: string;
  colors?: string[];
  brand?: string;
  campus?: CampusValue;
  campusName?: string;
  locationName?: string;
  locationNote?: string;
  occurredFrom?: string;
  occurredTo?: string;
  custody?: CustodyValue;
  dropPointName?: string;
  hintsCount?: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  error?: string | null;
}

export function ReviewStep({
  type,
  category,
  categoryLabel,
  imageCount,
  title,
  description,
  colors = [],
  brand,
  campus,
  campusName,
  locationName,
  locationNote,
  occurredFrom,
  occurredTo,
  custody,
  dropPointName,
  hintsCount = 0,
  isSubmitting,
  onSubmit,
  error,
}: ReviewStepProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-6" data-testid="review-step">
      <h2 className="text-base font-semibold text-text">{t("report.wizard.review.summary")}</h2>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4 text-sm">
        {/* Type & Category */}
        <div className="flex flex-col gap-1 border-b border-border pb-3">
          <span className="text-xs text-text-muted">{t("report.wizard.review.categoryTitle")}</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {type === "LOST" ? t("report.wizard.type.lost") : t("report.wizard.type.found")}
            </span>
            <span className="font-medium text-text">{categoryLabel ?? category ?? "—"}</span>
          </div>
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-1 border-b border-border pb-3">
          <span className="text-xs text-text-muted">{t("report.wizard.review.photosTitle")}</span>
          <span className="text-text">
            {imageCount > 0
              ? t("report.wizard.review.photosCount", { count: imageCount })
              : t("report.wizard.review.noPhotos")}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5 border-b border-border pb-3">
          <span className="text-xs text-text-muted">{t("report.wizard.review.detailsTitle")}</span>
          <span className="font-semibold text-text">{title}</span>
          <p className="whitespace-pre-line text-xs text-text-muted">{description}</p>
          {(colors.length > 0 || brand) && (
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-text-muted">
              {colors.length > 0 && (
                <span>
                  {t("report.wizard.review.colorsLabel")}
                  {colors
                    .map((c) =>
                      t.has(`report.wizard.colors.${c}`) ? t(`report.wizard.colors.${c}`) : c,
                    )
                    .join(", ")}
                </span>
              )}
              {brand && (
                <span>
                  {t("report.wizard.review.brandLabel")}
                  {brand}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location & Time */}
        <div className="flex flex-col gap-1 border-b border-border pb-3">
          <span className="text-xs text-text-muted">{t("report.wizard.review.locationTitle")}</span>
          <span className="font-medium text-text">
            {campusName ?? campus ?? "—"} {locationName ? `• ${locationName}` : ""}
          </span>
          {locationNote && (
            <span className="text-xs text-text-muted">
              {t("report.wizard.review.locationNoteLabel")}
              {locationNote}
            </span>
          )}
          {occurredFrom && (
            <span className="text-xs text-text-muted">
              {t("report.wizard.review.timeLabel")}
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Jakarta",
              }).format(new Date(occurredFrom))}
              {occurredTo
                ? t("report.wizard.review.timeRangeSeparator") +
                  new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(occurredTo))
                : ""}
            </span>
          )}
        </div>

        {/* Custody (FOUND only) */}
        {type === "FOUND" && (
          <div className="flex flex-col gap-1 border-b border-border pb-3">
            <span className="text-xs text-text-muted">
              {t("report.wizard.review.custodyTitle")}
            </span>
            <span className="font-medium text-text">
              {custody === "AT_DROP_POINT"
                ? `${t("report.wizard.custody.atDropPoint")}${dropPointName ? ` (${dropPointName})` : ""}`
                : t("report.wizard.custody.heldByFinder")}
            </span>
          </div>
        )}

        {/* Hints (FOUND only) */}
        {type === "FOUND" && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted">{t("report.wizard.review.hintsTitle")}</span>
            <span className="text-text">
              {t("report.wizard.review.hintsCount", { count: hintsCount })}
            </span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        data-testid="report-submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        onClick={onSubmit}
        className="min-h-11 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? t("report.wizard.review.submitting") : t("report.wizard.review.submit")}
      </button>
    </div>
  );
}
