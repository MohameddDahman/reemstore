/**
 * The store's launch catalogue — the products that exist on a freshly
 * deployed Reem store before the admin adds anything of their own.
 *
 * Prices are in EGP (Egyptian pounds), pitched at the range Egyptian
 * beauty retailers actually sell at rather than converted placeholders.
 */

export type Shade = { en: string; ar: string; hex: string };

export type CatalogProduct = {
  cat: "skincare" | "makeup" | "fragrance" | "hair-care";
  slug: string;
  name: { en: string; ar: string };
  price: number;
  compareAtPrice?: number;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  shades?: Shade[];
};

export const CATALOG: CatalogProduct[] = [
  // ---------- Skincare ----------
  {
    cat: "skincare",
    slug: "rose-radiance-serum",
    name: { en: "Rose Radiance Serum", ar: "سيروم الورد المشرق" },
    price: 1250,
    compareAtPrice: 1550,
    tags: ["serum", "glow", "vitamin-c"],
    featured: true,
    isNew: true,
  },
  {
    cat: "skincare",
    slug: "hydra-bloom-moisturizer",
    name: { en: "Hydra Bloom Moisturizer", ar: "مرطب هيدرا بلوم" },
    price: 980,
    tags: ["moisturizer", "hydration"],
    featured: true,
  },
  {
    cat: "skincare",
    slug: "gentle-silk-cleanser",
    name: { en: "Gentle Silk Cleanser", ar: "منظف الحرير اللطيف" },
    price: 650,
    tags: ["cleanser"],
  },
  {
    cat: "skincare",
    slug: "barrier-repair-night-cream",
    name: { en: "Barrier Repair Night Cream", ar: "كريم ليلي لإصلاح حاجز البشرة" },
    price: 1390,
    compareAtPrice: 1690,
    tags: ["night", "repair"],
    isNew: true,
  },
  {
    cat: "skincare",
    slug: "niacinamide-10-serum",
    name: { en: "Niacinamide 10% Serum", ar: "سيروم نياسيناميد ١٠٪" },
    price: 890,
    compareAtPrice: 1090,
    tags: ["serum", "pores"],
    featured: true,
  },
  {
    cat: "skincare",
    slug: "daily-mineral-sunscreen-spf50",
    name: { en: "Daily Mineral Sunscreen SPF 50", ar: "واقي شمس معدني يومي SPF 50" },
    price: 1090,
    tags: ["spf", "daily"],
    isNew: true,
    featured: true,
  },
  {
    cat: "skincare",
    slug: "clay-detox-mask",
    name: { en: "Clay Detox Mask", ar: "ماسك الطين المنقّي" },
    price: 720,
    compareAtPrice: 920,
    tags: ["mask"],
  },

  // ---------- Makeup ----------
  {
    cat: "makeup",
    slug: "velvet-matte-lipstick",
    name: { en: "Velvet Matte Lipstick", ar: "أحمر شفاه مخملي مطفي" },
    price: 850,
    tags: ["lips", "matte"],
    featured: true,
    isNew: true,
    shades: [
      { en: "Cairo Red", ar: "أحمر القاهرة", hex: "#c62231" },
      { en: "Dusty Rose", ar: "وردي باهت", hex: "#c3737f" },
      { en: "Terracotta", ar: "طيني", hex: "#a85b43" },
      { en: "Deep Plum", ar: "برقوقي غامق", hex: "#6f2740" },
    ],
  },
  {
    cat: "makeup",
    slug: "silk-foundation-spf30",
    name: { en: "Silk Foundation SPF 30", ar: "كريم أساس الحرير SPF 30" },
    price: 1150,
    tags: ["face", "foundation", "spf"],
    featured: true,
    shades: [
      { en: "Porcelain", ar: "بورسلين", hex: "#f3d9c4" },
      { en: "Sand", ar: "رملي", hex: "#e0b592" },
      { en: "Honey", ar: "عسلي", hex: "#c98d5f" },
      { en: "Chestnut", ar: "كستنائي", hex: "#8d5535" },
      { en: "Espresso", ar: "إسبريسو", hex: "#5c3722" },
    ],
  },
  {
    cat: "makeup",
    slug: "golden-hour-eyeshadow",
    name: { en: "Golden Hour Eyeshadow Palette", ar: "باليت ظلال العيون الذهبية" },
    price: 1050,
    compareAtPrice: 1250,
    tags: ["eyes", "palette"],
  },
  {
    cat: "makeup",
    slug: "soft-matte-concealer",
    name: { en: "Soft Matte Concealer", ar: "كونسيلر مطفي ناعم" },
    price: 780,
    tags: ["face", "concealer"],
    isNew: true,
    shades: [
      { en: "Porcelain", ar: "بورسلين", hex: "#f3d9c4" },
      { en: "Sand", ar: "رملي", hex: "#e0b592" },
      { en: "Honey", ar: "عسلي", hex: "#c98d5f" },
      { en: "Chestnut", ar: "كستنائي", hex: "#8d5535" },
      { en: "Espresso", ar: "إسبريسو", hex: "#5c3722" },
    ],
  },
  {
    cat: "makeup",
    slug: "glow-liquid-blush",
    name: { en: "Glow Liquid Blush", ar: "بلاشر سائل متوهج" },
    price: 720,
    compareAtPrice: 850,
    tags: ["cheeks"],
    featured: true,
    shades: [
      { en: "Peach", ar: "خوخي", hex: "#f0a08a" },
      { en: "Rose", ar: "وردي", hex: "#d97186" },
      { en: "Berry", ar: "توتي", hex: "#a63c5c" },
    ],
  },
  {
    cat: "makeup",
    slug: "precision-brow-pencil",
    name: { en: "Precision Brow Pencil", ar: "قلم حواجب دقيق" },
    price: 520,
    tags: ["brows"],
  },
  {
    cat: "makeup",
    slug: "lash-volume-mascara",
    name: { en: "Lash Volume Mascara", ar: "ماسكارا لكثافة الرموش" },
    price: 650,
    compareAtPrice: 820,
    tags: ["eyes", "mascara"],
    isNew: true,
  },

  // ---------- Fragrance ----------
  {
    cat: "fragrance",
    slug: "reem-oud-noir-edp",
    name: { en: "Reem Oud Noir Eau de Parfum", ar: "ريم عود نوار او دو بارفان" },
    price: 2300,
    tags: ["oud", "unisex"],
    featured: true,
  },
  {
    cat: "fragrance",
    slug: "blush-jasmine-mist",
    name: { en: "Blush Jasmine Mist", ar: "رذاذ الياسمين الوردي" },
    price: 920,
    tags: ["floral"],
  },
  {
    cat: "fragrance",
    slug: "amber-musk-body-mist",
    name: { en: "Amber Musk Body Mist", ar: "رذاذ الجسم عنبر ومسك" },
    price: 590,
    compareAtPrice: 760,
    tags: ["mist"],
    isNew: true,
  },
  {
    cat: "fragrance",
    slug: "rose-taif-edp",
    name: { en: "Rose Taif Eau de Parfum", ar: "ورد الطائف او دو بارفان" },
    price: 2600,
    tags: ["rose", "floral"],
    featured: true,
  },

  // ---------- Hair care ----------
  {
    cat: "hair-care",
    slug: "argan-repair-hair-oil",
    name: { en: "Argan Repair Hair Oil", ar: "زيت الأرجان لإصلاح الشعر" },
    price: 780,
    tags: ["oil", "repair"],
  },
  {
    cat: "hair-care",
    slug: "repair-hair-mask",
    name: { en: "Repair Hair Mask", ar: "ماسك إصلاح الشعر" },
    price: 950,
    compareAtPrice: 1180,
    tags: ["mask", "repair"],
    featured: true,
  },
  {
    cat: "hair-care",
    slug: "curl-define-cream",
    name: { en: "Curl Define Cream", ar: "كريم تحديد الكيرلي" },
    price: 820,
    tags: ["curls"],
    isNew: true,
  },
  {
    cat: "hair-care",
    slug: "scalp-renew-serum",
    name: { en: "Scalp Renew Serum", ar: "سيروم تجديد فروة الرأس" },
    price: 1250,
    tags: ["scalp"],
  },
];

export const CATEGORIES = [
  { slug: "skincare", name: { en: "Skincare", ar: "العناية بالبشرة" }, order: 1, featured: true },
  { slug: "makeup", name: { en: "Makeup", ar: "المكياج" }, order: 2, featured: true },
  { slug: "fragrance", name: { en: "Fragrance", ar: "العطور" }, order: 3, featured: true },
  { slug: "hair-care", name: { en: "Hair Care", ar: "العناية بالشعر" }, order: 4, featured: true },
] as const;

export const STORE_SETTINGS = {
  storeName: { en: "Reem", ar: "ريم" },
  currency: "EGP",
  currencySymbol: "L.E",
  shippingFee: 60,
  freeShippingThreshold: 1500,
};

export const LAUNCH_REVIEWS = [
  { name: "لمى.", rating: 5, comment: "السيروم يمتص بسرعة وبشرتي فعلاً أشرق لونها بعد أسبوع. حتى التغليف يحس فخم." },
  { name: "ريم ك.", rating: 5, comment: "أخيراً أحمر شفاه مطفي ما يجفف شفايفي. اللون ثابت طول اليوم." },
  { name: "Sara M.", rating: 4, comment: "Lovely scent, not overpowering. Delivery to Alexandria took 3 days, well packed." },
  { name: "نورة س.", rating: 5, comment: "صار المرطب المفضل عندي، خفيف بس بشرتي تضل مرطبة طول اليوم." },
  { name: "Hind Y.", rating: 5, comment: "Ordered cash on delivery, arrived exactly as described. Will be reordering the foundation." },
];
