import { setRequestLocale } from "next-intl/server";
import { CheckoutClient } from "@/components/storefront/checkout-client";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckoutClient />;
}
