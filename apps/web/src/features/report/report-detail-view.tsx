"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorState } from "@/components/error-state";
import { SensitiveNotice } from "@/components/report/sensitive-notice";
import { StatusBadge } from "@/components/report/status-badge";
import { formatCampusName } from "@/features/browse/campus";
import type { ReportOwnerItem, ReportPublicItem } from "@/features/browse/types";
import { ApiQueryError } from "@/lib/api/client";
import { type ReportDetailData, useReportDetail } from "./use-report-detail";

export interface ReportDetailViewProps {
  reportId: string;
  initialData?: ReportDetailData;
}

export function ReportDetailSkeleton() {
  return (
    <div data-testid="report-detail-loading" className="flex flex-col gap-6 py-6 animate-pulse">
      <div className="h-4 w-32 bg-surface-muted rounded" />
      <div className="h-8 w-3/4 bg-surface-muted rounded" />
      <div className="aspect-video w-full bg-surface-muted rounded-xl" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-1/2 bg-surface-muted rounded" />
        <div className="h-4 w-full bg-surface-muted rounded" />
        <div className="h-4 w-5/6 bg-surface-muted rounded" />
      </div>
    </div>
  );
}

export function ReportDetailView({ reportId, initialData }: ReportDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useReportDetail(reportId, initialData);

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: "Asia/Jakarta",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (isError) {
    const isNotFound =
      error instanceof ApiQueryError && (error.status === 404 || error.message === "NOT_FOUND");

    if (isNotFound) {
      notFound();
    }

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

  if (!report) return null;

  // An owner view includes the `version` field from ReportOwnerView.
  const isOwner = "version" in report && typeof report.version === "number";
  const ownerReport = isOwner ? (report as ReportOwnerItem) : null;

  const isFound = report.type === "FOUND";
  const isLost = report.type === "LOST";

  // Claim button is shown only for FOUND reports and hidden for the owner
  const canClaim = isFound && !isOwner;

  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary-700 transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>{t("report.detail.back")}</span>
        </Link>
      </div>

      {/* Header & Badges */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${
              isLost ? "bg-danger-600 text-white" : "bg-primary-700 text-white"
            }`}
          >
            {isLost ? t("browse.filter.lost") : t("browse.filter.found")}
          </span>
          <StatusBadge status={report.status as never} />
        </div>

        <h1
          data-testid="report-detail-title"
          className="text-2xl font-bold text-text leading-tight"
        >
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span>{t(`category.${report.category}`)}</span>
          <span>•</span>
          <span>{formatCampusName(report.campus)}</span>
          {report.locationName && (
            <>
              <span>•</span>
              <span>{report.locationName}</span>
            </>
          )}
        </div>
      </div>

      {/* Sensitive Notice if sensitive */}
      {report.isSensitive && (
        <div data-testid="report-sensitive-notice">
          <SensitiveNotice category={report.category} />
        </div>
      )}

      {/* Media / Images */}
      {report.images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.images.map((img: ReportPublicItem["images"][number], idx: number) => {
              const isMasked = report.isSensitive || Boolean(img.isMasked);
              const altText = isMasked ? t("report.detail.masked") : `${report.title} - ${idx + 1}`;
              const src = img.url ?? img.thumbUrl ?? "";

              return (
                <div
                  key={img.id ?? idx}
                  className="relative aspect-video rounded-xl overflow-hidden border border-border bg-surface-muted flex items-center justify-center"
                >
                  {src ? (
                    <img
                      src={src}
                      alt={altText}
                      data-testid={`report-gallery-image-${idx}`}
                      className={`h-full w-full object-cover ${isMasked ? "blur-xs filter" : ""}`}
                    />
                  ) : null}
                  {isMasked && (
                    <div className="absolute inset-x-0 bottom-0 bg-text/80 text-white text-xs px-3 py-1.5 text-center backdrop-blur-sm">
                      {t("report.detail.masked")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Description & Meta */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text">{t("report.detail.description")}</h2>
        <p className="text-sm text-text whitespace-pre-line leading-relaxed">
          {report.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
          {report.colors && report.colors.length > 0 && (
            <div>
              <span className="text-text-muted font-medium">{t("report.detail.colors")}: </span>
              <span className="text-text">
                {report.colors.map((c: string) => t(`report.wizard.colors.${c}`)).join(", ")}
              </span>
            </div>
          )}

          {report.brand && (
            <div>
              <span className="text-text-muted font-medium">{t("report.detail.brand")}: </span>
              <span className="text-text">{report.brand}</span>
            </div>
          )}

          {report.occurredAt?.from && (
            <div>
              <span className="text-text-muted font-medium">{t("report.detail.occurredAt")}: </span>
              <span className="text-text">{formatDate(report.occurredAt.from)}</span>
            </div>
          )}

          {report.custody && (
            <div>
              <span className="text-text-muted font-medium">
                {t("report.wizard.custody.label")}:{" "}
              </span>
              <span className="text-text">
                {report.custody === "AT_DROP_POINT"
                  ? t("report.detail.custody.dropPoint", {
                      name: report.dropPointName ?? "Drop Point",
                    })
                  : t("report.detail.custody.held")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owner-Only Panel */}
      {isOwner && ownerReport && (
        <div
          data-testid="report-owner-panel"
          className="flex flex-col gap-4 rounded-xl border border-primary-500/30 bg-primary-100/30 p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary-900">
              {t("report.detail.ownerPanel.title")}
            </h2>
            {ownerReport.expiresAt && (
              <span className="text-xs text-text-muted">
                {t("report.detail.ownerPanel.expiresAt", {
                  date: formatDate(ownerReport.expiresAt),
                })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/reports/${report.id}/matches`}
              data-testid="report-matches-link"
              className="px-4 py-2 rounded-md bg-primary-700 text-xs font-semibold text-white hover:bg-primary-900 transition-colors"
            >
              {(ownerReport.matchCount ?? 0) > 0
                ? t("report.detail.ownerPanel.matches", { count: ownerReport.matchCount ?? 0 })
                : t("report.detail.ownerPanel.noMatches")}
            </Link>

            {ownerReport.activeClaimId && (
              <span className="px-3 py-1.5 rounded-md bg-accent-100 border border-accent-400 text-xs font-medium text-warn-600">
                {t("report.detail.ownerPanel.activeClaim")}
              </span>
            )}
          </div>

          {/* Verification hints prompt list (owner only, NEVER show answers!) */}
          {ownerReport.hintPrompts && ownerReport.hintPrompts.length > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-primary-500/20">
              <span className="text-xs font-medium text-text-muted">
                {t("report.detail.ownerPanel.hintsTitle")}
              </span>
              <ul className="list-disc list-inside text-xs text-text space-y-1">
                {ownerReport.hintPrompts.map((prompt: string, idx: number) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons for visitors */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {canClaim && (
          <Link
            href={`/claims/new?reportId=${report.id}`}
            data-testid="report-claim-button"
            className="flex-1 min-w-[200px] text-center px-6 py-3 rounded-lg bg-primary-700 hover:bg-primary-900 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            {t("report.detail.claim")}
          </Link>
        )}

        <button
          type="button"
          data-testid="report-flag-button"
          className="px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text-muted transition-colors"
        >
          {t("report.detail.flag")}
        </button>
      </div>
    </div>
  );
}
