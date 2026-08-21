"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

export default function AdminProductsPage() {
  const t = useTranslations("admin.products");
  const products = useQuery(api.products.listAll);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-ink">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-cream"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
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
            {(products ?? []).map((product) => (
              <tr key={product._id} className="hover:bg-cream-soft">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product._id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-cream-soft">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <span className="text-ink">{product.name.en}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">—</td>
                <td className="px-4 py-3 text-ink">{product.price}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {product.variants.length > 0
                    ? product.variants.reduce((s, v) => s + v.stock, 0)
                    : product.stock}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-widest ${
                      product.status === "active"
                        ? "bg-success/15 text-success"
                        : product.status === "draft"
                          ? "bg-line text-ink-soft"
                          : "bg-danger/15 text-danger"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products && products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">—</p>
        )}
      </div>
    </div>
  );
}
