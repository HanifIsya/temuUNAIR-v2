"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { ErrorState } from "@/components/error-state";
import { ReportFilterBar } from "@/components/report/report-filter-bar";
import { ReportGrid } from "@/components/report/report-grid";
import { useCampuses } from "@/features/report/use-campuses";
import { useCategories } from "@/features/report/use-categories";
import { ApiQueryError } from "@/lib/api/client";
import type { BrowseFilters, CampusValue, CategoryValue, ReportTypeValue } from "./types";
import { useReportsList } from "./use-reports-list";

export interface BrowseViewProps {
  initialFilters?: BrowseFilters;
}

export function BrowseView({ initialFilters = {} }: BrowseViewProps) {
  const t = useTranslations("browse");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter values from URL searchParams or fallback to props
  const parseFiltersFromUrl = useCallback((): BrowseFilters => {
    if (!searchParams) return initialFilters;
    const typeParam = searchParams.get("type");
    const type =
      typeParam?.toUpperCase() === "LOST"
        ? ("LOST" as ReportTypeValue)
        : typeParam?.toUpperCase() === "FOUND"
          ? ("FOUND" as ReportTypeValue)
          : undefined;

    const campus = searchParams.getAll("campus") as CampusValue[];
    const category = searchParams.getAll("category") as CategoryValue[];
    const q = searchParams.get("q") ?? undefined;

    return {
      type: type ?? initialFilters.type,
      campus: campus.length > 0 ? campus : initialFilters.campus,
      category: category.length > 0 ? category : initialFilters.category,
      q: q ?? initialFilters.q,
    };
  }, [searchParams, initialFilters]);

  const [filters, setFilters] = useState<BrowseFilters>(parseFiltersFromUrl);
  const [searchInput, setSearchInput] = useState(filters.q ?? "");

  const { data: campusesData } = useCampuses();
  const { data: categoriesData } = useCategories();

  const campuses = campusesData ?? [];
  const categories = categoriesData ?? [];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReportsList(filters);

  const allItems = data?.pages.flatMap((page) => page.data) ?? [];
  const totalLoaded = allItems.length;

  // Sync state to URL search parameters (FE-01, SCR-005)
  const syncFiltersToUrl = useCallback(
    (next: BrowseFilters) => {
      const params = new URLSearchParams();
      if (next.type) params.set("type", next.type.toLowerCase());
      if (next.campus && next.campus.length > 0) {
        for (const c of next.campus) params.append("campus", c);
      }
      if (next.category && next.category.length > 0) {
        for (const cat of next.category) params.append("category", cat);
      }
      if (next.q) params.set("q", next.q);

      const qs = params.toString();
      router.replace(qs ? `/reports?${qs}` : "/reports");
    },
    [router],
  );

  const handleFiltersChange = (next: BrowseFilters) => {
    setFilters(next);
    syncFiltersToUrl(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: BrowseFilters = {
      ...filters,
      q: searchInput.trim() || undefined,
      cursor: undefined,
    };
    setFilters(next);
    syncFiltersToUrl(next);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({});
    router.replace("/reports");
  };

  if (isError) {
    const requestId = error instanceof ApiQueryError ? error.requestId : null;
    return (
      <div className="py-8">
        <ErrorState
          titleKey="common.unknownError"
          descKey="error.INTERNAL"
          requestId={requestId}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const emptyState = (
    <div
      data-testid="browse-empty-state"
      className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-surface-muted/50 my-6"
    >
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-text-muted mb-3">
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-text mb-1">{t("empty.title")}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-4">{t("empty.desc")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {Object.keys(filters).length > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-md border border-border bg-surface text-xs font-medium text-text hover:bg-surface-muted transition-colors"
          >
            {t("filter.clear")}
          </button>
        )}
        <Link
          href="/reports/new"
          data-testid="browse-empty-create-report"
          className="px-4 py-2 rounded-md bg-primary-700 text-xs font-medium text-white hover:bg-primary-900 transition-colors"
        >
          {t("empty.createReport")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Search Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-text">{t("title")}</h1>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <label htmlFor="browse-search-input" className="sr-only">
            {t("search.placeholder")}
          </label>
          <input
            id="browse-search-input"
            type="search"
            data-testid="browse-search-input"
            aria-label={t("search.placeholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute left-3.5 text-text-muted pointer-events-none">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="absolute right-2 px-3 py-1 rounded bg-primary-700 text-xs font-medium text-white hover:bg-primary-900 transition-colors"
          >
            {t("search.submit")}
          </button>
        </form>

        {/* Filter Bar */}
        <ReportFilterBar
          value={filters}
          campuses={campuses}
          categories={categories}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Result Count Announcement */}
      {!isLoading && (
        <div className="text-xs text-text-muted" aria-live="polite">
          {t("resultCount", { count: totalLoaded })}
        </div>
      )}

      {/* Grid of Results */}
      <ReportGrid
        items={allItems}
        isLoading={isLoading}
        hasMore={Boolean(hasNextPage)}
        emptyState={emptyState}
        onLoadMore={() => void fetchNextPage()}
        isFetchingMore={isFetchingNextPage}
      />
    </div>
  );
}
