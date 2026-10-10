"use client";

import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

export type StatusValue =
  | "OPEN"
  | "MATCHED"
  | "CLAIMED"
  | "RETURNED"
  | "EXPIRED"
  | "CANCELLED"
  | "REMOVED"
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DISPUTED"
  | "HANDOVER_PLANNED";

export interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

interface StatusConfig {
  style: string;
  icon: (props: { className?: string }) => ReactElement;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

const STATUS_CONFIGS: Record<StatusValue, StatusConfig> = {
  OPEN: {
    style: "bg-primary-100 text-primary-700 border-primary-500/20",
    icon: ClockIcon,
  },
  MATCHED: {
    style: "bg-accent-100 text-warn-600 border-accent-400/30",
    icon: SparklesIcon,
  },
  CLAIMED: {
    style: "bg-accent-100 text-warn-600 border-accent-400/30",
    icon: ClockIcon,
  },
  RETURNED: {
    style: "bg-success-600/10 text-success-600 border-success-600/20",
    icon: CheckIcon,
  },
  EXPIRED: {
    style: "bg-surface-muted text-text-muted border-border",
    icon: ClockIcon,
  },
  CANCELLED: {
    style: "bg-surface-muted text-text-muted border-border",
    icon: XIcon,
  },
  REMOVED: {
    style: "bg-danger-600/10 text-danger-600 border-danger-600/20",
    icon: XIcon,
  },
  SUBMITTED: {
    style: "bg-primary-100 text-primary-700 border-primary-500/20",
    icon: ClockIcon,
  },
  PENDING_REVIEW: {
    style: "bg-accent-100 text-warn-600 border-accent-400/30",
    icon: ClockIcon,
  },
  APPROVED: {
    style: "bg-success-600/10 text-success-600 border-success-600/20",
    icon: CheckIcon,
  },
  REJECTED: {
    style: "bg-danger-600/10 text-danger-600 border-danger-600/20",
    icon: XIcon,
  },
  DISPUTED: {
    style: "bg-danger-600/10 text-danger-600 border-danger-600/20",
    icon: AlertIcon,
  },
  HANDOVER_PLANNED: {
    style: "bg-primary-100 text-primary-700 border-primary-500/20",
    icon: ClockIcon,
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const t = useTranslations("report.status");
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.OPEN;
  const Icon = config.icon;

  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{t(status)}</span>
    </span>
  );
}
