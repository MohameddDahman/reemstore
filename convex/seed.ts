import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { PRODUCT_IMAGES, CATEGORY_IMAGES, productImg, wideImg } from "./lib/stockImages";

// Demo/dev data only — run once with `npx convex run seed:seedAll`.
// Imagery comes from convex/lib/stockImages.ts (curated cosmetics stock
// photos). Swap for Reem's own photography via the admin image uploader.
const categories = [
  {
    name: { en: "Skincare", ar: "العناية بالبشرة" },
    slug: "skincare",
    image: wideImg(CATEGORY_IMAGES["skincare"]),
    order: 1,
    featured: true,
  },
  {
    name: { en: "Makeup", ar: "المكياج" },
    slug: "makeup",
    image: wideImg(CATEGORY_IMAGES["makeup"]),
    order: 2,
    featured: true,
  },
  {
    name: { en: "Fragrance", ar: "العطور" },
    slug: "fragrance",
    image: wideImg(CATEGORY_IMAGES["fragrance"]),
    order: 3,
    featured: true,
  },
  {
    name: { en: "Hair Care", ar: "العناية بالشعر" },
    slug: "hair-care",
    image: wideImg(CATEGORY_IMAGES["hair-care"]),
    order: 4,
    featured: false,
  },
];

const productsByCategory: Record<
  string,
  {
    name: { en: string; ar: string };
    slug: string;
    price: number;
    compareAtPrice?: number;
    tags: string[];
    featured?: boolean;
    isNew?: boolean;
    seed: string;
  }[]
> = {
  skincare: [
    {
      name: { en: "Rose Radiance Serum", ar: "سيروم الورد المشرق" },
      slug: "rose-radiance-serum",
      price: 189,
      compareAtPrice: 229,
      tags: ["serum", "glow", "vitamin-c"],
      featured: true,
      isNew: true,
      seed: "serum1",
    },
    {
      name: { en: "Hydra Bloom Moisturizer", ar: "مرطب هيدرا بلوم" },
      slug: "hydra-bloom-moisturizer",
      price: 149,
      tags: ["moisturizer", "hydration"],
      featured: true,
      seed: "moist1",
    },
    {
      name: { en: "Gentle Silk Cleanser", ar: "منظف الحرير اللطيف" },
      slug: "gentle-silk-cleanser",
      price: 99,
      tags: ["cleanser"],
      seed: "cleanser1",
    },
  ],
  makeup: [
    {
      name: { en: "Velvet Matte Lipstick", ar: "أحمر شفاه مخملي مطفي" },
      slug: "velvet-matte-lipstick",
      price: 129,
      tags: ["lips", "matte"],
      featured: true,
      isNew: true,
      seed: "lip1",
    },
    {
      name: { en: "Silk Foundation SPF 30", ar: "كريم أساس الحرير spf 30" },
      slug: "silk-foundation-spf30",
      price: 175,
      tags: ["face", "foundation", "spf"],
      featured: true,
      seed: "found1",
    },
    {
      name: { en: "Golden Hour Eyeshadow Palette", ar: "باليت ظلال العيون الذهبية" },
      slug: "golden-hour-eyeshadow",
      price: 159,
      compareAtPrice: 189,
      tags: ["eyes", "palette"],
      seed: "eye1",
    },
  ],
  fragrance: [
    {
      name: { en: "Reem Oud Noir Eau de Parfum", ar: "ريم عود نوار او دو بارفان" },
      slug: "reem-oud-noir-edp",
      price: 349,
      tags: ["oud", "unisex"],
      featured: true,
      seed: "perf1",
    },
    {
      name: { en: "Blush Jasmine Mist", ar: "رذاذ الياسمين الوردي" },
      slug: "blush-jasmine-mist",
      price: 139,
      tags: ["floral"],
      seed: "perf2",
    },
  ],
  "hair-care": [
    {
      name: { en: "Argan Repair Hair Oil", ar: "زيت الأرجان لإصلاح الشعر" },
      slug: "argan-repair-hair-oil",
      price: 119,
      tags: ["oil", "repair"],
      seed: "hair1",
    },
  ],
};

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").first();
    if (existing) {
      return "Already seeded — skipping.";
    }

    const categoryIds: Record<string, Id<"categories">> = {};
    for (const cat of categories) {
      categoryIds[cat.slug] = await ctx.db.insert("categories", {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        order: cat.order,
        featured: cat.featured,
      });
    }

    for (const [slug, products] of Object.entries(productsByCategory)) {
      for (const p of products) {
        await ctx.db.insert("products", {
          name: p.name,
          slug: p.slug,
          description: {
            en: `${p.name.en} is crafted with premium ingredients to bring out your natural radiance. A signature Reem formula loved for its silky finish and lasting performance.`,
            ar: `${p.name.ar} مصنوع من مكونات فاخرة لإبراز إشراقتك الطبيعية. تركيبة ريم المميزة المحببة لملمسها الحريري وثباتها الطويل.`,
          },
          shortDescription: undefined,
          categoryId: categoryIds[slug],
          images: (PRODUCT_IMAGES[p.slug] ?? []).map((id) => productImg(id)),
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          sku: `RS-${p.slug.slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
          variants: [],
          stock: 50,
          tags: p.tags,
          ingredients: undefined,
          howToUse: undefined,
          featured: p.featured ?? false,
          isNew: p.isNew ?? false,
          status: "active",
          searchText: [p.name.en, p.name.ar, ...p.tags].join(" "),
          avgRating: 4.5,
          reviewCount: Math.floor(Math.random() * 40 + 5),
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("settings", {
      key: "global",
      storeName: { en: "Reem", ar: "ريم" },
      currency: "SAR",
      currencySymbol: "ر.س",
      shippingFee: 25,
      freeShippingThreshold: 250,
      whatsapp: undefined,
      instagram: undefined,
      tiktok: undefined,
      phone: undefined,
    });

    await ctx.db.insert("banners", {
      type: "popup",
      title: { en: "Summer Glow Sale", ar: "تخفيضات إشراقة الصيف" },
      subtitle: { en: "Up to 30% off best-selling skincare — today only.", ar: "خصم يصل إلى 30٪ على منتجات العناية الأكثر مبيعاً - اليوم فقط." },
      ctaText: { en: "Shop the sale", ar: "تسوقي الآن" },
      ctaLink: "/category/skincare",
      active: true,
      order: 1,
    });

    return "Seeded categories, products, settings and a promo popup.";
  },
});

// Dev-only helper: remove an orphaned auth user (created by an
// interrupted sign-up) that never got an `admins` row. Run with
// `npx convex run seed:deleteOrphanedUser '{"email":"..."}'`.
export const deleteOrphanedUser = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), email))
      .first();
    if (!account) return "No such account";
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_userId", (q) => q.eq("userId", account.userId))
      .unique();
    if (admin) return "Refusing to delete: this user IS an admin";
    await ctx.db.delete(account._id);
    await ctx.db.delete(account.userId);
    return "Deleted";
  },
});

// Dev-only: fix the seeded popup banner's CTA link if it still points at
// the old "/skincare" path instead of "/category/skincare".
export const fixBannerLink = internalMutation({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db.query("banners").collect();
    let fixed = 0;
    for (const b of banners) {
      if (b.ctaLink && !b.ctaLink.startsWith("/category/") && b.ctaLink !== "/") {
        await ctx.db.patch(b._id, { ctaLink: `/category${b.ctaLink}` });
        fixed++;
      }
    }
    return `Fixed ${fixed} banner(s)`;
  },
});

// Dev-only: add a handful of approved reviews so the homepage
// testimonials section has real content to show. Safe to run once.
export const seedTestimonials = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .first();
    if (existing) return "Already have approved reviews — skipping.";

    const products = await ctx.db.query("products").collect();
    if (products.length === 0) return "No products yet — run seedAll first.";

    // A realistic bilingual mix — real customer reviews on a Gulf store
    // are written in whichever language the shopper prefers, not synced
    // translations, so seed data reflects that instead of forcing one
    // language per entry.
    const testimonials = [
      { name: "لمى.", rating: 5, comment: "السيروم يمتص بسرعة وبشرتي فعلاً أشرق لونها بعد أسبوع. حتى التغليف يحس فخم." },
      { name: "ريم ك.", rating: 5, comment: "أخيراً أحمر شفاه مطفي ما يجفف شفايفي. اللون ثابت طول اليوم." },
      { name: "Sara M.", rating: 4, comment: "Lovely scent, not overpowering. Delivery to Jeddah took 3 days, well packed." },
      { name: "نورة س.", rating: 5, comment: "صار المرطب المفضل عندي، خفيف بس بشرتي تضل مرطبة طول اليوم." },
      { name: "Hind Y.", rating: 5, comment: "Ordered cash on delivery, arrived exactly as described. Will be reordering the foundation." },
    ];

    for (let i = 0; i < testimonials.length; i++) {
      const t = testimonials[i];
      const product = products[i % products.length];
      await ctx.db.insert("reviews", {
        productId: product._id,
        authorName: t.name,
        rating: t.rating,
        comment: t.comment,
        status: "approved",
        createdAt: Date.now() - i * 86_400_000,
      });
    }

    return `Seeded ${testimonials.length} approved reviews.`;
  },
});

// Dev-only: wipe all reviews (used when re-running seedTestimonials with
// updated demo content).
export const clearReviews = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("reviews").collect();
    for (const r of all) await ctx.db.delete(r._id);
    return `Deleted ${all.length} review(s).`;
  },
});

// Dev-only: expand the demo catalog so the storefront rails look like a
// real store (each rail wants ~8-10 items). Adds variants/shades to a few
// products so the swatch UI and "Choose Options" path are exercised too.
export const seedMoreProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const bySlug: Record<string, Id<"categories">> = {};
    for (const c of categories) bySlug[c.slug] = c._id;
    if (Object.keys(bySlug).length === 0) return "Run seedAll first.";

    const extra: {
      cat: string;
      name: { en: string; ar: string };
      slug: string;
      price: number;
      compareAtPrice?: number;
      tags: string[];
      featured?: boolean;
      isNew?: boolean;
      seed: string;
      shades?: { en: string; ar: string; hex: string }[];
    }[] = [
      { cat: "skincare", name: { en: "Barrier Repair Night Cream", ar: "كريم ليلي لإصلاح حاجز البشرة" }, slug: "barrier-repair-night-cream", price: 210, compareAtPrice: 260, tags: ["night", "repair"], isNew: true, seed: "night1" },
      { cat: "skincare", name: { en: "Niacinamide 10% Serum", ar: "سيروم نياسيناميد ١٠٪" }, slug: "niacinamide-10-serum", price: 135, compareAtPrice: 165, tags: ["serum", "pores"], featured: true, seed: "niacin1" },
      { cat: "skincare", name: { en: "Daily Mineral Sunscreen SPF 50", ar: "واقي شمس معدني يومي SPF 50" }, slug: "daily-mineral-sunscreen-spf50", price: 165, tags: ["spf", "daily"], isNew: true, featured: true, seed: "spf1" },
      { cat: "skincare", name: { en: "Clay Detox Mask", ar: "ماسك الطين المنقّي" }, slug: "clay-detox-mask", price: 110, compareAtPrice: 140, tags: ["mask"], seed: "mask1" },
      { cat: "makeup", name: { en: "Soft Matte Concealer", ar: "كونسيلر مطفي ناعم" }, slug: "soft-matte-concealer", price: 119, tags: ["face", "concealer"], isNew: true, seed: "conceal1",
        shades: [ { en: "Porcelain", ar: "بورسلين", hex: "#f3d9c4" }, { en: "Sand", ar: "رملي", hex: "#e0b592" }, { en: "Honey", ar: "عسلي", hex: "#c98d5f" }, { en: "Chestnut", ar: "كستنائي", hex: "#8d5535" }, { en: "Espresso", ar: "إسبريسو", hex: "#5c3722" } ] },
      { cat: "makeup", name: { en: "Glow Liquid Blush", ar: "بلاشر سائل متوهج" }, slug: "glow-liquid-blush", price: 109, compareAtPrice: 129, tags: ["cheeks"], featured: true, seed: "blush1",
        shades: [ { en: "Peach", ar: "خوخي", hex: "#f0a08a" }, { en: "Rose", ar: "وردي", hex: "#d97186" }, { en: "Berry", ar: "توتي", hex: "#a63c5c" } ] },
      { cat: "makeup", name: { en: "Precision Brow Pencil", ar: "قلم حواجب دقيق" }, slug: "precision-brow-pencil", price: 79, tags: ["brows"], seed: "brow1" },
      { cat: "makeup", name: { en: "Lash Volume Mascara", ar: "ماسكارا لكثافة الرموش" }, slug: "lash-volume-mascara", price: 99, compareAtPrice: 125, tags: ["eyes", "mascara"], isNew: true, seed: "mascara1" },
      { cat: "fragrance", name: { en: "Amber Musk Body Mist", ar: "رذاذ الجسم عنبر ومسك" }, slug: "amber-musk-body-mist", price: 89, compareAtPrice: 115, tags: ["mist"], isNew: true, seed: "mist1" },
      { cat: "fragrance", name: { en: "Rose Taif Eau de Parfum", ar: "ورد الطائف او دو بارفان" }, slug: "rose-taif-edp", price: 395, tags: ["rose", "floral"], featured: true, seed: "rose1" },
      { cat: "hair-care", name: { en: "Repair Hair Mask", ar: "ماسك إصلاح الشعر" }, slug: "repair-hair-mask", price: 145, compareAtPrice: 179, tags: ["mask", "repair"], featured: true, seed: "hmask1" },
      { cat: "hair-care", name: { en: "Curl Define Cream", ar: "كريم تحديد الكيرلي" }, slug: "curl-define-cream", price: 125, tags: ["curls"], isNew: true, seed: "curl1" },
      { cat: "hair-care", name: { en: "Scalp Renew Serum", ar: "سيروم تجديد فروة الرأس" }, slug: "scalp-renew-serum", price: 189, tags: ["scalp"], seed: "scalp1" },
    ];

    let added = 0;
    for (const p of extra) {
      const exists = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", p.slug))
        .unique();
      if (exists) continue;

      await ctx.db.insert("products", {
        name: p.name,
        slug: p.slug,
        description: {
          en: `${p.name.en} — a Reem essential, formulated for daily use and tested for sensitive skin.`,
          ar: `${p.name.ar} — من أساسيات ريم، بتركيبة مناسبة للاستخدام اليومي ومختبرة للبشرة الحساسة.`,
        },
        shortDescription: undefined,
        categoryId: bySlug[p.cat],
        images: (PRODUCT_IMAGES[p.slug] ?? []).map((id) => productImg(id)),
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: `RS-${p.slug.slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        variants: (p.shades ?? []).map((s, i) => ({
          name: { en: s.en, ar: s.ar },
          sku: `${p.slug.slice(0, 6).toUpperCase()}-${i + 1}`,
          priceOverride: undefined,
          stock: 20,
          swatch: s.hex,
          image: undefined,
        })),
        stock: p.shades ? 0 : 40,
        tags: p.tags,
        ingredients: undefined,
        howToUse: undefined,
        featured: p.featured ?? false,
        isNew: p.isNew ?? false,
        status: "active",
        searchText: [p.name.en, p.name.ar, ...p.tags].join(" "),
        avgRating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 60 + 8),
        createdAt: Date.now() - added * 3_600_000,
      });
      added++;
    }
    return `Added ${added} product(s).`;
  },
});

// Replaces the picsum placeholders on every existing product and category
// with curated cosmetics photography. Idempotent — safe to re-run, and it
// only touches rows whose slug appears in the mapping.
export const relinkImages = internalMutation({
  args: {},
  handler: async (ctx) => {
    let products = 0;
    let categories = 0;

    for (const product of await ctx.db.query("products").collect()) {
      const ids = PRODUCT_IMAGES[product.slug];
      if (!ids) continue;
      await ctx.db.patch(product._id, {
        images: [productImg(ids[0]), productImg(ids[1])],
      });
      products++;
    }

    for (const category of await ctx.db.query("categories").collect()) {
      const id = CATEGORY_IMAGES[category.slug];
      if (!id) continue;
      await ctx.db.patch(category._id, { image: wideImg(id) });
      categories++;
    }

    return `Relinked ${products} product(s) and ${categories} category image(s).`;
  },
});
