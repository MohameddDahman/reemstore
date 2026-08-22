import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { setRequestLocale } from "next-intl/server";
import { api } from "../../../../../../convex/_generated/api";
import { CategoryPageClient } from "@/components/storefront/category-page-client";

/**
 * A slug that matches no category used to render a browsable page whose
 * heading was the URL itself — "/category/does-not-exist" produced a
 * plausible-looking, permanently empty "Does Not Exist" department.
 * Resolving it server-side turns that into an honest 404.
 */
async function getCategory(slug: string) {
  try {
    return await fetchQuery(api.categories.departmentBySlug, { slug });
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  const isAr = locale === "ar";
  return {
    title: isAr ? category.name.ar : category.name.en,
    description: isAr ? category.description?.ar : category.description?.en,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = await getCategory(slug);
  if (category === null) notFound();

  return <CategoryPageClient slug={slug} />;
}
