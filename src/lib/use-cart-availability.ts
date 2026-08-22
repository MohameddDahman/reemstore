"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart, type CartItem } from "@/store/cart";

export type LineProblem = "unavailable" | "out_of_stock" | "low_stock";

/**
 * Checks the browser-held cart against the live catalogue.
 *
 * The cart persists in localStorage, so it outlives the catalogue: a
 * product can be archived, sell out, or be deleted while a line still
 * sits in someone's bag. Surfacing that in the cart — rather than letting
 * placeOrder reject it at the end of checkout — is the difference between
 * a fixable warning and a shopper stuck with an order they cannot place.
 */
export function useCartAvailability() {
  const items = useCart((s) => s.items);

  const report = useQuery(
    api.products.availability,
    items.length > 0
      ? {
          items: items.map((i) => ({
            productId: i.productId,
            variantSku: i.variantSku,
            quantity: i.quantity,
          })),
        }
      : "skip"
  );

  const key = (productId: string, variantSku?: string) => `${productId}::${variantSku ?? ""}`;

  const problems = new Map<string, { reason: LineProblem; availableStock: number }>();
  for (const line of report ?? []) {
    if (!line.ok && line.reason) {
      problems.set(key(line.productId, line.variantSku), {
        reason: line.reason,
        availableStock: line.availableStock,
      });
    }
  }

  return {
    /** Undefined while loading — callers should not block checkout on that. */
    loaded: report !== undefined,
    problems,
    hasProblems: problems.size > 0,
    problemFor: (item: CartItem) => problems.get(key(item.productId, item.variantSku)),
  };
}
