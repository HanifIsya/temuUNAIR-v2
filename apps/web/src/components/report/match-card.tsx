"use client";

import type { components } from "@temuunair/contracts/generated/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatCampusName } from "@/features/browse/campus";

export type MatchItem = components["schemas"]["API-MAT-01Response"][number];
export type MatchBand = MatchItem["band"];

export interface MatchBandBadgeProps {
  band: MatchBand;
  className?: string;
}

export function MatchBandBadge({ band, className = "" }: MatchBandBadgeProps) {
  const t = useTranslations("match.band");
  const isStrong = band === "STRONG";

  return (
    <span
      data-testid="match-band-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isStrong
          ? "bg-accent-100 text-text border border-accent-400/40"
          : "bg-surface-muted text-text-muted border border-border"
      } ${className}`}
    >
      <svg
        className={`w-3.5 h-3.5 shrink-0 ${isStrong ? "text-warn-600" : "text-text-muted"}`}
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isStrong ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        )}
      </svg>
      <span>{t(band)}</span>
    </span>
  );
}

export interface MatchCardProps {
  match: MatchItem;
  onOpen?: (matchId: string) => void;
  onClaim?: (matchId: string) => void;
  onDismiss?: (matchId: string) => void;
  testId?: string;
  className?: string;
}

export function MatchCard({
  match,
  onOpen,
  onClaim,
  onDismiss,
  testId,
  className = "",
}: MatchCardProps) {
  const t = useTranslations();
  const other = match.other;

  const firstImage = other.images[0];
  const isMasked = other.isSensitive || Boolean(firstImage?.isMasked);
  const imageUrl = firstImage ? (firstImage.thumbUrl ?? firstImage.url) : null;
  const imageAlt = isMasked ? t("report.detail.masked") : other.title;

  return (
    <div
      data-testid={testId ?? `match-card-${match.id}`}
      className={`group flex flex-col sm:flex-row overflow-hidden rounded-lg border border-border bg-surface shadow-sm hover:border-primary-500/50 hover:shadow-md transition-all duration-base ${className}`}
    >
      <Link
        href={`/reports/${other.id}`}
        onClick={() => onOpen?.(match.id)}
        className="flex flex-col sm:flex-row flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        {/* Media */}
        <div className="relative aspect-video sm:aspect-square sm:w-36 overflow-hidden bg-surface-muted shrink-0 flex items-center justify-center">
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
                className="w-8 h-8 opacity-40"
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
          {isMasked && (
            <div className="absolute bottom-1 right-1 bg-text/80 text-white text-xs px-1.5 py-0.5 rounded-md backdrop-blur-sm pointer-events-none">
              {t("sensitive.notice.title")}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MatchBandBadge band={match.band} />
            <span className="text-xs text-text-muted">{formatCampusName(other.campus)}</span>
          </div>

          <h3 className="text-sm font-semibold text-text line-clamp-1 group-hover:text-primary-700 transition-colors">
            {other.title}
          </h3>

          {/* Reasons chips */}
          {match.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {match.reasons.map((r, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-surface-muted text-text-muted text-xs font-medium"
                >
                  {t.has(r.labelKey) ? t(r.labelKey) : r.code}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {(onDismiss || onClaim) && (
        <div className="flex items-center justify-end gap-2 p-2 border-t sm:border-t-0 sm:border-l border-border bg-surface-muted/30">
          {onClaim && (
            <button
              type="button"
              data-testid={`match-claim-${match.id}`}
              onClick={(e) => {
                e.preventDefault();
                onClaim(match.id);
              }}
              className="px-3 py-1.5 rounded-md bg-primary-700 text-xs font-semibold text-white hover:bg-primary-900 transition-colors"
            >
              {t("report.detail.claim")}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              data-testid={`match-dismiss-${match.id}`}
              onClick={(e) => {
                e.preventDefault();
                onDismiss(match.id);
              }}
              aria-label={t("match.dismissItem", { title: other.title })}
              className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
