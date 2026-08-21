"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  const t = useTranslations("admin.orders");
  const ts = useTranslations("orderStatus");
  const locale = useLocale();
  const [filter, setFilter] = useState<string>("");
  const orders = useQuery(api.orders.listAll, filter ? { status: filter } : {});
  const settings = useQuery(api.settings.get);
  const updateStatus = useMutation(api.orders.updateStatus);
  const symbol = settings?.currencySymbol ?? "";

  const handleStatusChange = async (id: Id<"orders">, status: string) => {
    try {
      await updateStatus({ id, status: status as (typeof STATUSES)[number] });
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-ink">{t("title")}</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ts(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-start text-xs uppercase tracking-widest text-ink-soft">
              <th className="px-4 py-3 text-start">{t("orderNumber")}</th>
              <th className="px-4 py-3 text-start">{t("customer")}</th>
              <th className="px-4 py-3 text-start">{t("total")}</th>
              <th className="px-4 py-3 text-start">{t("date")}</th>
              <th className="px-4 py-3 text-start">{t("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(orders ?? []).map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-3 text-ink" dir="ltr">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink">{order.customer.name}</p>
                  <p className="text-xs text-ink-soft" dir="ltr">
                    {order.customer.phone}
                  </p>
                </td>
                <td className="px-4 py-3 text-ink">{formatPrice(order.total, symbol, locale)}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US")}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="rounded-full border border-line bg-cream px-3 py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ts(s)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders && orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">—</p>
        )}
      </div>
    </div>
  );
}
