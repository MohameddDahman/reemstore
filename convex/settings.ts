import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

const localized = v.object({ en: v.string(), ar: v.string() });

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "global")).unique();
  },
});

export const upsert = mutation({
  args: {
    storeName: localized,
    currency: v.string(),
    currencySymbol: v.string(),
    shippingFee: v.number(),
    freeShippingThreshold: v.optional(v.number()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", { key: "global", ...args });
    }
  },
});
