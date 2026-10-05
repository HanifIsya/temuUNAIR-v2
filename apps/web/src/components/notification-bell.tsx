"use client";

import { useTranslations } from "next-intl";

export interface NotificationBellProps {
  count: number;
  onOpen: () => void;
}

export function NotificationBell({ count, onOpen }: NotificationBellProps) {
  const t = useTranslations();

  return (
    <button
      type="button"
      data-testid="notification-bell"
      aria-label={t("common.nav.notificationsCount", { count })}
      onClick={onOpen}
      className="relative rounded-md p-2 text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary-700"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 ? (
        <span
          data-testid="notification-bell-badge"
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary-700 px-1 text-xs font-semibold text-white"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
