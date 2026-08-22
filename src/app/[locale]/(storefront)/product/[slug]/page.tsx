import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { setRequestLocale } from "next-intl/server";
import { api } from "../../../../../../convex/_generated/api";
import { ProductDetail } from "@/components/storefront/product-detail";

/**
 * Resolve the product on the server.
 *
 * The detail view fetches its own copy client-side, but the server needs
 * the record for two things the client cannot do: return a real 404 for
 * a slug that does not exist, and put the product's own name in the
 * page title. Without this, a mistyped URL answered 200 with an empty
 * shell — fine for a human, but it invites search engines to index junk.
 */
async function getProduct(slug: string) {
  try {
    return await fetchQuery(api.products.getBySlug, { slug });
  } catch {
    // A backend hiccup should not turn a real product into a 404.
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const isAr = locale === "ar";
  const name = isAr ? product.name.ar : product.name.en;
  const description = isAr ? product.description?.ar : product.description?.en;

  return {
    title: name,
    description: description?.slice(0, 160),
    openGraph: {
      title: name,
      description: description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (product === null) notFound();

  return <ProductDetail slug={slug} />;
}
