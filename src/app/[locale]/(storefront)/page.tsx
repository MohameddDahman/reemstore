import { setRequestLocale } from "next-intl/server";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { UspStrip } from "@/components/storefront/usp-strip";
import { FlashDeals } from "@/components/storefront/flash-deals";
import { DepartmentGrid } from "@/components/storefront/department-grid";
import { PromoTiles } from "@/components/storefront/promo-tiles";
import { BrandRail } from "@/components/storefront/brand-rail";
import { AdCarousel } from "@/components/storefront/ad-carousel";
import {
  BestsellersRail,
  DepartmentRail,
  NewArrivalsRail,
} from "@/components/storefront/home-rails";
import { Testimonials } from "@/components/storefront/testimonials";
import { Newsletter } from "@/components/storefront/newsletter";

/**
 * Homepage running order.
 *
 * The page is built to answer, in this order: what's on offer (hero),
 * can I trust you (USP strip), what's urgent (flash deals), what do you
 * actually stock (departments), then depth — rail after rail of real
 * catalogue, banded light/sand so a long scroll reads as separate
 * shelves rather than one undifferentiated column.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroCarousel />
      <UspStrip />
      <FlashDeals />
      <DepartmentGrid />

      <DepartmentRail
        slug="mother-baby"
        titleEn="Mother & Baby"
        titleAr="الأم والطفل"
        subEn="Diapers, wipes, bottles and bath"
        subAr="حفاضات ومناديل وببرونات واستحمام"
      />

      <AdCarousel
        set="everyday"
        titleEn="Offers this week"
        titleAr="عروض هذا الأسبوع"
        band
      />

      <PromoTiles />

      <DepartmentRail
        slug="skin-care"
        titleEn="Skin Care"
        titleAr="العناية بالبشرة"
        subEn="Cleansers, serums, moisturisers and SPF"
        subAr="غسول وسيرومات ومرطبات وواقي شمس"
        accent
      />

      <NewArrivalsRail />

      <DepartmentRail
        slug="vitamins"
        titleEn="Vitamins & Supplements"
        titleAr="الفيتامينات والمكملات"
        subEn="Daily essentials for the whole family"
        subAr="أساسيات يومية لكل أفراد العائلة"
      />

      <DepartmentRail
        slug="personal-care"
        titleEn="Daily Personal Care"
        titleAr="العناية اليومية"
        subEn="Bath, deodorant, body and hands"
        subAr="استحمام ومزيلات عرق وعناية بالجسم واليدين"
        accent
      />

      <AdCarousel
        set="grooming"
        titleEn="Grooming & devices"
        titleAr="الحلاقة والأجهزة"
        band
      />

      <DepartmentRail
        slug="devices-appliances"
        titleEn="Devices & Appliances"
        titleAr="الأجهزة والمستلزمات الكهربائية"
        subEn="Shavers, trimmers, straighteners and dryers"
        subAr="ماكينات حلاقة ومكواة شعر وسشوار"
      />

      <BrandRail />

      <DepartmentRail
        slug="medical-supplies"
        titleEn="Medical Supplies"
        titleAr="المستلزمات الطبية"
        subEn="First aid, devices and supports"
        subAr="إسعافات أولية وأجهزة ودعامات"
      />

      <DepartmentRail
        slug="adult-care"
        titleEn="Adult Care"
        titleAr="عناية الكبار"
        subEn="Discreet delivery, everyday dignity"
        subAr="توصيل بخصوصية تامة"
        accent
      />

      <BestsellersRail />
      <Testimonials />
      <Newsletter />
    </>
  );
}
