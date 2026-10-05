"use client";

import { useTranslations } from "next-intl";

import type { CategoryValue } from "@/features/report/types";

export interface SensitiveNoticeProps {
  category: CategoryValue;
}

export function SensitiveNotice({ category }: SensitiveNoticeProps) {
  const t = useTranslations();

  return (
    <aside
      data-testid="sensitive-notice"
      data-category={category}
      role="note"
      className="flex flex-col gap-1 rounded-md border border-border bg-surface-muted p-3 text-sm"
    >
      <p className="font-semibold text-text">{t("sensitive.notice.title")}</p>
      <p className="text-text-muted">{t("sensitive.notice.body")}</p>
      <p className="text-text-muted">{t("sensitive.notice.dropPoint")}</p>
    </aside>
  );
}
