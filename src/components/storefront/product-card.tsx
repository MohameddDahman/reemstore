"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useCurrencySymbol } from "@/lib/use-currency";
import { ProductImage } from "./product-image";
import type { Doc } from "../../../convex/_generated/dataModel";
import { REVEAL_VIEWPORT, revealFrom, revealTo, revealTransition } from "@/lib/reveal";

export function ProductCard({ product, index = 0 }: { product: Doc<"products">; index?: number }) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("product");
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [hover, setHover] = useState(false);
  // Brief confirmation on the button itself. A toast alone makes people
  // wonder whether the tap registered, and they tap again.
  const [justAdded, setJustAdded] = useState(false);
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
    toast.success(t("added"), {
      description: product.name[locale],
      action: { label: t("viewBag"), onClick: () => router.push("/cart") },
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <motion.div
      initial={revealFrom}
      whileInView={revealTo}
      viewport={REVEAL_VIEWPORT}
      transition={revealTransition(index % 4)}
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
            aisleSlug={product.tags[1]}
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
          {/* Two lines are reserved whether or not the name needs them,
              so ratings, prices and buttons line up across the shelf. */}
          <p className="line-clamp-2 min-h-[2.75em] text-[13px] leading-snug text-ink">
            {product.name[locale]}
          </p>

          {product.reviewCount > 0 ? (
            <div className="mt-1 flex h-4 items-center gap-1">
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
          ) : (
            <div className="mt-1 h-4" aria-hidden />
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

          {/* One line, always. Allowed to wrap, the struck-through original
              price dropped to a second line on some sale cards and pushed
              that card's button 8px below its neighbours'. */}
          <div className="mt-auto flex min-h-[1.5rem] flex-nowrap items-baseline gap-x-1.5 pt-1.5">
            <span
              className={`whitespace-nowrap text-sm font-semibold ${onSale ? "text-rose" : "text-ink"}`}
            >
              {formatPrice(product.price, symbol, locale)}
            </span>
            {onSale && (
              <span className="min-w-0 truncate whitespace-nowrap text-[11px] text-ink-soft line-through">
                {formatPrice(product.compareAtPrice!, symbol, locale)}
              </span>
            )}
          </div>

          <button
            onClick={quickAdd}
            disabled={outOfStock}
            className={`mt-2.5 w-full rounded-full border py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:border-line disabled:text-ink-soft disabled:hover:bg-transparent disabled:hover:text-ink-soft ${
              justAdded
                ? "border-mint bg-mint text-white"
                : "border-ink bg-transparent text-ink hover:bg-ink hover:text-white"
            }`}
          >
            {justAdded ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {t("added")}
              </span>
            ) : outOfStock ? (
              t("outOfStock")
            ) : hasVariants ? (
              t("chooseOptions")
            ) : (
              t("addToCart")
            )}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
