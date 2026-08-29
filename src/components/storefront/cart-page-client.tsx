"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { AlertCircle, Check, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useCartAvailability } from "@/lib/use-cart-availability";
import { ProductImage } from "./product-image";

/**
 * The bag, as a page.
 *
 * Amazon and Al Nahdi both put the bag on its own page with the same
 * bones: a dense list of lines on one side, a summary that follows you
 * down the page on the other, and the checkout button living inside that
 * summary rather than floating somewhere. A minimal slide-out panel
 * showing a name and a price looks unfinished next to those, because a
 * real bag has to answer more questions — is this still in stock, what
 * does one of them cost, what am I actually paying, and what happens
 * next.
 *
 * On a phone the summary drops below the list and the total plus the
 * checkout button ride a fixed bar at the bottom, which is what both
 * those shops do rather than making someone scroll to pay.
 */
export function CartPageClient() {
  const t = useTranslations("cart");
  const locale = useLocale() as "ar" | "en";
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const settings = useQuery(api.settings.get);
  const availability = useCartAvailability();

  const symbol = settings?.currencySymbol ?? "";
  const { subtotal, count } = cartTotals(items);
  const threshold = settings?.freeShippingThreshold;
  const shippingFee = settings?.shippingFee ?? 0;
  const qualifiesFree = threshold ? subtotal >= threshold : false;
  const remaining = threshold ? Math.max(threshold - subtotal, 0) : 0;
  const money = (n: number) => formatPrice(n, symbol, locale);

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-20 text-center sm:px-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-ink-soft/40" strokeWidth={1.25} />
        <h1 className="mt-5 font-heading text-2xl font-bold text-ink">{t("empty")}</h1>
        <p className="mt-2 text-ink-soft">{t("emptySubtitle")}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-white"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const summary = (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-heading text-base font-bold text-ink">{t("orderSummary")}</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="min-w-0 text-ink-soft">{t("subtotalWithCount", { count })}</dt>
          <dd className="shrink-0 font-semibold tabular-nums text-ink">{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">{t("estimatedShipping")}</dt>
          <dd className="shrink-0 tabular-nums">
            {qualifiesFree ? (
              <span className="font-semibold text-mint">{t("free")}</span>
            ) : shippingFee > 0 ? (
              <span className="text-ink">{money(shippingFee)}</span>
            ) : (
              <span className="text-ink-soft">{t("calculatedAtCheckout")}</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <span className="font-heading text-base font-bold text-ink">{t("total")}</span>
        <span className="font-heading text-xl font-bold tabular-nums text-ink">
          {money(subtotal + (qualifiesFree ? 0 : shippingFee))}
        </span>
      </div>

      {availability.hasProblems ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-danger">{t("unavailableWarning")}</p>
          <button
            onClick={() => {
              for (const item of items) {
                if (availability.problemFor(item)) remove(item.productId, item.variantSku);
              }
            }}
            className="w-full rounded-full bg-ink py-3.5 text-sm font-bold text-white"
          >
            {t("removeUnavailable")}
          </button>
        </div>
      ) : (
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-full bg-rose-deep py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {t("proceedToCheckout")}
        </Link>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-soft">
        <Truck className="mt-px h-3.5 w-3.5 shrink-0" />
        {t("codNote")}
      </p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">{t("pageTitle")}</h1>
        <p className="text-sm text-ink-soft">
          {count === 1 ? t("oneItemInBag") : t("itemsInBag", { count })}
        </p>
      </header>

      {/* Free-delivery progress, above the list where it can still change
          what someone adds. */}
      {threshold ? (
        <div className="mb-5 rounded-xl border border-line bg-surface p-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-soft">
            <div
              className="h-full rounded-full bg-mint transition-[width] duration-500"
              style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
            />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs">
            {remaining > 0 ? (
              <span className="text-ink-soft">
                {t("freeShippingProgress", { amount: money(remaining) })}
              </span>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 shrink-0 text-mint" />
                <span className="font-semibold text-mint">{t("freeShippingReached")}</span>
              </>
            )}
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((item) => {
            const problem = availability.problemFor(item);
            return (
              <li key={`${item.productId}-${item.variantSku ?? ""}`} className="p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-soft sm:h-24 sm:w-24"
                  >
                    <ProductImage src={item.image} alt={item.name} sizes="96px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="line-clamp-2 text-sm font-medium text-ink hover:text-rose-deep sm:text-base"
                        >
                          {item.name}
                        </Link>
                        {item.variantLabel && (
                          <p className="mt-0.5 text-xs text-ink-soft">{item.variantLabel}</p>
                        )}

                        {/* Stock status, the way a pharmacy site states it. */}
                        <p className="mt-1 text-xs">
                          {problem?.reason === "unavailable" || problem?.reason === "out_of_stock" ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-danger">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {t("unavailable")}
                            </span>
                          ) : problem?.reason === "low_stock" ? (
                            <span className="font-semibold text-danger">
                              {t("lowStockLeft", { count: problem.availableStock })}
                            </span>
                          ) : (
                            <span className="font-semibold text-mint">{t("inStock")}</span>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-end">
                        <p className="font-semibold tabular-nums text-ink sm:text-lg">
                          {money(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[11px] tabular-nums text-ink-soft">
                            {money(item.price)} {t("each")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1, item.variantSku)
                          }
                          aria-label="-"
                          className="p-2 text-ink-soft transition-colors hover:text-ink"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1, item.variantSku)
                          }
                          aria-label="+"
                          disabled={item.quantity >= item.maxStock}
                          className="p-2 text-ink-soft transition-colors hover:text-ink disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.productId, item.variantSku)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Follows the list down on a desktop, the way both reference
            shops keep checkout permanently in reach. */}
        <div className="hidden lg:sticky lg:top-24 lg:block">{summary}</div>
        <div className="lg:hidden">{summary}</div>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-sm font-semibold text-rose-deep hover:underline">
          {t("keepShopping")}
        </Link>
      </div>
    </div>
  );
}
