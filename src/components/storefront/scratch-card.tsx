"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A foil panel the shopper rubs away to uncover what's underneath.
 *
 * Scratch-and-win is native to how promotions run in this market —
 * Chefaa puts "Play & Win" in its main nav — so the welcome offer is a
 * thing you do, not a poster you dismiss. Earning the code is what makes
 * it worth keeping.
 *
 * The foil is a canvas erased with destination-out compositing. Coverage
 * is sampled cheaply (every 6th pixel, at most ~10x/second) and once a
 * third is gone the rest wipes itself, so nobody has to scrub corners.
 *
 * Anyone who can't or doesn't want to drag — keyboard, screen reader,
 * reduced-motion — gets the Reveal button instead; it is always present,
 * never a hidden fallback.
 */
export function ScratchCard({
  onRevealed,
  revealLabel,
  hintLabel,
  children,
}: {
  onRevealed: () => void;
  revealLabel: string;
  hintLabel: string;
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastSample = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    onRevealed();
  }, [revealed, onRevealed]);

  // Paint the foil once the element has a measured size.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const paint = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      // Brushed metallic foil in the brand red.
      const foil = ctx.createLinearGradient(0, 0, width, height);
      foil.addColorStop(0, "#a80f26");
      foil.addColorStop(0.35, "#d7263d");
      foil.addColorStop(0.5, "#f2607a");
      foil.addColorStop(0.65, "#d7263d");
      foil.addColorStop(1, "#8d0c20");
      ctx.fillStyle = foil;
      ctx.fillRect(0, 0, width, height);

      // Diagonal sheen streaks so it reads as foil, not flat paint.
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 10;
      for (let x = -height; x < width + height; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "700 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(hintLabel, width / 2, height / 2);
    };

    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [hintLabel]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const prev = lastPoint.current;
    ctx.beginPath();
    if (prev) {
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    lastPoint.current = { x, y };

    // Reading pixels is the expensive part, so throttle it.
    const now = performance.now();
    if (now - lastSample.current < 100) return;
    lastSample.current = now;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 6) {
      total++;
      if (data[i] === 0) clear++;
    }
    if (total > 0 && clear / total > 0.33) reveal();
  };

  return (
    <div ref={wrapRef} className="relative isolate overflow-hidden rounded-2xl">
      {children}

      {!revealed && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={(e) => {
              drawing.current = true;
              lastPoint.current = null;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drawing.current = false;
              lastPoint.current = null;
            }}
            onPointerLeave={() => {
              drawing.current = false;
              lastPoint.current = null;
            }}
          />
          <button
            type="button"
            onClick={reveal}
            className="absolute bottom-2 z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-ink shadow-sm ltr:right-2 rtl:left-2"
          >
            {revealLabel}
          </button>
        </>
      )}
    </div>
  );
}
