"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const ts = useTranslations("orderStatus");
  const locale = useLocale();
  const stats = useQuery(api.orders.stats);
  const orders = useQuery(api.orders.listAll, {});
  const settings = useQuery(api.settings.get);
  const symbol = settings?.currencySymbol ?? "";

  const recent = (orders ?? []).slice(0, 8);

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">{t("title")}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft">{t("revenue")}</p>
          <p className="mt-2 font-heading text-3xl text-ink">
            {stats ? formatPrice(stats.revenue, symbol, locale) : "…"}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft">{t("orders")}</p>
          <p className="mt-2 font-heading text-3xl text-ink">{stats?.totalOrders ?? "…"}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft">{t("pending")}</p>
          <p className="mt-2 font-heading text-3xl text-ink">{stats?.pending ?? "…"}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface">
        <div className="border-b border-line p-5">
          <h2 className="font-medium text-ink">{t("recentOrders")}</h2>
        </div>
        <div className="divide-y divide-line">
          {recent.map((order) => (
            <Link
              key={order._id}
              href="/admin/orders"
              className="flex items-center justify-between px-5 py-3 text-sm hover:bg-cream-soft"
            >
              <div>
                <p className="text-ink">{order.orderNumber}</p>
                <p className="text-ink-soft">{order.customer.name}</p>
              </div>
              <div className="text-end">
                <p className="text-ink">{formatPrice(order.total, symbol, locale)}</p>
                <p className="text-xs text-ink-soft">{ts(order.status)}</p>
              </div>
            </Link>
          ))}
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
