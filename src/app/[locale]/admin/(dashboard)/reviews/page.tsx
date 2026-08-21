"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Star, Trash2, X } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export default function AdminReviewsPage() {
  const reviews = useQuery(api.reviews.listAll);
  const moderate = useMutation(api.reviews.moderate);
  const remove = useMutation(api.reviews.remove);

  const handleModerate = async (id: Id<"reviews">, status: "approved" | "rejected") => {
    await moderate({ id, status });
  };

  return (
    <div>
      <h1 className="font-heading text-2xl text-ink">Reviews</h1>

      <div className="mt-6 space-y-3">
        {(reviews ?? []).map((review) => (
          <div key={review._id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-line"}`}
                    />
                  ))}
                  <span className="ms-2 text-sm font-medium text-ink">{review.authorName}</span>
                  <span
                    className={`ms-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      review.status === "approved"
                        ? "bg-success/15 text-success"
                        : review.status === "rejected"
                          ? "bg-danger/15 text-danger"
                          : "bg-line text-ink-soft"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{review.comment}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {review.status !== "approved" && (
                  <button
                    onClick={() => handleModerate(review._id, "approved")}
                    className="rounded-full bg-success/15 p-1.5 text-success"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() => handleModerate(review._id, "rejected")}
                    className="rounded-full bg-danger/15 p-1.5 text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => remove({ id: review._id })}
                  className="rounded-full p-1.5 text-ink-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {reviews && reviews.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
