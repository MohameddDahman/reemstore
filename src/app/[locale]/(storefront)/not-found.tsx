"use client";

import { useTranslations } from "next-intl";
import { Compass, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The storefront's 404.
 *
 * A dead end is a place to lose a sale, so this one does not just
 * apologise: it offers search and a short list of the busiest
 * departments. It lives inside the (storefront) group so the header,
 * navigation and footer stay in place — the shopper never loses the
 * store around them.
 */
const POPULAR = [
  { slug: "skin-care", en: "Skin Care", ar: "العناية بالبشرة" },
  { slug: "hair-care", en: "Hair Care", ar: "العناية بالشعر" },
  { slug: "mother-baby", en: "Mother & Baby", ar: "الأم والطفل" },
  { slug: "makeup", en: "Makeup", ar: "المكياج" },
  { slug: "personal-care", en: "Daily Personal Care", ar: "العناية اليومية" },
  { slug: "devices-appliances", en: "Devices", ar: "الأجهزة" },
];

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-24">
      <Compass className="mx-auto h-12 w-12 text-rose-deep" strokeWidth={1.5} />

      <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">{t("body")}</p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-white"
        >
          <Search className="h-4 w-4" />
          {t("searchCta")}
        </Link>
        <Link
          href="/"
          className="rounded-full border border-line px-8 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink"
        >
          {t("homeCta")}
        </Link>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {t("popular")}
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {POPULAR.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className="block rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
              >
                <span className="ltr:inline rtl:hidden">{c.en}</span>
                <span className="ltr:hidden rtl:inline">{c.ar}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
