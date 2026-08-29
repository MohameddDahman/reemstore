"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

/**
 * Desktop department navigation.
 *
 * With fourteen departments and fifty-plus aisles, a flat link bar can't
 * carry the catalogue — so the bar shows departments and a hover panel
 * reveals that department's aisles. The panel is keyboard reachable and
 * closes on Escape; it opens on hover for pointer users because that's
 * the interaction shoppers already expect from this kind of store.
 */
export function MegaMenu() {
  const locale = useLocale() as "ar" | "en";
  const tree = useQuery(api.categories.tree);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const departments = tree ?? [];
  const open = departments.find((d) => d.slug === openSlug) ?? null;

  return (
    <div
      className="relative hidden border-t border-line bg-white lg:block"
      onMouseLeave={() => setOpenSlug(null)}
      onKeyDown={(e) => e.key === "Escape" && setOpenSlug(null)}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-1 px-5 sm:px-8">
        <span className="me-2 flex items-center gap-1.5 py-2.5 text-sm font-bold text-ink">
          <LayoutGrid className="h-4 w-4 text-rose" />
          {locale === "ar" ? "كل الأقسام" : "All Departments"}
        </span>

        {departments.slice(0, 9).map((dept) => (
          <button
            key={dept._id}
            onMouseEnter={() => setOpenSlug(dept.slug)}
            onFocus={() => setOpenSlug(dept.slug)}
            aria-expanded={openSlug === dept.slug}
            className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
              openSlug === dept.slug ? "text-rose" : "text-ink-soft hover:text-ink"
            }`}
          >
            {dept.name[locale]}
            <ChevronDown className="h-3 w-3" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-full z-40 border-y border-line bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
          >
            <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8">
              <div className="mb-4 flex items-center gap-2">
                <span aria-hidden className="text-xl">
                </span>
                <Link
                  href={`/category/${open.slug}`}
                  className="font-heading text-lg font-bold text-ink hover:text-rose"
                >
                  {open.name[locale]}
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-x-6 gap-y-2 xl:grid-cols-6">
                {open.subs.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/category/${sub.slug}`}
                    className="truncate rounded-md px-2 py-1.5 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-rose"
                  >
                    {sub.name[locale]}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
