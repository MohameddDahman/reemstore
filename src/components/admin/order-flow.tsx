"use client";

import { ChevronRight, XCircle } from "lucide-react";

type Step = { stage: string; reached: number; sitting: number };

/**
 * The order pipeline, stage by stage.
 *
 * This is the one place on the dashboard allowed to be loud, because it
 * answers the question the shop owner actually opens the dashboard for:
 * where are orders piling up, and where are they falling out.
 *
 * "Reached" is cumulative — an order that has shipped has necessarily
 * been confirmed — so the numbers only ever go down along the chain and
 * the figure on each arrow is a real pass-through rate. "Here now" is
 * the queue sitting at that stage waiting for someone to act, which is
 * the number that turns the chart into a to-do list.
 *
 * The chain runs left to right on a desktop and top to bottom on a
 * phone, because five stages abbreviated to fit a 375px row would be
 * unreadable. Arrows mirror in Arabic.
 */
export function OrderFlow({
  steps,
  cancelled,
  labels,
  stageLabel,
}: {
  steps: Step[];
  cancelled: number;
  labels: { hereNow: string; ofPrevious: string; cancelled: string; empty: string };
  stageLabel: (stage: string) => string;
}) {
  const entered = steps[0]?.reached ?? 0;

  if (entered === 0 && cancelled === 0) {
    return <p className="px-5 py-14 text-center text-sm text-ink-soft">{labels.empty}</p>;
  }

  return (
    <div className="p-4 sm:p-5">
      <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
        {steps.map((step, i) => {
          const previous = i === 0 ? null : steps[i - 1].reached;
          const passRate =
            previous && previous > 0 ? Math.round((step.reached / previous) * 100) : null;
          const share = entered > 0 ? (step.reached / entered) * 100 : 0;
          const leaking = passRate !== null && passRate < 70;

          return (
            <li key={step.stage} className="flex min-w-0 flex-1 items-stretch gap-2 lg:gap-0">
              {/* Connector carrying the pass-through rate */}
              {i > 0 && (
                <div className="flex shrink-0 flex-row items-center justify-center gap-1 ps-1 lg:w-16 lg:flex-col lg:px-1">
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 rotate-90 lg:rotate-0 rtl:lg:-scale-x-100 ${
                      leaking ? "text-rose" : "text-ink-soft/50"
                    }`}
                    strokeWidth={2.5}
                  />
                  {passRate !== null && (
                    <span
                      className={`whitespace-nowrap text-[10px] font-bold tabular-nums ${
                        leaking ? "text-rose-deep" : "text-ink-soft"
                      }`}
                    >
                      {passRate}%
                    </span>
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1 rounded-xl border border-line bg-cream-soft p-3">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                  {stageLabel(step.stage)}
                </p>

                <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-ink">
                  {step.reached}
                </p>

                {/* Share of everything that entered the pipeline. */}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-rose-deep transition-[width] duration-500"
                    style={{ width: `${Math.max(share, 1.5)}%` }}
                  />
                </div>

                {step.sitting > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-mist px-2 py-0.5 text-[10px] font-bold text-rose-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-deep" />
                    {step.sitting} {labels.hereNow}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {cancelled > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line bg-surface px-3 py-2.5">
          <XCircle className="h-4 w-4 shrink-0 text-danger" />
          <span className="text-sm text-ink-soft">
            <span className="font-bold tabular-nums text-ink">{cancelled}</span>{" "}
            {labels.cancelled}
          </span>
          <span className="ms-auto shrink-0 text-xs font-semibold tabular-nums text-danger">
            {Math.round((cancelled / (entered + cancelled)) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
