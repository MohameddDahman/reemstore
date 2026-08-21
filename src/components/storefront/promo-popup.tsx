"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import { Link } from "@/i18n/navigation";

const SESSION_KEY = "reem-popup-seen";

export function PromoPopup() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("popup");
  const banners = useQuery(api.banners.active, { type: "popup" });
  const [visible, setVisible] = useState(false);

  const banner = banners?.[0];

  useEffect(() => {
    if (!banner) return;
    if (sessionStorage.getItem(SESSION_KEY) === banner._id) return;
    const timer = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(timer);
  }, [banner]);

  const dismiss = () => {
    setVisible(false);
    if (banner) sessionStorage.setItem(SESSION_KEY, banner._id);
  };

  return (
    <AnimatePresence>
      {visible && banner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-2xl md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              aria-label={t("close")}
              className="absolute end-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur"
            >
              <X className="h-4 w-4" />
            </button>

            {banner.image ? (
              <div className="relative hidden min-h-[280px] md:block">
                <Image src={banner.image} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="hidden bg-rose-mist md:block" />
            )}

            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
              <p className="font-heading text-3xl leading-tight text-ink sm:text-4xl">
                {banner.title[locale]}
              </p>
              {banner.subtitle && (
                <p className="text-sm leading-relaxed text-ink-soft">{banner.subtitle[locale]}</p>
              )}
              <Link
                href={banner.ctaLink ?? "/"}
                onClick={dismiss}
                className="mt-2 inline-flex w-fit items-center rounded-full bg-ink px-7 py-3 text-sm uppercase tracking-widest text-cream transition-transform hover:scale-[1.03]"
              >
                {banner.ctaText?.[locale] ?? t("shopNow")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
