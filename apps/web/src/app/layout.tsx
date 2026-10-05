/** @jsxRuntime automatic */
import "../styles/theme.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/providers";
import { ApiProvider } from "@/lib/api/provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TemuUNAIR",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="bg-surface font-sans text-text antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ApiProvider>{children}</ApiProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
