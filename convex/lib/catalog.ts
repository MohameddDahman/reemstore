/**
 * Reem's launch catalogue: an everyday care marketplace — skincare,
 * hair, baby, adult care, personal care, vitamins and home essentials.
 *
 * Shape is department -> subcategory -> products, which is what the mega
 * menu, department pages and homepage rails all read. Prices are EGP,
 * pitched at what Egyptian retailers actually charge.
 *
 * Product names are deliberately descriptive rather than trademarked.
 * The demo ships with generic stock photography, and putting a real
 * brand's name on a stock photo of a different bottle would misdescribe
 * the goods. Real brands live in `BRANDS` and get attached to products
 * once the client loads their actual catalogue and imagery.
 */

export type SeedProduct = {
  slug: string;
  name: { en: string; ar: string };
  price: number;
  /** Was-price. Present => the product renders as discounted. */
  was?: number;
  featured?: boolean;
  isNew?: boolean;
  /** Key into IMAGE_POOL in stockImages.ts. */
  img: string;
};

export type SeedSub = {
  slug: string;
  name: { en: string; ar: string };
  products: SeedProduct[];
};

export type SeedDept = {
  slug: string;
  name: { en: string; ar: string };
  /**
   * Optional, and unset for every department today. Emoji were dropped
   * from the storefront because they render in each platform's own
   * cartoon style, never match the page, and read as filler. The field
   * survives for a real icon set — an SVG or an uploaded mark — rather
   * than being reintroduced as emoji.
   */
  icon?: string;
  subs: SeedSub[];
};

// Compact constructor so the catalogue below stays readable.
const p = (
  slug: string,
  en: string,
  ar: string,
  price: number,
  img: string,
  extra: Partial<SeedProduct> = {}
): SeedProduct => ({ slug, name: { en, ar }, price, img, ...extra });

export const DEPARTMENTS: SeedDept[] = [
  {
    slug: "skin-care",
    name: { en: "Skin Care", ar: "العناية بالبشرة" },
    subs: [
      {
        slug: "cleansers",
        name: { en: "Cleansers", ar: "غسول الوجه" },
        products: [
          p("gentle-foaming-cleanser", "Gentle Foaming Cleanser 200ml", "غسول رغوي لطيف ٢٠٠ مل", 285, "sk-tube", { featured: true }),
          p("salicylic-acne-wash", "Salicylic Acid Acne Wash 150ml", "غسول حب الشباب بالساليسيليك ١٥٠ مل", 340, "sk-apothecary", { was: 410 }),
          p("micellar-water-400", "Micellar Cleansing Water 400ml", "ماء ميسيلار منظف ٤٠٠ مل", 220, "sk-pink-flatlay"),
          p("cream-cleanser-dry", "Cream Cleanser for Dry Skin", "غسول كريمي للبشرة الجافة", 265, "sk-swatch"),
        ],
      },
      {
        slug: "moisturizers",
        name: { en: "Moisturizers", ar: "مرطبات" },
        products: [
          p("daily-moisturizer-spf15", "Daily Moisturizer SPF 15", "مرطب يومي بعامل حماية ١٥", 395, "sk-tube", { featured: true }),
          p("ceramide-repair-cream", "Ceramide Barrier Repair Cream", "كريم إصلاح الحاجز بالسيراميد", 520, "sk-copper", { was: 640 }),
          p("oil-free-gel-cream", "Oil-Free Gel Cream 50ml", "جل كريم خالي من الزيوت ٥٠ مل", 310, "sk-swatch"),
          p("night-recovery-cream", "Overnight Recovery Cream", "كريم الإصلاح الليلي", 610, "sk-copper", { isNew: true }),
        ],
      },
      {
        slug: "serums-treatments",
        name: { en: "Serums & Treatments", ar: "سيرومات وعلاجات" },
        products: [
          p("vitamin-c-serum-15", "Vitamin C Brightening Serum 15%", "سيروم فيتامين سي للتفتيح ١٥٪", 680, "sk-dropper", { featured: true, was: 850 }),
          p("niacinamide-serum-10", "Niacinamide 10% Serum", "سيروم نياسيناميد ١٠٪", 445, "sk-dropper"),
          p("hyaluronic-serum", "Hyaluronic Acid Hydrating Serum", "سيروم حمض الهيالورونيك المرطب", 490, "sk-dropper", { isNew: true }),
          p("retinol-night-serum", "Retinol 0.3% Night Serum", "سيروم ريتينول ٠.٣٪ ليلي", 720, "sk-apothecary"),
        ],
      },
      {
        slug: "sunscreen",
        name: { en: "Sunscreen", ar: "واقي الشمس" },
        products: [
          p("mineral-sunscreen-spf50", "Mineral Sunscreen SPF 50", "واقي شمس معدني SPF 50", 465, "sk-tube", { featured: true }),
          p("invisible-fluid-spf50", "Invisible Fluid Sunscreen SPF 50+", "واقي شمس سائل شفاف SPF 50+", 540, "sk-tube", { was: 660 }),
          p("kids-sunscreen-spf50", "Kids Sunscreen Lotion SPF 50", "لوشن واقي شمس للأطفال SPF 50", 380, "sk-white-tube"),
        ],
      },
      {
        slug: "masks-exfoliators",
        name: { en: "Masks & Exfoliators", ar: "ماسكات ومقشرات" },
        products: [
          p("clay-detox-mask", "Purifying Clay Mask 75ml", "ماسك الطين المنقي ٧٥ مل", 295, "sk-swatch", { was: 370 }),
          p("aha-bha-peeling", "AHA + BHA Peeling Solution", "محلول تقشير AHA + BHA", 415, "sk-apothecary"),
          p("sheet-mask-pack-5", "Hydrating Sheet Masks — 5 Pack", "ماسكات ورقية مرطبة - ٥ قطع", 180, "sk-pink-flatlay", { isNew: true }),
        ],
      },
      {
        slug: "lip-eye-care",
        name: { en: "Lip & Eye Care", ar: "عناية الشفاه والعين" },
        products: [
          p("caffeine-eye-cream", "Caffeine Eye Cream 15ml", "كريم العين بالكافيين ١٥ مل", 355, "sk-copper"),
          p("lip-repair-balm", "Overnight Lip Repair Balm", "بلسم إصلاح الشفاه الليلي", 145, "mk-lip-swatches"),
        ],
      },
    ],
  },
  {
    slug: "hair-care",
    name: { en: "Hair Care", ar: "العناية بالشعر" },
    subs: [
      {
        slug: "shampoo",
        name: { en: "Shampoo", ar: "شامبو" },
        products: [
          p("anti-dandruff-shampoo", "Anti-Dandruff Shampoo 400ml", "شامبو ضد القشرة ٤٠٠ مل", 245, "hr-white-trio", { featured: true }),
          p("keratin-smooth-shampoo", "Keratin Smoothing Shampoo 500ml", "شامبو الكيراتين المنعم ٥٠٠ مل", 320, "hr-pink-duo", { was: 395 }),
          p("sulphate-free-shampoo", "Sulphate-Free Daily Shampoo", "شامبو يومي خالي من السلفات", 285, "hr-beige-pump"),
          p("volumising-shampoo", "Volumising Shampoo for Fine Hair", "شامبو لزيادة الكثافة للشعر الخفيف", 260, "hr-white-trio"),
        ],
      },
      {
        slug: "conditioner",
        name: { en: "Conditioner", ar: "بلسم" },
        products: [
          p("deep-conditioner-400", "Deep Conditioner 400ml", "بلسم مركز ٤٠٠ مل", 275, "hr-pink-duo"),
          p("leave-in-conditioner", "Leave-In Conditioning Spray", "بخاخ بلسم يترك على الشعر", 230, "hr-beige-pump", { isNew: true }),
        ],
      },
      {
        slug: "hair-treatments",
        name: { en: "Treatments & Masks", ar: "علاجات وماسكات" },
        products: [
          p("argan-repair-oil", "Argan Repair Hair Oil 100ml", "زيت الأرجان لإصلاح الشعر ١٠٠ مل", 310, "hr-white-trio", { featured: true }),
          p("protein-hair-mask", "Protein Repair Hair Mask 300ml", "ماسك البروتين لإصلاح الشعر ٣٠٠ مل", 365, "hr-pink-duo", { was: 450 }),
          p("scalp-renewal-serum", "Scalp Renewal Serum", "سيروم تجديد فروة الرأس", 480, "sk-dropper"),
          p("hair-growth-serum", "Hair Growth Booster Serum", "سيروم تكثيف الشعر", 690, "sk-dropper", { isNew: true, was: 820 }),
        ],
      },
      {
        slug: "styling",
        name: { en: "Styling", ar: "تصفيف الشعر" },
        products: [
          p("curl-define-cream", "Curl Defining Cream 250ml", "كريم تحديد الكيرلي ٢٥٠ مل", 295, "hr-beige-pump"),
          p("heat-protect-spray", "Heat Protection Spray", "بخاخ الحماية من الحرارة", 250, "hr-white-trio"),
          p("strong-hold-gel", "Strong Hold Styling Gel", "جل تثبيت قوي", 120, "hr-pink-duo"),
        ],
      },
      {
        slug: "hair-color",
        name: { en: "Hair Colour", ar: "صبغات الشعر" },
        products: [
          p("permanent-hair-color", "Permanent Hair Colour Kit", "طقم صبغة شعر دائمة", 210, "hr-pink-duo"),
          p("root-touchup-spray", "Root Touch-Up Spray", "بخاخ إخفاء الجذور", 265, "hr-beige-pump"),
        ],
      },
    ],
  },
  {
    slug: "makeup",
    name: { en: "Makeup", ar: "المكياج" },
    subs: [
      {
        slug: "face-makeup",
        name: { en: "Face", ar: "الوجه" },
        products: [
          p("silk-foundation-spf30", "Silk Foundation SPF 30", "كريم أساس الحرير SPF 30", 560, "mk-white-flatlay", { featured: true }),
          p("soft-matte-concealer", "Soft Matte Concealer", "كونسيلر مطفي ناعم", 340, "mk-white-flatlay", { isNew: true }),
          p("loose-setting-powder", "Loose Setting Powder", "بودرة تثبيت سائبة", 385, "mk-powders", { was: 460 }),
          p("glow-liquid-blush", "Glow Liquid Blush", "بلاشر سائل متوهج", 320, "mk-rose-flatlay"),
        ],
      },
      {
        slug: "lips",
        name: { en: "Lips", ar: "الشفاه" },
        products: [
          p("velvet-matte-lipstick", "Velvet Matte Lipstick", "أحمر شفاه مخملي مطفي", 375, "mk-red-lipstick", { featured: true }),
          p("tinted-lip-oil", "Tinted Lip Oil", "زيت شفاه ملون", 265, "mk-lip-swatches", { isNew: true }),
          p("lip-liner-pencil", "Long-Wear Lip Liner", "قلم تحديد شفاه ثابت", 165, "mk-rose-flatlay"),
        ],
      },
      {
        slug: "eyes",
        name: { en: "Eyes", ar: "العيون" },
        products: [
          p("volume-mascara", "Lash Volume Mascara", "ماسكارا لكثافة الرموش", 290, "mk-rose-flatlay", { was: 360 }),
          p("eyeshadow-palette-12", "12-Shade Eyeshadow Palette", "باليت ظلال ١٢ لون", 470, "mk-palette-hand", { featured: true }),
          p("precision-eyeliner", "Precision Liquid Eyeliner", "آيلاينر سائل دقيق", 195, "mk-white-flatlay"),
          p("brow-pencil", "Precision Brow Pencil", "قلم حواجب دقيق", 175, "mk-flatlay2"),
        ],
      },
      {
        slug: "makeup-tools",
        name: { en: "Brushes & Tools", ar: "فرش وأدوات مكياج" },
        products: [
          p("brush-set-12", "12-Piece Makeup Brush Set", "طقم فرش مكياج ١٢ قطعة", 540, "mk-powders", { was: 690, featured: true }),
          p("blending-sponge-set", "Blending Sponge — 3 Pack", "إسفنجة دمج - ٣ قطع", 130, "mk-flatlay2"),
          p("eyelash-curler", "Stainless Eyelash Curler", "جهاز تجعيد الرموش", 110, "mk-flatlay2"),
        ],
      },
      {
        slug: "nails",
        name: { en: "Nails", ar: "الأظافر" },
        products: [
          p("gel-effect-polish", "Gel-Effect Nail Polish", "طلاء أظافر بمفعول الجل", 95, "mk-coral-render"),
          p("nail-strengthener", "Nail Strengthening Treatment", "علاج تقوية الأظافر", 180, "mk-coral-render", { isNew: true }),
        ],
      },
    ],
  },
  {
    slug: "mother-baby",
    name: { en: "Mother & Baby", ar: "الأم والطفل" },
    subs: [
      {
        slug: "baby-diapers",
        name: { en: "Baby Diapers", ar: "حفاضات الأطفال" },
        products: [
          p("baby-diapers-s3-jumbo", "Baby Diapers Size 3 — Jumbo 68pcs", "حفاضات أطفال مقاس ٣ - جامبو ٦٨ قطعة", 480, "bb-diapers", { featured: true, was: 590 }),
          p("baby-diapers-s4-jumbo", "Baby Diapers Size 4 — Jumbo 60pcs", "حفاضات أطفال مقاس ٤ - جامبو ٦٠ قطعة", 495, "bb-diapers", { was: 610 }),
          p("baby-diapers-s5-mega", "Baby Diapers Size 5 — Mega 52pcs", "حفاضات أطفال مقاس ٥ - ميجا ٥٢ قطعة", 510, "bb-diapers"),
          p("newborn-diapers-s1", "Newborn Diapers Size 1 — 44pcs", "حفاضات حديثي الولادة مقاس ١ - ٤٤ قطعة", 320, "bb-diapers"),
          p("pull-up-pants-s5", "Pull-Up Training Pants Size 5", "حفاضات بنطلون تدريب مقاس ٥", 465, "bb-diapers", { isNew: true }),
        ],
      },
      {
        slug: "baby-wipes",
        name: { en: "Wipes", ar: "مناديل مبللة" },
        products: [
          p("baby-wipes-64x4", "Baby Wipes 64pcs — 4 Pack", "مناديل أطفال مبللة ٦٤ قطعة - ٤ عبوات", 260, "bb-wipes", { featured: true }),
          p("sensitive-wipes-72", "Sensitive Baby Wipes 72pcs", "مناديل أطفال للبشرة الحساسة ٧٢ قطعة", 85, "bb-wipes"),
        ],
      },
      {
        slug: "baby-bath",
        name: { en: "Baby Bath & Skin", ar: "استحمام وعناية الطفل" },
        products: [
          p("baby-shampoo-tearfree", "No-Tears Baby Shampoo 400ml", "شامبو أطفال بدون دموع ٤٠٠ مل", 175, "bb-bath"),
          p("diaper-rash-cream", "Diaper Rash Protection Cream", "كريم الحماية من التسلخات", 145, "bb-bath", { was: 180 }),
          p("baby-lotion-500", "Gentle Baby Lotion 500ml", "لوشن أطفال لطيف ٥٠٠ مل", 190, "bb-bath"),
          p("baby-massage-oil", "Baby Massage Oil 200ml", "زيت تدليك الأطفال ٢٠٠ مل", 130, "bb-bath"),
        ],
      },
      {
        slug: "feeding",
        name: { en: "Feeding", ar: "الرضاعة والتغذية" },
        products: [
          p("anti-colic-bottle-260", "Anti-Colic Baby Bottle 260ml", "ببرونة مضادة للمغص ٢٦٠ مل", 240, "bb-bottle", { featured: true }),
          p("silicone-soother-pack", "Silicone Soother — 2 Pack", "لهاية سيليكون - قطعتان", 120, "bb-bottle"),
          p("bottle-brush-set", "Bottle & Teat Brush Set", "طقم فرشاة تنظيف الببرونة", 95, "bb-bottle"),
          p("breast-pads-30", "Disposable Breast Pads — 30pcs", "ضمادات الصدر للمرة الواحدة - ٣٠ قطعة", 110, "bb-wipes"),
        ],
      },
      {
        slug: "maternity",
        name: { en: "Maternity Care", ar: "عناية الأمومة" },
        products: [
          p("stretch-mark-oil", "Stretch Mark Prevention Oil", "زيت الوقاية من علامات التمدد", 420, "sk-dropper"),
          p("nipple-care-balm", "Nipple Care Balm 30ml", "بلسم العناية بالحلمة ٣٠ مل", 265, "sk-copper"),
        ],
      },
    ],
  },
  {
    slug: "adult-care",
    name: { en: "Adult Care", ar: "عناية الكبار" },
    subs: [
      {
        slug: "adult-diapers",
        name: { en: "Adult Diapers", ar: "حفاضات الكبار" },
        products: [
          p("adult-diapers-large-30", "Adult Diapers Large — 30pcs", "حفاضات كبار مقاس كبير - ٣٠ قطعة", 620, "ad-care", { featured: true, was: 750 }),
          p("adult-diapers-medium-30", "Adult Diapers Medium — 30pcs", "حفاضات كبار مقاس متوسط - ٣٠ قطعة", 585, "ad-care"),
          p("adult-pull-up-large", "Adult Pull-Up Pants Large — 14pcs", "حفاضات بنطلون للكبار مقاس كبير - ١٤ قطعة", 430, "ad-care"),
          p("underpads-60x90", "Disposable Underpads 60x90 — 20pcs", "مفارش واقية ٦٠×٩٠ - ٢٠ قطعة", 340, "ad-care"),
        ],
      },
      {
        slug: "mobility-comfort",
        name: { en: "Mobility & Comfort", ar: "الحركة والراحة" },
        products: [
          p("walking-stick-adj", "Adjustable Walking Stick", "عصا مشي قابلة للتعديل", 380, "ad-mobility"),
          p("orthopedic-cushion", "Orthopedic Seat Cushion", "وسادة جلوس طبية", 520, "ad-mobility", { isNew: true }),
        ],
      },
      {
        slug: "elderly-skin",
        name: { en: "Sensitive Skin Care", ar: "عناية البشرة الحساسة" },
        products: [
          p("barrier-cream-zinc", "Zinc Barrier Cream 200ml", "كريم حاجز بالزنك ٢٠٠ مل", 230, "sk-white-tube"),
          p("no-rinse-cleansing-foam", "No-Rinse Cleansing Foam", "رغوة تنظيف بدون شطف", 285, "sk-white-tube"),
        ],
      },
    ],
  },
  {
    slug: "personal-care",
    name: { en: "Daily Personal Care", ar: "العناية اليومية" },
    subs: [
      {
        slug: "bath-shower",
        name: { en: "Bath & Shower", ar: "الاستحمام" },
        products: [
          p("shower-gel-750", "Moisturising Shower Gel 750ml", "جل استحمام مرطب ٧٥٠ مل", 195, "pc-shower", { featured: true, was: 240 }),
          p("exfoliating-body-scrub", "Exfoliating Body Scrub 250ml", "مقشر الجسم ٢٥٠ مل", 260, "pc-shower"),
          p("antibacterial-soap-4", "Antibacterial Soap Bar — 4 Pack", "صابون مضاد للبكتيريا - ٤ قطع", 90, "pc-soap"),
          p("loofah-body-brush", "Long-Handle Body Brush", "فرشاة الجسم بمقبض طويل", 145, "pc-brush"),
        ],
      },
      {
        slug: "deodorants",
        name: { en: "Deodorants", ar: "مزيلات العرق" },
        products: [
          p("roll-on-48h", "48H Roll-On Deodorant", "مزيل عرق رول أون ٤٨ ساعة", 95, "pc-deo", { featured: true }),
          p("dry-spray-deo", "Invisible Dry Spray Deodorant", "بخاخ مزيل عرق شفاف", 135, "pc-deo"),
          p("natural-deo-stick", "Aluminium-Free Deodorant Stick", "مزيل عرق خالي من الألومنيوم", 180, "pc-deo", { isNew: true }),
        ],
      },
      {
        slug: "body-lotion",
        name: { en: "Body Lotion", ar: "لوشن الجسم" },
        products: [
          p("body-lotion-400", "Nourishing Body Lotion 400ml", "لوشن الجسم المغذي ٤٠٠ مل", 215, "pc-lotion"),
          p("cocoa-body-butter", "Cocoa Body Butter 250ml", "زبدة الجسم بالكاكاو ٢٥٠ مل", 285, "pc-lotion", { was: 350 }),
        ],
      },
      {
        slug: "hand-care",
        name: { en: "Hand Care", ar: "العناية باليدين" },
        products: [
          p("hand-sanitiser-500", "Hand Sanitiser Gel 500ml", "جل معقم لليدين ٥٠٠ مل", 120, "pc-soap"),
          p("hand-cream-75", "Intensive Hand Cream 75ml", "كريم اليدين المكثف ٧٥ مل", 105, "pc-lotion"),
        ],
      },
    ],
  },
  {
    slug: "oral-care",
    name: { en: "Oral Care", ar: "العناية بالفم والأسنان" },
    subs: [
      {
        slug: "toothpaste",
        name: { en: "Toothpaste", ar: "معجون أسنان" },
        products: [
          p("whitening-toothpaste", "Whitening Toothpaste 100ml", "معجون أسنان مبيض ١٠٠ مل", 85, "or-toothpaste", { featured: true }),
          p("sensitive-toothpaste", "Sensitivity Relief Toothpaste", "معجون أسنان للحساسية", 110, "or-toothpaste", { was: 135 }),
          p("kids-toothpaste", "Kids Fluoride Toothpaste", "معجون أسنان للأطفال بالفلورايد", 65, "or-toothpaste"),
        ],
      },
      {
        slug: "toothbrushes",
        name: { en: "Toothbrushes", ar: "فرش الأسنان" },
        products: [
          p("soft-toothbrush-3", "Soft Bristle Toothbrush — 3 Pack", "فرشاة أسنان ناعمة - ٣ قطع", 75, "or-brush"),
          p("electric-toothbrush", "Rechargeable Electric Toothbrush", "فرشاة أسنان كهربائية", 1450, "or-brush", { featured: true, was: 1790 }),
          p("kids-toothbrush-2", "Kids Toothbrush — 2 Pack", "فرشاة أسنان للأطفال - قطعتان", 60, "or-brush"),
        ],
      },
      {
        slug: "mouthwash-floss",
        name: { en: "Mouthwash & Floss", ar: "غسول وخيط الأسنان" },
        products: [
          p("mouthwash-500", "Antibacterial Mouthwash 500ml", "غسول فم مضاد للبكتيريا ٥٠٠ مل", 130, "or-toothpaste"),
          p("dental-floss-50m", "Waxed Dental Floss 50m", "خيط تنظيف الأسنان ٥٠ متر", 55, "or-brush"),
          p("interdental-brushes", "Interdental Brushes — 8 Pack", "فرش ما بين الأسنان - ٨ قطع", 95, "or-brush", { isNew: true }),
        ],
      },
    ],
  },
  {
    slug: "men-care",
    name: { en: "Men's Care", ar: "العناية بالرجل" },
    subs: [
      {
        slug: "shaving",
        name: { en: "Shaving", ar: "الحلاقة" },
        products: [
          p("razor-5blade-4", "5-Blade Razor Cartridges — 4 Pack", "شفرات حلاقة ٥ شفرات - ٤ قطع", 320, "mn-shave", { featured: true, was: 395 }),
          p("shaving-foam-300", "Sensitive Shaving Foam 300ml", "رغوة حلاقة للبشرة الحساسة ٣٠٠ مل", 125, "mn-shave"),
          p("aftershave-balm", "Soothing Aftershave Balm", "بلسم ما بعد الحلاقة", 210, "mn-shave"),
        ],
      },
      {
        slug: "beard-care",
        name: { en: "Beard Care", ar: "العناية باللحية" },
        products: [
          p("beard-oil-50", "Conditioning Beard Oil 50ml", "زيت اللحية المرطب ٥٠ مل", 245, "mn-beard", { isNew: true }),
          p("beard-trimmer", "Cordless Beard Trimmer", "ماكينة تهذيب اللحية", 890, "mn-beard", { was: 1100 }),
          p("beard-brush", "Boar Bristle Beard Brush", "فرشاة اللحية", 165, "mn-beard"),
        ],
      },
      {
        slug: "men-skin",
        name: { en: "Men's Skin & Hair", ar: "بشرة وشعر الرجل" },
        products: [
          p("men-face-wash", "Charcoal Face Wash for Men 150ml", "غسول وجه بالفحم للرجال ١٥٠ مل", 185, "mn-shave"),
          p("men-anti-hairloss-shampoo", "Anti-Hairloss Shampoo for Men", "شامبو ضد تساقط الشعر للرجال", 295, "hr-white-trio"),
        ],
      },
    ],
  },
  {
    slug: "feminine-care",
    name: { en: "Feminine Care", ar: "العناية النسائية" },
    subs: [
      {
        slug: "sanitary-pads",
        name: { en: "Pads & Liners", ar: "فوط ولاينرز" },
        products: [
          p("sanitary-pads-night-16", "Night Sanitary Pads — 16pcs", "فوط صحية ليلية - ١٦ قطعة", 95, "fc-care", { featured: true }),
          p("sanitary-pads-day-20", "Day Sanitary Pads — 20pcs", "فوط صحية نهارية - ٢٠ قطعة", 85, "fc-care", { was: 105 }),
          p("panty-liners-40", "Daily Panty Liners — 40pcs", "لاينرز يومية - ٤٠ قطعة", 70, "fc-care"),
        ],
      },
      {
        slug: "intimate-wash",
        name: { en: "Intimate Wash", ar: "غسول نسائي" },
        products: [
          p("intimate-wash-250", "Gentle Intimate Wash 250ml", "غسول نسائي لطيف ٢٥٠ مل", 165, "fc-wash"),
          p("intimate-wipes-20", "Intimate Wipes — 20pcs", "مناديل نسائية - ٢٠ قطعة", 90, "fc-wash"),
        ],
      },
      {
        slug: "hair-removal",
        name: { en: "Hair Removal", ar: "إزالة الشعر" },
        products: [
          p("wax-strips-body", "Body Wax Strips — 20pcs", "شرائح شمع للجسم - ٢٠ قطعة", 140, "fc-wash"),
          p("epilator-women", "Rechargeable Epilator", "جهاز إزالة الشعر الكهربائي", 1180, "fc-wash", { was: 1450, featured: true }),
          p("hair-removal-cream", "Sensitive Hair Removal Cream", "كريم إزالة الشعر للبشرة الحساسة", 115, "fc-care"),
        ],
      },
    ],
  },
  {
    slug: "foot-care",
    name: { en: "Foot Care", ar: "العناية بالقدم" },
    subs: [
      {
        slug: "foot-treatments",
        name: { en: "Creams & Treatments", ar: "كريمات وعلاجات" },
        products: [
          p("cracked-heel-cream", "Cracked Heel Repair Cream 100ml", "كريم علاج تشققات القدم ١٠٠ مل", 165, "ft-care", { featured: true, was: 200 }),
          p("antifungal-foot-spray", "Antifungal Foot Spray", "بخاخ مضاد للفطريات للقدم", 195, "ft-care"),
        ],
      },
      {
        slug: "foot-sweat",
        name: { en: "Sweat & Odour", ar: "التعرق والروائح" },
        products: [
          p("anti-sweat-foot-powder", "Anti-Sweat Foot Powder 100g", "بودرة القدم لمنع التعرق ١٠٠ جم", 95, "ft-sweat", { featured: true }),
          p("medicated-foot-powder", "Medicated Foot Powder 200g", "بودرة طبية للقدم ٢٠٠ جم", 145, "ft-sweat", { was: 175 }),
          p("foot-deodorant-powder", "Foot Deodorising Powder", "بودرة إزالة روائح القدم", 110, "ft-sweat"),
          p("antiperspirant-foot-spray", "Antiperspirant Foot Spray 150ml", "بخاخ مضاد للتعرق للقدم ١٥٠ مل", 175, "ft-sweat", { isNew: true }),
          p("shoe-deodorising-powder", "Shoe Deodorising Powder 150g", "بودرة معطرة للأحذية ١٥٠ جم", 85, "ft-sweat"),
          p("sweat-absorbing-insole-pads", "Sweat-Absorbing Insole Pads", "نعال ماصة للعرق", 120, "ft-sweat"),
        ],
      },
      {
        slug: "foot-tools",
        name: { en: "Files & Tools", ar: "مبارد وأدوات" },
        products: [
          p("electric-foot-file", "Electric Callus Remover", "مبرد القدم الكهربائي", 520, "ft-tools", { isNew: true }),
          p("pumice-stone", "Natural Pumice Stone", "حجر الخفاف الطبيعي", 45, "ft-tools"),
          p("foot-soak-salts", "Foot Soak Salts 500g", "أملاح نقع القدم ٥٠٠ جم", 130, "ft-tools"),
        ],
      },
      {
        slug: "insoles",
        name: { en: "Insoles & Support", ar: "نعال ودعامات" },
        products: [
          p("gel-insoles", "Gel Comfort Insoles", "نعال جل مريحة", 185, "ft-insoles"),
          p("arch-support-insole", "Arch Support Orthotic Insole", "نعل طبي لدعم القوس", 320, "ft-insoles"),
        ],
      },
    ],
  },
  {
    slug: "vitamins",
    name: { en: "Vitamins & Supplements", ar: "الفيتامينات والمكملات" },
    subs: [
      {
        slug: "daily-vitamins",
        name: { en: "Daily Vitamins", ar: "فيتامينات يومية" },
        products: [
          p("multivitamin-60", "Daily Multivitamin — 60 Tablets", "فيتامينات متعددة يومية - ٦٠ قرص", 340, "vt-bottle", { featured: true }),
          p("vitamin-d3-1000", "Vitamin D3 1000 IU — 90 Softgels", "فيتامين د٣ ١٠٠٠ وحدة - ٩٠ كبسولة", 285, "vt-bottle", { was: 350 }),
          p("vitamin-c-1000", "Vitamin C 1000mg — 60 Tablets", "فيتامين سي ١٠٠٠ مجم - ٦٠ قرص", 220, "vt-bottle"),
          p("omega-3-fish-oil", "Omega-3 Fish Oil — 120 Softgels", "أوميجا ٣ زيت السمك - ١٢٠ كبسولة", 465, "vt-bottle"),
        ],
      },
      {
        slug: "beauty-supplements",
        name: { en: "Hair, Skin & Nails", ar: "الشعر والبشرة والأظافر" },
        products: [
          p("biotin-10000", "Biotin 10,000mcg — 60 Capsules", "بيوتين ١٠٠٠٠ ميكروجرام - ٦٠ كبسولة", 395, "vt-capsules", { featured: true, isNew: true }),
          p("collagen-powder-300", "Marine Collagen Powder 300g", "بودرة الكولاجين البحري ٣٠٠ جم", 890, "vt-capsules", { was: 1100 }),
        ],
      },
      {
        slug: "minerals",
        name: { en: "Minerals", ar: "المعادن" },
        products: [
          p("iron-folic-60", "Iron + Folic Acid — 60 Tablets", "حديد + حمض الفوليك - ٦٠ قرص", 195, "vt-bottle"),
          p("zinc-50mg", "Zinc 50mg — 100 Tablets", "زنك ٥٠ مجم - ١٠٠ قرص", 165, "vt-bottle"),
          p("magnesium-400", "Magnesium 400mg — 60 Capsules", "ماغنيسيوم ٤٠٠ مجم - ٦٠ كبسولة", 240, "vt-capsules"),
        ],
      },
      {
        slug: "kids-vitamins",
        name: { en: "Kids Vitamins", ar: "فيتامينات الأطفال" },
        products: [
          p("kids-gummy-vitamins", "Kids Multivitamin Gummies — 60", "فيتامينات جيلي للأطفال - ٦٠ قطعة", 310, "vt-capsules"),
          p("kids-vitamin-d-drops", "Kids Vitamin D Drops 10ml", "نقط فيتامين د للأطفال ١٠ مل", 175, "vt-bottle"),
        ],
      },
    ],
  },
  {
    slug: "medical-supplies",
    name: { en: "Medical Supplies", ar: "المستلزمات الطبية" },
    subs: [
      {
        slug: "first-aid",
        name: { en: "First Aid", ar: "الإسعافات الأولية" },
        products: [
          p("first-aid-kit-home", "Home First Aid Kit — 90 Pieces", "حقيبة إسعافات أولية منزلية - ٩٠ قطعة", 420, "md-firstaid", { featured: true }),
          p("adhesive-plasters-40", "Adhesive Plasters — 40pcs", "بلاستر لاصق - ٤٠ قطعة", 65, "md-firstaid"),
          p("sterile-gauze-pack", "Sterile Gauze Pads — 25pcs", "شاش معقم - ٢٥ قطعة", 80, "md-firstaid"),
          p("antiseptic-solution", "Antiseptic Skin Solution 250ml", "محلول مطهر للجلد ٢٥٠ مل", 95, "md-supplies"),
        ],
      },
      {
        slug: "health-devices",
        name: { en: "Health Devices", ar: "أجهزة طبية" },
        products: [
          p("digital-bp-monitor", "Digital Blood Pressure Monitor", "جهاز قياس ضغط الدم الرقمي", 1650, "md-device", { featured: true, was: 1990 }),
          p("infrared-thermometer", "Infrared Forehead Thermometer", "ترمومتر الجبهة بالأشعة", 680, "md-device"),
          p("pulse-oximeter", "Fingertip Pulse Oximeter", "جهاز قياس تشبع الأكسجين", 540, "md-device"),
          p("nebuliser-compressor", "Compressor Nebuliser", "جهاز استنشاق (نبيوليزر)", 1350, "md-device", { isNew: true }),
        ],
      },
      {
        slug: "supports-braces",
        name: { en: "Supports & Braces", ar: "دعامات ومشدات" },
        products: [
          p("knee-support-brace", "Elastic Knee Support", "دعامة الركبة المرنة", 285, "md-supplies"),
          p("lumbar-back-belt", "Lumbar Support Belt", "حزام دعم الظهر", 420, "md-supplies"),
          p("wrist-splint", "Adjustable Wrist Splint", "جبيرة الرسغ القابلة للتعديل", 230, "md-supplies"),
        ],
      },
      {
        slug: "masks-gloves",
        name: { en: "Masks & Gloves", ar: "كمامات وقفازات" },
        products: [
          p("surgical-masks-50", "3-Ply Surgical Masks — 50pcs", "كمامات جراحية ٣ طبقات - ٥٠ قطعة", 75, "md-masks"),
          p("nitrile-gloves-100", "Nitrile Gloves — 100pcs", "قفازات نيتريل - ١٠٠ قطعة", 260, "md-masks"),
        ],
      },
    ],
  },
  {
    slug: "fragrance",
    name: { en: "Fragrance", ar: "العطور" },
    subs: [
      {
        slug: "women-fragrance",
        name: { en: "For Her", ar: "عطور نسائية" },
        products: [
          p("rose-taif-edp", "Rose Taif Eau de Parfum 100ml", "ورد الطائف أو دو بارفان ١٠٠ مل", 1450, "fr-clear", { featured: true }),
          p("jasmine-body-mist", "Jasmine Body Mist 250ml", "رذاذ الجسم بالياسمين ٢٥٠ مل", 320, "fr-tall", { was: 400 }),
        ],
      },
      {
        slug: "men-fragrance",
        name: { en: "For Him", ar: "عطور رجالية" },
        products: [
          p("oud-noir-edp", "Oud Noir Eau de Parfum 100ml", "عود نوار أو دو بارفان ١٠٠ مل", 1690, "fr-hand", { featured: true, was: 1990 }),
          p("citrus-sport-edt", "Citrus Sport Eau de Toilette", "سيتروس سبورت أو دو تواليت", 620, "fr-bokeh"),
        ],
      },
      {
        slug: "body-mists",
        name: { en: "Body Mists", ar: "معطرات الجسم" },
        products: [
          p("amber-musk-mist", "Amber Musk Body Mist 250ml", "رذاذ الجسم عنبر ومسك ٢٥٠ مل", 245, "fr-tall", { isNew: true }),
          p("vanilla-body-mist", "Vanilla Body Mist 250ml", "رذاذ الجسم بالفانيليا ٢٥٠ مل", 245, "fr-clear"),
        ],
      },
    ],
  },
  {
    slug: "home-essentials",
    name: { en: "Home Essentials", ar: "مستلزمات المنزل" },
    subs: [
      {
        slug: "tissues-paper",
        name: { en: "Tissues & Paper", ar: "مناديل وورق" },
        products: [
          p("facial-tissues-6", "Facial Tissues — 6 Boxes", "مناديل وجه - ٦ علب", 165, "hm-tissue", { featured: true, was: 200 }),
          p("kitchen-towel-4", "Kitchen Paper Towels — 4 Rolls", "مناديل مطبخ - ٤ لفات", 145, "hm-tissue"),
          p("toilet-rolls-12", "Toilet Tissue — 12 Rolls", "ورق تواليت - ١٢ لفة", 210, "hm-tissue"),
        ],
      },
      {
        slug: "cleaning",
        name: { en: "Cleaning", ar: "منظفات" },
        products: [
          p("multi-surface-cleaner", "Multi-Surface Cleaner 1L", "منظف متعدد الأسطح ١ لتر", 95, "hm-clean"),
          p("dishwashing-liquid", "Dishwashing Liquid 900ml", "سائل غسيل الأطباق ٩٠٠ مل", 85, "hm-clean"),
          p("floor-disinfectant", "Floor Disinfectant 1.5L", "مطهر الأرضيات ١.٥ لتر", 120, "hm-clean", { was: 150 }),
        ],
      },
      {
        slug: "laundry",
        name: { en: "Laundry", ar: "غسيل الملابس" },
        products: [
          p("laundry-powder-3kg", "Automatic Laundry Powder 3kg", "مسحوق غسيل أوتوماتيك ٣ كجم", 340, "hm-clean", { featured: true }),
          p("fabric-softener-2l", "Fabric Softener 2L", "منعم الأقمشة ٢ لتر", 175, "hm-clean"),
        ],
      },
    ],
  },
  {
    slug: "devices-appliances",
    name: { en: "Devices & Appliances", ar: "الأجهزة والمستلزمات الكهربائية" },
    subs: [
      {
        slug: "mens-shavers",
        name: { en: "Men's Shavers & Trimmers", ar: "ماكينات حلاقة الرجال" },
        products: [
          p("rotary-shaver-wet-dry", "Rotary Electric Shaver — Wet & Dry", "ماكينة حلاقة دوارة - جاف ومبلل", 2450, "dv-shaver-men", { featured: true, was: 2990 }),
          p("foil-shaver-rechargeable", "Rechargeable Foil Shaver", "ماكينة حلاقة بشفرة رقائقية قابلة للشحن", 1850, "dv-shaver-men", { was: 2200 }),
          p("beard-trimmer-20-settings", "Beard Trimmer — 20 Length Settings", "ماكينة تهذيب اللحية - ٢٠ درجة طول", 1290, "dv-clipper", { isNew: true }),
          p("hair-clipper-pro", "Professional Hair Clipper", "ماكينة قص شعر احترافية", 1650, "dv-clipper", { featured: true }),
          p("nose-ear-trimmer", "Nose & Ear Hair Trimmer", "ماكينة تهذيب شعر الأنف والأذن", 420, "dv-clipper"),
          p("grooming-kit-10in1", "10-in-1 Grooming Kit", "طقم عناية ١٠ في ١", 1980, "dv-clipper", { was: 2400 }),
        ],
      },
      {
        slug: "womens-shavers",
        name: { en: "Women's Shavers & Epilators", ar: "ماكينات إزالة الشعر النسائية" },
        products: [
          p("lady-shaver-cordless", "Cordless Lady Shaver", "ماكينة حلاقة نسائية لاسلكية", 890, "dv-shaver-women", { featured: true }),
          p("epilator-wet-dry", "Wet & Dry Epilator", "جهاز إزالة الشعر جاف ومبلل", 2190, "dv-shaver-women", { was: 2650 }),
          p("ipl-hair-removal", "IPL Hair Removal Device", "جهاز إزالة الشعر بالليزر المنزلي IPL", 5900, "dv-ipl", { featured: true, isNew: true, was: 7200 }),
          p("facial-hair-trimmer", "Precision Facial Hair Trimmer", "ماكينة تهذيب شعر الوجه الدقيقة", 480, "dv-shaver-women" ),
          p("bikini-trimmer", "Bikini Line Trimmer", "ماكينة تهذيب منطقة البيكيني", 620, "dv-shaver-women"),
        ],
      },
      {
        slug: "hair-styling-tools",
        name: { en: "Straighteners & Dryers", ar: "مكواة الشعر والسشوار" },
        products: [
          p("ceramic-straightener", "Ceramic Hair Straightener", "مكواة شعر سيراميك", 1350, "dv-straightener", { featured: true, was: 1690 }),
          p("titanium-straightener-pro", "Titanium Pro Straightener", "مكواة شعر تيتانيوم احترافية", 2450, "dv-straightener", { isNew: true }),
          p("ionic-hair-dryer-2200", "Ionic Hair Dryer 2200W", "سشوار أيوني ٢٢٠٠ وات", 1490, "dv-dryer", { featured: true }),
          p("travel-hair-dryer", "Compact Travel Hair Dryer", "سشوار سفر صغير", 690, "dv-dryer", { was: 850 }),
          p("curling-wand-32", "Curling Wand 32mm", "جهاز تجعيد الشعر ٣٢ مم", 980, "dv-curler"),
          p("hot-air-brush", "Hot Air Volumising Brush", "فرشاة الهواء الساخن للتصفيف", 1180, "dv-curler", { isNew: true }),
          p("multi-styler-5in1", "5-in-1 Multi Styler Set", "طقم تصفيف ٥ في ١", 3200, "dv-straightener", { was: 3900 }),
        ],
      },
      {
        slug: "personal-care-devices",
        name: { en: "Personal Care Devices", ar: "أجهزة العناية الشخصية" },
        products: [
          p("facial-cleansing-brush", "Sonic Facial Cleansing Brush", "فرشاة تنظيف الوجه بالموجات", 890, "dv-facial", { isNew: true }),
          p("electric-callus-device", "Electric Callus Remover", "جهاز إزالة الجلد الميت الكهربائي", 520, "dv-facial"),
          p("manicure-pedicure-set", "Electric Manicure & Pedicure Set", "طقم مانيكير وبديكير كهربائي", 760, "dv-facial", { was: 950 }),
          p("led-makeup-mirror", "LED Lighted Makeup Mirror", "مرآة مكياج بإضاءة LED", 1150, "dv-mirror", { featured: true }),
        ],
      },
      {
        slug: "device-accessories",
        name: { en: "Accessories & Spares", ar: "ملحقات وقطع غيار" },
        products: [
          p("shaver-replacement-heads", "Shaver Replacement Heads", "رؤوس بديلة لماكينة الحلاقة", 680, "dv-shaver-men"),
          p("clipper-guard-set", "Clipper Guard Comb Set", "طقم أمشاط ماكينة القص", 240, "dv-clipper"),
          p("heat-resistant-mat", "Heat-Resistant Styling Mat", "حصيرة مقاومة للحرارة", 180, "dv-straightener"),
        ],
      },
    ],
  },
];

/** Brands the marketplace resells — shown as a browsable rail. */
export const BRANDS = [
  "Nivea", "Vaseline", "Garnier", "L'Oréal", "Pantene", "Head & Shoulders",
  "Johnson's", "Pampers", "Molfix", "Sensodyne", "Signal", "Oral-B",
  "Gillette", "Always", "Eva", "Bioderma", "La Roche-Posay", "CeraVe",
  "Neutrogena", "Centrum", "Dettol", "Fine", "Persil", "Abu Auf",
  "Philips", "Braun", "Remington", "Babyliss", "Panasonic", "Kemei",
];

export const STORE_SETTINGS = {
  storeName: { en: "Reem", ar: "ريم" },
  currency: "EGP",
  currencySymbol: "L.E",
  shippingFee: 40,
  freeShippingThreshold: 600,
};

export const LAUNCH_REVIEWS = [
  { name: "لمى.", rating: 5, comment: "طلبت حفاضات ومستلزمات البيت مع بعض ووصلوا في يومين. أرخص من الصيدلية عندنا." },
  { name: "Sara M.", rating: 5, comment: "Ordered the blood pressure monitor for my dad — arrived sealed, cash on delivery, no hassle." },
  { name: "منى ع.", rating: 4, comment: "التشكيلة كبيرة جداً، لقيت كل حاجة كنت محتاجاها في أوردر واحد." },
  { name: "نورهان س.", rating: 5, comment: "الأسعار كويسة والتوصيل كان أسرع من المتوقع. هطلب تاني أكيد." },
  { name: "Ahmed K.", rating: 5, comment: "Finally a place that stocks adult diapers without me calling five pharmacies." },
];
