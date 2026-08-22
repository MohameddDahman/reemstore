"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * In-house campaign banners, in a swipeable rail.
 *
 * Egyptian pharmacy marketplaces run rows of these between product
 * shelves — Chefaa and Nahdi both do — and they are what makes a
 * catalogue page feel like a shop that is actively selling rather than a
 * database with pictures.
 *
 * Every creative here is drawn by us: a colour field, a headline set
 * large, and a photo bleeding off the trailing edge. Real retailers fill
 * these slots with brand-supplied artwork, which we cannot use — a Nivea
 * or Haleon creative on this page would be someone else's copyright and
 * would advertise stock the shop does not carry. Designing them in-house
 * also keeps the whole rail in one visual voice.
 *
 * The signature is the price flash: a rotated circular sticker, which is
 * the vernacular of Egyptian retail advertising rather than a generic
 * "SALE" ribbon.
 */

const U = "https://images.unsplash.com/photo-";
const art = (id: string) => `${U}${id}?w=1200&h=800&q=80&auto=format&fit=crop`;

type Copy = { kicker: string; title: string; sub: string; cta: string };

type Campaign = {
  href: string;
  image: string;
  /** Colour field behind the copy. Photo fades into this. */
  bg: string;
  flash?: { en: string; ar: string };
  en: Copy;
  ar: Copy;
};

/**
 * Campaign sets. Each photo below has been checked to be unbranded —
 * a legible third-party wordmark blown up to banner size reads as an
 * endorsement of stock this shop does not sell.
 */
const SETS: Record<string, Campaign[]> = {
  grooming: [
    {
      href: "/category/devices-appliances",
      image: art("1639160534101-56eb149eba78"),
      bg: "#1b2330",
      flash: { en: "from L.E 899", ar: "يبدأ من ٨٩٩" },
      en: {
        kicker: "Shavers & trimmers",
        title: "A closer shave,\nevery morning",
        sub: "Cordless shavers, beard trimmers and clippers.",
        cta: "Shop shavers",
      },
      ar: {
        kicker: "ماكينات الحلاقة",
        title: "حلاقة أنعم\nكل صباح",
        sub: "ماكينات حلاقة لاسلكية وتريمر للذقن.",
        cta: "تسوق الماكينات",
      },
    },
    {
      href: "/category/devices-appliances",
      image: art("1713180760640-c9ff9eb90b2d"),
      bg: "#4a2340",
      flash: { en: "up to 25% off", ar: "خصم حتى ٢٥٪" },
      en: {
        kicker: "Hair styling",
        title: "Salon hair,\nat home",
        sub: "Straighteners, curlers and dryers that protect as they style.",
        cta: "Shop styling",
      },
      ar: {
        kicker: "تصفيف الشعر",
        title: "شعر الصالون\nفي بيتك",
        sub: "مكواة شعر وسشوار يحمي شعرك أثناء التصفيف.",
        cta: "تسوق الأجهزة",
      },
    },
    {
      href: "/category/men-care",
      image: art("1524230616393-d6229fcd2eff"),
      bg: "#26221f",
      en: {
        kicker: "Men's care",
        title: "The whole\ngrooming shelf",
        sub: "Shave gels, aftershave, beard oil and face wash.",
        cta: "Shop men's care",
      },
      ar: {
        kicker: "العناية بالرجل",
        title: "رف العناية\nكامل",
        sub: "جل حلاقة وبعد الحلاقة وزيت للذقن وغسول.",
        cta: "تسوق عناية الرجل",
      },
    },
  ],
  everyday: [
    {
      href: "/category/hair-care",
      image: art("1546060432-b90a6441048f"),
      bg: "#123f4a",
      flash: { en: "buy 2 save 15%", ar: "اشترِ ٢ ووفر ١٥٪" },
      en: {
        kicker: "Hair care",
        title: "Wash days\nworth looking\nforward to",
        sub: "Shampoo, conditioner, masks and oils for every hair type.",
        cta: "Shop hair care",
      },
      ar: {
        kicker: "العناية بالشعر",
        title: "يوم غسيل\nالشعر بمتعة",
        sub: "شامبو وبلسم وماسكات وزيوت لكل أنواع الشعر.",
        cta: "تسوق العناية بالشعر",
      },
    },
    {
      href: "/category/mother-baby",
      image: art("1622290319146-7b63df48a635"),
      bg: "#2b4d7a",
      flash: { en: "bulk packs", ar: "عبوات كبيرة" },
      en: {
        kicker: "Mother & baby",
        title: "Stock the\nnursery in\none order",
        sub: "Nappies, wipes, bottles and bath — delivered to the door.",
        cta: "Shop baby",
      },
      ar: {
        kicker: "الأم والطفل",
        title: "جهّز غرفة\nالبيبي في\nطلب واحد",
        sub: "حفاضات ومناديل وببرونات ومستحضرات استحمام.",
        cta: "تسوق الأم والطفل",
      },
    },
    {
      href: "/category/vitamins",
      image: art("1664956618021-73c47736845e"),
      bg: "#3c4718",
      en: {
        kicker: "Vitamins",
        title: "Keep the\nwhole family\ntopped up",
        sub: "Multivitamins, vitamin D, omega 3 and iron.",
        cta: "Shop vitamins",
      },
      ar: {
        kicker: "الفيتامينات",
        title: "صحة العائلة\nكلها في\nمكان واحد",
        sub: "فيتامينات متعددة وفيتامين د وأوميجا ٣ وحديد.",
        cta: "تسوق الفيتامينات",
      },
    },
  ],
};

export function AdCarousel({
  set,
  titleEn,
  titleAr,
  band = false,
}: {
  set: keyof typeof SETS;
  titleEn: string;
  titleAr: string;
  /** Sit on the warm band, so consecutive sections stay distinguishable. */
  band?: boolean;
}) {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const campaigns = SETS[set];

  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Auto-advance yields to the shopper: any touch or hover pauses it,
  // and it only resumes once they have left it alone for a while.
  const [paused, setPaused] = useState(false);

  const scrollToCard = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[index] as HTMLElement | undefined;
    // `block: nearest` keeps this from scrolling the page vertically as
    // a side effect of moving the rail sideways.
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  /**
   * Which card is parked at the rail's inline start.
   *
   * Measured from rects rather than scrollLeft, whose sign for RTL
   * differs between engines and would invert the dots in Arabic.
   */
  const syncActive = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const railBox = rail.getBoundingClientRect();
    let best = 0;
    let bestDistance = Infinity;
    Array.from(rail.children).forEach((child, i) => {
      const box = (child as HTMLElement).getBoundingClientRect();
      const distance = isAr
        ? Math.abs(box.right - railBox.right)
        : Math.abs(box.left - railBox.left);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setActive(best);
  }, [isAr]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % campaigns.length;
        scrollToCard(next);
        return next;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, campaigns.length, scrollToCard]);

  const step = (direction: 1 | -1) => {
    const next = (active + direction + campaigns.length) % campaigns.length;
    setActive(next);
    scrollToCard(next);
  };

  return (
    <section
      className={band ? "bg-sand py-10 sm:py-12" : "py-10 sm:py-12"}
      onPointerEnter={() => setPaused(true)}
      onPointerDown={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-bold text-ink sm:text-2xl">
            {isAr ? titleAr : titleEn}
          </h2>

          <div className="hidden shrink-0 gap-1.5 sm:flex">
            <button
              onClick={() => step(-1)}
              aria-label={isAr ? "السابق" : "Previous"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              onClick={() => step(1)}
              aria-label={isAr ? "التالي" : "Next"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={syncActive}
        className="h-rail mx-auto flex max-w-7xl snap-x snap-mandatory gap-3 px-5 sm:gap-4 sm:px-8"
      >
        {campaigns.map((campaign, i) => {
          const copy = campaign[locale];
          return (
            <Link
              key={`${campaign.href}-${i}`}
              href={campaign.href}
              className="group relative flex w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[70%] lg:w-[48%]"
              style={{ backgroundColor: campaign.bg }}
            >
              {/* Photo bleeds off the trailing edge and dissolves into
                  the colour field, so the headline never fights it. */}
              <div className="absolute inset-y-0 end-0 w-[62%]">
                <Image
                  src={campaign.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 60vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 rtl:-scale-x-100"
                  style={{
                    background: `linear-gradient(to right, ${campaign.bg} 4%, ${campaign.bg}cc 38%, transparent 78%)`,
                  }}
                />
              </div>

              <div className="relative flex min-h-[13rem] w-[68%] flex-col justify-center p-5 sm:min-h-[15rem] sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {copy.kicker}
                </p>
                <h3 className="mt-1.5 whitespace-pre-line font-heading text-xl font-extrabold leading-[1.15] text-white sm:text-2xl">
                  {copy.title}
                </h3>
                <p className="mt-2 hidden max-w-[16rem] text-xs leading-relaxed text-white/75 sm:block">
                  {copy.sub}
                </p>

                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition-transform group-hover:scale-[1.04]">
                  {copy.cta}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </span>
              </div>

              {campaign.flash && (
                <span
                  aria-hidden
                  className="absolute top-3 flex h-16 w-16 -rotate-[10deg] items-center justify-center rounded-full bg-gold-flash p-1 text-center font-heading text-[10px] font-extrabold leading-tight text-ink shadow-lg ltr:right-3 rtl:left-3 rtl:rotate-[10deg] sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[11px]"
                >
                  {campaign.flash[locale]}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Dots double as controls, and are the only affordance on a phone
          where the arrows are hidden. */}
      <div className="mt-4 flex justify-center gap-1.5">
        {campaigns.map((c, i) => (
          <button
            key={`${c.href}-dot-${i}`}
            onClick={() => {
              setActive(i);
              scrollToCard(i);
            }}
            aria-label={`${isAr ? "عرض" : "Slide"} ${i + 1}`}
            aria-current={i === active}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-ink" : "w-1.5 bg-line hover:bg-ink-soft"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
