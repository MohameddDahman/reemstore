"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { Megaphone, Repeat, TicketPercent, Users } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { BarList, MiniBars, Panel, SplitBar, StatCard } from "@/components/admin/charts";

const RANGES = [
  { days: 7, key: "range7" },
  { days: 30, key: "range30" },
  { days: 90, key: "range90" },
  { days: 0, key: "rangeAll" },
] as const;

export default function AdminMarketingPage() {
  const t = useTranslations("admin.marketing");
  const td = useTranslations("admin.dashboard");
  const locale = useLocale() as "ar" | "en";
  const [days, setDays] = useState<number>(30);

  const settings = useQuery(api.settings.get);
  const symbol = settings?.currencySymbol ?? "";
  const data = useQuery(api.analytics.marketing, { days });
  // Aggregates run to six figures, where piastres are noise — a total
  // reading "L.E 199,988.5" costs a glance and tells nobody anything.
  const money = (n: number) => formatPrice(Math.round(n), symbol, locale);

  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { weekday: "short" })
      // 2024-01-07 was a Sunday, matching Date#getDay()'s 0 = Sunday.
      .format(new Date(Date.UTC(2024, 0, 7 + i)))
  );

  const busiestHour = data?.hourly.reduce((best, h) => (h.orders > best.orders ? h : best), {
    hour: 0,
    orders: 0,
  });
  const busiestDay = data?.weekday.reduce((best, d) => (d.orders > best.orders ? d : best), {
    day: 0,
    orders: 0,
  });

  const impact = data?.couponImpact;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        <div className="x-scroll -mx-1 flex max-w-full gap-1 rounded-full bg-cream-soft p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDays(r.days)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === r.days ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {td(r.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("totalCustomers")}
          value={data ? String(data.customers.total) : "…"}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label={t("repeatRate")}
          value={data ? `${data.customers.repeatRate.toFixed(0)}%` : "…"}
          hint={data ? `${data.customers.repeat} ${t("repeatCustomers")}` : undefined}
          icon={<Repeat className="h-4 w-4" />}
        />
        <StatCard
          label={t("withCoupon")}
          value={data ? String(impact?.ordersWithCoupon ?? 0) : "…"}
          hint={data ? `${impact?.ordersWithoutCoupon ?? 0} ${t("withoutCoupon")}` : undefined}
          icon={<TicketPercent className="h-4 w-4" />}
        />
        <StatCard
          label={t("totalDiscount")}
          value={data ? money(impact?.totalDiscount ?? 0) : "…"}
          icon={<Megaphone className="h-4 w-4" />}
        />
      </div>

      <div className="mt-3">
        <Panel
          title={t("couponTitle")}
          subtitle={t("couponSub")}
          action={
            <Link href="/admin/coupons" className="shrink-0 text-xs font-semibold text-rose-deep hover:underline">
              {td("viewAll")}
            </Link>
          }
        >
          {/* A real table on desktop; stacked cards where columns would
              not fit, rather than a table that scrolls sideways. */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-start text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-5 py-2.5 text-start font-semibold">{t("code")}</th>
                  <th className="px-3 py-2.5 text-end font-semibold">{t("uses")}</th>
                  <th className="px-3 py-2.5 text-end font-semibold">{t("couponRevenue")}</th>
                  <th className="px-3 py-2.5 text-end font-semibold">{t("couponDiscount")}</th>
                  <th className="px-5 py-2.5 text-end font-semibold" title={t("roiHint")}>
                    {t("roi")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(data?.couponPerformance ?? []).map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-2.5">
                      <span className="font-mono text-xs font-bold text-ink" dir="ltr">{c.code}</span>
                      <span
                        className={`ms-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          c.active ? "bg-mint-soft text-mint" : "bg-cream-soft text-ink-soft"
                        }`}
                      >
                        {c.active ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-end tabular-nums text-ink">{c.uses}</td>
                    <td className="px-3 py-2.5 text-end tabular-nums text-ink">{money(c.revenue)}</td>
                    <td className="px-3 py-2.5 text-end tabular-nums text-ink-soft">
                      −{money(c.discount)}
                    </td>
                    <td className="px-5 py-2.5 text-end">
                      {c.roi !== null ? (
                        <span className="font-semibold tabular-nums text-mint">
                          {c.roi.toFixed(1)}×
                        </span>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.couponPerformance.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-ink-soft">{t("noData")}</p>
            )}
          </div>

          <ul className="divide-y divide-line md:hidden">
            {(data?.couponPerformance ?? []).map((c) => (
              <li key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-ink" dir="ltr">{c.code}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      c.active ? "bg-mint-soft text-mint" : "bg-cream-soft text-ink-soft"
                    }`}
                  >
                    {c.active ? t("active") : t("inactive")}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-ink-soft">{t("uses")}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{c.uses}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-ink-soft">{t("couponRevenue")}</dt>
                    <dd className="truncate font-semibold tabular-nums text-ink">{money(c.revenue)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">{t("roi")}</dt>
                    <dd className="font-semibold tabular-nums text-mint">
                      {c.roi !== null ? `${c.roi.toFixed(1)}×` : "—"}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
            {data && data.couponPerformance.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-soft">{t("noData")}</li>
            )}
          </ul>
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title={t("impactTitle")} subtitle={t("impactSub")} bodyClassName="p-4 sm:p-5">
          <SplitBar
            emptyLabel={t("noData")}
            parts={[
              {
                label: t("withCoupon"),
                value: impact?.ordersWithCoupon ?? 0,
                color: "var(--color-rose)",
              },
              {
                label: t("withoutCoupon"),
                value: impact?.ordersWithoutCoupon ?? 0,
                color: "var(--color-ink)",
              },
            ]}
          />
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div className="min-w-0">
              <dt className="truncate text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {t("aovWith")}
              </dt>
              <dd className="mt-0.5 truncate font-heading text-lg font-bold tabular-nums text-ink">
                {data ? money(impact?.aovWithCoupon ?? 0) : "…"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="truncate text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                {t("aovWithout")}
              </dt>
              <dd className="mt-0.5 truncate font-heading text-lg font-bold tabular-nums text-ink">
                {data ? money(impact?.aovWithoutCoupon ?? 0) : "…"}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title={t("languageTitle")} subtitle={t("languageSub")} bodyClassName="p-4 sm:p-5">
          <SplitBar
            emptyLabel={t("noData")}
            parts={[
              { label: t("arabic"), value: data?.language.ar ?? 0, color: "var(--color-rose-deep)" },
              { label: t("english"), value: data?.language.en ?? 0, color: "var(--color-mint)" },
            ]}
          />
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel
          title={t("hoursTitle")}
          subtitle={t("hoursSub")}
          bodyClassName="p-4 sm:p-5"
        >
          {data ? (
            <MiniBars
              data={data.hourly.map((h) => ({
                label: `${h.hour}:00`,
                value: h.orders,
                emphasise: h.hour === busiestHour?.hour && h.orders > 0,
              }))}
              highlightLabel={
                busiestHour && busiestHour.orders > 0
                  ? `${t("peak")} ${busiestHour.hour}:00`
                  : undefined
              }
            />
          ) : (
            <div className="h-28 animate-pulse rounded bg-cream-soft" />
          )}
        </Panel>

        <Panel title={t("weekdayTitle")} subtitle={t("weekdaySub")} bodyClassName="p-4 sm:p-5">
          {data ? (
            <MiniBars
              data={data.weekday.map((d) => ({
                label: weekdayNames[d.day],
                value: d.orders,
                emphasise: d.day === busiestDay?.day && d.orders > 0,
              }))}
              highlightLabel={
                busiestDay && busiestDay.orders > 0
                  ? `${t("peak")} ${weekdayNames[busiestDay.day]}`
                  : undefined
              }
            />
          ) : (
            <div className="h-28 animate-pulse rounded bg-cream-soft" />
          )}
        </Panel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title={t("topCustomers")} subtitle={t("customersSub")}>
          <BarList
            tone="mint"
            emptyLabel={t("noData")}
            rows={(data?.customers.top ?? []).map((c, i) => ({
              key: `${c.name}-${i}`,
              label: c.name,
              sub: `${c.orders} ${t("orderCount")}`,
              value: money(c.revenue),
              amount: c.revenue,
            }))}
          />
        </Panel>

        <Panel
          title={t("campaignsTitle")}
          subtitle={t("campaignsSub")}
          action={
            <Link href="/admin/banners" className="shrink-0 text-xs font-semibold text-rose-deep hover:underline">
              {td("viewAll")}
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {(data?.campaigns ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{c.title[locale]}</p>
                  <p className="truncate text-[11px] text-ink-soft">
                    {c.type}
                    {c.couponCode ? ` · ${c.couponCode}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    c.active ? "bg-mint-soft text-mint" : "bg-cream-soft text-ink-soft"
                  }`}
                >
                  {c.active ? t("active") : t("inactive")}
                </span>
              </li>
            ))}
            {data && data.campaigns.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-soft">{t("noCampaigns")}</li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
