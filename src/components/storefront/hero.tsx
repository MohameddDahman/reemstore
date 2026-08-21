"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { HeroSceneLoader } from "./hero-scene-loader";

/**
 * Commerce-first hero, in the mould of Source Beauty / Sephora: the live
 * promo is the headline. Copy comes from the admin-managed "hero" banner
 * when one is active, so the client can change the offer without a
 * deploy; the brand line below is the evergreen fallback.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const locale = useLocale() as "ar" | "en";
  const ref = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollProgressRef.current = v;
  });

  const heroBanners = useQuery(api.banners.active, { type: "hero" });
  const banner = heroBanners?.[0];

  const eyebrow = banner ? banner.subtitle?.[locale] : t("eyebrow");
  const headline = banner ? banner.title[locale] : t("title").replace("\n", " ");
  const ctaLabel = banner?.ctaText?.[locale] ?? t("cta");
  const ctaHref = banner?.ctaLink ?? "/category/skincare";

  return (
    <section
      ref={ref}
      className="relative grid min-h-[78vh] grid-cols-1 items-center overflow-hidden bg-cream md:min-h-[70vh] md:grid-cols-2"
    >
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/2 md:block">
        <HeroSceneLoader scrollProgress={scrollProgressRef} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{
          background: "radial-gradient(70% 45% at 80% 12%, rgba(215,38,61,0.10), transparent)",
        }}
      />

      <div className="relative z-10 px-5 py-16 sm:px-8 md:ps-16 md:py-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl font-heading text-4xl font-black leading-[1.02] tracking-tight text-ink sm:text-5xl md:text-6xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <Link
            href={ctaHref}
            className="rounded-full bg-ink px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.15em] text-white transition-transform hover:scale-[1.03]"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/category/makeup"
            className="rounded-full border border-ink/20 px-8 py-3.5 text-[12px] font-medium uppercase tracking-[0.15em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            {tc("shopNow")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
