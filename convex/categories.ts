import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

const localized = v.object({ en: v.string(), ar: v.string() });

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => a.order - b.order);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: localized,
    slug: v.string(),
    description: v.optional(localized),
    image: v.optional(v.string()),
    order: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("A category with this slug already exists");
    return await ctx.db.insert("categories", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: localized,
    slug: v.string(),
    description: v.optional(localized),
    image: v.optional(v.string()),
    order: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const inUse = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .first();
    if (inUse) throw new Error("Cannot delete a category that still has products");
    await ctx.db.delete(id);
  },
});

/**
 * The full department -> subcategory tree, ordered. Powers the mega menu,
 * the department grid and department landing pages. Small enough (a few
 * dozen rows) to send whole rather than paginate.
 */
export const tree = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("categories").collect();
    const departments = all
      .filter((c) => c.parentId === undefined)
      .sort((a, b) => a.order - b.order);

    return departments.map((dept) => ({
      ...dept,
      subs: all
        .filter((c) => c.parentId === dept._id)
        .sort((a, b) => a.order - b.order),
    }));
  },
});

/** A department plus its subcategories, for the department landing page. */
export const departmentBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const dept = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!dept) return null;

    const subs = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", dept._id))
      .collect();

    return { ...dept, subs: subs.sort((a, b) => a.order - b.order) };
  },
});
