import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseClient } from "@/components/storefront/browse-client";

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "browse" });

  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BrowseClient mode="deals" title={t("dealsTitle")} subtitle={t("dealsSubtitle")} />
    </Suspense>
  );
}
