/** @jsxRuntime automatic */
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main id="main" className="bg-surface px-5 py-6 text-text font-sans antialiased">
      <section className="flex flex-col gap-3" data-testid="landing-hero">
        <h1 className="text-2xl font-semibold">{t("hero.title")}</h1>
        <p className="text-text-muted">{t("hero.subtitle")}</p>
        <Link
          href="/login"
          data-testid="landing-login-button"
          className="w-fit rounded-md bg-primary-700 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-primary-700"
        >
          {t("cta.login")}
        </Link>
      </section>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <li data-testid="landing-value-card-1" className="rounded-md border border-border p-4">
          {t("value.report.title")}
        </li>
        <li data-testid="landing-value-card-2" className="rounded-md border border-border p-4">
          {t("value.match.title")}
        </li>
        <li data-testid="landing-value-card-3" className="rounded-md border border-border p-4">
          {t("value.safe.title")}
        </li>
      </ul>
    </main>
  );
}
