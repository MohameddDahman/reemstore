"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductCard } from "./product-card";
import { Link } from "@/i18n/navigation";

type Sort = "newest" | "price_asc" | "price_desc";

export function CategoryPageClient({ slug }: { slug: string }) {
  const locale = useLocale() as "ar" | "en";
  const category = useQuery(api.categories.departmentBySlug, { slug });
  const [sort, setSort] = useState<Sort>("newest");
  const products = useQuery(api.products.listActive, { categorySlug: slug, sort });
  // A department has aisles beneath it; an aisle has none. Showing the
  // aisle chips lets shoppers narrow down without a back-and-forth.
  const subs = category?.subs ?? [];

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold capitalize text-ink sm:text-3xl">
            {category ? category.name[locale] : slug.replace(/-/g, " ")}
          </h1>
          {products && (
            <p className="mt-1 text-sm text-ink-soft">
              {products.length} {locale === "ar" ? "منتج" : "products"}
            </p>
          )}
          {category?.description && (
            <p className="mt-2 max-w-xl text-ink-soft">{category.description[locale]}</p>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink outline-none"
        >
          <option value="newest">{locale === "ar" ? "الأحدث" : "Newest"}</option>
          <option value="price_asc">{locale === "ar" ? "السعر: من الأقل" : "Price: Low to High"}</option>
          <option value="price_desc">{locale === "ar" ? "السعر: من الأعلى" : "Price: High to Low"}</option>
        </select>
      </div>

      {subs.length > 0 && (
        <div className="h-rail -mx-5 mb-8 flex gap-2 px-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {subs.map((sub) => (
            <Link
              key={sub._id}
              href={`/category/${sub.slug}`}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink transition-colors hover:border-rose hover:text-rose"
            >
              {sub.name[locale]}
            </Link>
          ))}
        </div>
      )}

      {products && products.length === 0 && (
        <p className="py-20 text-center text-ink-soft">
          {locale === "ar" ? "لا توجد منتجات في هذه الفئة حالياً." : "No products in this category yet."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5">
        {(products ?? []).map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
