"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { REVEAL_VIEWPORT, revealFrom, revealTo, revealTransition } from "@/lib/reveal";

/**
 * Three merchandising tiles under the hero — the "shop this offer" blocks
 * Sephora and Source Beauty use to route people into a category fast.
 * Content is intentionally static: these are evergreen entry points, not
 * time-limited campaigns (those live in the admin-managed banners).
 */
// Photo ids mirror convex/lib/stockImages.ts — curated, unbranded
// cosmetics shots. Swap for Reem's own photography before launch.
const UNSPLASH = "https://images.unsplash.com/photo-";
const tileImg = (id: string) => `${UNSPLASH}${id}?w=900&h=700&q=80&auto=format&fit=crop`;

const TILES = [
  {
    href: "/category/skin-care",
    image: tileImg("1670201203116-26644750a726"),
    en: { kicker: "Skincare", title: "Build your routine", cta: "Shop skincare" },
    ar: { kicker: "العناية بالبشرة", title: "ابني روتينك", cta: "تسوقي العناية" },
  },
  {
    href: "/category/makeup",
    image: tileImg("1596462502278-27bfdc403348"),
    en: { kicker: "Makeup", title: "Every shade, matched", cta: "Shop makeup" },
    ar: { kicker: "المكياج", title: "كل درجة تناسبك", cta: "تسوقي المكياج" },
  },
  {
    href: "/category/fragrance",
    image: tileImg("1592400374401-002fe1d25961"),
    en: { kicker: "Fragrance", title: "Find your signature", cta: "Shop fragrance" },
    ar: { kicker: "العطور", title: "اكتشفي توقيعك", cta: "تسوقي العطور" },
  },
] as const;

export function PromoTiles() {
  const locale = useLocale() as "ar" | "en";

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {TILES.map((tile, i) => {
          const copy = tile[locale];
          return (
            <motion.div
              key={tile.href}
              initial={revealFrom}
              whileInView={revealTo}
              viewport={REVEAL_VIEWPORT}
              transition={revealTransition(i)}
            >
              <Link
                href={tile.href}
                className="group relative flex aspect-[16/10] items-end overflow-hidden rounded-xl bg-cream-soft md:aspect-[4/3]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${tile.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="relative w-full p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
                    {copy.kicker}
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-white sm:text-2xl">
                    {copy.title}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white">
                    {copy.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
