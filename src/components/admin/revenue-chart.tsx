"use client";

import { useState } from "react";
import { useElementWidth } from "./charts";

type Point = { date: number; revenue: number; orders: number; units: number };

/**
 * Revenue over the selected window.
 *
 * Drawn at measured pixel size rather than a scaled viewBox, so the axis
 * labels are the same size on a phone as on a desktop instead of
 * shrinking into illegibility with the graphic.
 *
 * The chart is pinned to LTR in both locales. Time series read
 * chronologically left to right in Arabic data journalism too, and
 * mirroring the plot while leaving the date order alone is the kind of
 * detail that reads as a bug.
 */
export function RevenueChart({
  series,
  formatMoney,
  formatDay,
  labels,
}: {
  series: Point[];
  formatMoney: (n: number) => string;
  formatDay: (ts: number) => string;
  labels: { revenue: string; orders: string; empty: string };
}) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  if (series.length === 0) {
    return <p className="px-5 py-16 text-center text-sm text-ink-soft">{labels.empty}</p>;
  }

  const height = 260;
  const compact = width < 520;
  const padding = { top: 16, right: compact ? 10 : 16, bottom: 26, left: compact ? 46 : 62 };
  const plotW = Math.max(width - padding.left - padding.right, 10);
  const plotH = height - padding.top - padding.bottom;

  const peak = Math.max(...series.map((p) => p.revenue), 0);
  // Round the top of the scale up to something a person would choose, so
  // the gridline labels are readable numbers rather than 1,7 43.6.
  const niceMax = (() => {
    if (peak <= 0) return 100;
    const magnitude = 10 ** Math.floor(Math.log10(peak));
    return Math.ceil(peak / (magnitude / 2)) * (magnitude / 2);
  })();

  const x = (i: number) =>
    padding.left + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const y = (v: number) => padding.top + plotH - (v / niceMax) * plotH;

  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.revenue).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${padding.top + plotH} L${x(0).toFixed(1)},${padding.top + plotH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Thin the date labels to whatever fits, always keeping the ends.
  const maxLabels = Math.max(Math.floor(plotW / (compact ? 64 : 92)), 2);
  const step = Math.max(Math.ceil(series.length / maxLabels), 1);

  const point = active !== null ? series[active] : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const ratio = (px - padding.left) / plotW;
    const index = Math.round(ratio * (series.length - 1));
    setActive(Math.min(Math.max(index, 0), series.length - 1));
  };

  return (
    <div ref={wrapRef} className="relative w-full px-1 pb-1" dir="ltr">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="block touch-pan-y"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setActive(null)}
          role="img"
          aria-label={labels.revenue}
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-rose)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-rose)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => {
            const gy = padding.top + plotH - g * plotH;
            return (
              <g key={g}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={gy}
                  y2={gy}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  strokeDasharray={g === 0 ? undefined : "3 4"}
                />
                <text
                  x={padding.left - 8}
                  y={gy + 3.5}
                  textAnchor="end"
                  className="fill-[var(--color-ink-soft)] text-[10px] tabular-nums"
                >
                  {formatMoney(niceMax * g)}
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#revenue-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--color-rose)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {series.map((p, i) =>
            i % step === 0 || i === series.length - 1 ? (
              <text
                key={p.date}
                x={x(i)}
                y={height - 8}
                textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
                className="fill-[var(--color-ink-soft)] text-[10px]"
              >
                {formatDay(p.date)}
              </text>
            ) : null
          )}

          {point && active !== null && (
            <g pointerEvents="none">
              <line
                x1={x(active)}
                x2={x(active)}
                y1={padding.top}
                y2={padding.top + plotH}
                stroke="var(--color-ink)"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.35"
              />
              <circle
                cx={x(active)}
                cy={y(point.revenue)}
                r="5"
                fill="var(--color-surface)"
                stroke="var(--color-rose)"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>
      )}

      {point && active !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[8.5rem] rounded-lg border border-line bg-surface p-2.5 shadow-lg"
          style={{
            // Keep the card inside the plot instead of letting it run off
            // the edge on the first and last day.
            left: Math.min(Math.max(x(active) - 68, 4), Math.max(width - 144, 4)),
          }}
        >
          <p className="text-[11px] font-semibold text-ink-soft">{formatDay(point.date)}</p>
          <p className="mt-0.5 font-heading text-base font-bold tabular-nums text-ink">
            {formatMoney(point.revenue)}
          </p>
          <p className="text-[11px] tabular-nums text-ink-soft">
            {point.orders} {labels.orders}
          </p>
        </div>
      )}
    </div>
  );
}
