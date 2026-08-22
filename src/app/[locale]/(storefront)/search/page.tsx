import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseClient } from "@/components/storefront/browse-client";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "browse" });

  return (
    // useSearchParams needs a Suspense boundary to avoid opting the whole
    // route into client-side rendering.
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BrowseClient mode="search" title={t("searchTitle")} subtitle={t("searchSubtitle")} />
    </Suspense>
  );
}
