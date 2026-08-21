"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

export function TrackOrderClient() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("track");
  const ts = useTranslations("orderStatus");
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState<{ orderNumber: string; phone: string } | null>(null);

  const order = useQuery(api.orders.trackOrder, searched ?? "skip");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) return;
    setSearched({ orderNumber, phone });
  };

  const activeStepIndex = order ? STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]) : -1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <h1 className="font-heading text-3xl text-ink">{t("title")}</h1>
      <p className="mt-2 text-ink-soft">{t("subtitle")}</p>

      <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder={t("orderNumber")}
          dir="ltr"
          className="rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone")}
          dir="ltr"
          className="rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-rose-deep"
        />
        <button
          type="submit"
          className="sm:col-span-2 rounded-full bg-ink py-3.5 text-sm uppercase tracking-widest text-cream"
        >
          {t("submit")}
        </button>
      </form>

      {searched && order === null && (
        <p className="mt-8 text-center text-sm text-danger">{t("notFound")}</p>
      )}

      {order && (
        <div className="mt-10 rounded-2xl border border-line bg-cream-soft p-6">
          <div className="flex items-center justify-between">
            <p className="font-heading text-xl text-ink">{order.orderNumber}</p>
            <span className="rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-widest text-cream">
              {ts(order.status)}
            </span>
          </div>

          {order.status !== "cancelled" && (
            <div className="mt-6 flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      i <= activeStepIndex ? "bg-rose-deep" : "bg-line"
                    }`}
                  />
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 ${i < activeStepIndex ? "bg-rose-deep" : "bg-line"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-3 border-t border-line pt-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink">
                  {item.name} {item.variantName ? `· ${item.variantName}` : ""} x{item.quantity}
                </span>
                <span className="text-ink-soft">{formatPrice(item.price * item.quantity, "", locale)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold text-ink">
            <span>{locale === "ar" ? "الإجمالي" : "Total"}</span>
            <span>{formatPrice(order.total, "", locale)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
