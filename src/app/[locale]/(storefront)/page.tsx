import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/storefront/hero";
import { UspStrip } from "@/components/storefront/usp-strip";
import { PromoTiles } from "@/components/storefront/promo-tiles";
import { CategoryGrid } from "@/components/storefront/category-grid";
import {
  BestsellersRail,
  NewArrivalsRail,
  OffersRail,
} from "@/components/storefront/home-rails";
import { Testimonials } from "@/components/storefront/testimonials";
import { Newsletter } from "@/components/storefront/newsletter";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <UspStrip />
      <PromoTiles />
      <NewArrivalsRail />
      <OffersRail />
      <CategoryGrid />
      <BestsellersRail />
      <Testimonials />
      <Newsletter />
    </>
  );
}
