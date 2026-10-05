"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Locale } from "@/features/shell/types";

const LOCALE_NAMES: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
};

export interface LocaleSwitcherProps {
  locale: Locale;
  onChange: (next: Locale) => void;
}

export function LocaleSwitcher({ locale, onChange }: LocaleSwitcherProps) {
  const t = useTranslations();
  const [announcement, setAnnouncement] = useState("");

  const select = (next: Locale) => {
    if (next === locale) return;
    setAnnouncement(t("common.localeSwitcher.changed", { language: LOCALE_NAMES[next] }));
    onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={t("common.localeSwitcher.label")}
      data-testid="locale-switcher"
      className="flex items-center gap-1 rounded-md border border-border p-0.5"
    >
      {(["id", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          data-testid={`locale-switcher-${code}`}
          aria-pressed={code === locale}
          onClick={() => select(code)}
          className={
            code === locale
              ? "rounded bg-primary-700 px-2 py-1 text-xs font-semibold text-white"
              : "rounded px-2 py-1 text-xs text-text hover:bg-surface-muted"
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
      <span data-testid="locale-switcher-announcement" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
