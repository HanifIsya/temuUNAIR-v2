import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import type { Me } from "@/features/shell/types";
import { BottomNav } from "./bottom-nav";
import { TopNav } from "./top-nav";

export interface AppShellProps {
  user: Me;
  variant: "app" | "public" | "admin";
  children: ReactNode;
}

export function AppShell({ user, variant, children }: AppShellProps) {
  const t = useTranslations();

  return (
    <div
      data-testid="app-shell"
      data-variant={variant}
      className="relative min-h-screen bg-surface"
    >
      <a
        href="#main"
        data-testid="app-shell-skip-link"
        className="absolute left-2 top-2 z-50 sr-only rounded-md bg-surface px-3 py-2 text-text focus:not-sr-only focus:outline-2 focus:outline-primary-700"
      >
        {t("common.skipToContent")}
      </a>
      <header className="hidden md:block">
        <TopNav user={user} />
      </header>
      <main
        id="main"
        data-testid="app-shell-main"
        className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-10"
      >
        {children}
      </main>
      <footer className="border-t border-border px-5 py-4 pb-20 text-sm text-text md:pb-4">
        {t("app.name")}
      </footer>
      <BottomNav />
    </div>
  );
}
