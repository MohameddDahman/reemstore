"use client";

import { useQuery } from "convex/react";
import { useLocale, useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { ProductRail } from "./product-rail";

export function NewArrivalsRail() {
  const t = useTranslations("home.newArrivals");
  const products = useQuery(api.products.newArrivals, { limit: 10 });
  return <ProductRail title={t("title")} subtitle={t("subtitle")} products={products} />;
}

export function OffersRail() {
  const locale = useLocale() as "ar" | "en";
  const products = useQuery(api.products.onSale, { limit: 10 });
  return (
    <ProductRail
      title={locale === "ar" ? "عروض هذا الأسبوع" : "This Week's Offers"}
      subtitle={locale === "ar" ? "خصومات لفترة محدودة" : "Limited-time markdowns"}
      products={products}
      accent
    />
  );
}

export function BestsellersRail() {
  const t = useTranslations("home.featured");
  const products = useQuery(api.products.featured);
  return <ProductRail title={t("title")} subtitle={t("subtitle")} products={products} />;
}
