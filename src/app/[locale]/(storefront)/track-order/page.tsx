import { setRequestLocale } from "next-intl/server";
import { TrackOrderClient } from "@/components/storefront/track-order-client";

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrackOrderClient />;
}
