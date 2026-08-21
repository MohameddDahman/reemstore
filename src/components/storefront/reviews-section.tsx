"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function ReviewsSection({ productId }: { productId: Id<"products"> }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const reviews = useQuery(api.reviews.listApprovedForProduct, { productId });
  const submit = useMutation(api.reviews.submit);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      await submit({ productId, authorName: name, rating, comment });
      toast.success(t("reviewSubmitted"));
      setName("");
      setComment("");
      setRating(5);
      setOpen(false);
    } catch {
      toast.error(locale === "ar" ? "حدث خطأ ما" : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-ink">{t("reviews")}</h2>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm uppercase tracking-widest text-rose-deep"
        >
          {t("writeReview")}
        </button>
      </div>

      {open && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="mb-10 space-y-4 rounded-xl border border-line p-6"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)}>
                <Star
                  className={`h-5 w-5 ${n <= rating ? "fill-gold text-gold" : "text-line"}`}
                />
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourName")}
            required
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("yourReview")}
            required
            rows={3}
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-ink px-6 py-2.5 text-sm uppercase tracking-widest text-cream disabled:opacity-50"
          >
            {t("submitReview")}
          </button>
        </motion.form>
      )}

      {reviews && reviews.length === 0 && (
        <p className="text-sm text-ink-soft">{t("noReviews")}</p>
      )}

      <div className="space-y-6">
        {(reviews ?? []).map((review) => (
          <div key={review._id} className="border-b border-line pb-6">
            <div className="mb-1 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-line"}`}
                />
              ))}
              <span className="text-sm font-medium text-ink">{review.authorName}</span>
            </div>
            <p className="text-sm text-ink-soft">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
