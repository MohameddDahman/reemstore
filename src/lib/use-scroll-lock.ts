"use client";

import { useEffect } from "react";

/**
 * Freezes the page behind an open overlay (mobile menu, cart drawer,
 * promo popup) while that overlay is on screen.
 *
 * Without this the page keeps scrolling under the panel — a drag on the
 * drawer moves the catalogue behind it instead — which reads as the menu
 * being broken.
 *
 * The padding compensation matters: hiding overflow removes the
 * scrollbar, and on desktop that widens the page by its width and makes
 * the whole layout jump sideways as the drawer opens.
 *
 * Reference-counted through a data attribute so two overlays open at once
 * (cart opened from inside the mobile menu) don't unlock each other.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const depth = Number(body.dataset.scrollLocks ?? "0");
    body.dataset.scrollLocks = String(depth + 1);

    let previousOverflow = "";
    let previousPadding = "";
    if (depth === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      previousOverflow = body.style.overflow;
      previousPadding = body.style.paddingInlineEnd;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) body.style.paddingInlineEnd = `${scrollbarWidth}px`;
    }

    return () => {
      const remaining = Number(body.dataset.scrollLocks ?? "1") - 1;
      body.dataset.scrollLocks = String(Math.max(0, remaining));
      if (remaining <= 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingInlineEnd = previousPadding;
        delete body.dataset.scrollLocks;
      }
    };
  }, [active]);
}
