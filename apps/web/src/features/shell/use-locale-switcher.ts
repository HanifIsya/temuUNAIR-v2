import { api } from "@temuunair/contracts/generated/client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { Locale } from "./types";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Locale round-trip (FR-I18N-001): write the NEXT_LOCALE cookie for an instant
 * preview, persist the profile via API-ME-02, then re-render in place — never
 * a full page reload. The profile write is best-effort (offline keeps the cookie).
 */
export function useLocaleSwitcher(): { locale: Locale; onChange: (next: Locale) => Promise<void> } {
  const locale = useLocale();
  const router = useRouter();

  const onChange = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      try {
        await api.PATCH("/api/v1/me", {
          body: { locale: next },
          headers: { "X-Requested-With": "temuunair" },
        });
      } catch {
        // Profile write may fail offline; the cookie already applied the preview.
      }
      router.refresh();
    },
    [locale, router],
  );

  return { locale: locale as Locale, onChange };
}
