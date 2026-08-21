import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/authz";

export const listApprovedForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    return reviews.filter((r) => r.status === "approved").sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Newest approved reviews across every product, with the product name
 * attached — powers the homepage testimonials section. */
export const listRecentApprovedAcrossStore = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit ?? 6);

    return await Promise.all(
      reviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        return { ...review, productName: product?.name ?? null, productSlug: product?.slug ?? null };
      })
    );
  },
});

export const submit = mutation({
  args: {
    productId: v.id("products"),
    authorName: v.string(),
    rating: v.number(),
    comment: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be between 1 and 5");
    await ctx.db.insert("reviews", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return reviews.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

async function recomputeRating(ctx: MutationCtx, productId: Id<"products">) {
  const approved = await ctx.db
    .query("reviews")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const onlyApproved = approved.filter((r) => r.status === "approved");
  const avgRating = onlyApproved.length
    ? onlyApproved.reduce((sum, r) => sum + r.rating, 0) / onlyApproved.length
    : 0;
  await ctx.db.patch(productId, { avgRating, reviewCount: onlyApproved.length });
}

export const moderate = mutation({
  args: { id: v.id("reviews"), status: v.union(v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(id);
    if (!review) throw new Error("Review not found");
    await ctx.db.patch(id, { status });
    await recomputeRating(ctx, review.productId);
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(id);
    if (!review) return;
    await ctx.db.delete(id);
    await recomputeRating(ctx, review.productId);
  },
});
