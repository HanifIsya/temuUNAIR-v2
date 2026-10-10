"use client";

import { useTranslations } from "next-intl";
import type {
  BrowseFilters,
  CampusMetaItem,
  CampusValue,
  CategoryMetaItem,
  CategoryValue,
  ReportTypeValue,
} from "@/features/browse/types";

export interface ReportFilterBarProps {
  value: BrowseFilters;
  campuses: CampusMetaItem[];
  categories: CategoryMetaItem[];
  onChange: (filters: BrowseFilters) => void;
  onReset: () => void;
  className?: string;
}

export function ReportFilterBar({
  value,
  campuses,
  categories,
  onChange,
  onReset,
  className = "",
}: ReportFilterBarProps) {
  const t = useTranslations("browse");
  const tCat = useTranslations("category");

  const hasActiveFilters = Boolean(
    value.type ||
    (value.campus && value.campus.length > 0) ||
    (value.category && value.category.length > 0) ||
    value.q,
  );

  const handleTypeSelect = (type?: ReportTypeValue) => {
    onChange({ ...value, type, cursor: undefined });
  };

  const handleCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as CampusValue | "";
    onChange({
      ...value,
      campus: val ? [val] : undefined,
      cursor: undefined,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as CategoryValue | "";
    onChange({
      ...value,
      category: val ? [val] : undefined,
      cursor: undefined,
    });
  };

  const currentCampus = value.campus?.[0] ?? "";
  const currentCategory = value.category?.[0] ?? "";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Type Tabs */}
      <div className="flex items-center gap-2" role="group" aria-label={t("filter.type")}>
        <button
          type="button"
          data-testid="browse-filter-type-all"
          aria-pressed={!value.type}
          onClick={() => handleTypeSelect(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !value.type
              ? "bg-primary-700 text-white"
              : "bg-surface-muted text-text-muted hover:bg-border"
          }`}
        >
          {t("filter.all")}
        </button>
        <button
          type="button"
          data-testid="browse-filter-type-lost"
          aria-pressed={value.type === "LOST"}
          onClick={() => handleTypeSelect("LOST")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value.type === "LOST"
              ? "bg-danger-600 text-white"
              : "bg-surface-muted text-text-muted hover:bg-border"
          }`}
        >
          {t("filter.lost")}
        </button>
        <button
          type="button"
          data-testid="browse-filter-type-found"
          aria-pressed={value.type === "FOUND"}
          onClick={() => handleTypeSelect("FOUND")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value.type === "FOUND"
              ? "bg-primary-700 text-white"
              : "bg-surface-muted text-text-muted hover:bg-border"
          }`}
        >
          {t("filter.found")}
        </button>
      </div>

      {/* Dropdown Filters & Clear */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Campus Filter */}
        <select
          data-testid="browse-filter-campus"
          aria-label={t("filter.campus")}
          value={currentCampus}
          onChange={handleCampusChange}
          className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-text focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">{t("filter.allCampuses")}</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          data-testid="browse-filter-category"
          aria-label={t("filter.category")}
          value={currentCategory}
          onChange={handleCategoryChange}
          className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-text focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">{t("filter.allCategories")}</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {tCat(c.value as never)}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            data-testid="browse-filter-clear"
            onClick={onReset}
            className="px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:underline transition-colors"
          >
            {t("filter.clear")}
          </button>
        )}
      </div>
    </div>
  );
}
