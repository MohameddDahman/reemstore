import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAV_LINKS = [
  { key: "skincare", href: "/category/skincare" },
  { key: "makeup", href: "/category/makeup" },
  { key: "fragrance", href: "/category/fragrance" },
  { key: "hairCare", href: "/category/hair-care" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const brand = useTranslations("brand");

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
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                  {nav(link.key)}
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
