"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * Chart primitives for the admin dashboard, drawn by hand in SVG.
 *
 * A charting library would bring its own visual language — its own
 * greys, its own tooltip, its own type scale — and the dashboard would
 * stop looking like the rest of Reem. These read the store's own tokens
 * instead, and add nothing to the bundle.
 *
 * Everything measures its container and draws at real pixel size rather
 * than scaling a fixed viewBox, so labels stay legible on a phone
 * instead of shrinking with the graphic.
 */

/** Container width, from the element itself. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ResizeObserver fires once on observe, so the first measurement
    // arrives without a setState during the effect body.
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/**
 * Period-over-period change.
 *
 * `null` means there was no previous period to compare with, which is
 * not the same as no change — it shows a dash rather than a confident
 * 0%. For counts where up is bad (cancellations), pass invert.
 */
export function TrendPill({
  delta,
  invert = false,
  className = "",
}: {
  delta: number | null;
  invert?: boolean;
  className?: string;
}) {
  if (delta === null) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-cream-soft px-2 py-0.5 text-xs font-semibold text-ink-soft ${className}`}
      >
        <Minus className="h-3 w-3" />
        <span className="sr-only">No previous period to compare</span>
      </span>
    );
  }

  const rising = delta > 0;
  const good = invert ? !rising : rising;
  const flat = Math.abs(delta) < 0.05;
  const Icon = rising ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
        flat
          ? "bg-cream-soft text-ink-soft"
          : good
            ? "bg-mint-soft text-mint"
            : "bg-rose-mist text-rose-deep"
      } ${className}`}
    >
      {!flat && <Icon className="h-3 w-3" />}
      {Math.abs(delta) >= 999 ? "999+" : Math.abs(delta).toFixed(delta < 10 ? 1 : 0)}%
    </span>
  );
}

/** A bare trend line — no axes, just the shape of the last N days. */
export function Sparkline({
  points,
  tone = "rose",
  height = 34,
}: {
  points: number[];
  tone?: "rose" | "mint" | "ink";
  height?: number;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const stroke =
    tone === "mint" ? "var(--color-mint)" : tone === "ink" ? "var(--color-ink)" : "var(--color-rose)";

  const usable = points.length > 1 ? points : [0, 0];
  const max = Math.max(...usable, 1);
  const min = Math.min(...usable, 0);
  const span = max - min || 1;

  const coords = usable.map((v, i) => {
    const x = (i / (usable.length - 1)) * Math.max(width - 2, 1) + 1;
    const y = height - 3 - ((v - min) / span) * (height - 6);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`;
  const id = `spark-${tone}`;

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} aria-hidden className="block overflow-visible">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
          <path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

/** Headline number, its movement, and the shape behind it. */
export function StatCard({
  label,
  value,
  delta,
  invert,
  spark,
  tone = "rose",
  icon,
  hint,
}: {
  label: string;
  value: string;
  delta?: number | null;
  invert?: boolean;
  spark?: number[];
  tone?: "rose" | "mint" | "ink";
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
          {label}
        </p>
        {icon && <span className="shrink-0 text-ink-soft">{icon}</span>}
      </div>

      <p className="mt-1.5 truncate font-heading text-2xl font-bold tabular-nums text-ink sm:text-[1.7rem]">
        {value}
      </p>

      <div className="mt-1 flex items-center gap-2">
        {delta !== undefined && <TrendPill delta={delta} invert={invert} />}
        {hint && <span className="truncate text-[11px] text-ink-soft">{hint}</span>}
      </div>

      {spark && spark.length > 1 && (
        <div className="mt-3">
          <Sparkline points={spark} tone={tone} />
        </div>
      )}
    </div>
  );
}

/**
 * Ranked horizontal bars.
 *
 * The bar is a tinted track behind the label rather than a separate
 * column, so the name stays readable at any width and the row doubles as
 * its own axis — important on a phone, where a real axis would eat half
 * the screen.
 */
export function BarList({
  rows,
  emptyLabel,
  tone = "rose",
}: {
  rows: { key: string; label: string; value: string; amount: number; sub?: string }[];
  emptyLabel: string;
  tone?: "rose" | "mint" | "ink";
}) {
  if (rows.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-ink-soft">{emptyLabel}</p>;
  }

  const max = Math.max(...rows.map((r) => r.amount), 1);
  const fill =
    tone === "mint" ? "bg-mint-soft" : tone === "ink" ? "bg-cream-soft" : "bg-rose-mist";

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.key} className="relative isolate px-4 py-2.5 sm:px-5">
          <span
            aria-hidden
            className={`absolute inset-y-0 start-0 -z-10 ${fill}`}
            style={{ width: `${Math.max((row.amount / max) * 100, 2)}%` }}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{row.label}</p>
              {row.sub && <p className="truncate text-[11px] text-ink-soft">{row.sub}</p>}
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
              {row.value}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Compact column chart for cyclical data — hours of the day, weekdays. */
export function MiniBars({
  data,
  highlightLabel,
}: {
  data: { label: string; value: number; emphasise?: boolean }[];
  highlightLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]">
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t transition-colors ${
                d.emphasise ? "bg-rose-deep" : "bg-rose-mist group-hover:bg-rose"
              }`}
              style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
            />
            {/* Value on hover, so the chart stays clean at rest. */}
            <span className="pointer-events-none absolute -top-1 start-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 rtl:translate-x-1/2">
              {d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-ink-soft">
        <span>{data[0]?.label}</span>
        {highlightLabel && <span className="font-semibold text-ink">{highlightLabel}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Two-part proportion bar — Arabic vs English, coupon vs no coupon. */
export function SplitBar({
  parts,
  emptyLabel,
}: {
  parts: { label: string; value: number; color: string }[];
  emptyLabel: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 0) {
    return <p className="py-6 text-center text-sm text-ink-soft">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-cream-soft">
        {parts.map((p) => (
          <div
            key={p.label}
            style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }}
            title={`${p.label}: ${p.value}`}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{p.label}</span>
            <span className="font-semibold tabular-nums text-ink">{p.value}</span>
            <span className="w-11 text-end text-xs tabular-nums text-ink-soft">
              {((p.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Section wrapper, so every panel on the dashboard frames identically. */
export function Panel({
  title,
  subtitle,
  action,
  children,
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate font-heading text-base font-bold text-ink">{title}</h2>
          {subtitle && <p className="truncate text-xs text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
