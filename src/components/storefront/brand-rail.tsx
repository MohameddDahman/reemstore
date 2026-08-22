"use client";

import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

/**
 * The brands the marketplace carries, as a scrollable strip of wordmarks.
 *
 * Shoppers in this category often arrive brand-first ("do you have
 * Sensodyne?"), so this doubles as reassurance and as navigation. Set as
 * type rather than logos: real logo files are trademarked assets the
 * client supplies, and typed names never render as broken images.
 */
export function BrandRail() {
  const locale = useLocale() as "ar" | "en";
  const brands = useQuery(api.brands.list);

  if (brands && brands.length === 0) return null;

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-heading text-xl font-extrabold text-ink sm:text-2xl">
            {locale === "ar" ? "الماركات" : "Shop by Brand"}
          </h2>
          <span className="text-sm text-ink-soft">
            {brands ? `${brands.length}+` : ""}
          </span>
        </div>

        <div className="h-rail -mx-5 flex gap-3 px-5 sm:mx-0 sm:px-0">
          {(brands ?? Array.from({ length: 10 })).map((brand, i) =>
            brand ? (
              <Link
                key={brand._id}
                href={`/search?brand=${brand.slug}`}
                className="flex h-16 w-32 shrink-0 items-center justify-center rounded-xl border border-line bg-white px-3 text-center transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-sm"
              >
                <span className="font-heading text-sm font-bold text-ink">{brand.name}</span>
              </Link>
            ) : (
              <div key={i} className="h-16 w-32 shrink-0 animate-pulse rounded-xl bg-cream-soft" />
            )
          )}
        </div>
      </div>
    </section>
  );
}
