"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ErrorState } from "@/components/error-state";
import { MatchCard } from "@/components/report/match-card";
import { ReportCard } from "@/components/report/report-card";
import type { ReportOwnerItem } from "@/features/browse/types";
import { ApiQueryError, api } from "@/lib/api/client";
import { reportsMineKey } from "@/lib/api/keys";
import { useMyReports } from "./use-my-reports";
import { useTopMatches } from "./use-top-matches";

export interface HomeViewProps {
  user?: { displayName?: string };
}

const ONBOARDING_STORAGE_KEY = "temuunair_onboarding_dismissed";
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function HomeView({ user }: HomeViewProps) {
  const t = useTranslations("home");
  const tApp = useTranslations("app");
  const tBrowse = useTranslations("browse");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewError, setRenewError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!dismissed) {
        setShowOnboarding(true);
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  };

  const displayName = user?.displayName ?? "Ksatria Airlangga";
  const firstName = displayName.split(" ")[0] ?? displayName;

  // Poll unread notifications count (FE-02, SCR-003, API-NTF-04)
  useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async (): Promise<number> => {
      const res = (await api.GET("/api/v1/notifications/unread-count", {})) as unknown as {
        data?: { count: number };
      };
      return res.data?.count ?? 0;
    },
    refetchInterval: 30 * 1000,
  });

  const {
    data: reports = [],
    isLoading: loadingReports,
    isError: errorReports,
    error: reportsError,
    refetch: refetchReports,
  } = useMyReports({ status: "active" });

  const activeReports = reports.slice(0, 3);
  const firstReportId = activeReports[0]?.id;

  const {
    data: matches = [],
    isLoading: loadingMatches,
    isError: errorMatches,
    error: matchesError,
    refetch: refetchMatches,
  } = useTopMatches(firstReportId);

  const topMatches = matches.slice(0, 3);

  const checkIsExpiring = (report: ReportOwnerItem): boolean => {
    if (report.status === "EXPIRED") return true;
    if (!report.expiresAt) return false;
    const msLeft = new Date(report.expiresAt).getTime() - Date.now();
    return msLeft > 0 && msLeft <= FOURTEEN_DAYS_MS;
  };

  const handleRenew = async (reportId: string) => {
    setRenewingId(reportId);
    setRenewError(null);
    try {
      const res = (await api.POST("/api/v1/reports/{id}/renew", {
        params: { path: { id: reportId } },
      })) as unknown as { error?: unknown; response?: Response };

      if (res.error) {
        setRenewError(t("renewFailed"));
        return;
      }
      void queryClient.invalidateQueries({ queryKey: reportsMineKey({ status: "active" }) });
    } catch {
      setRenewError(t("renewFailed"));
    } finally {
      setRenewingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/reports?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/reports");
    }
  };

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* Greeting Region */}
      <div className="flex flex-col gap-1">
        <h1
          data-testid="home-greeting"
          className="text-2xl sm:text-3xl font-bold text-text leading-tight"
        >
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-sm text-text-muted">{tApp("tagline")}</p>
      </div>

      {/* Quick Search Entry (SCR-003, FE-01) */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <label htmlFor="home-search-input" className="sr-only">
          {tBrowse("search.placeholder")}
        </label>
        <input
          id="home-search-input"
          type="search"
          data-testid="home-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tBrowse("search.placeholder")}
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
          className="absolute right-2 px-3 py-1 rounded-md bg-primary-700 text-xs font-medium text-white hover:bg-primary-900 transition-colors"
        >
          {tBrowse("search.submit")}
        </button>
      </form>

      {/* Onboarding Banner (dismissible) */}
      {showOnboarding && (
        <div
          data-testid="home-onboarding"
          role="region"
          aria-label={t("onboarding.title")}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-primary-500/30 bg-primary-100/40"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-primary-900">{t("onboarding.title")}</h2>
            <p className="text-xs text-text-muted max-w-xl">{t("onboarding.desc")}</p>
          </div>
          <button
            type="button"
            data-testid="home-onboarding-dismiss"
            onClick={dismissOnboarding}
            className="shrink-0 px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-text hover:bg-surface-muted transition-colors"
          >
            {t("onboarding.dismiss")}
          </button>
        </div>
      )}

      {/* Primary CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Lost CTA */}
        <Link
          href="/reports/new?type=lost"
          data-testid="home-lost-cta"
          className="group flex items-center justify-between p-5 rounded-lg border border-border bg-surface shadow-sm hover:border-danger-600/50 hover:shadow-md transition-all duration-base focus:outline-none focus:ring-2 focus:ring-danger-600"
        >
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-text group-hover:text-danger-600 transition-colors">
              {t("cta.lost")}
            </span>
            <span className="text-xs text-text-muted">{t("cta.lostDesc")}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-danger-600/10 text-danger-600 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>

        {/* Found CTA */}
        <Link
          href="/reports/new?type=found"
          data-testid="home-found-cta"
          className="group flex items-center justify-between p-5 rounded-lg border border-border bg-surface shadow-sm hover:border-primary-500/50 hover:shadow-md transition-all duration-base focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-text group-hover:text-primary-700 transition-colors">
              {t("cta.found")}
            </span>
            <span className="text-xs text-text-muted">{t("cta.foundDesc")}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Laporan Saya Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">{t("myReports")}</h2>
          <Link
            href="/me/reports"
            className="text-xs font-semibold text-primary-700 hover:underline transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>

        {renewError && (
          <div
            role="alert"
            className="p-3 rounded-lg border border-danger-600/30 bg-danger-600/10 text-xs text-danger-600 font-medium"
          >
            {renewError}
          </div>
        )}

        {errorReports ? (
          <ErrorState
            titleKey="common.unknownError"
            descKey="error.INTERNAL"
            requestId={reportsError instanceof ApiQueryError ? reportsError.requestId : null}
            onRetry={() => void refetchReports()}
          />
        ) : loadingReports ? (
          <div
            data-testid="home-reports-loading"
            role="list"
            aria-busy="true"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                role="listitem"
                className="h-48 rounded-lg border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : activeReports.length === 0 ? (
          <div
            data-testid="home-reports-empty"
            className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface-muted/50"
          >
            <p className="text-sm font-medium text-text mb-1">{t("empty.reports")}</p>
            <p className="text-xs text-text-muted mb-4 max-w-xs">{t("empty.reportsDesc")}</p>
            <Link
              href="/reports/new"
              className="px-4 py-2 rounded-md bg-primary-700 text-xs font-medium text-white hover:bg-primary-900 transition-colors"
            >
              {t("cta.lost")}
            </Link>
          </div>
        ) : (
          <div role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeReports.map((report) => {
              const isExpiring = checkIsExpiring(report);

              return (
                <div key={report.id} role="listitem" className="flex flex-col gap-2">
                  <div data-testid={`home-report-card-${report.id}`}>
                    <ReportCard report={report} variant="mine" />
                  </div>
                  {isExpiring && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-accent-100 rounded-md border border-accent-400/40 text-xs text-text">
                      <div className="flex items-center gap-1 font-medium">
                        <svg
                          className="w-3.5 h-3.5 text-warn-600 shrink-0"
                          aria-hidden="true"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span>{t("expiringSoon")}</span>
                      </div>
                      <button
                        type="button"
                        data-testid={`home-renew-button-${report.id}`}
                        onClick={() => void handleRenew(report.id)}
                        disabled={renewingId === report.id}
                        className="px-2 py-0.5 rounded-md bg-primary-700 text-white text-xs font-semibold hover:bg-primary-900 disabled:opacity-50"
                      >
                        {t("renew")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Kecocokan Terbaru Section (only if active report exists) */}
      {firstReportId && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">{t("matches")}</h2>
            <Link
              href={`/reports/${firstReportId}/matches`}
              className="text-xs font-semibold text-primary-700 hover:underline transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>

          {errorMatches ? (
            <ErrorState
              titleKey="common.unknownError"
              descKey="error.INTERNAL"
              requestId={matchesError instanceof ApiQueryError ? matchesError.requestId : null}
              onRetry={() => void refetchMatches()}
            />
          ) : loadingMatches ? (
            <div
              data-testid="home-matches-loading"
              role="list"
              aria-busy="true"
              className="flex flex-col gap-3"
            >
              {[1, 2].map((i) => (
                <div
                  key={i}
                  role="listitem"
                  className="h-24 rounded-lg border border-border bg-surface animate-pulse"
                />
              ))}
            </div>
          ) : topMatches.length === 0 ? (
            <div
              data-testid="home-matches-empty"
              className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-dashed border-border bg-surface-muted/50"
            >
              <p className="text-sm font-medium text-text mb-1">{t("empty.matches")}</p>
              <p className="text-xs text-text-muted max-w-xs">{t("empty.matchesDesc")}</p>
            </div>
          ) : (
            <div role="list" className="flex flex-col gap-3">
              {topMatches.map((match) => (
                <div key={match.id} role="listitem">
                  <MatchCard match={match} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
