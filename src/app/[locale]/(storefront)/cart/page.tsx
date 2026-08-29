import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CartPageClient } from "@/components/storefront/cart-page-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  // Nobody should land here from a search engine, and a bag is personal.
  return { title: t("pageTitle"), robots: { index: false, follow: false } };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageClient />;
}
