"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductCard } from "./product-card";

type Sort = "newest" | "price_asc" | "price_desc";

export function CategoryPageClient({ slug }: { slug: string }) {
  const locale = useLocale() as "ar" | "en";
  const category = useQuery(api.categories.getBySlug, { slug });
  const [sort, setSort] = useState<Sort>("newest");
  const products = useQuery(api.products.listActive, { categorySlug: slug, sort });

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <h1 className="font-heading text-3xl capitalize text-ink sm:text-4xl">
            {category ? category.name[locale] : slug.replace("-", " ")}
          </h1>
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

      {products && products.length === 0 && (
        <p className="py-20 text-center text-ink-soft">
          {locale === "ar" ? "لا توجد منتجات في هذه الفئة حالياً." : "No products in this category yet."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {(products ?? []).map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
