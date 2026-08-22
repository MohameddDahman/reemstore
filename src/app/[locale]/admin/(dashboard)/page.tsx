"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Banknote,
  Clock,
  PackageX,
  Receipt,
  ShoppingBag,
  Boxes,
  TicketPercent,
} from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { BarList, Panel, StatCard, TrendPill } from "@/components/admin/charts";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderFlow } from "@/components/admin/order-flow";

const RANGES = [
  { days: 7, key: "range7" },
  { days: 30, key: "range30" },
  { days: 90, key: "range90" },
  { days: 0, key: "rangeAll" },
] as const;

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const ts = useTranslations("orderStatus");
  const locale = useLocale() as "ar" | "en";
  const [days, setDays] = useState<number>(30);

  const settings = useQuery(api.settings.get);
  const symbol = settings?.currencySymbol ?? "";
  const data = useQuery(api.analytics.dashboard, {
    days,
    // Bucket the series by the viewer's own days, not UTC — an order
    // placed at 11pm in Cairo belongs to that evening, not to tomorrow.
    tzOffsetMinutes: new Date().getTimezoneOffset(),
  });

  // Aggregates run to six figures, where piastres are noise — a total
  // reading "L.E 199,988.5" costs a glance and tells nobody anything.
  const money = (n: number) => formatPrice(Math.round(n), symbol, locale);
  /** Axis labels need to stay narrow; 12,400 reads better as 12.4k. */
  const compactMoney = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n));

  const dayFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
  });

  const attention = data?.attention;
  const alerts = [
    { key: "pending", value: attention?.pending ?? 0, label: t("pendingOrders"), icon: Clock, href: "/admin/orders" },
    { key: "processing", value: attention?.processing ?? 0, label: t("processingOrders"), icon: Boxes, href: "/admin/orders" },
    { key: "outOfStock", value: attention?.outOfStock ?? 0, label: t("outOfStock"), icon: PackageX, href: "/admin/products" },
    { key: "lowStock", value: attention?.lowStock ?? 0, label: t("lowStock"), icon: AlertTriangle, href: "/admin/products" },
  ].filter((a) => a.value > 0);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        {/* Range switcher — scrolls rather than wraps on a narrow phone. */}
        <div className="x-scroll -mx-1 flex max-w-full gap-1 rounded-full bg-cream-soft p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDays(r.days)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === r.days ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t(r.key)}
            </button>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {alerts.map((a) => (
            <Link
              key={a.key}
              href={a.href}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-ink"
            >
              <a.icon className="h-4 w-4 shrink-0 text-rose-deep" />
              <span className="font-heading text-lg font-bold tabular-nums text-ink">{a.value}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">{a.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("revenue")}
          value={data ? money(data.kpis.revenue.value) : "…"}
          delta={data?.kpis.revenue.delta ?? null}
          spark={data?.series.map((p) => p.revenue)}
          tone="rose"
          icon={<Banknote className="h-4 w-4" />}
          hint={t("comparedTo")}
        />
        <StatCard
          label={t("orders")}
          value={data ? String(data.kpis.orders.value) : "…"}
          delta={data?.kpis.orders.delta ?? null}
          spark={data?.series.map((p) => p.orders)}
          tone="ink"
          icon={<ShoppingBag className="h-4 w-4" />}
          hint={t("comparedTo")}
        />
        <StatCard
          label={t("aov")}
          value={data ? money(data.kpis.aov.value) : "…"}
          delta={data?.kpis.aov.delta ?? null}
          tone="mint"
          icon={<Receipt className="h-4 w-4" />}
          hint={t("comparedTo")}
        />
        <StatCard
          label={t("units")}
          value={data ? String(data.kpis.units.value) : "…"}
          delta={data?.kpis.units.delta ?? null}
          spark={data?.series.map((p) => p.units)}
          tone="mint"
          icon={<Boxes className="h-4 w-4" />}
          hint={t("comparedTo")}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title={t("revenueTitle")} subtitle={t("revenueSub")}>
            {data ? (
              <RevenueChart
                series={data.series}
                formatMoney={compactMoney}
                formatDay={(ts_) => dayFmt.format(ts_)}
                labels={{
                  revenue: t("revenueTitle"),
                  orders: t("ordersShort"),
                  empty: t("noData"),
                }}
              />
            ) : (
              <div className="h-[260px] animate-pulse bg-cream-soft/60" />
            )}
          </Panel>
        </div>

        <Panel
          title={t("discount")}
          subtitle={t("comparedTo")}
          bodyClassName="p-4 sm:p-5"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tabular-nums text-ink">
              {data ? money(data.kpis.discount.value) : "…"}
            </span>
            <TrendPill delta={data?.kpis.discount.delta ?? null} invert />
          </div>
          <div className="mt-4 flex items-baseline gap-2 border-t border-line pt-4">
            <TicketPercent className="h-4 w-4 shrink-0 self-center text-ink-soft" />
            <span className="font-heading text-2xl font-bold tabular-nums text-ink">
              {data ? data.kpis.cancelled.value : "…"}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">{t("cancelled")}</span>
            <TrendPill delta={data?.kpis.cancelled.delta ?? null} invert />
          </div>
        </Panel>
      </div>

      <div className="mt-3">
        <Panel title={t("flowTitle")} subtitle={t("flowSub")}>
          {data ? (
            <OrderFlow
              steps={data.flow}
              cancelled={data.cancelledInWindow}
              stageLabel={(s) => ts(s)}
              labels={{
                hereNow: t("hereNow"),
                ofPrevious: t("ofPrevious"),
                cancelled: t("cancelledOrders"),
                empty: t("noData"),
              }}
            />
          ) : (
            <div className="h-40 animate-pulse bg-cream-soft/60" />
          )}
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title={t("topProducts")} subtitle={t("topProductsSub")}>
          <BarList
            emptyLabel={t("noData")}
            rows={(data?.topProducts ?? []).map((p) => ({
              key: p.productId,
              label: p.name,
              sub: `${p.units} ${t("unitsShort")}`,
              value: money(p.revenue),
              amount: p.revenue,
            }))}
          />
        </Panel>

        <Panel title={t("departments")} subtitle={t("departmentsSub")}>
          <BarList
            tone="mint"
            emptyLabel={t("noData")}
            rows={(data?.departments ?? []).slice(0, 8).map((d) => ({
              key: d.slug,
              label: d.name[locale],
              sub: `${d.units} ${t("unitsShort")}`,
              value: money(d.revenue),
              amount: d.revenue,
            }))}
          />
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title={t("cities")} subtitle={t("citiesSub")}>
          <BarList
            tone="ink"
            emptyLabel={t("noData")}
            rows={(data?.cities ?? []).map((c) => ({
              key: c.city,
              label: c.city,
              sub: `${c.orders} ${t("ordersShort")}`,
              value: money(c.revenue),
              amount: c.revenue,
            }))}
          />
        </Panel>

        <Panel
          title={t("recentOrders")}
          subtitle={t("recentOrdersSub")}
          action={
            <Link href="/admin/orders" className="shrink-0 text-xs font-semibold text-rose-deep hover:underline">
              {t("viewAll")}
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {(data?.recent ?? []).map((o) => (
              <li key={o.id}>
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-cream-soft sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-ink" dir="ltr">
                      {o.orderNumber}
                    </p>
                    <p className="truncate text-xs text-ink-soft">{o.customer}</p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="text-sm font-semibold tabular-nums text-ink">{money(o.total)}</p>
                    <p className="text-[11px] text-ink-soft">{ts(o.status)}</p>
                  </div>
                </Link>
              </li>
            ))}
            {data && data.recent.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-soft">{t("noData")}</li>
            )}
          </ul>
        </Panel>
      </div>

      {attention && attention.lowStockItems.length > 0 && (
        <div className="mt-3">
          <Panel title={t("lowStock")} subtitle={t("attentionSub")}>
            <ul className="divide-y divide-line">
              {attention.lowStockItems.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
                  <span className="min-w-0 truncate text-sm text-ink">{p.name[locale]}</span>
                  <span className="shrink-0 rounded-full bg-rose-mist px-2.5 py-0.5 text-xs font-bold tabular-nums text-rose-deep">
                    {p.stock} {t("left")}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </div>
  );
}
