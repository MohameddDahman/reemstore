"use client";

import Image from "next/image";
import { ProductIllustration, hasIllustration } from "./product-illustration";

/**
 * Department identity used by the placeholder, keyed by the department
 * slug that seeding writes as a product's first tag.
 */
const DEPARTMENT_LOOK: Record<string, { icon: string; tint: string }> = {
  "skin-care": { icon: "🧴", tint: "#fdeef0" },
  "hair-care": { icon: "💇‍♀️", tint: "#f3eefd" },
  makeup: { icon: "💄", tint: "#fdeef7" },
  "mother-baby": { icon: "🍼", tint: "#eef6fd" },
  "adult-care": { icon: "🧑‍🦳", tint: "#eef1f6" },
  "personal-care": { icon: "🧼", tint: "#eefdf6" },
  "oral-care": { icon: "🦷", tint: "#eef9fd" },
  "men-care": { icon: "🧔", tint: "#eff0f2" },
  "feminine-care": { icon: "🌸", tint: "#fdeef5" },
  "foot-care": { icon: "🦶", tint: "#fdf4ee" },
  vitamins: { icon: "💊", tint: "#fdf9ee" },
  "medical-supplies": { icon: "🩺", tint: "#eef4fd" },
  fragrance: { icon: "🌹", tint: "#fdeeee" },
  "home-essentials": { icon: "🏠", tint: "#f0fdf4" },
  "devices-appliances": { icon: "🔌", tint: "#eef2fd" },
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

  const look = DEPARTMENT_LOOK[departmentSlug ?? ""] ?? { icon: "🛍️", tint: "#f6f5f3" };

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-center"
      style={{ backgroundColor: look.tint }}
      // Decorative: the product name is already announced next to it.
      aria-hidden
    >
      <span className="text-3xl leading-none opacity-80 sm:text-4xl">{look.icon}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Reem
      </span>
    </div>
  );
}
