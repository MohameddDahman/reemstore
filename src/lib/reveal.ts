/**
 * Scroll-reveal settings, shared so the whole site behaves as one.
 *
 * A reveal is a garnish, never a gate. The earlier version used a
 * negative viewport margin, which shrinks the trigger box: an element
 * had to sit 60px *inside* the viewport before it began a half-second
 * fade, and staggered delays pushed the fourth card in a row past
 * two-thirds of a second. Scrolling a long marketplace page at any
 * normal speed outran that, so shelves arrived blank and the site read
 * as empty — the exact complaint the animation was there to prevent.
 *
 * So the margin is positive now: the trigger box is *expanded* well
 * beyond the fold, and content has finished animating before it is
 * scrolled to. The movement is small and quick, which means even a
 * viewer who catches it mid-flight sees a placed element easing into
 * position rather than a hole where a product should be.
 */

/** How far beyond the viewport an element starts animating. */
const LEAD = "300px";

export const REVEAL_VIEWPORT = { once: true, margin: LEAD } as const;

export const revealFrom = { opacity: 0, y: 8 } as const;
export const revealTo = { opacity: 1, y: 0 } as const;

/**
 * @param index Position within a group; stagger is capped so a long row
 *              never leaves its last item waiting.
 */
export function revealTransition(index = 0) {
  return {
    duration: 0.3,
    delay: Math.min(index, 3) * 0.03,
    ease: [0.16, 1, 0.3, 1] as const,
  };
}
