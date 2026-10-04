import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/nav/app-shell";
import { getAppUser } from "@/features/shell/server-user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const result = await getAppUser();
  if ("redirectTo" in result) {
    return redirect(result.redirectTo);
  }
  return (
    <AppShell user={result.user} variant="app">
      {children}
    </AppShell>
  );
}
