import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// A string that carries both an Arabic and an English version so every
// piece of customer-facing copy can be authored once and rendered in
// whichever locale the shopper is browsing in.
const localized = v.object({
  en: v.string(),
  ar: v.string(),
});

export default defineSchema({
  ...authTables,

  // Links an authTables `users` row to the "admin" role. Kept separate
  // from `users` so the auth system stays generic and we only treat
  // someone as staff once they have a row here.
  admins: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("staff")),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  categories: defineTable({
    name: localized,
    slug: v.string(),
    description: v.optional(localized),
    image: v.optional(v.string()),
    order: v.number(),
    featured: v.boolean(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: localized,
    slug: v.string(),
    description: localized,
    shortDescription: v.optional(localized),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    sku: v.string(),
    // Optional variants (shade / size). If empty, `stock` on the product
    // itself is authoritative.
    variants: v.array(
      v.object({
        name: localized,
        sku: v.string(),
        priceOverride: v.optional(v.number()),
        stock: v.number(),
        swatch: v.optional(v.string()), // hex color for shade swatches
        image: v.optional(v.string()),
      })
    ),
    stock: v.number(),
    tags: v.array(v.string()),
    // Flattened "name.en name.ar tags..." blob so Convex full-text search
    // can match across both locales without needing a multi-field index.
    searchText: v.string(),
    ingredients: v.optional(localized),
    howToUse: v.optional(localized),
    featured: v.boolean(),
    isNew: v.boolean(),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("archived")),
    avgRating: v.number(),
    reviewCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"])
    .searchIndex("search_name", {
      searchField: "searchText",
      filterFields: ["status"],
    }),

  orders: defineTable({
    orderNumber: v.string(),
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
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        image: v.optional(v.string()),
        variantName: v.optional(v.string()),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    subtotal: v.number(),
    discount: v.number(),
    shippingFee: v.number(),
    total: v.number(),
    couponCode: v.optional(v.string()),
    paymentMethod: v.literal("cod"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_phone", ["customer.phone"]),

  coupons: defineTable({
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrderValue: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
    active: v.boolean(),
  }).index("by_code", ["code"]),

  banners: defineTable({
    type: v.union(v.literal("popup"), v.literal("topbar"), v.literal("hero")),
    title: localized,
    subtitle: v.optional(localized),
    image: v.optional(v.string()),
    ctaText: v.optional(localized),
    ctaLink: v.optional(v.string()),
    active: v.boolean(),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    order: v.number(),
  }).index("by_type_active", ["type", "active"]),

  reviews: defineTable({
    productId: v.id("products"),
    authorName: v.string(),
    rating: v.number(),
    comment: v.string(),
    images: v.optional(v.array(v.string())),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_status", ["status"]),

  settings: defineTable({
    key: v.literal("global"),
    storeName: localized,
    currency: v.string(),
    currencySymbol: v.string(),
    shippingFee: v.number(),
    freeShippingThreshold: v.optional(v.number()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
  }).index("by_key", ["key"]),
});
