"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Slide = {
  href: string;
  image: string;
  /** Tint behind the artwork so copy stays legible before the image loads. */
  tint: string;
  en: { kicker: string; title: string; sub: string; cta: string };
  ar: { kicker: string; title: string; sub: string; cta: string };
};

const U = "https://images.unsplash.com/photo-";
const art = (id: string) => `${U}${id}?w=1600&h=900&q=80&auto=format&fit=crop`;

const SLIDES: Slide[] = [
  {
    href: "/category/mother-baby",
    image: art("1622290319146-7b63df48a635"),
    tint: "#f6ecd9",
    en: {
      kicker: "Mother & Baby",
      title: "Diapers, wipes and\nformula — delivered",
      sub: "Bulk packs at better prices. Cash on delivery, anywhere in Egypt.",
      cta: "Shop Mother & Baby",
    },
    ar: {
      kicker: "الأم والطفل",
      title: "حفاضات ومناديل\nوكل مستلزمات طفلك",
      sub: "عبوات جامبو بأسعار الصيدلية. الدفع عند الاستلام في كل مصر.",
      cta: "تسوقي قسم الأم والطفل",
    },
  },
  {
    href: "/category/vitamins",
    image: art("1664956618021-73c47736845e"),
    tint: "#e6f6ef",
    en: {
      kicker: "Vitamins & Supplements",
      title: "Stock up on the\nbasics for less",
      sub: "Multivitamins, vitamin D, omega-3 and more — sealed and genuine.",
      cta: "Shop Vitamins",
    },
    ar: {
      kicker: "الفيتامينات والمكملات",
      title: "كل الفيتامينات\nبأسعار أقل",
      sub: "فيتامينات متعددة، فيتامين د، أوميجا ٣ وأكثر — أصلية ومغلفة.",
      cta: "تسوقي الفيتامينات",
    },
  },
  {
    href: "/category/adult-care",
    image: art("1584622650111-993a426fbf0a"),
    tint: "#eef1f6",
    en: {
      kicker: "Adult & Home Care",
      title: "Care for everyone\nunder one roof",
      sub: "Adult care, daily essentials and home supplies in one order.",
      cta: "Browse departments",
    },
    ar: {
      kicker: "عناية الكبار والمنزل",
      title: "عناية لكل فرد\nفي البيت",
      sub: "عناية الكبار والاحتياجات اليومية ومستلزمات المنزل في طلب واحد.",
      cta: "تصفحي الأقسام",
    },
  },
  {
    href: "/category/home-essentials",
    image: art("1563453392212-326f5e854473"),
    tint: "#e8f4f4",
    en: {
      kicker: "Home Essentials",
      title: "The monthly shop,\nwithout the queue",
      sub: "Tissues, detergent and cleaning — free delivery over L.E 600.",
      cta: "Shop Home Essentials",
    },
    ar: {
      kicker: "مستلزمات المنزل",
      title: "مشوار الشهر\nمن غير طوابير",
      sub: "مناديل ومنظفات وغسيل — شحن مجاني فوق ٦٠٠ جنيه.",
      cta: "تسوقي مستلزمات المنزل",
    },
  },
];

const AUTOPLAY_MS = 6000;

/**
 * The homepage's opening statement: an auto-advancing set of merchandised
 * banners, one per department the store wants to push this week.
 *
 * A carousel earns its place here because the store's pitch is breadth —
 * no single still image can say "we carry baby, vitamins, adult care and
 * home" at once. Autoplay pauses on hover and focus, and stops entirely
 * for visitors who ask for reduced motion.
 */
export function HeroCarousel() {
  const locale = useLocale() as "ar" | "en";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) setPaused(true);
  }, []);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, index]);

  const slide = SLIDES[index];
  const copy = slide[locale];
  // In RTL the "next" chevron must still mean "forward in reading order".
  const isRtl = locale === "ar";

  return (
    <section
      className="relative overflow-hidden bg-cream-soft"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => !reducedMotion.current && setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => !reducedMotion.current && setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative mx-auto h-[380px] max-w-[1400px] sm:h-[420px] md:h-[460px]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{ backgroundColor: slide.tint }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Copy sits on a gradient scrim so it stays readable on any
                artwork, including photos that are bright on the text side. */}
            <div
              className="absolute inset-0"
              style={{
                background: isRtl
                  ? "linear-gradient(270deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 38%, rgba(255,255,255,0.15) 72%)"
                  : "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 38%, rgba(255,255,255,0.15) 72%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative flex h-full items-center px-5 sm:px-10 md:px-14">
          <motion.div
            key={`copy-${index}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[34rem]"
          >
            <span className="inline-flex items-center rounded-full bg-rose px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              {copy.kicker}
            </span>
            <h1 className="mt-3 whitespace-pre-line font-heading text-3xl font-extrabold leading-[1.12] text-ink sm:text-4xl md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-md text-sm text-ink-soft sm:text-base">{copy.sub}</p>
            <Link
              href={slide.href}
              className="mt-6 inline-flex items-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              {copy.cta}
            </Link>
          </motion.div>
        </div>

        {/* Arrows: hidden on touch, where the dots and autoplay suffice. */}
        <button
          onClick={() => go(index - 1)}
          aria-label={isRtl ? "التالي" : "Previous slide"}
          className="absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 text-ink shadow-md backdrop-blur transition hover:bg-white md:block ltr:left-4 rtl:right-4"
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label={isRtl ? "السابق" : "Next slide"}
          className="absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 text-ink shadow-md backdrop-blur transition hover:bg-white md:block ltr:right-4 rtl:left-4"
        >
          {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div className="absolute bottom-4 flex gap-2 ltr:left-5 sm:ltr:left-10 md:ltr:left-14 rtl:right-5 sm:rtl:right-10 md:rtl:right-14">
          {SLIDES.map((s, i) => (
            <button
              key={s.href}
              onClick={() => go(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-ink" : "w-2.5 bg-ink/25 hover:bg-ink/45"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
