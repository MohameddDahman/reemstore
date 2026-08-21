import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { CATALOG, CATEGORIES, STORE_SETTINGS, LAUNCH_REVIEWS } from "./lib/catalog";
import { PRODUCT_IMAGES, CATEGORY_IMAGES, productImg, wideImg } from "./lib/stockImages";

/**
 * Seeds a store deployment with its launch content: categories, the full
 * product catalogue, store settings, the entry promo popup, and a handful
 * of approved reviews so the testimonials section isn't empty on day one.
 *
 * Idempotent by design — every row is matched on a natural key (slug, or
 * the singleton settings key) and patched rather than duplicated, so this
 * is safe to re-run after adding products to the catalogue. It never
 * touches real orders or admin accounts.
 *
 * Run against production with:
 *   npx convex run --prod seedStore:seedStore
 */
export const seedStore = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ---- Categories ----
    const categoryIds: Record<string, Id<"categories">> = {};
    for (const cat of CATEGORIES) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .unique();
      const fields = {
        name: cat.name,
        slug: cat.slug,
        image: wideImg(CATEGORY_IMAGES[cat.slug]),
        order: cat.order,
        featured: cat.featured,
      };
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        categoryIds[cat.slug] = existing._id;
      } else {
        categoryIds[cat.slug] = await ctx.db.insert("categories", fields);
      }
    }

    // ---- Products ----
    let created = 0;
    let updated = 0;
    for (let i = 0; i < CATALOG.length; i++) {
      const p = CATALOG[i];
      const imageIds = PRODUCT_IMAGES[p.slug] ?? [];
      const variants = (p.shades ?? []).map((s, idx) => ({
        name: { en: s.en, ar: s.ar },
        sku: `${p.slug.slice(0, 6).toUpperCase()}-${idx + 1}`,
        priceOverride: undefined,
        stock: 25,
        swatch: s.hex,
        image: undefined,
      }));

      const fields = {
        name: p.name,
        slug: p.slug,
        description: {
          en: `${p.name.en} — a Reem essential, formulated for daily use and tested for sensitive skin.`,
          ar: `${p.name.ar} — من أساسيات ريم، بتركيبة مناسبة للاستخدام اليومي ومختبرة للبشرة الحساسة.`,
        },
        shortDescription: undefined,
        categoryId: categoryIds[p.cat],
        images: imageIds.map((id) => productImg(id)),
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        variants,
        // With shades, stock lives per-variant; without, on the product.
        stock: variants.length > 0 ? 0 : 40,
        tags: p.tags,
        ingredients: undefined,
        howToUse: undefined,
        featured: p.featured ?? false,
        isNew: p.isNew ?? false,
        status: "active" as const,
        searchText: [p.name.en, p.name.ar, ...p.tags].join(" "),
      };

      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", p.slug))
        .unique();

      if (existing) {
        // Leave ratings, SKU and createdAt alone so re-running doesn't
        // churn data the storefront sorts and displays by.
        await ctx.db.patch(existing._id, fields);
        updated++;
      } else {
        await ctx.db.insert("products", {
          ...fields,
          sku: `RS-${p.slug.slice(0, 4).toUpperCase()}-${100 + i}`,
          avgRating: 4.4 + (i % 6) / 10,
          reviewCount: 8 + ((i * 7) % 55),
          // Stagger so "newest first" ordering is stable and meaningful.
          createdAt: Date.now() - i * 3_600_000,
        });
        created++;
      }
    }

    // ---- Store settings (singleton) ----
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    if (settings) {
      await ctx.db.patch(settings._id, STORE_SETTINGS);
    } else {
      await ctx.db.insert("settings", { key: "global", ...STORE_SETTINGS });
    }

    // ---- Entry promo popup ----
    const popup = await ctx.db
      .query("banners")
      .withIndex("by_type_active", (q) => q.eq("type", "popup").eq("active", true))
      .first();
    if (!popup) {
      await ctx.db.insert("banners", {
        type: "popup",
        title: { en: "Welcome to Reem", ar: "أهلاً بكِ في ريم" },
        subtitle: {
          en: "Enjoy 15% off your first order with code REEM15 — cash on delivery available.",
          ar: "احصلي على خصم ١٥٪ على أول طلب بكود REEM15 — الدفع عند الاستلام متاح.",
        },
        ctaText: { en: "Shop the collection", ar: "تسوقي التشكيلة" },
        ctaLink: "/category/skincare",
        active: true,
        order: 1,
      });
    }

    // ---- Welcome coupon referenced by the popup ----
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", "REEM15"))
      .unique();
    if (!coupon) {
      await ctx.db.insert("coupons", {
        code: "REEM15",
        type: "percent",
        value: 15,
        minOrderValue: 500,
        usedCount: 0,
        active: true,
      });
    }

    // ---- Launch reviews (only if none approved yet) ----
    const anyApproved = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .first();
    if (!anyApproved) {
      const products = await ctx.db.query("products").collect();
      for (let i = 0; i < LAUNCH_REVIEWS.length && products.length > 0; i++) {
        const r = LAUNCH_REVIEWS[i];
        await ctx.db.insert("reviews", {
          productId: products[i % products.length]._id,
          authorName: r.name,
          rating: r.rating,
          comment: r.comment,
          status: "approved",
          createdAt: Date.now() - i * 86_400_000,
        });
      }
    }

    return `Seeded: ${created} product(s) created, ${updated} updated, ${CATEGORIES.length} categories, settings in ${STORE_SETTINGS.currency}.`;
  },
});
