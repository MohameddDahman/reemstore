"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useCurrencySymbol } from "@/lib/use-currency";
import { ProductImage } from "./product-image";
import type { Doc } from "../../../convex/_generated/dataModel";

export function ProductCard({ product, index = 0 }: { product: Doc<"products">; index?: number }) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("product");
  const add = useCart((s) => s.add);
  const [hover, setHover] = useState(false);
  const symbol = useCurrencySymbol();

  const hasVariants = product.variants.length > 0;
  const secondImage = product.images[1] ?? product.images[0];
  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  const outOfStock = totalStock <= 0;

  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPct = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    // Products with shades/sizes need a choice made on the detail page.
    if (hasVariants) return;
    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name[locale],
        image: product.images[0],
        price: product.price,
        maxStock: product.stock,
      },
      1
    );
    toast.success(product.name[locale]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
      className="group flex h-full flex-col"
    >
      <Link
        href={`/product/${product.slug}`}
        className="flex h-full flex-col"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-soft">
          <ProductImage
            src={hover ? secondImage : product.images[0]}
            alt={product.name[locale]}
            departmentSlug={product.tags[0]}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          <div className="absolute start-2 top-2 flex flex-col gap-1">
            {onSale && (
              <span className="rounded bg-rose px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                -{discountPct}%
              </span>
            )}
            {product.isNew && !onSale && (
              <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {t("new")}
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded bg-ink px-2.5 py-1 text-[11px] uppercase tracking-wide text-white">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 flex flex-1 flex-col">
          <p className="line-clamp-2 text-[13px] leading-snug text-ink">{product.name[locale]}</p>

          {product.reviewCount > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(product.avgRating) ? "fill-rose text-rose" : "text-line"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-ink-soft">({product.reviewCount})</span>
            </div>
          )}

          {hasVariants && (
            <div className="mt-1.5 flex items-center gap-1">
              {product.variants.slice(0, 5).map((v) => (
                <span
                  key={v.sku}
                  className="h-3 w-3 rounded-full border border-line"
                  style={{ backgroundColor: v.swatch ?? "var(--color-cream-soft)" }}
                  title={v.name[locale]}
                />
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-ink-soft">+{product.variants.length - 5}</span>
              )}
            </div>
          )}

          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            <span
              className={`text-sm font-semibold ${onSale ? "text-rose" : "text-ink"}`}
            >
              {formatPrice(product.price, symbol, locale)}
            </span>
            {onSale && (
              <span className="text-[11px] text-ink-soft line-through">
                {formatPrice(product.compareAtPrice!, symbol, locale)}
              </span>
            )}
          </div>

          <button
            onClick={quickAdd}
            disabled={outOfStock}
            className="mt-2.5 w-full rounded-full border border-ink bg-transparent py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-ink-soft disabled:hover:bg-transparent disabled:hover:text-ink-soft"
          >
            {outOfStock ? t("outOfStock") : hasVariants ? t("chooseOptions") : t("addToCart")}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
