import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/authz";

/**
 * Reporting for the admin dashboard.
 *
 * Everything here is read-only aggregation over the orders table. The
 * store is a single shop with a human-scale order count, so collecting
 * and folding in memory is both simpler and faster than maintaining
 * rollup tables — and it can never drift out of sync with the orders it
 * describes. If order volume ever outgrows that, the shape of these
 * return values is what a rollup table would need to reproduce.
 *
 * Each query answers a whole screen in one round trip. Splitting these
 * into a dozen small queries would mean a dozen websocket subscriptions
 * recomputing on every order that lands.
 */

const DAY = 86_400_000;

/** Stages an order moves through, in order. Cancelled is not a stage. */
const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
type Stage = (typeof FLOW)[number];

type Order = Doc<"orders">;

const isCancelled = (o: Order) => o.status === "cancelled";
const unitsIn = (o: Order) => o.items.reduce((n, i) => n + i.quantity, 0);

/**
 * Percentage change, as a number the UI turns into an arrow.
 *
 * Returns null rather than 0 or Infinity when there is no prior period
 * to compare against — "no previous data" and "flat" are different
 * statements, and showing 0% for the former is a lie.
 */
function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : null;
  return ((current - previous) / previous) * 100;
}

/** Totals for one slice of orders. */
function summarise(orders: Order[]) {
  const live = orders.filter((o) => !isCancelled(o));
  const revenue = live.reduce((sum, o) => sum + o.total, 0);
  const units = live.reduce((sum, o) => sum + unitsIn(o), 0);
  const discount = live.reduce((sum, o) => sum + o.discount, 0);
  return {
    revenue,
    units,
    discount,
    orders: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.length - live.length,
    aov: live.length ? revenue / live.length : 0,
  };
}

/**
 * Start of the local day containing `ts`.
 *
 * The client passes its own UTC offset so buckets line up with the days
 * the shop owner actually experienced. Bucketing in UTC would put every
 * Cairo evening order into the following day.
 */
function dayStart(ts: number, offsetMinutes: number) {
  const shifted = ts - offsetMinutes * 60_000;
  return Math.floor(shifted / DAY) * DAY + offsetMinutes * 60_000;
}

export const dashboard = query({
  args: {
    /** Window length. 0 means "everything since the first order". */
    days: v.number(),
    /** `new Date().getTimezoneOffset()` from the browser. */
    tzOffsetMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { days, tzOffsetMinutes = 0 }) => {
    await requireAdmin(ctx);

    const allOrders = await ctx.db.query("orders").collect();
    const now = Date.now();

    const earliest = allOrders.reduce((min, o) => Math.min(min, o.createdAt), now);
    const spanDays = days > 0 ? days : Math.max(Math.ceil((now - earliest) / DAY), 1);
    const windowStart = days > 0 ? now - days * DAY : earliest;
    const prevStart = windowStart - spanDays * DAY;

    const current = allOrders.filter((o) => o.createdAt >= windowStart);
    const previous = allOrders.filter(
      (o) => o.createdAt >= prevStart && o.createdAt < windowStart
    );

    const now_ = summarise(current);
    const then_ = summarise(previous);

    // ---- Daily series -------------------------------------------------
    // Every day in the window gets a bucket, including the quiet ones —
    // a line that skips empty days misrepresents the shape of the trend.
    const buckets = new Map<number, { revenue: number; orders: number; units: number }>();
    const firstBucket = dayStart(windowStart, tzOffsetMinutes);
    const lastBucket = dayStart(now, tzOffsetMinutes);
    for (let d = firstBucket; d <= lastBucket; d += DAY) {
      buckets.set(d, { revenue: 0, orders: 0, units: 0 });
    }
    for (const o of current) {
      const key = dayStart(o.createdAt, tzOffsetMinutes);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (!isCancelled(o)) {
        bucket.revenue += o.total;
        bucket.units += unitsIn(o);
      }
    }
    const series = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([date, b]) => ({ date, ...b }));

    // ---- Order flow ---------------------------------------------------
    // An order only stores its *current* stage, so "reached this stage"
    // means its stage sits at or past this one. That makes the widths
    // monotonic and the drop-off between two stages meaningful.
    const liveOrders = current.filter((o) => !isCancelled(o));
    const flow = FLOW.map((stage, i) => {
      const reached = liveOrders.filter(
        (o) => FLOW.indexOf(o.status as Stage) >= i
      ).length;
      return { stage, reached, sitting: liveOrders.filter((o) => o.status === stage).length };
    });

    // ---- Product and department mix -----------------------------------
    const products = await ctx.db.query("products").collect();
    const categories = await ctx.db.query("categories").collect();
    const productById = new Map(products.map((p) => [p._id as Id<"products">, p]));
    const categoryById = new Map(categories.map((c) => [c._id, c]));

    /** Aisles hang off departments; roll a product up to its department. */
    const departmentOf = (productId: Id<"products">) => {
      const product = productById.get(productId);
      if (!product) return null;
      const category = categoryById.get(product.categoryId);
      if (!category) return null;
      return category.parentId ? (categoryById.get(category.parentId) ?? category) : category;
    };

    const productTotals = new Map<
      string,
      { productId: Id<"products">; name: string; units: number; revenue: number; image?: string }
    >();
    const deptTotals = new Map<
      string,
      { slug: string; name: { ar: string; en: string }; units: number; revenue: number }
    >();

    for (const order of liveOrders) {
      for (const item of order.items) {
        const line = item.price * item.quantity;

        const pKey = item.productId as string;
        const p = productTotals.get(pKey) ?? {
          productId: item.productId,
          name: item.name,
          image: item.image,
          units: 0,
          revenue: 0,
        };
        p.units += item.quantity;
        p.revenue += line;
        productTotals.set(pKey, p);

        const dept = departmentOf(item.productId);
        if (dept) {
          const d = deptTotals.get(dept.slug) ?? {
            slug: dept.slug,
            name: dept.name,
            units: 0,
            revenue: 0,
          };
          d.units += item.quantity;
          d.revenue += line;
          deptTotals.set(dept.slug, d);
        }
      }
    }

    const topProducts = [...productTotals.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
    const departments = [...deptTotals.values()].sort((a, b) => b.revenue - a.revenue);

    // ---- Where orders are going ---------------------------------------
    const cityTotals = new Map<string, { city: string; orders: number; revenue: number }>();
    for (const o of liveOrders) {
      const key = o.shipping.city.trim().toLowerCase();
      const c = cityTotals.get(key) ?? { city: o.shipping.city.trim(), orders: 0, revenue: 0 };
      c.orders += 1;
      c.revenue += o.total;
      cityTotals.set(key, c);
    }
    const cities = [...cityTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // ---- Things needing a human ---------------------------------------
    const active = products.filter((p) => p.status === "active");
    const outOfStock = active.filter((p) => p.stock <= 0);
    const lowStock = active
      .filter((p) => p.stock > 0 && p.stock <= 5)
      .sort((a, b) => a.stock - b.stock);

    return {
      range: { days, windowStart, spanDays },
      kpis: {
        revenue: { value: now_.revenue, delta: delta(now_.revenue, then_.revenue) },
        orders: { value: now_.orders, delta: delta(now_.orders, then_.orders) },
        aov: { value: now_.aov, delta: delta(now_.aov, then_.aov) },
        units: { value: now_.units, delta: delta(now_.units, then_.units) },
        discount: { value: now_.discount, delta: delta(now_.discount, then_.discount) },
        cancelled: { value: now_.cancelled, delta: delta(now_.cancelled, then_.cancelled) },
      },
      series,
      flow,
      cancelledInWindow: now_.cancelled,
      topProducts,
      departments,
      cities,
      attention: {
        pending: allOrders.filter((o) => o.status === "pending").length,
        processing: allOrders.filter((o) => o.status === "processing").length,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        lowStockItems: lowStock.slice(0, 6).map((p) => ({
          id: p._id,
          name: p.name,
          stock: p.stock,
        })),
      },
      recent: [...allOrders]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 8)
        .map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          customer: o.customer.name,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
          items: unitsIn(o),
        })),
    };
  },
});

export const marketing = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    await requireAdmin(ctx);

    const allOrders = await ctx.db.query("orders").collect();
    const now = Date.now();
    const earliest = allOrders.reduce((min, o) => Math.min(min, o.createdAt), now);
    const windowStart = days > 0 ? now - days * DAY : earliest;
    const orders = allOrders.filter((o) => o.createdAt >= windowStart);
    const live = orders.filter((o) => !isCancelled(o));

    // ---- Coupons -------------------------------------------------------
    // usedCount on the coupon is a lifetime counter; the money each code
    // actually moved has to come from the orders that carried it.
    const coupons = await ctx.db.query("coupons").collect();
    const byCode = new Map<string, { uses: number; revenue: number; discount: number }>();
    for (const o of live) {
      if (!o.couponCode) continue;
      const c = byCode.get(o.couponCode) ?? { uses: 0, revenue: 0, discount: 0 };
      c.uses += 1;
      c.revenue += o.total;
      c.discount += o.discount;
      byCode.set(o.couponCode, c);
    }
    const couponPerformance = coupons
      .map((c) => {
        const used = byCode.get(c.code) ?? { uses: 0, revenue: 0, discount: 0 };
        return {
          id: c._id,
          code: c.code,
          type: c.type,
          value: c.value,
          active: c.active,
          expiresAt: c.expiresAt,
          usageLimit: c.usageLimit,
          lifetimeUses: c.usedCount,
          uses: used.uses,
          revenue: used.revenue,
          discount: used.discount,
          /** What each pound of discount brought back in order value. */
          roi: used.discount > 0 ? used.revenue / used.discount : null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const withCoupon = live.filter((o) => o.couponCode);
    const withoutCoupon = live.filter((o) => !o.couponCode);
    const avg = (list: Order[]) =>
      list.length ? list.reduce((s, o) => s + o.total, 0) / list.length : 0;

    // ---- Customers -----------------------------------------------------
    // No accounts exist, so the phone number is the only stable identity.
    const byPhone = new Map<string, { orders: number; revenue: number; name: string }>();
    for (const o of allOrders.filter((x) => !isCancelled(x))) {
      const key = o.customer.phone.replace(/\D/g, "");
      const c = byPhone.get(key) ?? { orders: 0, revenue: 0, name: o.customer.name };
      c.orders += 1;
      c.revenue += o.total;
      byPhone.set(key, c);
    }
    const customers = [...byPhone.values()];
    const repeat = customers.filter((c) => c.orders > 1);

    // ---- When people buy ------------------------------------------------
    const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));
    const weekday = Array.from({ length: 7 }, (_, day) => ({ day, orders: 0 }));
    for (const o of orders) {
      const d = new Date(o.createdAt);
      hourly[d.getHours()].orders += 1;
      weekday[d.getDay()].orders += 1;
    }

    const banners = await ctx.db.query("banners").collect();

    return {
      couponPerformance,
      couponImpact: {
        ordersWithCoupon: withCoupon.length,
        ordersWithoutCoupon: withoutCoupon.length,
        aovWithCoupon: avg(withCoupon),
        aovWithoutCoupon: avg(withoutCoupon),
        totalDiscount: live.reduce((s, o) => s + o.discount, 0),
      },
      customers: {
        total: customers.length,
        repeat: repeat.length,
        repeatRate: customers.length ? (repeat.length / customers.length) * 100 : 0,
        top: customers.sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      },
      language: {
        ar: orders.filter((o) => o.locale === "ar").length,
        en: orders.filter((o) => o.locale === "en").length,
      },
      hourly,
      weekday,
      campaigns: banners.map((b) => ({
        id: b._id,
        title: b.title,
        type: b.type,
        active: b.active,
        couponCode: b.couponCode,
      })),
    };
  },
});
