/** @jsxRuntime automatic */
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("app");

  return (
    <main id="main" className="bg-surface px-5 py-6 text-text font-sans antialiased">
      <h1 className="text-2xl font-semibold">{t("name")}</h1>
      <p className="text-text-muted">{t("tagline")}</p>
    </main>
  );
}
