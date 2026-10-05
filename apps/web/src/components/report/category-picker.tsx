"use client";

import { useTranslations } from "next-intl";

import type { ApiCategories, CategoryValue } from "@/features/report/types";

import { SensitiveNotice } from "./sensitive-notice";

export interface CategoryPickerProps {
  value?: CategoryValue | null;
  options: ApiCategories;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onChange: (value: CategoryValue) => void;
}

export function CategoryPicker({
  value,
  options,
  loading = false,
  error = false,
  onRetry,
  onChange,
}: CategoryPickerProps) {
  const t = useTranslations();
  const selected = options.find((option) => option.value === value);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-text">
        {t("report.wizard.category.legend")}
      </legend>
      {loading ? (
        <div
          data-testid="category-picker-skeleton"
          aria-busy="true"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
          <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
          <div className="h-10 animate-pulse rounded-md bg-surface-muted" />
        </div>
      ) : error ? (
        <div className="flex flex-col gap-2">
          <p data-testid="category-picker-error" role="alert" className="text-sm text-text-muted">
            {t("common.unknownError")}
          </p>
          <button
            type="button"
            data-testid="category-picker-retry"
            onClick={onRetry}
            className="w-fit rounded-md border border-border px-4 py-2 text-sm text-text"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-testid={`category-option-${option.value}`}
              aria-pressed={value === option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-primary-700 ${
                value === option.value
                  ? "border-primary-700 bg-surface-muted font-semibold text-text"
                  : "border-border text-text"
              }`}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      )}
      {selected?.isSensitive ? <SensitiveNotice category={selected.value} /> : null}
    </fieldset>
  );
}
