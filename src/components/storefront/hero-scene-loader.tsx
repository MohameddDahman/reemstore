"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./hero-scene").then((m) => m.HeroScene), {
  ssr: false,
});

/** Curated product shot used whenever the 3D scene can't or shouldn't run. */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&h=1100&q=80&auto=format&fit=crop";

function detectWebgl() {
  try {
    const canvas = document.createElement("canvas");
    const ctx = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!ctx) return false;
    // Release the probe's context immediately. Browsers cap how many live
    // WebGL contexts a page may hold and evict the oldest when the cap is
    // hit — leaking this one would help push the real scene's context out.
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Renders the still product photo by default and upgrades to the 3D
 * bottle only once the client confirms it's worthwhile:
 *
 *  - viewport is desktop-sized (the parent is `hidden md:block`, so on
 *    mobile this never becomes visible — we also skip mounting WebGL),
 *  - the browser actually supports WebGL,
 *  - the user hasn't asked for reduced motion,
 *
 * plus a runtime escape hatch: if the GPU drops the WebGL context while
 * the page is open, we fall straight back to the photo.
 *
 * The upgrade decision lives entirely in an effect, never in render.
 * Reading `window` during render would make the server's HTML and the
 * client's first render disagree, which React reports as a hydration
 * mismatch — so the first paint is always the photo, on both sides.
 */
export function HeroSceneLoader({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const [use3d, setUse3d] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setUse3d(wide.matches && !reduced.matches && detectWebgl());
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  const handleContextLost = useCallback(() => setUse3d(false), []);

  if (use3d) {
    return <HeroScene scrollProgress={scrollProgress} onContextLost={handleContextLost} />;
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={FALLBACK_IMAGE}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
