import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

export const validate = query({
  args: { code: v.string(), subtotal: v.number() },
  handler: async (ctx, { code, subtotal }) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .unique();
    if (!coupon || !coupon.active) return { valid: false, reason: "Invalid code" };
    if (coupon.expiresAt && coupon.expiresAt < Date.now())
      return { valid: false, reason: "This code has expired" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return { valid: false, reason: "This code has been fully redeemed" };
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
      return { valid: false, reason: `Minimum order of ${coupon.minOrderValue} required` };

    const discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
    return { valid: true, discount: Math.min(discount, subtotal), type: coupon.type, value: coupon.value };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrderValue: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const code = args.code.toUpperCase();
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (existing) throw new Error("A coupon with this code already exists");
    return await ctx.db.insert("coupons", { ...args, code, usedCount: 0 });
  },
});

export const update = mutation({
  args: {
    id: v.id("coupons"),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrderValue: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
