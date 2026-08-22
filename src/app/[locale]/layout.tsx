import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Baloo_Bhaijaan_2, Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// One family pair serves both locales: both faces ship Arabic and Latin,
// so headings and body keep the same voice when the shopper switches
// language, instead of swapping personality mid-session.
const display = Baloo_Bhaijaan_2({
  subsets: ["latin", "arabic"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
const body = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-body",
  weight: ["300", "400", "600", "700"],
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

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={isArabic ? "rtl" : "ltr"} suppressHydrationWarning>
        <body
          className={`${display.variable} ${body.variable} bg-cream font-body text-ink antialiased`}
        >
          <NextIntlClientProvider>
            <ConvexClientProvider>
                {children}
                {/* theme="light" — sonner defaults to the system theme,
                    which would render dark toasts on a light-only store. */}
                <Toaster
                  position={isArabic ? "top-left" : "top-right"}
                  theme="light"
                  richColors
                />
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
