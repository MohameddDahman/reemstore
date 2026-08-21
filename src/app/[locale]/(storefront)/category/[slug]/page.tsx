import { setRequestLocale } from "next-intl/server";
import { CategoryPageClient } from "@/components/storefront/category-page-client";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <CategoryPageClient slug={slug} />;
}
