"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import Image from "next/image";
import { ChevronRight, Plus, Search, X } from "lucide-react";
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

type Product = Doc<"products">;
type Category = Doc<"categories">;

type Aisle = { category: Category | null; products: Product[] };
type Department = { category: Category | null; aisles: Aisle[]; count: number };

/**
 * Catalogue management for a shop with nearly two hundred lines.
 *
 * A flat, unsearchable list is fine for a demo and unusable for the
 * person who actually maintains stock: finding one shampoo meant
 * scrolling past every nappy. Products are grouped the way the
 * storefront presents them — department, then aisle — so the admin's
 * mental model matches what shoppers see, and a search box cuts across
 * the whole catalogue when someone already knows what they want.
 *
 * Filtering happens in the browser. The whole catalogue is one modest
 * query the page already holds, so a round trip per keystroke would add
 * latency and buy nothing.
 */
export default function AdminProductsPage() {
  const t = useTranslations("admin.products");
  const locale = useLocale() as "ar" | "en";
  const products = useQuery(api.products.listAll);
  const categories = useQuery(api.categories.list);
  const symbol = useCurrencySymbol();

  const [term, setTerm] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((c) => [c._id as string, c])),
    [categories]
  );

  /** Departments are the top-level categories; aisles hang off them. */
  const departmentOptions = useMemo(
    () => (categories ?? []).filter((c) => !c.parentId),
    [categories]
  );

  const totalStock = (p: Product) =>
    p.variants.length > 0 ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;

  const resolve = useMemo(
    () => (product: Product) => {
      const aisle = categoryById.get(product.categoryId as string) ?? null;
      const dept = aisle?.parentId
        ? (categoryById.get(aisle.parentId as string) ?? aisle)
        : aisle;
      return { aisle, dept };
    },
    [categoryById]
  );

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (status && p.status !== status) return false;
      if (department) {
        const { dept } = resolve(p);
        if (dept?._id !== department) return false;
      }
      if (!needle) return true;
      // Both languages and the SKU, because whoever is restocking may
      // be reading off a supplier invoice rather than the storefront.
      return (
        p.name.en.toLowerCase().includes(needle) ||
        p.name.ar.includes(term.trim()) ||
        p.sku.toLowerCase().includes(needle) ||
        p.slug.includes(needle)
      );
    });
  }, [products, term, department, status, resolve]);

  /** Group into department → aisle, ordered as the storefront orders them. */
  const grouped = useMemo(() => {
    const byDept = new Map<string, Map<string, Product[]>>();
    for (const product of filtered) {
      const { aisle, dept } = resolve(product);
      const deptKey = dept?._id ?? "none";
      const aisleKey = aisle?._id ?? "none";
      if (!byDept.has(deptKey)) byDept.set(deptKey, new Map());
      const aisles = byDept.get(deptKey)!;
      if (!aisles.has(aisleKey)) aisles.set(aisleKey, []);
      aisles.get(aisleKey)!.push(product);
    }

    const order = (id: string) => categoryById.get(id)?.order ?? 999;
    return [...byDept.entries()]
      .sort((a, b) => order(a[0]) - order(b[0]))
      .map<Department>(([deptKey, aisleMap]) => ({
        category: categoryById.get(deptKey) ?? null,
        count: [...aisleMap.values()].reduce((n, list) => n + list.length, 0),
        aisles: [...aisleMap.entries()]
          .sort((a, b) => order(a[0]) - order(b[0]))
          .map<Aisle>(([aisleKey, list]) => ({
            category: categoryById.get(aisleKey) ?? null,
            products: list.sort((a, b) => a.name.en.localeCompare(b.name.en)),
          })),
      }));
  }, [filtered, resolve, categoryById]);

  // A search is a request to see matches, so it overrides collapse state.
  const searching = term.trim().length > 0;
  const isOpen = (key: string) => searching || !collapsed.has(key);
  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const allCollapsed = grouped.length > 0 && grouped.every((d) => collapsed.has(d.category?._id ?? "none"));
  const toggleAll = () =>
    setCollapsed(allCollapsed ? new Set() : new Set(grouped.map((d) => d.category?._id ?? "none")));

  const hasFilters = term || department || status;

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold text-ink">{t("title")}</h1>
          {products && (
            <p className="text-sm text-ink-soft">
              {t("resultCount", { count: filtered.length, total: products.length })}
            </p>
          )}
        </div>
        <Link
          href="/admin/products/new"
          className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          {t("add")}
        </Link>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[16rem]">
          <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft ltr:left-3 rtl:right-3" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            className="w-full min-w-0 rounded-lg border border-line bg-surface py-2.5 text-sm text-ink outline-none transition-colors focus:border-rose-deep ltr:pl-9 ltr:pr-9 rtl:pr-9 rtl:pl-9"
          />
          {term && (
            <button
              onClick={() => setTerm("")}
              aria-label={t("clearFilters")}
              className="absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-cream-soft text-ink-soft hover:text-ink ltr:right-3 rtl:left-3"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="min-w-0 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink sm:max-w-[13rem]"
        >
          <option value="">{t("allDepartments")}</option>
          {departmentOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name[locale]}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-w-0 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink sm:max-w-[10rem]"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="active">active</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setTerm("");
              setDepartment("");
              setStatus("");
            }}
            className="shrink-0 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {t("clearFilters")}
          </button>
        )}

        {!searching && grouped.length > 0 && (
          <button
            onClick={toggleAll}
            className="shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-deep hover:underline"
          >
            {allCollapsed ? t("expandAll") : t("collapseAll")}
          </button>
        )}
      </div>

      {products && filtered.length === 0 && (
        <p className="rounded-xl border border-line bg-surface px-4 py-12 text-center text-sm text-ink-soft">
          {t("noResults")}
        </p>
      )}

      <div className="space-y-3">
        {grouped.map((dept) => {
          const deptKey = dept.category?._id ?? "none";
          const open = isOpen(deptKey);
          return (
            <section key={deptKey} className="overflow-hidden rounded-xl border border-line bg-surface">
              <button
                onClick={() => toggle(deptKey)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 bg-cream-soft px-4 py-3 text-start transition-colors hover:bg-line/40"
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-ink-soft transition-transform rtl:-scale-x-100 ${
                    open ? "rotate-90 rtl:-rotate-90" : ""
                  }`}
                />
                {dept.category?.icon && <span aria-hidden>{dept.category.icon}</span>}
                <span className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-ink">
                  {dept.category?.name[locale] ?? t("uncategorised")}
                </span>
                <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-soft">
                  {dept.count}
                </span>
              </button>

              {open && (
                <div className="divide-y divide-line">
                  {dept.aisles.map((aisle) => (
                    <div key={aisle.category?._id ?? "none"}>
                      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2">
                        <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
                          {aisle.category?.name[locale] ?? t("uncategorised")}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-ink-soft/70">
                          {t("itemCount", { count: aisle.products.length })}
                        </span>
                      </div>

                      <ul className="divide-y divide-line">
                        {aisle.products.map((product) => (
                          <li key={product._id}>
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-cream-soft"
                            >
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-cream-soft">
                                {product.images[0] && (
                                  <Image
                                    src={product.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">
                                  {product.name[locale]}
                                </p>
                                <p className="truncate font-mono text-[11px] text-ink-soft" dir="ltr">
                                  {product.sku}
                                </p>
                              </div>

                              {/* Price, stock and status collapse into the
                                  card body on a phone rather than forcing
                                  a sideways scroll. */}
                              <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                                <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
                                  {formatPrice(product.price, symbol, locale)}
                                </span>
                                <span className="hidden whitespace-nowrap text-xs tabular-nums text-ink-soft sm:inline">
                                  {t("stock")}: {totalStock(product)}
                                </span>
                                <span
                                  className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide sm:inline ${statusClasses(product.status)}`}
                                >
                                  {product.status}
                                </span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
