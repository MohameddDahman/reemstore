"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { useCurrencySymbol } from "@/lib/use-currency";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

function statusClasses(status: Doc<"products">["status"]) {
  if (status === "active") return "bg-success/15 text-success";
  if (status === "draft") return "bg-line text-ink-soft";
  return "bg-danger/15 text-danger";
}

export default function AdminProductsPage() {
  const t = useTranslations("admin.products");
  const locale = useLocale() as "ar" | "en";
  const products = useQuery(api.products.listAll);
  const categories = useQuery(api.categories.list);
  const symbol = useCurrencySymbol();

  // The table used to render a hardcoded "—" here; resolve the real name.
  const categoryName = useMemo(() => {
    const map = new Map((categories ?? []).map((c) => [c._id, c.name[locale]]));
    return (id: Doc<"products">["categoryId"]) => map.get(id) ?? "—";
  }, [categories, locale]);

  const totalStock = (p: Doc<"products">) =>
    p.variants.length > 0 ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;

  const rows = products ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl text-ink">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-cream"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </Link>
      </div>

      {/* Mobile: cards. A five-column table on a phone forces sideways
          scrolling just to see stock and status, so stack instead. */}
      <div className="space-y-3 md:hidden">
        {rows.map((product) => (
          <Link
            key={product._id}
            href={`/admin/products/${product._id}`}
            className="flex gap-3 rounded-xl border border-line bg-surface p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-cream-soft">
              {product.images[0] && (
                <Image src={product.images[0]} alt="" fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{product.name[locale]}</p>
              <p className="mt-0.5 truncate text-xs text-ink-soft">
                {categoryName(product.categoryId)}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-semibold text-ink">
                  {formatPrice(product.price, symbol, locale)}
                </span>
                <span className="text-ink-soft">
                  {t("stock")}: {totalStock(product)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusClasses(product.status)}`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {products && rows.length === 0 && (
          <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            —
          </p>
        )}
      </div>

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-start text-xs uppercase tracking-widest text-ink-soft">
              <th className="px-4 py-3 text-start">{t("name")}</th>
              <th className="px-4 py-3 text-start">{t("category")}</th>
              <th className="px-4 py-3 text-start">{t("price")}</th>
              <th className="px-4 py-3 text-start">{t("stock")}</th>
              <th className="px-4 py-3 text-start">{t("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((product) => (
              <tr key={product._id} className="hover:bg-cream-soft">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product._id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-cream-soft">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <span className="text-ink">{product.name[locale]}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{categoryName(product.categoryId)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink">
                  {formatPrice(product.price, symbol, locale)}
                </td>
                <td className="px-4 py-3 text-ink-soft">{totalStock(product)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-widest ${statusClasses(product.status)}`}
                  >
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products && rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">—</p>
        )}
      </div>
    </div>
  );
}
