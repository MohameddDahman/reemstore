"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { PackageSearch, Search, ShieldCheck } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import { useCurrencySymbol } from "@/lib/use-currency";
import { ProductImage } from "./product-image";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

/**
 * Order tracking, keyed on the order number alone.
 *
 * There are no accounts on this store, so the number printed on the
 * confirmation is the only thing a shopper reliably has. Asking for a
 * matching phone number on top of it turned a lookup into a quiz —
 * people mistype the number they gave at checkout, or a family member
 * placed the order.
 *
 * The trade-off is that the number is now the sole credential, so the
 * server answers with a redacted order (see orders.trackOrder): status,
 * items and totals, but only a first name, the last four digits of the
 * phone, and the city. Enough to know it's yours; not enough to be worth
 * guessing at.
 */
export function TrackOrderClient() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("track");
  const ts = useTranslations("orderStatus");
  const currency = useCurrencySymbol();
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState<{ orderNumber: string } | null>(null);

  const order = useQuery(api.orders.trackOrder, searched ?? "skip");
  const loading = searched !== null && order === undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    setSearched({ orderNumber: trimmed });
  };

  const activeStepIndex = order
    ? STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number])
    : -1;

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-16">
      <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 text-ink-soft">{t("subtitle")}</p>

      <form onSubmit={submit} className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft ltr:left-4 rtl:right-4" />
            <input
              value={orderNumber}
              // Order numbers are stored uppercase; normalising as the
              // shopper types means a lowercase paste still matches.
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="RS-20260822-K4M9PX"
              aria-label={t("orderNumber")}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              className="w-full min-w-0 rounded-full border border-line bg-surface py-3.5 font-mono text-sm tracking-wide text-ink outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-soft/60 focus:border-rose-deep ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4"
            />
          </div>
          <button
            type="submit"
            disabled={!orderNumber.trim()}
            className="shrink-0 rounded-full bg-ink px-8 py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
          >
            {t("submit")}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-soft ltr:pl-4 rtl:pr-4">{t("hint")}</p>
      </form>

      {loading && (
        <div className="mt-10 animate-pulse rounded-2xl border border-line bg-surface p-6">
          <div className="h-5 w-40 rounded bg-line" />
          <div className="mt-6 h-2 w-full rounded bg-line" />
          <div className="mt-6 h-14 w-full rounded bg-line" />
        </div>
      )}

      {searched && order === null && (
        <div className="mt-10 rounded-2xl border border-line bg-surface px-6 py-12 text-center">
          <PackageSearch className="mx-auto h-10 w-10 text-ink-soft/50" />
          <p className="mt-3 text-sm text-ink">{t("notFound")}</p>
        </div>
      )}

      {order && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
            <div className="min-w-0">
              <p className="font-mono text-lg font-bold tracking-wide text-ink" dir="ltr">
                {order.orderNumber}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {t("placedOn")} {dateFmt.format(order.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                order.status === "cancelled"
                  ? "bg-danger/10 text-danger"
                  : order.status === "delivered"
                    ? "bg-mint-soft text-mint"
                    : "bg-ink text-white"
              }`}
            >
              {ts(order.status)}
            </span>
          </div>

          {order.status !== "cancelled" && (
            <div className="border-b border-line p-5 sm:p-6">
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={`h-3 w-3 shrink-0 rounded-full ring-4 ${
                        i <= activeStepIndex ? "bg-rose-deep ring-rose-mist" : "bg-line ring-transparent"
                      }`}
                    />
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${i < activeStepIndex ? "bg-rose-deep" : "bg-line"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                {STATUS_STEPS.map((step, i) => (
                  <span
                    key={step}
                    className={`text-[10px] leading-tight sm:text-xs ${
                      i === activeStepIndex ? "font-bold text-ink" : "text-ink-soft"
                    } ${i === 0 ? "text-start" : i === STATUS_STEPS.length - 1 ? "text-end" : "text-center"}`}
                  >
                    {ts(step)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="divide-y divide-line">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-5 sm:px-6">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-soft">
                  <ProductImage src={item.image} alt={item.name} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-soft">
                    {item.variantName ? `${item.variantName} · ` : ""}x{item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-ink-soft">
                  {formatPrice(item.price * item.quantity, currency, locale)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-line p-5 sm:p-6">
            <div className="flex justify-between text-lg font-bold text-ink">
              <span>{t("total")}</span>
              <span>{formatPrice(order.total, currency, locale)}</span>
            </div>

            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{t("orderedBy")}</dt>
                <dd className="min-w-0 truncate text-ink">
                  {order.customer.firstName}{" "}
                  <span dir="ltr" className="text-ink-soft">
                    {order.customer.maskedPhone}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{t("deliveringTo")}</dt>
                <dd className="min-w-0 truncate text-ink">{order.shipping.city}</dd>
              </div>
            </dl>

            <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-soft">
              <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
              {t("privacyNote")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
