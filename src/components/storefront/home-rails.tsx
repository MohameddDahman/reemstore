"use client";

import { useQuery } from "convex/react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { ProductRail } from "./product-rail";

export function NewArrivalsRail() {
  const t = useTranslations("home.newArrivals");
  const products = useQuery(api.products.newArrivals, { limit: 12 });
  return (
    <ProductRail
      title={t("title")}
      subtitle={t("subtitle")}
      products={products}
      viewAllHref="/search"
    />
  );
}

export function BestsellersRail() {
  const t = useTranslations("home.featured");
  const products = useQuery(api.products.featured);
  return (
    <ProductRail
      title={t("title")}
      subtitle={t("subtitle")}
      products={products}
      viewAllHref="/search"
    />
  );
}

/**
 * One merchandised rail per department — the pattern that makes a
 * marketplace homepage feel deep rather than curated. Each pulls live
 * from its own department, so adding products in the admin fills these
 * out without a code change.
 */
export function DepartmentRail({
  slug,
  titleEn,
  titleAr,
  subEn,
  subAr,
  accent = false,
}: {
  slug: string;
  titleEn: string;
  titleAr: string;
  subEn: string;
  subAr: string;
  accent?: boolean;
}) {
  const locale = useLocale() as "ar" | "en";
  const products = useQuery(api.products.listActive, { categorySlug: slug });

  return (
    <ProductRail
      title={locale === "ar" ? titleAr : titleEn}
      subtitle={locale === "ar" ? subAr : subEn}
      products={products?.slice(0, 12)}
      viewAllHref={`/category/${slug}`}
      accent={accent}
    />
  );
}
