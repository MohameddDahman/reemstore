import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Unbounded, Inter, Reem_Kufi, Tajawal } from "next/font/google";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700", "900"],
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  variable: "--font-heading",
  weight: ["400", "500", "700"],
  display: "swap",
});
const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-body",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  return {
    title: { default: `${t("name")} — ${t("tagline")}`, template: `%s — ${t("name")}` },
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const isArabic = locale === "ar";
  const headingFont = isArabic ? reemKufi : unbounded;
  const bodyFont = isArabic ? tajawal : inter;

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={isArabic ? "rtl" : "ltr"} suppressHydrationWarning>
        <body
          className={`${headingFont.variable} ${bodyFont.variable} bg-cream font-body text-ink antialiased`}
        >
          <NextIntlClientProvider>
            <ConvexClientProvider>
              <SmoothScrollProvider>
                {children}
                {/* theme="light" — sonner defaults to the system theme,
                    which would render dark toasts on a light-only store. */}
                <Toaster
                  position={isArabic ? "top-left" : "top-right"}
                  theme="light"
                  richColors
                />
              </SmoothScrollProvider>
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
