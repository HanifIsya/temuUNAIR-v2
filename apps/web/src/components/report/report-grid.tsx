"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { ReportOwnerItem, ReportPublicItem } from "@/features/browse/types";
import { ReportCard } from "./report-card";

export interface ReportGridProps {
  items: Array<ReportOwnerItem | ReportPublicItem>;
  isLoading: boolean;
  hasMore: boolean;
  emptyState?: ReactNode;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  className?: string;
}

export function ReportGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="list"
      aria-busy="true"
      data-testid="browse-loading-skeleton"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          role="listitem"
          className="flex flex-col rounded-lg border border-border bg-surface overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-surface-muted" />
          <div className="p-3.5 flex flex-col gap-2">
            <div className="h-3 w-1/2 bg-surface-muted rounded" />
            <div className="h-4 w-3/4 bg-surface-muted rounded" />
            <div className="h-3 w-full bg-surface-muted rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportGrid({
  items,
  isLoading,
  hasMore,
  emptyState,
  onLoadMore,
  isFetchingMore = false,
  className = "",
}: ReportGridProps) {
  const t = useTranslations("browse");

  if (isLoading && items.length === 0) {
    return <ReportGridSkeleton />;
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div
        role="list"
        data-testid="browse-results"
        aria-busy={isFetchingMore}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <ReportCard report={item} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            type="button"
            data-testid="browse-load-more"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="px-6 py-2.5 rounded-md border border-border bg-surface hover:bg-surface-muted text-sm font-medium text-text transition-colors disabled:opacity-50"
          >
            {isFetchingMore ? t("loadingMore") : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
