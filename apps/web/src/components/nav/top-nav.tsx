"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { TOP_NAV_ITEMS } from "@/features/shell/nav-items";
import { useLocaleSwitcher } from "@/features/shell/use-locale-switcher";
import type { Me } from "@/features/shell/types";
import { AvatarMenu } from "./avatar-menu";

export interface TopNavProps {
  user: Me;
}

export function TopNav({ user }: TopNavProps) {
  const t = useTranslations();
  const router = useRouter();
  const { locale, onChange } = useLocaleSwitcher();

  return (
    <nav
      aria-label={t("common.nav.topNavigation")}
      data-testid="top-nav"
      className="hidden items-center gap-4 border-b border-border bg-surface px-5 py-3 md:flex"
    >
      <Link href="/home" data-testid="top-nav-logo" className="text-sm font-semibold text-text">
        {t("app.name")}
      </Link>
      <ul className="flex items-center gap-1">
        {TOP_NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href ?? "/"}
              data-testid={item.testid}
              className={
                item.id === "report"
                  ? "rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-md px-3 py-2 text-sm text-text hover:bg-surface-muted"
              }
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-3">
        <LocaleSwitcher
          locale={locale}
          onChange={(next) => {
            void onChange(next);
          }}
        />
        <NotificationBell count={0} onOpen={() => router.push("/notifications")} />
        <AvatarMenu user={user} />
      </div>
    </nav>
  );
}
