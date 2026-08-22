"use client";

import { useEffect } from "react";

/**
 * Closes an overlay when Escape is pressed.
 *
 * Every drawer and modal in the store owes the shopper this — it's how
 * people expect to back out, and for anyone navigating by keyboard it is
 * the only way out that doesn't involve hunting for the close button.
 * Each overlay had been left to remember it individually, and only the
 * promo popup did.
 *
 * The listener is only attached while `active`, so a page full of closed
 * drawers costs nothing and the topmost open one is the only thing
 * listening.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}
