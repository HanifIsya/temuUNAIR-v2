"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export interface ErrorStateProps {
  titleKey: string;
  descKey: string;
  headingLevel?: 1 | 2;
  action?: { labelKey: string; href: string };
  onRetry?: () => void;
  requestId?: string | null;
  messageTestId?: string;
}

export function ErrorState({
  titleKey,
  descKey,
  headingLevel = 2,
  action,
  onRetry,
  requestId,
  messageTestId,
}: ErrorStateProps) {
  const t = useTranslations();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const messageId = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function copyRequestId() {
    try {
      await navigator.clipboard.writeText(requestId ?? "");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const headingProps = {
    ref: headingRef,
    id: headingId,
    tabIndex: -1,
    "data-testid": "error-state-heading",
    className: "text-text focus:outline-none",
  };

  return (
    <div className="flex flex-col gap-3">
      {headingLevel === 1 ? (
        <h1 {...headingProps}>{t(titleKey)}</h1>
      ) : (
        <h2 {...headingProps}>{t(titleKey)}</h2>
      )}
      <p
        id={messageId}
        role="alert"
        data-testid={messageTestId ?? "error-state-message"}
        className="text-text-muted"
      >
        {t(descKey)}
      </p>
      {requestId ? (
        <div
          className="flex items-center gap-2 text-sm text-text-muted"
          data-testid="error-request-id"
        >
          <code className="font-mono">{requestId}</code>
          <button
            type="button"
            onClick={copyRequestId}
            data-testid="error-request-id-copy"
            className="text-primary-700 underline"
          >
            {t(copied ? "common.copied" : "common.copy")}
          </button>
        </div>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          aria-describedby={messageId}
          data-testid="error-state-action"
          className="w-fit rounded-md bg-primary-700 px-4 py-2 text-white"
        >
          {t(action.labelKey)}
        </Link>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          aria-describedby={messageId}
          data-testid="error-state-retry"
          className="w-fit rounded-md border border-border px-4 py-2 text-text"
        >
          {t("common.retry")}
        </button>
      ) : null}
    </div>
  );
}
