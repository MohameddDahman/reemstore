/**
 * Placeholder imagery for the demo catalogue.
 *
 * Every id here was opened and looked at before being added. Two rules
 * were applied throughout:
 *
 *  1. No competitor packaging. Photos showing a real brand's label
 *     (Colgate, Pampers, Chanel, Glossier, The Ordinary, NARS, Bobbi
 *     Brown, Clinique, Lancôme, Versace, Prada, Zara, Loewe…) were
 *     rejected — a marketplace can resell those brands, but it can't put
 *     their packaging on a differently-named product.
 *  2. Nothing that misdescribes the goods. Catalogue products carry
 *     generic descriptive names, so the photos are generic too.
 *
 * These are placeholders. Real product photography goes in through the
 * admin image uploader before launch; a customer receiving a different
 * bottle than the one pictured is a real problem, not a cosmetic one.
 */

const P = "https://images.unsplash.com/photo-";

/** Square crop, for product cards and galleries. */
export function productImg(id: string, size = 800) {
  return `${P}${id}?w=${size}&h=${size}&q=80&auto=format&fit=crop`;
}

/** Landscape crop, for department tiles and promo banners. */
export function wideImg(id: string, w = 900, h = 700) {
  return `${P}${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;
}

/**
 * Every image key the catalogue references. Some keys deliberately share
 * a photo where the departments are visually adjacent (a bathroom-counter
 * shot serves soap, deodorant and men's grooming equally well) — the
 * client's real photography will separate them.
 */
export const IMAGE_POOL: Record<string, string> = {
  // Skin care
  "sk-tube": "1616750819456-5cdee9b85d22",
  "sk-white-tube": "1616750819456-5cdee9b85d22",
  "sk-dropper": "1608571423902-eed4a5ad8108",
  "sk-swatch": "1585945037805-5fd82c2e60b1",
  "sk-copper": "1631730486572-226d1f595b68",
  "sk-apothecary": "1612817288484-6f916006741a",
  "sk-pink-flatlay": "1583209814683-c023dd293cc6",
  "sk-model": "1670201203116-26644750a726",

  // Makeup
  "mk-rose-flatlay": "1596462502278-27bfdc403348",
  "mk-palette-hand": "1596704017254-9b121068fb31",
  "mk-powders": "1515688594390-b649af70d282",
  "mk-white-flatlay": "1583784561105-a674080f391e",
  "mk-red-lipstick": "1626895872564-b691b6877b83",
  "mk-lip-swatches": "1631214499500-2e34edcaccfe",
  "mk-flatlay2": "1723150512429-bfa92988d845",
  "mk-coral-render": "1676570092589-a6c09ecbb373",

  // Hair
  "hr-white-trio": "1631729371254-42c2892f0e6e",
  "hr-beige-pump": "1747858989102-cca0f4dc4a11",
  "hr-pink-duo": "1610705267928-1b9f2fa7f1c5",
  "hr-wash": "1546060432-b90a6441048f",

  // Fragrance
  "fr-clear": "1592400374401-002fe1d25961",
  "fr-tall": "1625173709697-7dc5e371349f",
  "fr-hand": "1641248775395-2b938a7c099a",
  "fr-bokeh": "1615634260167-c8cdede054de",

  // Oral care
  "or-toothpaste": "1588774583125-bac783343696",
  "or-brush": "1609840113564-ab4aba4956c4",

  // Vitamins
  "vt-bottle": "1544829894-eb023ba95a38",
  "vt-capsules": "1664956618021-73c47736845e",

  // Medical
  "md-supplies": "1603398938378-e54eab446dde",
  "md-firstaid": "1603398938378-e54eab446dde",
  "md-device": "1505751172876-fa1923c5c528",

  // Home essentials
  "hm-clean": "1563453392212-326f5e854473",
  "hm-tissue": "1628177142898-93e36e4e3a50",

  // Daily personal care
  "pc-soap": "1656214286228-08fdbf520d1e",
  "pc-shower": "1645567455251-334ed4702f9b",
  "pc-lotion": "1645567455251-334ed4702f9b",
  "pc-deo": "1656214286228-08fdbf520d1e",
  "pc-brush": "1656214286228-08fdbf520d1e",

  // Men's care
  "mn-shave": "1524230616393-d6229fcd2eff",
  "mn-beard": "1672642150228-3fcd5826ec26",

  // Mother & baby
  "bb-diapers": "1622290319146-7b63df48a635",
  "bb-wipes": "1622290319146-7b63df48a635",
  "bb-bath": "1622290319146-7b63df48a635",
  "bb-bottle": "1622290319146-7b63df48a635",

  // Adult care
  "ad-care": "1603398938378-e54eab446dde",

  // Feminine care
  "fc-care": "1616750819456-5cdee9b85d22",
  "fc-wash": "1645567455251-334ed4702f9b",

  // Foot care
  "ft-care": "1616750819456-5cdee9b85d22",
  "ft-tools": "1656214286228-08fdbf520d1e",
};

/** Falls back to a neutral bottle shot so a missing key never breaks a card. */
export function imgFor(key: string, size = 800) {
  return productImg(IMAGE_POOL[key] ?? IMAGE_POOL["sk-tube"], size);
}

/** Department tile artwork, keyed by department slug. */
export const DEPARTMENT_IMAGES: Record<string, string> = {
  "skin-care": "sk-pink-flatlay",
  "hair-care": "hr-pink-duo",
  makeup: "mk-rose-flatlay",
  "mother-baby": "bb-diapers",
  "adult-care": "ad-care",
  "personal-care": "pc-soap",
  "oral-care": "or-toothpaste",
  "men-care": "mn-shave",
  "feminine-care": "fc-wash",
  "foot-care": "ft-care",
  vitamins: "vt-capsules",
  "medical-supplies": "md-device",
  fragrance: "fr-clear",
  "home-essentials": "hm-clean",
};

/** Hero carousel slides — big landscape artwork behind the copy. */
export const HERO_IMAGES = {
  everything: "1583209814683-c023dd293cc6",
  baby: "1622290319146-7b63df48a635",
  vitamins: "1664956618021-73c47736845e",
  home: "1563453392212-326f5e854473",
};
