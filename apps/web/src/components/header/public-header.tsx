"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSessionStatus } from "@/features/auth/use-session";

export function PublicHeader() {
  const t = useTranslations();
  const { status } = useSessionStatus();

  return (
    <header
      className="relative flex items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4"
      data-testid="public-header"
    >
      <a
        href="#main"
        data-testid="header-skip-link"
        className="absolute left-2 top-2 sr-only rounded-md bg-surface px-3 py-2 text-text focus:not-sr-only"
      >
        {t("common.skipToContent")}
      </a>
      <Link href="/" data-testid="header-logo" className="text-text font-semibold">
        {t("app.name")}
      </Link>
      {status === "loading" ? (
        <span
          data-testid="header-session-skeleton"
          aria-busy="true"
          className="h-9 w-24 animate-pulse rounded-md bg-surface-muted"
        />
      ) : status === "authenticated" ? (
        <Link
          href="/home"
          data-testid="header-home-link"
          className="rounded-md border border-border px-4 py-2 text-text"
        >
          {t("common.home")}
        </Link>
      ) : (
        <Link
          href="/login"
          data-testid="header-login-button"
          className="rounded-md bg-primary-700 px-4 py-2 text-white"
        >
          {t("common.signIn")}
        </Link>
      )}
    </header>
  );
}
