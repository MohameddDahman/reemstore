/**
 * Curated Unsplash photo IDs for demo imagery.
 *
 * Every ID here was opened and eyeballed before being added: they are all
 * genuine cosmetics/skincare shots, and photos showing a competitor's
 * branding (Chanel, Glossier, The Ordinary, NARS, Bobbi Brown, Clinique,
 * Lancôme, Versace, Prada, Zara, Loewe, Maui Moisture…) were deliberately
 * excluded — putting another brand's packaging on Reem's storefront is
 * not something a real store can ship.
 *
 * These remain PLACEHOLDERS. Replace them with Reem's own product
 * photography via the admin dashboard's image uploader before launch.
 */

const P = "https://images.unsplash.com/photo-";

/** Square crop, for product cards/galleries. */
export function productImg(id: string, size = 900) {
  return `${P}${id}?w=${size}&h=${size}&q=80&auto=format&fit=crop`;
}

/** Landscape crop, for category cards and promo tiles. */
export function wideImg(id: string, w = 900, h = 700) {
  return `${P}${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;
}

// --- Skincare ---
export const SK = {
  creamSwatch: "1585945037805-5fd82c2e60b1",
  amberDropper: "1608571423902-eed4a5ad8108",
  pinkFlatlay: "1583209814683-c023dd293cc6",
  copperBottles: "1631730486572-226d1f595b68",
  whiteTube: "1616750819456-5cdee9b85d22",
  apothecary: "1612817288484-6f916006741a",
  modelRoutine: "1670201203116-26644750a726",
} as const;

// --- Makeup ---
export const MK = {
  roseGoldFlatlay: "1596462502278-27bfdc403348",
  palenteInHand: "1596704017254-9b121068fb31",
  powdersBrushes: "1515688594390-b649af70d282",
  whiteFlatlay: "1583784561105-a674080f391e",
  redLipstick: "1626895872564-b691b6877b83",
  lipSwatches: "1631214499500-2e34edcaccfe",
  flatlayWhite2: "1723150512429-bfa92988d845",
  coralRender: "1676570092589-a6c09ecbb373",
  brushesYellow: "1679623100266-db82be84f5f3",
} as const;

// --- Fragrance ---
export const FR = {
  clearBottle: "1592400374401-002fe1d25961",
  tallBottle: "1625173709697-7dc5e371349f",
  bottleInHand: "1641248775395-2b938a7c099a",
  bottlesBokeh: "1615634260167-c8cdede054de",
} as const;

// --- Hair ---
export const HR = {
  beigePump: "1747858989102-cca0f4dc4a11",
  whiteTrio: "1631729371254-42c2892f0e6e",
  pinkDuo: "1610705267928-1b9f2fa7f1c5",
  hairWash: "1546060432-b90a6441048f",
} as const;

/** productSlug -> [mainImageId, hoverImageId] */
export const PRODUCT_IMAGES: Record<string, [string, string]> = {
  // Skincare
  "rose-radiance-serum": [SK.amberDropper, SK.creamSwatch],
  "hydra-bloom-moisturizer": [SK.whiteTube, SK.creamSwatch],
  "gentle-silk-cleanser": [SK.apothecary, SK.whiteTube],
  "barrier-repair-night-cream": [SK.copperBottles, SK.creamSwatch],
  "niacinamide-10-serum": [SK.amberDropper, SK.pinkFlatlay],
  "daily-mineral-sunscreen-spf50": [SK.whiteTube, SK.modelRoutine],
  "clay-detox-mask": [SK.creamSwatch, SK.apothecary],

  // Makeup
  "velvet-matte-lipstick": [MK.redLipstick, MK.lipSwatches],
  "silk-foundation-spf30": [MK.whiteFlatlay, MK.roseGoldFlatlay],
  "golden-hour-eyeshadow": [MK.palenteInHand, MK.brushesYellow],
  "soft-matte-concealer": [MK.whiteFlatlay, MK.flatlayWhite2],
  "glow-liquid-blush": [MK.powdersBrushes, MK.coralRender],
  "precision-brow-pencil": [MK.flatlayWhite2, MK.roseGoldFlatlay],
  "lash-volume-mascara": [MK.roseGoldFlatlay, MK.powdersBrushes],

  // Fragrance
  "reem-oud-noir-edp": [FR.clearBottle, FR.bottleInHand],
  "blush-jasmine-mist": [FR.tallBottle, FR.bottlesBokeh],
  "amber-musk-body-mist": [FR.bottleInHand, FR.clearBottle],
  "rose-taif-edp": [FR.clearBottle, FR.tallBottle],

  // Hair
  "argan-repair-hair-oil": [HR.whiteTrio, HR.beigePump],
  "repair-hair-mask": [HR.pinkDuo, HR.whiteTrio],
  "curl-define-cream": [HR.beigePump, HR.pinkDuo],
  "scalp-renew-serum": [HR.whiteTrio, HR.hairWash],
};

/** categorySlug -> image id */
export const CATEGORY_IMAGES: Record<string, string> = {
  skincare: SK.pinkFlatlay,
  makeup: MK.roseGoldFlatlay,
  fragrance: FR.clearBottle,
  "hair-care": HR.pinkDuo,
};
