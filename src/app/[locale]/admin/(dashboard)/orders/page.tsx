"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

/** Server-side guard phrase for emptying the table. Must match exactly. */
const ERASE_PHRASE = "DELETE ALL ORDERS";

type Pending =
  | { kind: "one"; id: Id<"orders">; orderNumber: string }
  | { kind: "demo" }
  | { kind: "all" }
  | null;

export default function AdminOrdersPage() {
  const t = useTranslations("admin.orders");
  const ts = useTranslations("orderStatus");
  const locale = useLocale();
  const [filter, setFilter] = useState<string>("");
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const orders = useQuery(api.orders.listAll, filter ? { status: filter } : {});
  const settings = useQuery(api.settings.get);
  const updateStatus = useMutation(api.orders.updateStatus);
  const removeOrder = useMutation(api.orders.remove);
  const removeDemo = useMutation(api.orders.removeDemo);
  const removeAll = useMutation(api.orders.removeAll);
  const symbol = settings?.currencySymbol ?? "";

  const demoCount = (orders ?? []).filter((o) => o.orderNumber.startsWith("RS-DEMO-")).length;

  const handleStatusChange = async (id: Id<"orders">, status: string) => {
    try {
      await updateStatus({ id, status: status as (typeof STATUSES)[number] });
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const runPending = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "one") {
        await removeOrder({ id: pending.id });
        toast.success(t("deleted"));
      } else {
        // Both bulk mutations delete in batches so one call can never
        // exceed a transaction; keep calling until nothing is left.
        let total = 0;
        for (;;) {
          const result =
            pending.kind === "demo"
              ? await removeDemo({})
              : await removeAll({ confirm: ERASE_PHRASE });
          total += result.deleted;
          const more =
            typeof result.remaining === "number" ? result.remaining > 0 : result.remaining;
          if (!more || result.deleted === 0) break;
        }
        toast.success(total > 0 ? t("deletedCount", { count: total }) : t("noneToDelete"));
      }
      setPending(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const dialogCopy = () => {
    if (pending?.kind === "one")
      return {
        title: t("deleteOrder"),
        body: t("deleteOrderBody", { orderNumber: pending.orderNumber }),
        phrase: undefined,
      };
    if (pending?.kind === "demo")
      return { title: t("deleteDemoConfirm"), body: t("deleteDemoBody"), phrase: undefined };
    return {
      title: t("deleteAllConfirm", { count: orders?.length ?? 0 }),
      body: t("deleteAllBody"),
      phrase: ERASE_PHRASE,
    };
  };
  const copy = dialogCopy();

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-ink">{t("title")}</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="min-w-0 max-w-[10rem] rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:max-w-none"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ts(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile: cards. Status stays an inline select so orders can be
          progressed without a desktop. */}
      <div className="space-y-3 md:hidden">
        {(orders ?? []).map((order) => (
          <div key={order._id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink" dir="ltr">
                  {order.orderNumber}
                </p>
                <p className="truncate text-sm text-ink-soft">{order.customer.name}</p>
                <p className="truncate text-xs text-ink-soft" dir="ltr">
                  {order.customer.phone}
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="whitespace-nowrap font-semibold text-ink">
                  {formatPrice(order.total, symbol, locale)}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-xs text-ink-soft">
                  {new Date(order.createdAt).toLocaleDateString(
                    locale === "ar" ? "ar-EG-u-nu-latn" : "en-US"
                  )}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ts(s)}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setPending({ kind: "one", id: order._id, orderNumber: order.orderNumber })
                }
                aria-label={`${t("delete")} ${order.orderNumber}`}
                className="shrink-0 rounded-lg border border-line p-2.5 text-ink-soft transition-colors hover:border-rose-deep hover:text-rose-deep"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {orders && orders.length === 0 && (
          <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            —
          </p>
        )}
      </div>

      <div className="hidden x-scroll rounded-xl border border-line bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-start text-xs uppercase tracking-widest text-ink-soft">
              <th className="px-4 py-3 text-start">{t("orderNumber")}</th>
              <th className="px-4 py-3 text-start">{t("customer")}</th>
              <th className="px-4 py-3 text-start">{t("total")}</th>
              <th className="px-4 py-3 text-start">{t("date")}</th>
              <th className="px-4 py-3 text-start">{t("status")}</th>
              <th className="px-4 py-3 text-end sr-only">{t("delete")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(orders ?? []).map((order) => (
              <tr key={order._id} className="group">
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
                <td className="px-4 py-3 text-end">
                  <button
                    onClick={() =>
                      setPending({ kind: "one", id: order._id, orderNumber: order.orderNumber })
                    }
                    aria-label={`${t("delete")} ${order.orderNumber}`}
                    // Visible on hover and whenever focused, so it stays
                    // reachable by keyboard.
                    className="rounded-lg p-2 text-ink-soft opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-rose-mist hover:text-rose-deep"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders && orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">—</p>
        )}
      </div>

      {orders && orders.length > 0 && (
        <section className="mt-8 rounded-xl border border-dashed border-rose/40 bg-rose-mist/30 p-4 sm:p-5">
          <h2 className="font-heading text-sm font-bold text-rose-deep">{t("dangerZone")}</h2>
          <p className="text-xs text-ink-soft">{t("dangerZoneSub")}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {demoCount > 0 && (
              <button
                onClick={() => setPending({ kind: "demo" })}
                className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
              >
                {t("deleteDemo")} ({demoCount})
              </button>
            )}
            <button
              onClick={() => setPending({ kind: "all" })}
              className="rounded-full bg-rose-deep px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {t("deleteAll")}
            </button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={copy.title}
        body={copy.body}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        requirePhrase={copy.phrase}
        phraseHint={t("typeToConfirm")}
        busy={busy}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
