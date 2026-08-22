"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";

type Sort = "relevance" | "newest" | "price_asc" | "price_desc" | "discount";

/**
 * The browse surface behind /search and /deals.
 *
 * Both pages are the same view with different starting filters, so they
 * share one component: search arrives with a term, deals arrives with
 * `onSale` pinned on. Filters live in the URL so a filtered list can be
 * shared or reloaded without losing its state.
 */
export function BrowseClient({
  mode,
  title,
  subtitle,
}: {
  mode: "search" | "deals";
  title: string;
  subtitle?: string;
}) {
  const locale = useLocale() as "ar" | "en";
  const params = useSearchParams();
  const term = params.get("q") ?? undefined;
  const brandSlug = params.get("brand") ?? undefined;
  const categorySlug = params.get("category") ?? undefined;

  const [sort, setSort] = useState<Sort>(
    mode === "deals" ? "discount" : term ? "relevance" : "newest"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const products = useQuery(api.products.browse, {
    term,
    brandSlug,
    categorySlug,
    onSale: mode === "deals" ? true : undefined,
    sort,
  });

  const tree = useQuery(api.categories.tree);
  const brands = useQuery(api.brands.list);

  const activeBrand = brands?.find((b) => b.slug === brandSlug);
  const activeDept = tree?.find(
    (d) => d.slug === categorySlug || d.subs.some((s) => s.slug === categorySlug)
  );
  const hasFilters = Boolean(brandSlug || categorySlug);

  /** Rebuilds the query string with one key changed or cleared. */
  const linkWith = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return `/${mode}${qs ? `?${qs}` : ""}`;
  };

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-bold text-ink">
          {locale === "ar" ? "الأقسام" : "Departments"}
        </p>
        <div className="flex flex-col gap-0.5">
          {(tree ?? []).map((dept) => (
            <Link
              key={dept._id}
              href={linkWith("category", dept.slug === categorySlug ? undefined : dept.slug)}
              className={`truncate rounded-md px-2 py-1.5 text-sm transition-colors ${
                dept.slug === categorySlug
                  ? "bg-ink font-semibold text-white"
                  : "text-ink-soft hover:bg-sand hover:text-ink"
              }`}
            >
              <span className="me-1.5" aria-hidden>
                {dept.icon}
              </span>
              {dept.name[locale]}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-ink">
          {locale === "ar" ? "الماركات" : "Brands"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(brands ?? []).map((brand) => (
            <Link
              key={brand._id}
              href={linkWith("brand", brand.slug === brandSlug ? undefined : brand.slug)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                brand.slug === brandSlug
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
      <div className="mb-5 border-b border-line pb-5">
        <h1 className="font-heading text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}

        {/* Active filters, each individually removable. */}
        {(hasFilters || term) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {term && (
              <span className="rounded-full bg-sand px-3 py-1 text-xs text-ink">
                {locale === "ar" ? "بحث" : "Search"}: {term}
              </span>
            )}
            {activeDept && categorySlug && (
              <Link
                href={linkWith("category", undefined)}
                className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs text-white"
              >
                {activeDept.slug === categorySlug
                  ? activeDept.name[locale]
                  : activeDept.subs.find((s) => s.slug === categorySlug)?.name[locale]}
                <X className="h-3 w-3" />
              </Link>
            )}
            {activeBrand && (
              <Link
                href={linkWith("brand", undefined)}
                className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs text-white"
              >
                {activeBrand.name}
                <X className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              {products
                ? `${products.length} ${locale === "ar" ? "منتج" : "products"}`
                : "…"}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm text-ink lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {locale === "ar" ? "تصفية" : "Filters"}
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-full border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
              >
                {term && (
                  <option value="relevance">
                    {locale === "ar" ? "الأكثر صلة" : "Most relevant"}
                  </option>
                )}
                <option value="discount">
                  {locale === "ar" ? "أعلى خصم" : "Biggest discount"}
                </option>
                <option value="newest">{locale === "ar" ? "الأحدث" : "Newest"}</option>
                <option value="price_asc">
                  {locale === "ar" ? "السعر: من الأقل" : "Price: low to high"}
                </option>
                <option value="price_desc">
                  {locale === "ar" ? "السعر: من الأعلى" : "Price: high to low"}
                </option>
              </select>
            </div>
          </div>

          {filtersOpen && (
            <div className="mb-6 rounded-xl border border-line bg-white p-4 lg:hidden">
              {filterPanel}
            </div>
          )}

          {products && products.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-ink">
                {locale === "ar" ? "لا توجد نتائج" : "Nothing matched"}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {locale === "ar"
                  ? "جربي كلمة أخرى أو امسحي التصفية."
                  : "Try another word, or clear the filters."}
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm text-white"
              >
                {locale === "ar" ? "تصفحي الأقسام" : "Browse departments"}
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
            {(products ?? []).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
