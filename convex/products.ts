import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authz";

const localized = v.object({ en: v.string(), ar: v.string() });
const variant = v.object({
  name: localized,
  sku: v.string(),
  priceOverride: v.optional(v.number()),
  stock: v.number(),
  swatch: v.optional(v.string()),
  image: v.optional(v.string()),
});

function buildSearchText(name: { en: string; ar: string }, tags: string[]) {
  return [name.en, name.ar, ...tags].join(" ");
}

// ---------- Public storefront queries ----------

export const listActive = query({
  args: {
    categorySlug: v.optional(v.string()),
    tag: v.optional(v.string()),
    sort: v.optional(
      v.union(v.literal("newest"), v.literal("price_asc"), v.literal("price_desc"))
    ),
  },
  handler: async (ctx, { categorySlug, tag, sort }) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    if (categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
        .unique();

      if (!category) {
        products = [];
      } else {
        // Products hang off subcategories, so a department slug has to
        // match its children too — otherwise every department page would
        // come back empty.
        const children = await ctx.db
          .query("categories")
          .withIndex("by_parent", (q) => q.eq("parentId", category._id))
          .collect();
        const ids = new Set<string>([category._id, ...children.map((c) => c._id)]);
        products = products.filter((p) => ids.has(p.categoryId));
      }
    }

    if (tag) {
      products = products.filter((p) => p.tags.includes(tag));
    }

    switch (sort) {
      case "price_asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        products.sort((a, b) => b.price - a.price);
        break;
      default:
        products.sort((a, b) => b.createdAt - a.createdAt);
    }

    return products;
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
    return products.filter((p) => p.status === "active").sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Active products with a compare-at price above their current price —
 * i.e. genuinely discounted right now. Powers the storefront's offers
 * rail, sorted by deepest discount first. */
export const onSale = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return products
      .filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price)
      .sort(
        (a, b) =>
          (b.compareAtPrice! - b.price) / b.compareAtPrice! -
          (a.compareAtPrice! - a.price) / a.compareAtPrice!
      )
      .slice(0, limit ?? 8);
  },
});

/** Newest active products, for the "New Arrivals" rail. */
export const newArrivals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return products
      .filter((p) => p.isNew)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit ?? 8);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product || product.status !== "active") return null;
    const category = await ctx.db.get(product.categoryId);
    return { ...product, category };
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    if (!term.trim()) return [];
    return await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) =>
        q.search("searchText", term).eq("status", "active")
      )
      .take(20);
  },
});

// ---------- Admin queries/mutations ----------

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();
    return products.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
  },
});

const productFields = {
  name: localized,
  slug: v.string(),
  description: localized,
  shortDescription: v.optional(localized),
  categoryId: v.id("categories"),
  images: v.array(v.string()),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  sku: v.string(),
  variants: v.array(variant),
  stock: v.number(),
  tags: v.array(v.string()),
  ingredients: v.optional(localized),
  howToUse: v.optional(localized),
  featured: v.boolean(),
  isNew: v.boolean(),
  status: v.union(v.literal("active"), v.literal("draft"), v.literal("archived")),
};

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("A product with this slug already exists");
    return await ctx.db.insert("products", {
      ...args,
      searchText: buildSearchText(args.name, args.tags),
      avgRating: 0,
      reviewCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("products"), ...productFields },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, {
      ...rest,
      searchText: buildSearchText(rest.name, rest.tags),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

/**
 * One query behind /search, /deals and brand pages.
 *
 * Every filter is optional and they compose, so the same endpoint serves
 * "everything on sale", "everything by this brand", "shampoo matching
 * 'keratin'", or any combination — which is what a marketplace's browse
 * page actually needs.
 */
export const browse = query({
  args: {
    term: v.optional(v.string()),
    brandSlug: v.optional(v.string()),
    categorySlug: v.optional(v.string()),
    onSale: v.optional(v.boolean()),
    sort: v.optional(
      v.union(
        v.literal("relevance"),
        v.literal("newest"),
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("discount")
      )
    ),
  },
  handler: async (ctx, { term, brandSlug, categorySlug, onSale, sort }) => {
    const trimmed = term?.trim();

    let products = trimmed
      ? await ctx.db
          .query("products")
          .withSearchIndex("search_name", (q) =>
            q.search("searchText", trimmed).eq("status", "active")
          )
          .take(200)
      : await ctx.db
          .query("products")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect();

    if (brandSlug) {
      const brand = await ctx.db
        .query("brands")
        .withIndex("by_slug", (q) => q.eq("slug", brandSlug))
        .unique();
      products = brand ? products.filter((p) => p.brandId === brand._id) : [];
    }

    if (categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
        .unique();
      if (!category) {
        products = [];
      } else {
        // Department slugs must match their aisles too.
        const children = await ctx.db
          .query("categories")
          .withIndex("by_parent", (q) => q.eq("parentId", category._id))
          .collect();
        const ids = new Set<string>([category._id, ...children.map((c) => c._id)]);
        products = products.filter((p) => ids.has(p.categoryId));
      }
    }

    if (onSale) {
      products = products.filter(
        (p) => p.compareAtPrice != null && p.compareAtPrice > p.price
      );
    }

    const discountOf = (p: (typeof products)[number]) =>
      p.compareAtPrice ? (p.compareAtPrice - p.price) / p.compareAtPrice : 0;

    switch (sort) {
      case "price_asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        products.sort((a, b) => discountOf(b) - discountOf(a));
        break;
      case "newest":
        products.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        // "relevance" keeps the search index's own ordering; with no term
        // there is nothing to be relevant to, so fall back to newest.
        if (!trimmed) products.sort((a, b) => b.createdAt - a.createdAt);
    }

    return products;
  },
});

/**
 * Per-line availability for a cart.
 *
 * The cart lives in the shopper's browser and can outlive the catalogue:
 * a product gets archived, sells out, or is removed entirely, and the
 * stored line still points at it. Without this the first sign of trouble
 * is placeOrder throwing at checkout, which strands the shopper with no
 * way to fix their own cart.
 *
 * Returns a verdict per line so the UI can mark exactly which item is a
 * problem and offer to remove it.
 */
export const availability = query({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, { items }) => {
    return await Promise.all(
      items.map(async (item) => {
        const base = { productId: item.productId, variantSku: item.variantSku };
        const product = await ctx.db.get(item.productId);

        if (!product || product.status !== "active") {
          return { ...base, ok: false, reason: "unavailable" as const, availableStock: 0, price: null };
        }

        let stock = product.stock;
        let price = product.price;

        if (item.variantSku) {
          const variant = product.variants.find((v) => v.sku === item.variantSku);
          if (!variant) {
            return { ...base, ok: false, reason: "unavailable" as const, availableStock: 0, price: null };
          }
          stock = variant.stock;
          price = variant.priceOverride ?? product.price;
        }

        if (stock <= 0) {
          return { ...base, ok: false, reason: "out_of_stock" as const, availableStock: 0, price };
        }
        if (stock < item.quantity) {
          return { ...base, ok: false, reason: "low_stock" as const, availableStock: stock, price };
        }
        return { ...base, ok: true, reason: null, availableStock: stock, price };
      })
    );
  },
});
