"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Gift, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Link, usePathname } from "@/i18n/navigation";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useEscapeKey } from "@/lib/use-escape-key";
import { ScratchCard } from "./scratch-card";
import { ConfettiBurst } from "./confetti-burst";

const SESSION_KEY = "reem-popup-seen";

/**
 * Routes where a welcome offer is an interruption rather than an offer.
 *
 * Someone filling in a delivery address has already decided to buy;
 * throwing a modal over the form only gives them a reason to stop. The
 * code stays reachable from the header banner if they want it.
 */
const MUTED_PATHS = ["/checkout", "/order", "/track-order"];

/**
 * The welcome offer, as a scratch card.
 *
 * A shopper who has rubbed the foil off a code has done something to earn
 * it, and is far likelier to carry it to checkout than one who dismissed
 * a banner. The code is copyable in one tap because the next thing anyone
 * does with a discount code is paste it.
 */
export function PromoPopup() {
  const locale = useLocale() as "ar" | "en";
  const pathname = usePathname();
  const muted = MUTED_PATHS.some((p) => pathname.startsWith(p));
  const banners = useQuery(api.banners.active, muted ? "skip" : { type: "popup" });
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const banner = banners?.[0];
  const code = banner?.couponCode;
  const isAr = locale === "ar";

  // Guard the lock on the same condition the panel renders under: if a
  // route change mutes the popup mid-session the panel unmounts, and a
  // lock left behind would freeze the page it navigated to.
  const open = visible && !!banner && !muted;
  useScrollLock(open);

  useEffect(() => {
    if (!banner) return;
    if (sessionStorage.getItem(SESSION_KEY) === banner._id) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [banner]);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (banner) sessionStorage.setItem(SESSION_KEY, banner._id);
  }, [banner]);

  useEscapeKey(open, dismiss);

  const handleRevealed = () => {
    setRevealed(true);
    // Read the preference here rather than in an effect: this is an event
    // handler, so it can't cascade a render, and it's the only moment the
    // answer matters.
    setCelebrate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the code stays readable on screen.
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {open && banner && [
        <motion.div
          key="promo-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-ink/55 backdrop-blur-[2px]"
          onClick={dismiss}
        />,
        <motion.div
          key="promo-panel"
          role="dialog"
          aria-modal="true"
          aria-label={banner.title[locale]}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className="fixed inset-x-4 top-1/2 z-[101] mx-auto w-auto max-w-sm -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-0"
        >
          {celebrate && <ConfettiBurst />}

          {/* Ribbon header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-deep via-rose to-[#f2607a] px-6 pb-9 pt-7 text-center text-white">
            <button
              onClick={dismiss}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 ltr:right-3 rtl:left-3"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.span
              initial={{ rotate: -12, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.15 }}
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20"
            >
              <Gift className="h-6 w-6" />
            </motion.span>

            <h2 className="font-heading text-2xl font-extrabold leading-tight">
              {banner.title[locale]}
            </h2>
            {banner.subtitle && (
              <p className="mx-auto mt-1.5 max-w-[17rem] text-sm text-white/85">
                {banner.subtitle[locale]}
              </p>
            )}
          </div>

          <div className="relative -mt-4 rounded-t-3xl bg-white px-6 pb-6 pt-5">
            {code ? (
              <>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {revealed
                    ? isAr
                      ? "الكود بتاعك"
                      : "Your code"
                    : isAr
                      ? "اكشطي لتظهر هديتك"
                      : "Scratch to reveal your gift"}
                </p>

                <div className="relative">
                  <ScratchCard
                    onRevealed={handleRevealed}
                    hintLabel={isAr ? "اكشطي هنا" : "SCRATCH HERE"}
                    revealLabel={isAr ? "إظهار" : "Reveal"}
                  >
                    <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose/45 bg-rose-mist">
                      <span className="font-heading text-3xl font-extrabold tracking-wider text-rose-deep">
                        {code}
                      </span>
                      <span className="text-[11px] text-ink-soft">
                        {isAr ? "على أول طلب" : "on your first order"}
                      </span>
                    </div>
                  </ScratchCard>

                </div>

                <AnimatePresence>
                  {revealed && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={copyCode}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-mint" />
                          {isAr ? "تم نسخ الكود" : "Code copied"}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          {isAr ? "نسخ الكود" : "Copy code"}
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            ) : null}

            <Link
              href={banner.ctaLink ?? "/"}
              onClick={dismiss}
              className="mt-3 block w-full rounded-full bg-ink py-3.5 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            >
              {banner.ctaText?.[locale] ?? (isAr ? "ابدئي التسوق" : "Start shopping")}
            </Link>

            <button
              onClick={dismiss}
              className="mx-auto mt-2 block text-xs text-ink-soft underline-offset-2 hover:underline"
            >
              {isAr ? "لا شكراً" : "No thanks"}
            </button>
          </div>
        </motion.div>,
      ]}
    </AnimatePresence>
  );
}
