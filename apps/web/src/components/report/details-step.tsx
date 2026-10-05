"use client";

import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";

export interface DetailsStepProps {
  title: string;
  description: string;
  colors: string[];
  brand?: string;
  onChangeTitle: (title: string) => void;
  onChangeDescription: (description: string) => void;
  onChangeColors: (colors: string[]) => void;
  onChangeBrand: (brand: string) => void;
}

const COMMON_COLORS = [
  "BLACK",
  "WHITE",
  "BLUE",
  "RED",
  "BROWN",
  "GRAY",
  "GREEN",
  "YELLOW",
  "GOLD",
  "SILVER",
] as const;

export function DetailsStep({
  title,
  description,
  colors,
  brand = "",
  onChangeTitle,
  onChangeDescription,
  onChangeColors,
  onChangeBrand,
}: DetailsStepProps) {
  const t = useTranslations();

  const toggleColor = (color: string) => {
    if (colors.includes(color)) {
      onChangeColors(colors.filter((c) => c !== color));
    } else if (colors.length < 3) {
      onChangeColors([...colors, color]);
    }
  };

  return (
    <div className="flex flex-col gap-6" data-testid="details-step">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-title-input" className="text-sm font-medium text-text">
          {t("report.wizard.details.titleLabel")} <span className="text-danger">*</span>
        </label>
        <input
          id="report-title-input"
          data-testid="report-title-input"
          type="text"
          value={title}
          maxLength={80}
          placeholder={t("report.wizard.details.titlePlaceholder")}
          aria-describedby="report-title-counter report-title-hint"
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeTitle(e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span id="report-title-hint">{t("report.wizard.details.titleHint")}</span>
          <span id="report-title-counter" aria-live="polite">
            {title.length}/80
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-desc-input" className="text-sm font-medium text-text">
          {t("report.wizard.details.descLabel")} <span className="text-danger">*</span>
        </label>
        <textarea
          id="report-desc-input"
          data-testid="report-desc-input"
          value={description}
          maxLength={1000}
          rows={4}
          placeholder={t("report.wizard.details.descPlaceholder")}
          aria-describedby="report-desc-counter report-desc-hint"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChangeDescription(e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span id="report-desc-hint">{t("report.wizard.details.descHint")}</span>
          <span id="report-desc-counter" aria-live="polite">
            {description.length}/1000
          </span>
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">
            {t("report.wizard.details.colorsLabel")}
          </span>
          <span className="text-xs text-text-muted">{colors.length}/3</span>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("report.wizard.details.colorsLabel")}
        >
          {COMMON_COLORS.map((color) => {
            const isSelected = colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                data-testid={`color-chip-${color.toLowerCase()}`}
                aria-pressed={isSelected}
                disabled={!isSelected && colors.length >= 3}
                onClick={() => toggleColor(color)}
                className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-contrast"
                    : "border-border bg-surface text-text hover:bg-surface-elevated"
                }`}
              >
                {t(`report.wizard.colors.${color}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-brand-input" className="text-sm font-medium text-text">
          {t("report.wizard.details.brandLabel")}
        </label>
        <input
          id="report-brand-input"
          data-testid="report-brand-input"
          type="text"
          value={brand}
          maxLength={60}
          placeholder={t("report.wizard.details.brandPlaceholder")}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeBrand(e.target.value)}
        />
      </div>
    </div>
  );
}
