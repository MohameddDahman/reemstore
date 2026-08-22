"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const brand = useTranslations("brand");
  const locale = useLocale() as "ar" | "en";
  const tree = useQuery(api.categories.tree);
  const departments = (tree ?? []).slice(0, 8);

  return (
    <footer className="border-t border-line bg-cream-soft">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div>
          <p className="font-heading text-2xl text-ink">{brand("name")}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{t("about")}</p>
          <div className="mt-5 flex items-center gap-4 text-xs uppercase tracking-widest text-ink-soft">
            <a href="#" className="hover:text-ink">Instagram</a>
            <a href="#" className="hover:text-ink">TikTok</a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-ink">{t("shop")}</p>
          <ul className="mt-4 space-y-3">
            {departments.map((dept) => (
              <li key={dept._id}>
                <Link
                  href={`/category/${dept.slug}`}
                  className="text-sm text-ink-soft hover:text-ink"
                >
                  {dept.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-ink">{t("help")}</p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link href="/track-order" className="text-sm text-ink-soft hover:text-ink">
                {t("trackOrder")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-ink-soft hover:text-ink">
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-ink">{t("followUs")}</p>
          <p className="mt-4 text-sm text-ink-soft">@reem.beauty</p>
        </div>
      </div>
      <div className="border-t border-line px-5 py-6 text-center text-xs text-ink-soft sm:px-8">
        © {new Date().getFullYear()} {brand("name")}. {t("rights")}
      </div>
    </footer>
  );
}
