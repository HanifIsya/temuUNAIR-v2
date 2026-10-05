"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { safeInternalNext } from "@/features/auth/next-path";

export function LoginForm({ next }: { next?: string | null }) {
  const t = useTranslations();
  const [pending, setPending] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const networkMessageId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function handleGoogleSignIn() {
    if (pending) return;
    setNetworkError(false);
    setPending(true);
    try {
      await signIn("google", { callbackUrl: safeInternalNext(next) });
    } catch {
      setNetworkError(true);
      setPending(false);
    }
  }

  return (
    <main id="main" className="bg-surface px-5 py-6 text-text font-sans antialiased">
      <div
        data-testid="login-card"
        className="mx-auto flex w-full max-w-card flex-col gap-3 rounded-md border border-border bg-surface p-6 shadow-sm"
      >
        <p className="text-text-muted">{t("app.name")}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          data-testid="login-title"
          className="text-2xl font-semibold focus:outline-none"
        >
          {t("auth.login.title")}
        </h1>
        <p className="text-text-muted">{t("auth.login.note.domain")}</p>
        {networkError ? (
          <p
            id={networkMessageId}
            role="alert"
            data-testid="login-network-message"
            className="text-danger-600"
          >
            {t("auth.login.network")}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={pending}
          aria-busy={pending}
          aria-describedby={networkError ? networkMessageId : undefined}
          data-testid="login-google-button"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-700 px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? (
            <span
              data-testid="login-google-spinner"
              aria-hidden="true"
              className="inline-block size-4 animate-spin rounded-full border-2 border-primary-100 border-t-surface"
            />
          ) : null}
          {t("auth.login.google")}
        </button>
        <p className="text-sm text-text-muted">
          {t("auth.login.terms")}{" "}
          <Link
            href="/privacy"
            data-testid="login-privacy-link"
            className="text-primary-700 underline"
          >
            {t("auth.login.privacy")}
          </Link>
        </p>
      </div>
    </main>
  );
}
