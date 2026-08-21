"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Shown while store settings are still loading, and if an admin ever
 * clears the field. Keeps prices from flashing a bare number.
 */
export const DEFAULT_CURRENCY_SYMBOL = "L.E";

/**
 * Single source of truth for the currency symbol on the storefront.
 *
 * Components used to hardcode their own symbol, which meant changing the
 * currency in the admin dashboard silently failed to update product cards
 * and search results. Everything reads through this hook instead.
 */
export function useCurrencySymbol() {
  const settings = useQuery(api.settings.get);
  return settings?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL;
}
