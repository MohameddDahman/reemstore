"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { REVEAL_VIEWPORT, revealFrom, revealTo, revealTransition } from "@/lib/reveal";

export function Testimonials() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("home.testimonials");
  const reviews = useQuery(api.reviews.listRecentApprovedAcrossStore, { limit: 6 });

  if (reviews && reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="font-heading text-3xl text-ink sm:text-4xl">{t("title")}</h2>
        <p className="text-ink-soft">{t("subtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(reviews ?? []).map((review, i) => (
          <motion.div
            key={review._id}
            initial={revealFrom}
            whileInView={revealTo}
            viewport={REVEAL_VIEWPORT}
            transition={revealTransition(i % 3)}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6"
          >
            <Quote className="h-5 w-5 text-rose" />
            <div className="mt-3 flex">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s < review.rating ? "fill-rose text-rose" : "text-line"}`}
                />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">{review.comment}</p>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm font-medium text-ink">{review.authorName}</span>
              {review.productName && (
                <span className="text-xs text-ink-soft">{review.productName[locale]}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
