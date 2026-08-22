import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { DEPARTMENTS, BRANDS, STORE_SETTINGS, LAUNCH_REVIEWS } from "./lib/catalog";
import { imgFor, wideImg, DEPARTMENT_IMAGES, IMAGE_POOL } from "./lib/stockImages";

/**
 * Seeds a deployment with the marketplace's launch content: the
 * department -> subcategory tree, every catalogue product, brands, store
 * settings, promo banners and a few approved reviews.
 *
 * Idempotent — every row is matched on its natural key (slug, or the
 * singleton settings key) and patched rather than duplicated, so this is
 * safe to re-run after the catalogue grows. It never touches real orders
 * or admin accounts.
 *
 * Run against production with:
 *   npx convex run --prod seedStore:seedStore
 */
export const seedStore = internalMutation({
  args: {},
  handler: async (ctx) => {
    let deptCount = 0;
    let subCount = 0;
    let created = 0;
    let updated = 0;

    // ---- Brands ----
    const brandIds: Id<"brands">[] = [];
    for (let i = 0; i < BRANDS.length; i++) {
      const name = BRANDS[i];
      const slug = name
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const existing = await ctx.db
        .query("brands")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      const fields = { name, slug, featured: i < 12, order: i };
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        brandIds.push(existing._id);
      } else {
        brandIds.push(await ctx.db.insert("brands", fields));
      }
    }

    // ---- Departments, subcategories, products ----
    let productIndex = 0;
    for (let d = 0; d < DEPARTMENTS.length; d++) {
      const dept = DEPARTMENTS[d];

      const deptFields = {
        name: dept.name,
        slug: dept.slug,
        image: wideImg(IMAGE_POOL[DEPARTMENT_IMAGES[dept.slug]] ?? IMAGE_POOL["sk-tube"]),
        icon: dept.icon,
        parentId: undefined,
        order: d,
        featured: true,
      };
      const existingDept = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", dept.slug))
        .unique();
      const deptId = existingDept
        ? (await ctx.db.patch(existingDept._id, deptFields), existingDept._id)
        : await ctx.db.insert("categories", deptFields);
      deptCount++;

      for (let s = 0; s < dept.subs.length; s++) {
        const sub = dept.subs[s];
        const subFields = {
          name: sub.name,
          slug: sub.slug,
          image: sub.products[0] ? imgFor(sub.products[0].img, 600) : undefined,
          icon: undefined,
          parentId: deptId,
          order: s,
          featured: false,
        };
        const existingSub = await ctx.db
          .query("categories")
          .withIndex("by_slug", (q) => q.eq("slug", sub.slug))
          .unique();
        const subId = existingSub
          ? (await ctx.db.patch(existingSub._id, subFields), existingSub._id)
          : await ctx.db.insert("categories", subFields);
        subCount++;

        for (const prod of sub.products) {
          const fields = {
            name: prod.name,
            slug: prod.slug,
            description: {
              en: `${prod.name.en}. Genuine stock, sealed and checked before dispatch. Cash on delivery available across Egypt.`,
              ar: `${prod.name.ar}. منتج أصلي، مغلف ومراجع قبل الشحن. الدفع عند الاستلام متاح في جميع أنحاء مصر.`,
            },
            shortDescription: undefined,
            categoryId: subId,
            brandId: brandIds[productIndex % brandIds.length],
            images: [imgFor(prod.img), imgFor(prod.img, 900)],
            price: prod.price,
            compareAtPrice: prod.was,
            variants: [],
            stock: 25 + ((productIndex * 7) % 60),
            tags: [dept.slug, sub.slug],
            ingredients: undefined,
            howToUse: undefined,
            featured: prod.featured ?? false,
            isNew: prod.isNew ?? false,
            status: "active" as const,
            searchText: [prod.name.en, prod.name.ar, dept.name.en, dept.name.ar, sub.name.en, sub.name.ar].join(" "),
          };

          const existing = await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", prod.slug))
            .unique();

          if (existing) {
            // Leave ratings, SKU and createdAt alone so re-running doesn't
            // churn the data the storefront sorts and displays by.
            await ctx.db.patch(existing._id, fields);
            updated++;
          } else {
            await ctx.db.insert("products", {
              ...fields,
              sku: `RS-${prod.slug.slice(0, 5).toUpperCase()}-${1000 + productIndex}`,
              avgRating: 3.9 + ((productIndex * 13) % 11) / 10,
              reviewCount: 6 + ((productIndex * 17) % 240),
              // Stagger so "newest first" ordering is stable and meaningful.
              createdAt: Date.now() - productIndex * 1_800_000,
            });
            created++;
          }
          productIndex++;
        }
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
        title: { en: "15% off your first order", ar: "خصم ١٥٪ على أول طلب" },
        subtitle: {
          en: "Use code REEM15 at checkout. Cash on delivery, everywhere in Egypt.",
          ar: "استخدمي كود REEM15 عند الدفع. الدفع عند الاستلام في كل مصر.",
        },
        ctaText: { en: "Start shopping", ar: "ابدئي التسوق" },
        ctaLink: "/category/skin-care",
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
        minOrderValue: 300,
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
          productId: products[(i * 11) % products.length]._id,
          authorName: r.name,
          rating: r.rating,
          comment: r.comment,
          status: "approved",
          createdAt: Date.now() - i * 86_400_000,
        });
      }
    }

    return `Seeded ${deptCount} departments, ${subCount} subcategories, ${created} products created / ${updated} updated, ${BRANDS.length} brands.`;
  },
});

/**
 * Removes catalogue rows whose slug is no longer in the catalogue file.
 * Used when the taxonomy changes shape (the store pivoted from a
 * cosmetics boutique to a marketplace) so stale products and categories
 * don't linger in the storefront. Orders keep their own copy of item
 * names and prices, so past orders are unaffected.
 */
export const pruneStaleCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const keepProducts = new Set<string>();
    const keepCategories = new Set<string>();
    for (const dept of DEPARTMENTS) {
      keepCategories.add(dept.slug);
      for (const sub of dept.subs) {
        keepCategories.add(sub.slug);
        for (const prod of sub.products) keepProducts.add(prod.slug);
      }
    }

    let removedProducts = 0;
    for (const product of await ctx.db.query("products").collect()) {
      if (!keepProducts.has(product.slug)) {
        await ctx.db.delete(product._id);
        removedProducts++;
      }
    }

    let removedCategories = 0;
    for (const category of await ctx.db.query("categories").collect()) {
      if (!keepCategories.has(category.slug)) {
        await ctx.db.delete(category._id);
        removedCategories++;
      }
    }

    return `Pruned ${removedProducts} product(s) and ${removedCategories} category/categories.`;
  },
});
