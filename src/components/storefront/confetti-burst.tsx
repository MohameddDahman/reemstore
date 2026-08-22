"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/** Party palette — deliberately wider than the brand's, because this is
 *  the one moment the store is allowed to be loud. */
const COLORS = [
  "#d7263d",
  "#0f9d6b",
  "#e0a63c",
  "#f2607a",
  "#2f6f66",
  "#4a8fe7",
  "#9b5de5",
];

/**
 * Deterministic stand-in for Math.random.
 *
 * React requires render to be pure, and a component that rolled fresh
 * random numbers on every render would reshuffle its own confetti
 * mid-animation. Seeding off the piece's index keeps each piece's path
 * fixed for the life of the burst while still looking scattered.
 */
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The celebration that fires when the scratch card gives up its code:
 * streamers falling from above, confetti bursting out of the middle.
 *
 * Runs once, for well under two seconds, on plain transforms. It is
 * purely decorative, so it is hidden from assistive tech, and the caller
 * skips it entirely for anyone who has asked for reduced motion.
 */
export function ConfettiBurst({
  ribbons = 22,
  pieces = 40,
}: {
  ribbons?: number;
  pieces?: number;
}) {
  const streamers = useMemo(
    () =>
      Array.from({ length: ribbons }, (_, i) => ({
        id: i,
        // Spread across the width, nudged so they don't sit in a grid.
        left: (i / ribbons) * 100 + noise(i) * 4 - 2,
        delay: noise(i + 100) * 0.45,
        duration: 1.3 + noise(i + 200) * 0.9,
        sway: 26 + noise(i + 300) * 42,
        spin: 180 + noise(i + 400) * 540,
        length: 16 + Math.round(noise(i + 500) * 16),
        color: COLORS[i % COLORS.length],
      })),
    [ribbons]
  );

  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const distance = 80 + noise(i + 600) * 150;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 30,
          rotate: noise(i + 700) * 720 - 360,
          delay: noise(i + 800) * 0.1,
          color: COLORS[(i + 3) % COLORS.length],
          round: i % 3 === 0,
        };
      }),
    [pieces]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
      {/* Streamers, falling and twisting like party tape */}
      {streamers.map((s) => (
        <motion.span
          key={`ribbon-${s.id}`}
          initial={{ top: "-14%", opacity: 1, rotate: 0, x: 0 }}
          animate={{
            top: "115%",
            opacity: [1, 1, 0.9, 0],
            rotate: s.spin,
            x: [0, s.sway, -s.sway * 0.6, s.sway * 0.3],
          }}
          transition={{ duration: s.duration, delay: s.delay, ease: "easeIn" }}
          className="absolute block"
          style={{
            left: `${s.left}%`,
            width: 4,
            height: s.length,
            backgroundColor: s.color,
            borderRadius: 2,
          }}
        />
      ))}

      {/* Confetti, bursting out of the centre */}
      {bits.map((b) => (
        <motion.span
          key={`bit-${b.id}`}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 0, x: b.x, y: b.y, scale: 1, rotate: b.rotate }}
          transition={{ duration: 1, delay: b.delay, ease: [0.16, 1, 0.3, 1] }}
          className="absolute start-1/2 top-1/2 block"
          style={{
            width: b.round ? 7 : 5,
            height: b.round ? 7 : 11,
            backgroundColor: b.color,
            borderRadius: b.round ? "50%" : 1,
          }}
        />
      ))}
    </div>
  );
}
