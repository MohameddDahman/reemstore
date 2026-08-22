import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Fabricated order history, for looking at the dashboard before the shop
 * has one.
 *
 * A brand-new store has nothing to chart, which makes a working
 * dashboard look broken. This fills in a plausible trading history so
 * the trends, the flow chart and the coupon report can be judged.
 *
 * Every order it writes is prefixed RS-DEMO- so it is obvious in the
 * orders list and can be removed again in one call. It deliberately does
 * NOT touch product stock — demo traffic should not make real inventory
 * disappear.
 *
 * Internal only: this can be run from the CLI but never from a browser.
 */

const DAY = 86_400_000;

const CITIES = [
  ["Cairo", 30], ["Giza", 18], ["Alexandria", 14], ["Mansoura", 8],
  ["Tanta", 6], ["Port Said", 5], ["Asyut", 5], ["Luxor", 4], ["Aswan", 3],
] as const;

const NAMES = [
  "Mona Hassan", "Ahmed Fathy", "Salma Abdel Rahman", "Youssef Kamal",
  "Nour El Din", "Heba Mostafa", "Karim Adel", "Dina Sobhy",
  "Omar Sherif", "Yasmin Farouk", "Tarek Mahmoud", "Rana Ibrahim",
  "Mahmoud Zaki", "Aya Gamal", "Hossam Nabil", "Sara Lotfy",
];

/** Weighted so the pipeline looks like a real one: most orders land. */
const STATUS_MIX = [
  ["delivered", 46], ["shipped", 14], ["processing", 10],
  ["confirmed", 12], ["pending", 12], ["cancelled", 6],
] as const;

/** Deterministic PRNG, so re-running produces the same history. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function weighted<T extends readonly (readonly [string, number])[]>(
  table: T,
  r: number
): T[number][0] {
  const total = table.reduce((sum, [, w]) => sum + w, 0);
  let target = r * total;
  for (const [value, weight] of table) {
    target -= weight;
    if (target <= 0) return value;
  }
  return table[table.length - 1][0];
}

export const seedDemoOrders = internalMutation({
  args: {
    count: v.optional(v.number()),
    days: v.optional(v.number()),
    seed: v.optional(v.number()),
  },
  handler: async (ctx, { count = 220, days = 120, seed = 20260822 }) => {
    const existing = await ctx.db.query("orders").collect();
    const alreadySeeded = existing.filter((o) => o.orderNumber.startsWith("RS-DEMO-")).length;
    if (alreadySeeded > 0) {
      return `Already holding ${alreadySeeded} demo orders — run clearDemoOrders first.`;
    }

    const products = (await ctx.db.query("products").collect()).filter(
      (p) => p.status === "active"
    );
    if (products.length === 0) return "No active products to build orders from.";

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const shippingFee = settings?.shippingFee ?? 40;
    const freeOver = settings?.freeShippingThreshold;

    const coupons = await ctx.db.query("coupons").collect();
    const random = rng(seed);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      // Bias orders toward the recent past so the trend line rises —
      // squaring a uniform sample clusters it near "today".
      const age = Math.pow(random(), 1.7) * days;
      const createdAt = now - age * DAY - random() * DAY;

      const lineCount = 1 + Math.floor(random() * 4);
      const items: {
        productId: (typeof products)[number]["_id"];
        name: string;
        image?: string;
        price: number;
        quantity: number;
      }[] = [];
      let subtotal = 0;

      const picked = new Set<string>();
      for (let l = 0; l < lineCount; l++) {
        const product = products[Math.floor(random() * products.length)];
        if (picked.has(product._id)) continue;
        picked.add(product._id);
        const quantity = 1 + Math.floor(random() * 2.4);
        items.push({
          productId: product._id,
          name: product.name.en,
          image: product.images[0],
          price: product.price,
          quantity,
        });
        subtotal += product.price * quantity;
      }
      if (items.length === 0) continue;

      // Roughly a quarter of shoppers arrive with a code.
      let discount = 0;
      let couponCode: string | undefined;
      const coupon = coupons.find((c) => c.active);
      if (coupon && random() < 0.26 && subtotal >= (coupon.minOrderValue ?? 0)) {
        discount =
          coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
        discount = Math.min(discount, subtotal);
        couponCode = coupon.code;
      }

      const fee = freeOver && subtotal - discount >= freeOver ? 0 : shippingFee;
      const status = weighted(STATUS_MIX, random()) as
        | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
      const name = NAMES[Math.floor(random() * NAMES.length)];

      await ctx.db.insert("orders", {
        orderNumber: `RS-DEMO-${String(i + 1).padStart(4, "0")}`,
        locale: random() < 0.68 ? "ar" : "en",
        customer: {
          name,
          // Deterministic and obviously fake, so demo rows are never
          // mistaken for a real person to phone.
          phone: `0100000${String(1000 + Math.floor(random() * 40)).slice(-4)}`,
        },
        shipping: {
          city: weighted(CITIES, random()),
          address: "Demo address — sample data",
        },
        items,
        subtotal,
        discount,
        shippingFee: fee,
        total: subtotal - discount + fee,
        couponCode,
        paymentMethod: "cod",
        status,
        createdAt,
        updatedAt: createdAt,
      });
    }

    return `Seeded ${count} demo orders across ${days} days.`;
  },
});

export const clearDemoOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const demo = (await ctx.db.query("orders").collect()).filter((o) =>
      o.orderNumber.startsWith("RS-DEMO-")
    );
    for (const order of demo) await ctx.db.delete(order._id);
    return `Removed ${demo.length} demo orders. Real orders untouched.`;
  },
});
