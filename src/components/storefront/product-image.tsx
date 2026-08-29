"use client";

import Image from "next/image";
import { ProductIllustration, hasIllustration } from "./product-illustration";

/**
 * Department identity used by the placeholder, keyed by the department
 * slug that seeding writes as a product's first tag.
 */
const DEPARTMENT_TINT: Record<string, string> = {
  "skin-care": "#fdeef0",
  "hair-care": "#f3eefd",
  "makeup": "#fdeef7",
  "mother-baby": "#eef6fd",
  "adult-care": "#eef1f6",
  "personal-care": "#eefdf6",
  "oral-care": "#eef9fd",
  "men-care": "#eff0f2",
  "feminine-care": "#fdeef5",
  "foot-care": "#fdf4ee",
  "vitamins": "#fdf9ee",
  "medical-supplies": "#eef4fd",
  "fragrance": "#fdeeee",
  "home-essentials": "#f0fdf4",
  "devices-appliances": "#eef2fd",
};

/**
 * A product's picture, or a deliberate stand-in when there isn't one.
 *
 * Free stock libraries have genuinely poor coverage for packaged
 * everyday goods — searching "diapers" returns lingerie and industrial
 * smokestacks — so rather than dress a nappy listing in a stethoscope
 * photo, products in those aisles ship with no image and render this
 * branded card instead.
 *
 * That is a deliberate trade: a shopper who sees a wrong photo has been
 * misled about what they're buying, while an obviously-pending image is
 * merely incomplete. It also reads to the client as "photography to
 * come" rather than as a bug. Uploading a real photo in the admin
 * replaces it with no code change.
 */
export function ProductImage({
  src,
  alt,
  departmentSlug,
  aisleSlug,
  sizes,
  priority = false,
  className = "",
}: {
  src?: string;
  alt: string;
  departmentSlug?: string;
  /** Second tag on a seeded product; selects the drawn illustration. */
  aisleSlug?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      // `fill` makes the image position:absolute, so it sizes itself
      // against the nearest positioned ancestor. Relying on every caller
      // to remember `relative` is a contract nothing enforces — miss it
      // once and a 56px thumbnail paints across the whole page. This
      // wrapper supplies the containing block itself; it is a no-op for
      // callers that already position their own box.
      <span className="relative block h-full w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          // Merge rather than replace: a caller passing transition or
          // sizing classes should not silently lose object-cover and get
          // a stretched image.
          className={`object-cover ${className}`}
        />
      </span>
    );
  }

  // Prefer a drawn illustration of the actual product over a generic
  // department card — it tells the shopper what they're buying.
  if (hasIllustration(aisleSlug)) {
    return <ProductIllustration aisleSlug={aisleSlug} />;
  }

  const tint = DEPARTMENT_TINT[departmentSlug ?? ""] ?? "#f6f5f3";

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
      style={{ backgroundColor: tint }}
      // Decorative: the product name is already announced next to it.
      aria-hidden
    >
      {/* A drawn container rather than an emoji. Emoji render in each
          platform's own cartoon style, which never matches the rest of
          the page and reads as filler — the thing the client noticed.
          A neutral bottle is quiet, sits in the brand's line weight, and
          looks like photography that has not arrived yet. */}
      <svg viewBox="0 0 48 64" className="h-1/2 w-auto max-h-16" fill="none">
        <path
          d="M18 12h12v6l6 8v30a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V26l6-8v-6Z"
          stroke="#9c948c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="19" y="5" width="10" height="7" rx="2" stroke="#9c948c" strokeWidth="2" />
        <path d="M14 38h20" stroke="#9c948c" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Reem
      </span>
    </div>
  );
}
