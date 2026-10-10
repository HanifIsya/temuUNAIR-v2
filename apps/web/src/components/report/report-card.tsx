"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatCampusName } from "@/features/browse/campus";
import type { ReportOwnerItem, ReportPublicItem } from "@/features/browse/types";
import { StatusBadge } from "./status-badge";

export interface ReportCardProps {
  report: ReportPublicItem | ReportOwnerItem;
  variant?: "browse" | "mine" | "compact";
  onOpen?: (reportId: string) => void;
  className?: string;
}

export function ReportCard({
  report,
  variant = "browse",
  onOpen,
  className = "",
}: ReportCardProps) {
  const t = useTranslations();

  const firstImage = report.images[0];
  const isMasked = report.isSensitive || Boolean(firstImage?.isMasked);
  const imageUrl = firstImage ? (firstImage.thumbUrl ?? firstImage.url) : null;
  const imageAlt = isMasked ? t("report.detail.masked") : report.title;

  const isLost = report.type === "LOST";
  const isCompact = variant === "compact";

  return (
    <div
      data-testid={`report-card-${report.id}`}
      className={`group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm hover:border-primary-500/50 hover:shadow-md transition-all duration-base ${className}`}
    >
      <Link
        href={`/reports/${report.id}`}
        onClick={() => onOpen?.(report.id)}
        className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        {/* Card Media Container */}
        <div
          className={`relative ${isCompact ? "aspect-video" : "aspect-[4/3]"} w-full overflow-hidden bg-surface-muted flex items-center justify-center`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className={`h-full w-full object-cover transition-transform duration-base group-hover:scale-105 ${
                isMasked ? "blur-xs filter" : ""
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted">
              <svg
                className="w-10 h-10 opacity-40"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Badges on Image */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 pointer-events-none">
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${
                isLost ? "bg-danger-600 text-white" : "bg-primary-700 text-white"
              }`}
            >
              {isLost ? t("browse.filter.lost") : t("browse.filter.found")}
            </span>
            {report.isSensitive && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent-400 text-primary-900 shadow-sm">
                {t("sensitive.notice.title")}
              </span>
            )}
          </div>

          {isMasked && (
            <div className="absolute bottom-2 right-2 bg-text/80 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
              {t("sensitive.notice.title")}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className={`flex flex-col flex-1 ${isCompact ? "p-2.5 gap-1.5" : "p-3.5 gap-2"}`}>
          {variant === "mine" && (
            <div className="mb-0.5">
              <StatusBadge status={report.status as never} />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>{t(`category.${report.category}`)}</span>
            <span>•</span>
            <span>{formatCampusName(report.campus)}</span>
            {report.locationName && (
              <>
                <span>•</span>
                <span className="truncate max-w-32">{report.locationName}</span>
              </>
            )}
          </div>

          <h2 className="text-sm font-semibold text-text line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
            {report.title}
          </h2>

          {!isCompact && (
            <p className="text-xs text-text-muted line-clamp-2 mt-auto pt-1">
              {report.description}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
