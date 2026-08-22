"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/use-currency";
import { ProductImage } from "./product-image";
import { ReviewsSection } from "./reviews-section";
import { ProductCard } from "./product-card";

export function ProductDetail({ slug }: { slug: string }) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("product");
  const product = useQuery(api.products.getBySlug, { slug });
  const settings = useQuery(api.settings.get);
  const siblingProducts = useQuery(
    api.products.listActive,
    product ? { categorySlug: product.category?.slug } : "skip"
  );

  const [activeImage, setActiveImage] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const add = useCart((s) => s.add);
  const symbol = settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL;

  const variant = product?.variants[variantIdx];
  const price = variant?.priceOverride ?? product?.price ?? 0;
  const stock = product ? (product.variants.length > 0 ? variant?.stock ?? 0 : product.stock) : 0;

  const related = useMemo(
    () => (siblingProducts ?? []).filter((p) => p._id !== product?._id).slice(0, 4),
    [siblingProducts, product]
  );

  if (product === undefined) {
    return <div className="mx-auto max-w-7xl px-5 py-24 text-center text-ink-soft sm:px-8">…</div>;
  }
  if (product === null) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8">
        <p className="text-ink-soft">{locale === "ar" ? "المنتج غير موجود" : "Product not found"}</p>
      </div>
    );
  }

  const handleAdd = () => {
    if (stock <= 0) return;
    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name[locale],
        image: product.images[0],
        price,
        variantSku: variant?.sku,
        variantLabel: variant?.name[locale],
        maxStock: stock,
      },
      quantity
    );
    toast.success(product.name[locale]);
  };

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 md:grid-cols-2 md:gap-14 md:py-16">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-soft"
          >
            <ProductImage
              src={product.images[activeImage]}
              alt={product.name[locale]}
              departmentSlug={product.tags[0]}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i ? "border-rose-deep" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="mb-2 text-xs uppercase tracking-widest text-rose-deep">
              {product.category.name[locale]}
            </p>
          )}
          <h1 className="font-heading text-3xl text-ink sm:text-4xl">{product.name[locale]}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.avgRating) ? "fill-gold text-gold" : "text-line"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-soft">({product.reviewCount})</span>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-medium text-ink">{formatPrice(price, symbol, locale)}</span>
            {product.compareAtPrice && (
              <span className="text-base text-ink-soft line-through">
                {formatPrice(product.compareAtPrice, symbol, locale)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 leading-relaxed text-ink-soft">{product.shortDescription[locale]}</p>
          )}

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink">{t("shade")}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.sku}
                    onClick={() => {
                      setVariantIdx(i);
                      setQuantity(1);
                    }}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      variantIdx === i ? "border-ink bg-ink text-cream" : "border-line text-ink"
                    }`}
                  >
                    {v.swatch && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-line"
                        style={{ backgroundColor: v.swatch }}
                      />
                    )}
                    {v.name[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="text-sm font-medium text-ink">{t("quantity")}</p>
            <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={quantity >= stock}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={stock <= 0}
            className="mt-8 w-full rounded-full bg-ink py-4 text-sm uppercase tracking-widest text-cream transition-transform hover:scale-[1.01] disabled:opacity-40"
          >
            {stock <= 0 ? t("outOfStock") : t("addToCart")}
          </button>
          {stock > 0 && stock <= 5 && (
            <p className="mt-2 text-xs text-rose-deep">{t("lowStock", { count: stock })}</p>
          )}

          <div className="mt-10 space-y-6 border-t border-line pt-8">
            <div>
              <p className="mb-1 text-sm font-semibold text-ink">{t("description")}</p>
              <p className="text-sm leading-relaxed text-ink-soft">{product.description[locale]}</p>
            </div>
            {product.ingredients && (
              <div>
                <p className="mb-1 text-sm font-semibold text-ink">{t("ingredients")}</p>
                <p className="text-sm leading-relaxed text-ink-soft">{product.ingredients[locale]}</p>
              </div>
            )}
            {product.howToUse && (
              <div>
                <p className="mb-1 text-sm font-semibold text-ink">{t("howToUse")}</p>
                <p className="text-sm leading-relaxed text-ink-soft">{product.howToUse[locale]}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewsSection productId={product._id} />

      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h2 className="mb-8 font-heading text-2xl text-ink">{t("relatedProducts")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
