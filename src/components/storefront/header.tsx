"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchBox } from "./search-box";
import { useCart, cartTotals } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "skincare", href: "/category/skincare" },
  { key: "makeup", href: "/category/makeup" },
  { key: "fragrance", href: "/category/fragrance" },
  { key: "hairCare", href: "/category/hair-care" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const brand = useTranslations("brand");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCart((s) => s.items);
  const toggleCart = useCart((s) => s.toggle);
  const { count } = cartTotals(items);

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
              <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-5 pb-3 lg:hidden">
        <SearchBox />
      </div>

      {/* Category nav row */}
      <nav className="hidden border-t border-line lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-8 py-2.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:text-rose"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>
      </nav>

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
              className="h-full w-[80%] max-w-xs bg-white p-6 rtl:ms-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-heading text-lg font-black text-ink">{brand("name")}</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <Link key={link.key} href={link.href} className="text-base text-ink">
                    {t(link.key)}
                  </Link>
                ))}
                <Link href="/track-order" className="text-base text-ink">
                  {t("trackOrder")}
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
