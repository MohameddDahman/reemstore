import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { PromoPopup } from "@/components/storefront/promo-popup";
import { MarqueeBar } from "@/components/storefront/marquee-bar";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <MarqueeBar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <PromoPopup />
    </>
  );
}
