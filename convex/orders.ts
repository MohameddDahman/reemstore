import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `RS-${datePart}-${randomPart}`;
}

const cartItemInput = v.object({
  productId: v.id("products"),
  variantSku: v.optional(v.string()),
  quantity: v.number(),
});

// ---------- Public: place + track orders (no accounts needed) ----------

export const placeOrder = mutation({
  args: {
    locale: v.union(v.literal("ar"), v.literal("en")),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.optional(v.string()),
    }),
    shipping: v.object({
      city: v.string(),
      area: v.optional(v.string()),
      address: v.string(),
      notes: v.optional(v.string()),
    }),
    items: v.array(cartItemInput),
    couponCode: v.optional(v.string()),
  },
  handler: async (ctx, { locale, customer, shipping, items, couponCode }) => {
    if (items.length === 0) throw new Error("Cart is empty");

    const settings = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "global")).unique();
    const shippingFee = settings?.shippingFee ?? 0;
    const freeShippingThreshold = settings?.freeShippingThreshold;

    let subtotal = 0;
    const resolvedItems: {
      productId: (typeof items)[number]["productId"];
      name: string;
      image?: string;
      variantName?: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product || product.status !== "active") {
        throw new Error("One of the items in your cart is no longer available");
      }

      let price = product.price;
      let availableStock = product.stock;
      let variantLabel: string | undefined;

      if (item.variantSku) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (!variant) throw new Error(`Variant not found: ${item.variantSku}`);
        price = variant.priceOverride ?? product.price;
        availableStock = variant.stock;
        variantLabel = variant.name[locale];
      }

      if (availableStock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name.en}`);
      }

      subtotal += price * item.quantity;
      resolvedItems.push({
        productId: product._id,
        name: locale === "ar" ? product.name.ar : product.name.en,
        image: product.images[0],
        variantName: variantLabel,
        price,
        quantity: item.quantity,
      });

      // decrement stock
      if (item.variantSku) {
        const variants = product.variants.map((v) =>
          v.sku === item.variantSku ? { ...v, stock: v.stock - item.quantity } : v
        );
        await ctx.db.patch(product._id, { variants });
      } else {
        await ctx.db.patch(product._id, { stock: product.stock - item.quantity });
      }
    }

    let discount = 0;
    let appliedCode: string | undefined;
    if (couponCode) {
      const coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", couponCode.toUpperCase()))
        .unique();
      if (coupon && coupon.active) {
        const notExpired = !coupon.expiresAt || coupon.expiresAt > Date.now();
        const underLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        const meetsMin = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
        if (notExpired && underLimit && meetsMin) {
          discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
          discount = Math.min(discount, subtotal);
          appliedCode = coupon.code;
          await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
        }
      }
    }

    const effectiveShippingFee =
      freeShippingThreshold && subtotal - discount >= freeShippingThreshold ? 0 : shippingFee;
    const total = subtotal - discount + effectiveShippingFee;

    const orderNumber = generateOrderNumber();
    const now = Date.now();
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      locale,
      customer,
      shipping,
      items: resolvedItems,
      subtotal,
      discount,
      shippingFee: effectiveShippingFee,
      total,
      couponCode: appliedCode,
      paymentMethod: "cod",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { orderId, orderNumber, total };
  },
});

export const trackOrder = query({
  args: { orderNumber: v.string(), phone: v.string() },
  handler: async (ctx, { orderNumber, phone }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber.toUpperCase()))
      .unique();
    if (!order || order.customer.phone !== phone) return null;
    return order;
  },
});

// ---------- Admin ----------

export const listAll = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").collect();
    return status ? orders.filter((o) => o.status === status) : orders;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").collect();
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    return {
      totalOrders: orders.length,
      revenue,
      pending,
    };
  },
});
