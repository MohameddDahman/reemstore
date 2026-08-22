"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { Zap } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { ProductRail } from "./product-rail";

/**
 * Deals reset at midnight Cairo time. Deriving the deadline from the
 * clock rather than storing it means the countdown is always live in a
 * demo, and the admin can later replace this with a real campaign end
 * date without touching the display code.
 */
function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function Countdown({ locale }: { locale: "ar" | "en" }) {
  // Starts null so server and first client render agree; the real value
  // lands on mount. Rendering a live clock during SSR would guarantee a
  // hydration mismatch.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // The first value lands on the next frame rather than synchronously in
    // the effect body: setting state during the effect would cascade an
    // extra render for every mount. The placeholder below covers that one
    // frame, and is sized identically so nothing shifts.
    const raf = requestAnimationFrame(() => setRemaining(msUntilMidnight()));
    const id = setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const total = remaining ?? 0;
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);

  const cell = (value: string) => (
    <span className="rounded-md bg-ink px-2 py-1 font-heading text-sm font-bold tabular-nums text-white sm:text-base">
      {value}
    </span>
  );

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      <span className="me-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        {locale === "ar" ? "ينتهي خلال" : "Ends in"}
      </span>
      {remaining === null ? (
        // Placeholder of identical width, so the strip doesn't jump when
        // the real countdown arrives.
        <span className="rounded-md bg-ink/15 px-2 py-1 text-sm font-bold tabular-nums text-transparent">
          00:00:00
        </span>
      ) : (
        <>
          {cell(pad(hours))}
          <span className="font-bold text-ink">:</span>
          {cell(pad(minutes))}
          <span className="font-bold text-ink">:</span>
          {cell(pad(seconds))}
        </>
      )}
    </div>
  );
}

/**
 * The homepage's signature moment: today's markdowns with a live ticking
 * deadline. Deliberately the loudest band on the page — everything around
 * it stays quiet so this reads as the one urgent thing.
 */
export function FlashDeals() {
  const locale = useLocale() as "ar" | "en";
  const deals = useQuery(api.products.onSale, { limit: 12 });

  if (deals && deals.length === 0) return null;

  return (
    <section className="border-y border-rose/20 bg-gradient-to-b from-rose-mist to-white py-8">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose text-white">
                <Zap className="h-5 w-5" fill="currentColor" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-xl font-extrabold leading-tight text-ink sm:text-2xl">
                  {locale === "ar" ? "عروض اليوم" : "Today's Deals"}
                </h2>
                <p className="truncate text-xs text-ink-soft">
                  {locale === "ar"
                    ? "أسعار مخفضة تنتهي منتصف الليل"
                    : "Reduced prices, gone at midnight"}
                </p>
              </div>
            </div>

            <Link
              href="/deals"
              className="shrink-0 rounded-full border border-rose px-3.5 py-1.5 text-xs font-semibold text-rose transition-colors hover:bg-rose hover:text-white sm:text-sm"
            >
              {locale === "ar" ? "عرض الكل" : "View all"}
            </Link>
          </div>

          <Countdown locale={locale} />
        </div>

        <ProductRail products={deals} bare />
      </div>
    </section>
  );
}
