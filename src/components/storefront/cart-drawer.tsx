"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import { useScrollLock } from "@/lib/use-scroll-lock";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const settings = useQuery(api.settings.get);
  const symbol = settings?.currencySymbol ?? "";
  const { subtotal } = cartTotals(items);
  const threshold = settings?.freeShippingThreshold;
  const remaining = threshold ? Math.max(threshold - subtotal, 0) : 0;
  useScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && [
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/40"
            onClick={close}
          />,
          <motion.aside
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 end-0 z-[70] flex w-full max-w-md flex-col bg-surface [dir=rtl]:left-0 [dir=rtl]:right-auto"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-heading text-xl text-ink">{t("title")}</h2>
              <button onClick={close} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-lg text-ink">{t("empty")}</p>
                <p className="text-sm text-ink-soft">{t("emptySubtitle")}</p>
                <Link
                  href="/"
                  onClick={close}
                  className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm text-cream"
                >
                  {t("continueShopping")}
                </Link>
              </div>
            ) : (
              <>
                {threshold ? (
                  <div className="border-b border-line px-6 py-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-soft">
                      <div
                        className="h-full rounded-full bg-rose-deep transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
                      />
                    </div>
                    {remaining > 0 ? (
                      <p className="mt-2 text-xs text-ink-soft">
                        {t("freeShippingProgress", { amount: formatPrice(remaining, symbol, locale) })}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-success">🎉 {t("free")}</p>
                    )}
                  </div>
                ) : null}

                <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantSku ?? ""}`} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-soft">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-ink">{item.name}</p>
                            {item.variantLabel && (
                              <p className="text-xs text-ink-soft">{item.variantLabel}</p>
                            )}
                          </div>
                          <button
                            onClick={() => remove(item.productId, item.variantSku)}
                            className="text-ink-soft hover:text-danger"
                            aria-label={t("remove")}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full border border-line px-2 py-1">
                            <button
                              onClick={() =>
                                setQuantity(item.productId, item.quantity - 1, item.variantSku)
                              }
                              className="p-1"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-4 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                setQuantity(item.productId, item.quantity + 1, item.variantSku)
                              }
                              className={cn(
                                "p-1",
                                item.quantity >= item.maxStock && "pointer-events-none opacity-30"
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-ink">
                            {formatPrice(item.price * item.quantity, symbol, locale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-line px-6 py-5">
                  <div className="flex items-center justify-between text-sm text-ink-soft">
                    <span>{t("subtotal")}</span>
                    <span className="text-base font-semibold text-ink">
                      {formatPrice(subtotal, symbol, locale)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="block w-full rounded-full bg-ink py-3.5 text-center text-sm uppercase tracking-widest text-cream transition-transform hover:scale-[1.02]"
                  >
                    {t("checkout")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>,
        ]}
    </AnimatePresence>
  );
}
