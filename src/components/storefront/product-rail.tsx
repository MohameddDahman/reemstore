"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
import type { Doc } from "../../../convex/_generated/dataModel";

/**
 * Horizontal product rail with arrow controls — the pattern Sephora,
 * Ulta and Source Beauty all use to surface many products without
 * burying the page in vertical grids. Falls back to plain touch
 * scrolling on mobile, where the arrows are hidden.
 */
export function ProductRail({
  title,
  subtitle,
  products,
  viewAllHref,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  products: Doc<"products">[] | undefined;
  viewAllHref?: string;
  accent?: boolean;
}) {
  const tc = useTranslations("common");
  const locale = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products && products.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // In RTL the visual "next" direction is negative scrollLeft.
    const sign = locale === "ar" ? -direction : direction;
    el.scrollBy({ left: sign * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };

  return (
    <section className={accent ? "bg-rose-mist py-14" : "py-14"}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink underline underline-offset-4 hover:text-rose"
              >
                {tc("viewAll")}
              </Link>
            )}
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Previous"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Next"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {(products ?? Array.from({ length: 5 })).map((product, i) =>
            product ? (
              <div
                key={(product as Doc<"products">)._id}
                className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[19%]"
              >
                <ProductCard product={product as Doc<"products">} index={i} />
              </div>
            ) : (
              <div
                key={i}
                className="h-64 w-[46%] shrink-0 animate-pulse rounded-lg bg-cream-soft sm:w-[31%] lg:w-[19%]"
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
