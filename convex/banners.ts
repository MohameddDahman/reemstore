import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

const localized = v.object({ en: v.string(), ar: v.string() });
const bannerType = v.union(v.literal("popup"), v.literal("topbar"), v.literal("hero"));

function isLive(banner: { active: boolean; startsAt?: number; endsAt?: number }) {
  if (!banner.active) return false;
  const now = Date.now();
  if (banner.startsAt && banner.startsAt > now) return false;
  if (banner.endsAt && banner.endsAt < now) return false;
  return true;
}

export const active = query({
  args: { type: bannerType },
  handler: async (ctx, { type }) => {
    const banners = await ctx.db
      .query("banners")
      .withIndex("by_type_active", (q) => q.eq("type", type).eq("active", true))
      .collect();
    return banners.filter(isLive).sort((a, b) => a.order - b.order);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const banners = await ctx.db.query("banners").collect();
    return banners.sort((a, b) => a.order - b.order);
  },
});

const bannerFields = {
  type: bannerType,
  title: localized,
  couponCode: v.optional(v.string()),
  subtitle: v.optional(localized),
  image: v.optional(v.string()),
  ctaText: v.optional(localized),
  ctaLink: v.optional(v.string()),
  active: v.boolean(),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
  order: v.number(),
};

export const create = mutation({
  args: bannerFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("banners", args);
  },
});

export const update = mutation({
  args: { id: v.id("banners"), ...bannerFields },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("banners") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
