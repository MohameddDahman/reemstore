"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { MegaMenu } from "./mega-menu";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchBox } from "./search-box";
import { useCart, cartTotals } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useEscapeKey } from "@/lib/use-escape-key";

export function Header() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const locale = useLocale() as "ar" | "en";
  const pathname = usePathname();
  const tree = useQuery(api.categories.tree);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCart((s) => s.items);
  const toggleCart = useCart((s) => s.toggle);
  const { count } = cartTotals(items);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useScrollLock(mobileOpen);
  useEscapeKey(mobileOpen, closeMobile);

  // Close the mobile menu on navigation — adjusted during render rather
  // than in an effect, to avoid an extra commit.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-white transition-shadow",
        scrolled ? "border-line shadow-sm" : "border-transparent"
      )}
    >
      {/* Top row: brand, search, actions */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 sm:px-8">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label={t("menu")}
        >
          <Menu className="h-5 w-5 text-ink" />
        </button>

        <Link href="/" className="font-heading text-xl font-black tracking-tight text-ink">
          {brand("name")}
        </Link>

        <div className="mx-auto hidden w-full max-w-md lg:block">
          <SearchBox />
        </div>

        <div className="ms-auto flex items-center gap-4 lg:ms-0">
          <LocaleSwitcher className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft hover:text-ink" />
          <Link
            href="/track-order"
            className="hidden text-[11px] font-medium uppercase tracking-widest text-ink-soft hover:text-ink sm:block"
          >
            {t("trackOrder")}
          </Link>
          <button aria-label={t("cart")} onClick={toggleCart} className="relative">
            <ShoppingBag className="h-5 w-5 text-ink" strokeWidth={1.5} />
            {count > 0 && (
              <motion.span
                // Keyed on the count so each change replays the pop.
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: [0.4, 1.35, 1] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-5 pb-3 lg:hidden">
        <SearchBox />
      </div>

      <MegaMenu />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="flex h-full w-[82%] max-w-xs flex-col overflow-y-auto overscroll-contain bg-white p-6 rtl:ms-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 -mx-6 mb-4 flex items-center justify-between bg-white px-6 pb-3 pt-1">
                <span className="font-heading text-lg font-black text-ink">{brand("name")}</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 pb-10">
                {(tree ?? []).map((dept) => (
                  <details key={dept._id} className="group border-b border-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-[15px] font-semibold text-ink marker:hidden">
                      <span className="flex items-center gap-2">
                        <span aria-hidden>{dept.icon}</span>
                        {dept.name[locale]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="flex flex-col pb-2">
                      <Link
                        href={`/category/${dept.slug}`}
                        className="py-1.5 ps-7 text-sm font-medium text-rose"
                      >
                        {locale === "ar" ? "عرض كل القسم" : "Shop all"}
                      </Link>
                      {dept.subs.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/category/${sub.slug}`}
                          className="py-1.5 ps-7 text-sm text-ink-soft"
                        >
                          {sub.name[locale]}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}
                <div className="mt-5 flex flex-col gap-1 border-t border-line pt-4">
                  <Link
                    href="/deals"
                    className="flex items-center gap-2 rounded-lg bg-rose-mist px-3 py-2.5 text-[15px] font-bold text-rose"
                  >
                    ⚡ {locale === "ar" ? "عروض اليوم" : "Today's Deals"}
                  </Link>
                  <Link href="/track-order" className="px-3 py-2.5 text-[15px] text-ink">
                    {t("trackOrder")}
                  </Link>
                  <Link href="/contact" className="px-3 py-2.5 text-[15px] text-ink">
                    {locale === "ar" ? "تواصلي معنا" : "Contact us"}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
